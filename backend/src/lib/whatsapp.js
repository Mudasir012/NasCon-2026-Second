/**
 * WhatsApp integration via whatsapp-web.js (Puppeteer-based, no API key needed).
 *
 * How it works:
 *  - On startup, a headless Chromium browser logs in to WhatsApp Web.
 *  - First run: a QR code is printed to the terminal — scan it with your phone once.
 *  - After that, the session is saved to ./.wwebjs_auth and reused automatically.
 *  - Incoming messages fire handleIncomingMessage() → creates contacts + leads.
 *  - Outbound messages are sent via client.sendMessage() for real delivery.
 */

import { randomUUID } from 'node:crypto';
import { db } from './db.js';
import { createLead } from './leads.js';
import { record as audit } from './audit.js';

const messages = db.collection('messages');
const contacts = db.collection('contacts');

/** Keywords that opt a contact out of messaging (I1.9). */
const OPTOUT_KEYWORDS = new Set(['stop', 'stopall', 'unsubscribe', 'opt out', 'optout', 'cancel']);

// ──────────────────────────────────────────────────────────────────────────────
// WhatsApp Web client (singleton)
// ──────────────────────────────────────────────────────────────────────────────

let waClient = null;
let waReady = false;
let waQr = null;
let waStatus = 'disconnected'; // 'disconnected' | 'qr_ready' | 'authenticated' | 'ready' | 'error'

export function getWAStatus() {
  return { status: waStatus, hasQr: Boolean(waQr), ready: waReady };
}

export function getWAQr() {
  return waQr; // raw QR string for frontend to render
}

/**
 * Boot the WhatsApp Web client.
 * Call once from server.js — it runs in the background.
 */
export async function startWhatsAppClient(workspaceId) {
  if (waClient) return waClient; // already started

  let Client, LocalAuth;
  try {
    const wweb = await import('whatsapp-web.js');
    Client = wweb.Client;
    LocalAuth = wweb.LocalAuth;
  } catch (err) {
    console.warn('[whatsapp-web] whatsapp-web.js not found — WhatsApp bot disabled:', err.message);
    waStatus = 'error';
    return null;
  }

  waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
  });

  // ── QR code ────────────────────────────────────────────────────────────────
  waClient.on('qr', (qr) => {
    waQr = qr;
    waStatus = 'qr_ready';
    // Print to terminal so dev can scan immediately
    import('qrcode-terminal').then(({ default: qrcode }) => {
      console.log('\n[whatsapp-web] Scan this QR code with your WhatsApp phone:\n');
      qrcode.generate(qr, { small: true });
    }).catch(() => {
      console.log('[whatsapp-web] QR code (copy to https://www.qr-code-generator.com):');
      console.log(qr);
    });
  });

  // ── Authenticated ──────────────────────────────────────────────────────────
  waClient.on('authenticated', () => {
    waStatus = 'authenticated';
    waQr = null;
    console.log('[whatsapp-web] Authenticated — session saved.');
  });

  // ── Ready ──────────────────────────────────────────────────────────────────
  waClient.on('ready', () => {
    waReady = true;
    waStatus = 'ready';
    console.log('[whatsapp-web] Client ready. Real WhatsApp messages will be sent and received.');
  });

  // ── Disconnected ───────────────────────────────────────────────────────────
  waClient.on('disconnected', (reason) => {
    waReady = false;
    waStatus = 'disconnected';
    waClient = null;
    console.warn('[whatsapp-web] Disconnected:', reason);
  });

  // ── Incoming messages ──────────────────────────────────────────────────────
  waClient.on('message', async (msg) => {
    if (msg.fromMe) return;
    if (String(msg.from).includes('status@broadcast')) return;
    if (String(msg.from).endsWith('@g.us')) return; // ignore group messages

    const rawFrom = String(msg.from ?? '').split('@')[0]; // e.g. "923001234567"
    const phone = `+${rawFrom.replace(/\D/g, '')}`;
    const body = String(msg.body ?? '').trim();

    if (!body) return;

    try {
      await handleIncomingMessage({
        from: phone,
        to: 'wa_bot',
        body,
        messageSid: msg.id?._serialized || `WA_${Date.now()}`,
        workspaceId,
      });
      console.log(`[whatsapp-web] Inbound from ${phone}: "${body.slice(0, 60)}"`);
    } catch (err) {
      console.error('[whatsapp-web] Failed to handle incoming message:', err.message);
    }
  });

  waClient.initialize();
  console.log('[whatsapp-web] Client initializing — this may take 20–40 seconds on first run...');
  return waClient;
}

