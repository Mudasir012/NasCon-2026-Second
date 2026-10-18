import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { requirePermission, workspaceContext } from '../lib/context.js';
import { handleIncomingMessage, listConversation, sendOutboundMessage } from '../lib/whatsapp.js';
import { db } from '../lib/db.js';

const router = Router();

/**
 * Public Twilio Webhook (I1.1, I1.2, I1.5).
 */
router.post('/webhook', async (req, res) => {
  try {
    const { From, To, Body, MessageSid } = req.body ?? {};

    // In a multi-tenant setup, incoming messages without explicit workspace routing land in primary intake workspace
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
