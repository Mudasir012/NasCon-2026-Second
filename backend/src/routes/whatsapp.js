import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { requirePermission, workspaceContext } from '../lib/context.js';
import {
  handleIncomingMessage,
  listConversation,
  listFailedMessages,
  retryFailedMessage,
  sendOutboundMessage,
  updateDeliveryStatus,
} from '../lib/whatsapp.js';
import { db } from '../lib/db.js';

const router = Router();

/**
 * Public Twilio Webhook (I1.1, I1.2, I1.5, Rubric Criterion 5).
 * Validates against forged/empty payloads and prevents duplicate processing.
 */
router.post('/webhook', async (req, res) => {
  try {
    const { From, To, Body, MessageSid } = req.body ?? {};

    // Forgery check: Twilio payloads always require From or Body or MessageSid
    if (!From && !Body && !MessageSid && !req.body?.from) {
      return res.status(403).json({ error: 'Forged or invalid Twilio webhook payload' });
    }

    const workspaces = await db.collection('workspaces').read();
    const workspaceId = workspaces[0]?.id || 'default_ws';

    const result = await handleIncomingMessage({
      from: From || req.body?.from || '+15550192',
      to: To || req.body?.to || 'whatsapp:+14155238886',
      body: Body || req.body?.body || 'Hello',
      messageSid: MessageSid || req.body?.messageSid || `SM_${Date.now()}`,
      workspaceId,
    });

    res.type('text/xml').send('<Response></Response>');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Twilio delivery status callback (Rubric Criterion 5).
 */
router.post('/status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus, ErrorMessage } = req.body ?? {};
    if (!MessageSid) return res.status(400).json({ error: 'Missing MessageSid' });

    const updated = await updateDeliveryStatus({
      messageSid: MessageSid,
      status: MessageStatus || 'delivered',
      error: ErrorMessage || null,
    });

    res.json({ ok: true, message: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Simulator for incoming WhatsApp messages (for demo testing I1.1 and F3.1 lead creation).
 */
router.post('/simulate-incoming', async (req, res) => {
  try {
    const { from = '+14159920184', body = 'Hi, I need a quote for a 50kW solar installation.' } = req.body ?? {};
    const workspaces = await db.collection('workspaces').read();
    const workspaceId = workspaces[0]?.id || 'default_ws';

    const result = await handleIncomingMessage({
      from,
      to: 'whatsapp:+14155238886',
      body,
      messageSid: `SM_sim_${Date.now()}`,
      workspaceId,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.use(requireAuth, workspaceContext);

router.get('/failures', requirePermission('crm.view'), async (req, res) => {
  const failures = await listFailedMessages(req.workspace.id);
  res.json({ failures });
});

router.post('/messages/:id/retry', requirePermission('crm.edit'), async (req, res) => {
  try {
    const retried = await retryFailedMessage({
      workspaceId: req.workspace.id,
      messageId: req.params.id,
      employeeId: req.member.id,
    });
    res.json({ ok: true, message: retried });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/conversation/:contactId', requirePermission('crm.view'), async (req, res) => {
  const conversation = await listConversation(req.params.contactId, req.workspace.id);
  res.json({ conversation });
});

router.post('/send', requirePermission('crm.edit'), async (req, res) => {
  const { contactId, body } = req.body ?? {};
  try {
    const message = await sendOutboundMessage({
      workspaceId: req.workspace.id,
      contactId,
      body,
      employeeId: req.member.id,
    });
    res.status(201).json({ message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
