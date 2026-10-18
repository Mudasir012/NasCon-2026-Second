import { randomUUID } from 'node:crypto';
import { db } from './db.js';
import { createLead } from './leads.js';
import { record as audit } from './audit.js';

const messages = db.collection('messages');
const contacts = db.collection('contacts');

/**
 * Handle incoming WhatsApp message via Twilio Sandbox Webhook (I1.1, I1.5, I1.8).
 */
export async function handleIncomingMessage({ from, to, body, messageSid, workspaceId }) {
  // Idempotency: verify webhook delivered twice does not duplicate (I1.8)
  const existing = await messages.find((m) => m.providerRef === messageSid);
  if (existing) {
    return { duplicate: true, message: existing };
  }

  const cleanPhone = from.replace(/^whatsapp:/i, '').trim();

  // Contact matching (I1.5)
  let contact = await contacts.find((c) => c.phone === cleanPhone && c.workspaceId === workspaceId);
  let createdLead = null;

  if (!contact) {
    // Unknown number: creates a contact and a lead (F3.1, I1.5)
    const newContactId = randomUUID();
    contact = {
      id: newContactId,
      workspaceId,
      name: `WhatsApp User (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      email: '',
      optedOut: false,
      createdAt: new Date().toISOString(),
    };
    await contacts.insert(contact);

    // Auto-create lead and route through round-robin
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
    direction: 'inbound', // 'inbound' | 'outbound'
    channel: 'whatsapp',
    from: cleanPhone,
    to: to ? to.replace(/^whatsapp:/i, '').trim() : 'sandbox',
    body,
    status: 'delivered', // 'sent' | 'delivered' | 'failed'
    providerRef: messageSid,
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

/**
 * Outbound message dispatch with opt-out checks (I1.3, I1.4, I1.9).
 */
export async function sendOutboundMessage({ workspaceId, contactId, body, employeeId }) {
  const contact = await contacts.find((c) => c.id === contactId && c.workspaceId === workspaceId);
  if (!contact) {
    throw new Error('Contact not found');
  }

  // Opt-out guard (I1.9)
  if (contact.optedOut) {
    throw new Error('Contact has opted out of messaging. Communication blocked by compliance rules.');
  }

  const msgId = randomUUID();
  const providerRef = `SM${randomUUID().slice(0, 16)}`;

  // Status can be sent, delivered, or failed (I1.4)
  const record = {
    id: msgId,
    workspaceId,
    contactId,
    employeeId,
    direction: 'outbound',
    channel: 'whatsapp',
    from: 'sandbox',
    to: contact.phone,
    body,
    status: 'sent',
    providerRef,
    error: null,
    createdAt: new Date().toISOString(),
  };

  await messages.insert(record);

  await audit({
    workspaceId,
    actorId: employeeId,
    action: 'message.sent',
    target: msgId,
    metadata: { to: contact.phone, contactId },
  });

  return record;
}

export async function listConversation(contactId, workspaceId) {
  const all = await messages.where((m) => m.contactId === contactId && m.workspaceId === workspaceId);
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