// ──────────────────────────────────────────────────────────────────────────────
// Inbound message handler (shared by real WA events + simulator endpoint)
// ──────────────────────────────────────────────────────────────────────────────

export async function handleIncomingMessage({ from, to, body, messageSid, workspaceId }) {
  // Idempotency: ignore duplicate deliveries (I1.8)
  const existing = await messages.find((m) => m.providerRef === messageSid);
  if (existing) return { duplicate: true, message: existing };

  const cleanPhone = String(from).replace(/^whatsapp:/i, '').trim();
  const isOptOut = OPTOUT_KEYWORDS.has(String(body).trim().toLowerCase());

  let contact = await contacts.find((c) => c.phone === cleanPhone && c.workspaceId === workspaceId);
  let createdLead = null;

  if (!contact) {
    contact = {
      id: randomUUID(),
      workspaceId,
      name: `WhatsApp User (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      email: '',
      optedOut: isOptOut,
      createdAt: new Date().toISOString(),
    };
    await contacts.insert(contact);

    // An opt-out is not an inquiry, so it never becomes a lead.
    if (!isOptOut) {
      createdLead = await createLead({
        workspaceId,
        input: {
          name: contact.name,
          phone: cleanPhone,
          source: 'whatsapp',
          notes: `Inbound WhatsApp: "${body}"`,
        },
        actorName: 'whatsapp_bot',
      });
    }
  } else if (isOptOut && !contact.optedOut) {
    await contacts.mutate((rows) => {
      const row = rows.find((r) => r.id === contact.id);
      if (row) row.optedOut = true;
    });
  }

  const msgRecord = {
    id: randomUUID(),
    workspaceId,
    contactId: contact.id,
    direction: 'inbound',
    channel: 'whatsapp',
    from: cleanPhone,
    to: String(to ?? 'bot'),
    body,
    status: 'delivered',
    providerRef: messageSid,
    error: null,
    createdAt: new Date().toISOString(),
  };

  await messages.insert(msgRecord);

  await audit({
    workspaceId,
    actorId: 'whatsapp_bot',
    action: 'message.received',
    target: msgRecord.id,
    metadata: { phone: cleanPhone, contactId: contact.id, leadCreated: Boolean(createdLead), optedOut: isOptOut },
  });

  return { message: msgRecord, contact, lead: createdLead };
}

// ──────────────────────────────────────────────────────────────────────────────
// Outbound: real whatsapp-web.js send
// ──────────────────────────────────────────────────────────────────────────────

export async function sendOutboundMessage({ workspaceId, contactId, body, employeeId }) {
  const contact = await contacts.find((c) => c.id === contactId && c.workspaceId === workspaceId);
  if (!contact) throw new Error('Contact not found');

  if (contact.optedOut) {
    throw new Error('Contact has opted out of messaging. Communication blocked by compliance rules.');
  }

  const msgId = randomUUID();
  let providerRef = `WA_out_${randomUUID().slice(0, 16)}`;
  let status = 'sent';
  let errorMsg = null;
  const simulatorMode = !waReady;

  // ── Real send via whatsapp-web.js ─────────────────────────────────────────
  if (waReady && waClient) {
    try {
      // WhatsApp chat IDs are phone numbers with @c.us suffix
      const chatId = contact.phone.replace(/^\+/, '') + '@c.us';
      const result = await waClient.sendMessage(chatId, body);
      providerRef = result?.id?._serialized || providerRef;
      status = 'sent';
      console.log(`[whatsapp-web] Outbound sent to ${contact.phone}: "${body.slice(0, 60)}"`);
    } catch (err) {
      errorMsg = err.message;
      status = 'failed';
      console.warn(`[whatsapp-web] Send failed to ${contact.phone}: ${err.message}`);
    }
  } else {
    console.log(`[whatsapp-web] Simulator mode — client not ready. Message stored only.`);
  }

  const record = {
    id: msgId,
    workspaceId,
    contactId,
    employeeId,
    direction: 'outbound',
    channel: 'whatsapp',
    from: 'wa_bot',
    to: contact.phone,
    body,
    status,
    providerRef,
    error: errorMsg,
    simulatorMode,
    createdAt: new Date().toISOString(),
  };

  await messages.insert(record);

  await audit({
    workspaceId,
    actorId: employeeId,
    action: status === 'failed' ? 'message.failed' : 'message.sent',
    target: msgId,
    metadata: { to: contact.phone, contactId, providerRef, simulatorMode, error: errorMsg },
  });

  if (status === 'failed') {
    const err = new Error(errorMsg || 'Message send failed');
    err.record = record;
    throw err;
  }

  return record;
}

// ──────────────────────────────────────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────────────────────────────────────

export async function listConversation(contactId, workspaceId) {
  const all = await messages.where((m) => m.contactId === contactId && m.workspaceId === workspaceId);
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listFailedMessages(workspaceId) {
  const all = await messages.where((m) => m.workspaceId === workspaceId && m.status === 'failed');
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Inbox summary: one row per contact with its latest message. Unread counts are not
 * modelled by the backend, so `unread` is always 0.
 */
export async function listConversations(workspaceId) {
  const allContacts = await contacts.where((c) => c.workspaceId === workspaceId);
  const allMessages = await messages.where((m) => m.workspaceId === workspaceId);

  return allContacts
    .map((contact) => {
      const thread = allMessages
        .filter((m) => m.contactId === contact.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const last = thread[thread.length - 1] ?? null;

      return {
        contactId: contact.id,
        name: contact.name,
        phone: contact.phone,
        channel: 'whatsapp',
        optedOut: Boolean(contact.optedOut),
        unread: 0,
        lastMessage: last
          ? { direction: last.direction, body: last.body, status: last.status, createdAt: last.createdAt }
          : null,
      };
    })
    .sort((a, b) => String(b.lastMessage?.createdAt ?? '').localeCompare(String(a.lastMessage?.createdAt ?? '')));
}

/** Toggle a contact's messaging opt-out flag (I1.9). */
export async function setContactOptOut(contactId, workspaceId, optedOut) {
  let updated = null;

  await contacts.mutate((rows) => {
    const contact = rows.find((c) => c.id === contactId && c.workspaceId === workspaceId);
    if (!contact) return;
    contact.optedOut = Boolean(optedOut);
    updated = contact;
  });

  if (!updated) throw new Error('Contact not found');

  await audit({
    workspaceId,
    actorId: 'wa_bot',
    action: optedOut ? 'contact.opted_out' : 'contact.opted_in',
    target: contactId,
    metadata: { phone: updated.phone },
  });

  return updated;
}

// ──────────────────────────────────────────────────────────────────────────────
// Delivery status (for delivery receipts from WA)
// ──────────────────────────────────────────────────────────────────────────────

export async function updateDeliveryStatus({ messageSid, status, error = null }) {
  let updated = null;

  await messages.mutate((rows) => {
    const msg = rows.find((m) => m.providerRef === messageSid);
    if (!msg) return;
    msg.status = status === 'undelivered' ? 'failed' : status;
    if (error) msg.error = error;
    msg.updatedAt = new Date().toISOString();
    updated = msg;
  });

  if (updated) {
    await audit({
      workspaceId: updated.workspaceId,
      actorId: 'wa_bot',
      action: `message.${updated.status}`,
      target: updated.id,
      metadata: { providerRef: messageSid, status: updated.status, error },
    });
  }

  return updated;
}

// ──────────────────────────────────────────────────────────────────────────────
// Retry
// ──────────────────────────────────────────────────────────────────────────────

export async function retryFailedMessage({ workspaceId, messageId, employeeId }) {
  const original = await messages.find((m) => m.id === messageId && m.workspaceId === workspaceId);
  if (!original) throw new Error('Message not found');

  const retried = await sendOutboundMessage({
    workspaceId,
    contactId: original.contactId,
    body: original.body,
    employeeId,
  });

  await messages.mutate((rows) => {
    const msg = rows.find((m) => m.id === messageId);
    if (msg) {
      msg.retriedAt = new Date().toISOString();
      msg.retriedWith = retried.id;
    }
  });

  await audit({
    workspaceId,
    actorId: employeeId,
    action: 'message.retried',
    target: messageId,
    metadata: { newMessageId: retried.id, to: retried.to },
  });

  return retried;
}
