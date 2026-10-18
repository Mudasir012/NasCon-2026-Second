import assert from 'node:assert/strict';
import test from 'node:test';
import { createPaymentRequest, handleStripeWebhook, getRevenueMetrics } from '../src/lib/payments.js';

test('creates a payment request and tracks uncollected projected revenue (I2.1, I2.6)', async () => {
  const wsId = `test_ws_${Date.now()}_1`;
  const payment = await createPaymentRequest({
    workspaceId: wsId,
    opportunityId: 'opp_123',
    contactId: 'ct_123',
    amount: 500,
    currency: 'USD',
    description: 'Deposit for Solar Inspection',
  });

  assert.equal(payment.amount, 500);
  assert.equal(payment.status, 'unpaid');
  assert.ok(payment.checkoutUrl);

  const metrics = await getRevenueMetrics(wsId);
  assert.equal(metrics.projectedRevenue, 500);
});

test('webhook confirms payment and updates to collected revenue idempotently (I2.2, I2.4)', async () => {
  const wsId = `test_ws_${Date.now()}_2`;
  const payment = await createPaymentRequest({
    workspaceId: wsId,
    opportunityId: 'opp_456',
    amount: 1000,
    currency: 'USD',
  });

  const webhookResult = await handleStripeWebhook({
    id: 'evt_test_1',
    type: 'checkout.session.completed',
    data: { object: { id: payment.providerRef } },
  });

  assert.equal(webhookResult.status, 'paid');

  const idempotentResult = await handleStripeWebhook({
    id: 'evt_test_1',
    type: 'checkout.session.completed',
    data: { object: { id: payment.providerRef } },
  });

  assert.equal(idempotentResult.ok, true);

  const metrics = await getRevenueMetrics(wsId);
  assert.equal(metrics.collectedRevenue, 1000);
});
