import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { isConnected } from './lib/db.js';
import { startEscalationTicker } from './lib/escalation.js';
import { listEntries, verifyChain } from './lib/audit.js';
import { requireAuth } from './lib/auth.js';
import { requirePermission, workspaceContext } from './lib/context.js';
import authRoutes from './routes/auth.js';
import calendarRoutes from './routes/calendar.js';
import crmRoutes from './routes/crm.js';
import paymentRoutes from './routes/payments.js';
import whatsappRoutes from './routes/whatsapp.js';
import workspaceRoutes from './routes/workspace.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'OmniFlow Unified Management Platform API',
      env: config.env,
      mongodb: isConnected() ? 'connected' : 'local_storage_fallback',
      time: new Date().toISOString(),
    });
  });

  // Core API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/crm', crmRoutes);
  app.use('/api/workspace', workspaceRoutes);
  app.use('/api/calendar', calendarRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/whatsapp', whatsappRoutes);

  // Dedicated Audit Route (F4.1 - F4.3)
  app.get('/api/audit', requireAuth, workspaceContext, requirePermission('audit.view'), async (req, res) => {
    const entries = await listEntries(req.workspace.id);
    const verification = await verifyChain(req.workspace.id);
    res.json({
      entries,
      tamperCheck: verification,
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.status ?? 500;
    if (status >= 500) console.error(err);
    return res.status(status).json({ error: err.message ?? 'Internal Server Error' });
  });

  // Start background lead SLA escalation engine (F3.4, F3.5)
  startEscalationTicker();

  return app;
}
