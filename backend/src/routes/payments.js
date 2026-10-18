import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { requirePermission, workspaceContext } from '../lib/context.js';
import { createPaymentRequest, getRevenueMetrics, handleStripeWebhook, stripeConfigured } from '../lib/payments.js';

const router = Router();

/**
 * Public Stripe webhook endpoint (I2.2, I2.3).
 */
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  try {
    const result = await handleStripeWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Test Simulator for Stripe Webhooks (allows demonstration of instant payment confirmation without webhook tunneling).
 */
router.post('/simulate-webhook', async (req, res) => {
  try {
    const { providerRef, status = 'paid' } = req.body ?? {};
    const result = await handleStripeWebhook({
      id: `sim_evt_${Date.now()}`,
      type: status === 'paid' ? 'checkout.session.completed' : 'charge.refunded',
      data: { object: { id: providerRef, payment_intent: providerRef } },
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.use(requireAuth, workspaceContext);

router.get('/status', (req, res) => {
  res.json({
    configured: stripeConfigured(),
    provider: 'Stripe (Test Mode)',
  });
});

router.get('/metrics', requirePermission('crm.view'), async (req, res) => {
  const metrics = await getRevenueMetrics(req.workspace.id);
  res.json(metrics);
});

router.post('/create-link', requirePermission('crm.edit'), async (req, res) => {
  const { opportunityId, contactId, contactEmail, amount, currency, description } = req.body ?? {};

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Please specify a positive payment amount' });
  }

  const payment = await createPaymentRequest({
    workspaceId: req.workspace.id,
    opportunityId,
    contactId,
    contactEmail,
    employeeId: req.member.id,
    amount,
    currency,
    description,
  });

  res.status(201).json({ payment });
});

export default router;
