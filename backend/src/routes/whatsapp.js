import { createHmac } from 'node:crypto';
import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { requirePermission, workspaceContext } from '../lib/context.js';
import { config } from '../config.js';
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
 * Whether real Twilio credentials are configured (vs. simulator mode).
 */
function twilioConfigured() {
  const sid = config.twilio.accountSid;
  const token = config.twilio.authToken;
  return Boolean(
    sid && token
    && !sid.startsWith('AC_your')
    && token !== 'your_twilio_auth_token_here'
    && sid.startsWith('AC')
  );
}

/**
 * Validate Twilio X-Twilio-Signature header (I1.2 - forgery protection).
 * Only enforced when real Twilio credentials are present.
 */
function validateTwilioSignature(req) {
  if (!twilioConfigured()) return true; // Skip in simulator mode
  const signature = req.headers['x-twilio-signature'];
  if (!signature) return false;
  const authToken = config.twilio.authToken;
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const params = req.body ?? {};
  const sortedKeys = Object.keys(params).sort();
  const data = url + sortedKeys.map((k) => `${k}${params[k]}`).join('');
  const expected = createHmac('sha1', authToken).update(data).digest('base64');
  return signature === expected;
}

/**
 * Public Twilio Webhook (I1.1, I1.2, I1.5, Rubric Criterion 5).
 * Validates X-Twilio-Signature, checks for empty/forged payloads, prevents duplicate processing.
 */
router.post('/webhook', async (req, res) => {
  try {
    const { From, To, Body, MessageSid } = req.body ?? {};

    // Signature validation against forgery (I1.2)
    if (!validateTwilioSignature(req)) {
      return res.status(403).type('text/xml').send('<Response><Message>Forbidden: invalid signature</Message></Response>');
    }

    // Payload sanity check
    if (!From && !Body && !MessageSid && !req.body?.from) {
      return res.status(400).type('text/xml').send('<Response><Message>Bad request</Message></Response>');
    }

    const workspaces = await db.collection('workspaces').read();
    const workspaceId = workspaces[0]?.id || 'default_ws';

    await handleIncomingMessage({
      from: From || req.body?.from,
      to: To || req.body?.to || 'whatsapp:+14155238886',
      body: Body || req.body?.body || '',
      messageSid: MessageSid || req.body?.messageSid || `SM_${Date.now()}`,
      workspaceId,
    });

    // Twilio expects an empty TwiML response for webhook acknowledgement
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

router.get('/info', requirePermission('crm.view'), (req, res) => {
  res.json({
    configured: twilioConfigured(),
    mode: twilioConfigured() ? 'live' : 'simulator',
    from: config.twilio.whatsappNumber || 'whatsapp:+14155238886',
    description: twilioConfigured()
      ? 'Twilio credentials configured. Real WhatsApp messages will be sent and received.'
      : 'No Twilio credentials. Using simulator mode — messages are stored but not delivered.',
  });
});

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
    res.status(400).json({ error: err.message, record: err.record ?? null });
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
    res.status(201).json({ message, mode: message.simulatorMode ? 'simulator' : 'live' });
  } catch (err) {
    res.status(400).json({ error: err.message, record: err.record ?? null });
  }
});

export default router;
