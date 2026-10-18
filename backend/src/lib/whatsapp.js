import { randomUUID } from 'node:crypto';
import { db } from './db.js';
import { createLead } from './leads.js';
import { record as audit } from './audit.js';
import { config } from '../config.js';

const messages = db.collection('messages');
const contacts = db.collection('contacts');

// ──────────────────────────────────────────────────────────────────────────────
// Twilio configuration check
// ──────────────────────────────────────────────────────────────────────────────

export function twilioConfigured() {
  const sid = config.twilio.accountSid;
  const token = config.twilio.authToken;
  return Boolean(
    sid && token
    && !sid.startsWith('AC_your')
    && token !== 'your_twilio_auth_token_here'
    && sid.startsWith('AC')
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Inbound: real Twilio webhook handler
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Handle incoming WhatsApp message via Twilio Sandbox Webhook (I1.1, I1.5, I1.8).
 */
export async function handleIncomingMessage({ from, to, body, messageSid, workspaceId }) {
  // Idempotency: reject duplicate webhook replays (I1.8)
  const existing = await messages.find((m) => m.providerRef === messageSid);
  if (existing) {
    return { duplicate: true, message: existing };
  }

  const cleanPhone = from.replace(/^whatsapp:/i, '').trim();

  // Contact matching (I1.5)
  let contact = await contacts.find((c) => c.phone === cleanPhone && c.workspaceId === workspaceId);
  let createdLead = null;

  if (!contact) {
    // Unknown number → create contact + lead via round-robin (F3.1, I1.5)
    contact = {
      id: randomUUID(),
      workspaceId,
      name: `WhatsApp User (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      email: '',
      optedOut: false,
      createdAt: new Date().toISOString(),
    };
    await contacts.insert(contact);

    createdLead = await createLead({
      workspaceId,
      input: {
        name: contact.name,
        phone: cleanPhone,
        source: 'whatsapp',
        notes: `Inbound WhatsApp: "${body}"`,
      },
      actorName: 'twilio_webhook',
    });
  }

  const msgRecord = {
    id: randomUUID(),
    workspaceId,
    contactId: contact.id,
    direction: 'inbound',
    channel: 'whatsapp',
    from: cleanPhone,
    to: to ? to.replace(/^whatsapp:/i, '').trim() : 'sandbox',
    body,
    status: 'delivered',
    providerRef: messageSid,
    error: null,
    createdAt: new Date().toISOString(),
  };

  await messages.insert(msgRecord);

  await audit({
    workspaceId,
    actorId: 'twilio_webhook',
    action: 'message.received',
    target: msgRecord.id,
    metadata: { phone: cleanPhone, contactId: contact.id, leadCreated: Boolean(createdLead) },
  });

  return { message: msgRecord, contact, lead: createdLead };
}

// ──────────────────────────────────────────────────────────────────────────────
// Outbound: real Twilio REST API send (I1.3, I1.4)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Send an outbound WhatsApp message via Twilio REST API.
 * Falls back to simulator mode (records in DB only) when credentials are absent.
 */
export async function sendOutboundMessage({ workspaceId, contactId, body, employeeId }) {
  const contact = await contacts.find((c) => c.id === contactId && c.workspaceId === workspaceId);
  if (!contact) throw new Error('Contact not found');

  // Opt-out guard (I1.9)
  if (contact.optedOut) {
    throw new Error('Contact has opted out of messaging. Communication blocked by compliance rules.');
  }

  const msgId = randomUUID();
  let providerRef = `SM${randomUUID().replace(/-/g, '').slice(0, 32)}`;
  let status = 'sent';
  let errorMsg = null;
  let simulatorMode = false;

  // ── Real Twilio REST API dispatch ─────────────────────────────────────────
  if (twilioConfigured()) {
    try {
      const sid = config.twilio.accountSid;
      const token = config.twilio.authToken;
      const fromNumber = config.twilio.whatsappNumber;

      const toPhone = contact.phone.startsWith('whatsapp:')
        ? contact.phone
        : `whatsapp:${contact.phone}`;

      const fromFormatted = fromNumber.startsWith('whatsapp:')
        ? fromNumber
        : `whatsapp:${fromNumber}`;

      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: fromFormatted,
            To: toPhone,
            Body: body,
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      const payload = await twilioResponse.json().catch(() => ({}));

      if (twilioResponse.ok && payload.sid) {
        providerRef = payload.sid;
        status = payload.status === 'queued' ? 'sent' : (payload.status || 'sent');
        console.log(`[whatsapp] Real message dispatched via Twilio: ${payload.sid} → ${contact.phone}`);
      } else {
        errorMsg = payload.message || payload.code
          ? `Twilio error ${payload.code}: ${payload.message}`
          : `Twilio HTTP ${twilioResponse.status}`;
        status = 'failed';
        console.warn(`[whatsapp] Twilio send failed: ${errorMsg}`);
      }
    } catch (err) {
      errorMsg = err.message;
      status = 'failed';
      console.warn(`[whatsapp] Twilio API unreachable: ${err.message}`);
    }
  } else {
    // ── Simulator mode: credentials not configured ────────────────────────────
    simulatorMode = true;
    console.log(`[whatsapp] Simulator mode — Twilio not configured. Message recorded in DB only.`);
  }

  const record = {
    id: msgId,
    workspaceId,
    contactId,
    employeeId,
    direction: 'outbound',
    channel: 'whatsapp',
    from: config.twilio.whatsappNumber || 'sandbox',
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

// ──────────────────────────────────────────────────────────────────────────────
// Delivery status callback from Twilio
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
      actorId: 'twilio_status_callback',
      action: `message.${updated.status}`,
      target: updated.id,
      metadata: { providerRef: messageSid, status: updated.status, error },
    });
  }

  return updated;
}

// ──────────────────────────────────────────────────────────────────────────────
// Retry: re-sends the original body via the real send path
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
