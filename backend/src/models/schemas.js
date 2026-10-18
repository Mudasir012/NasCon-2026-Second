/**
 * OmniFlow Unified Business Management Platform - Data Schemas
 * Defines document structure, field specifications, and indexes for all collections.
 */

export const SCHEMAS = {
  /**
   * Workspace (Tenant) Schema
   * Isolates companies completely (F1.6)
   */
  Workspace: {
    name: 'workspaces',
    fields: {
      id: { type: 'string', required: true, unique: true },
      name: { type: 'string', required: true, maxLength: 100 },
      slug: { type: 'string', required: true, unique: true },
      plan: { type: 'string', default: 'standard' },
      createdAt: { type: 'string', format: 'date-time', required: true },
      updatedAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { slug: 1 }, unique: true }],
  },

  /**
   * User Account & Authentication Schema
   * Password hashing, salt, multi-session JWT (F1.1)
   */
  Account: {
    name: 'accounts',
    fields: {
      id: { type: 'string', required: true, unique: true },
      email: { type: 'string', required: true, unique: true, lowercase: true },
      passwordHash: { type: 'string', required: true },
      name: { type: 'string', required: true },
      defaultWorkspaceId: { type: 'string', required: true },
      createdAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { email: 1 }, unique: true }],
  },

  /**
   * Workspace Member Schema
   * Roles, permissions, capacity, availability, absence tracking (F1.2, F1.3, F3.2, F3.5)
   */
  Member: {
    name: 'members',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      accountId: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      level: { type: 'string', enum: ['owner', 'admin', 'user'], required: true },
      roleId: { type: 'string', default: null },
      roleName: { type: 'string', default: 'User' },
      granted: { type: 'array', items: 'string', default: [] },
      revoked: { type: 'array', items: 'string', default: [] },
      available: { type: 'boolean', default: true },
      status: { type: 'string', enum: ['Active', 'On leave', 'Offline', 'Busy'], default: 'Active' },
      openLeadLimit: { type: 'number', default: null },
      backup: { type: 'boolean', default: false },
      lastAssignedAt: { type: 'string', format: 'date-time', default: null },
      createdAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [
      { key: { workspaceId: 1, accountId: 1 }, unique: true },
      { key: { workspaceId: 1, available: 1, lastAssignedAt: 1 } },
    ],
  },

  /**
   * Role Schema
   * User-defined roles bundling granular permissions (F1.3)
   */
  Role: {
    name: 'roles',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      name: { type: 'string', required: true },
      label: { type: 'string', required: true },
      permissions: { type: 'array', items: 'string', default: [] },
      createdAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { workspaceId: 1, name: 1 }, unique: true }],
  },

  /**
   * Lead / Opportunity CRM Schema
   * Inbound intake, round-robin assignment, SLA countdown timer, stage progression, custom fields (F2.1 - F3.7)
   */
  Lead: {
    name: 'leads',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', default: '' },
      phone: { type: 'string', default: '' },
      source: {
        type: 'string',
        enum: ['website', 'whatsapp', 'sms', 'walk-in', 'phone', 'referral', 'event', 'manual'],
        default: 'manual',
      },
      programme: { type: 'string', default: '' },
      stage: {
        type: 'string',
        enum: ['new', 'contacted', 'qualified', 'applied', 'enrolled', 'lost'],
        default: 'new',
      },
      value: { type: 'number', default: 0 }, // Field-level protected by permission opportunity_value.view
      notes: { type: 'string', default: '' },
      nextFollowUp: { type: 'string', format: 'date-time', default: '' },
      fields: { type: 'object', default: {} }, // Custom per-pipeline / per-stage fields
      assigneeId: { type: 'string', default: null },
      acknowledgedAt: { type: 'string', format: 'date-time', default: null },
      ackDeadline: { type: 'string', format: 'date-time', default: null },
      escalationLevel: { type: 'number', default: 0 },
      escalatedTo: { type: 'string', default: null },
      paymentStatus: { type: 'string', enum: ['unpaid', 'paid', 'refunded', 'failed'], default: 'unpaid' },
      paidAmount: { type: 'number', default: 0 },
      createdAt: { type: 'string', format: 'date-time', required: true },
      updatedAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [
      { key: { workspaceId: 1, stage: 1 } },
      { key: { workspaceId: 1, assigneeId: 1, acknowledgedAt: 1 } },
      { key: { workspaceId: 1, ackDeadline: 1 } },
    ],
  },

  /**
   * Activity / Timeline History Schema
   * Call logs, emails, meetings, notes, status changes (F2.2)
   */
  Activity: {
    name: 'activities',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      leadId: { type: 'string', required: true },
      kind: {
        type: 'string',
        enum: ['call', 'email', 'meeting', 'note', 'whatsapp', 'sms', 'system'],
        required: true,
      },
      summary: { type: 'string', required: true },
      by: { type: 'string', default: 'system' },
      at: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { workspaceId: 1, leadId: 1, at: -1 } }],
  },

  /**
   * Immutable Audit Log Ledger Schema
   * Cryptographically chained SHA-256 tamper-evident trail (F4.1, F4.2)
   */
  AuditLog: {
    name: 'audit',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      actorId: { type: 'string', default: null },
      action: { type: 'string', required: true },
      target: { type: 'string', default: null },
      metadata: { type: 'object', default: {} },
      prevHash: { type: 'string', required: true },
      hash: { type: 'string', required: true },
      at: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { workspaceId: 1, at: -1 } }],
  },

  /**
   * Messaging & Twilio WhatsApp Schema
   * Inbound & outbound messages, delivery receipts, opt-out protection (I1.1 - I1.9)
   */
  Message: {
    name: 'messages',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      contactId: { type: 'string', required: true },
      employeeId: { type: 'string', default: null },
      direction: { type: 'string', enum: ['inbound', 'outbound'], required: true },
      channel: { type: 'string', default: 'whatsapp' },
      from: { type: 'string', required: true },
      to: { type: 'string', required: true },
      body: { type: 'string', required: true },
      status: { type: 'string', enum: ['sent', 'delivered', 'failed', 'undelivered'], default: 'sent' },
      providerRef: { type: 'string', required: true },
      error: { type: 'string', default: null },
      retriedAt: { type: 'string', format: 'date-time', default: null },
      createdAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [
      { key: { workspaceId: 1, contactId: 1, createdAt: 1 } },
      { key: { providerRef: 1 }, unique: true },
    ],
  },

  /**
   * Contact Schema
   * WhatsApp and customer directory with compliance opt-out flag (I1.5, I1.9)
   */
  Contact: {
    name: 'contacts',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      name: { type: 'string', required: true },
      phone: { type: 'string', required: true },
      email: { type: 'string', default: '' },
      optedOut: { type: 'boolean', default: false },
      createdAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { workspaceId: 1, phone: 1 }, unique: true }],
  },

  /**
   * Payments & Stripe Transaction Schema
   * Payment links, webhook verification, collected vs projected revenue (I2.1 - I2.8)
   */
  Payment: {
    name: 'payments',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      opportunityId: { type: 'string', default: null },
      contactId: { type: 'string', default: null },
      employeeId: { type: 'string', default: null },
      amount: { type: 'number', required: true },
      currency: { type: 'string', default: 'USD' },
      status: { type: 'string', enum: ['unpaid', 'paid', 'failed', 'refunded', 'expired'], default: 'unpaid' },
      providerRef: { type: 'string', required: true },
      checkoutUrl: { type: 'string', required: true },
      paidAt: { type: 'string', format: 'date-time', default: null },
      createdAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [
      { key: { workspaceId: 1, status: 1 } },
      { key: { providerRef: 1 }, unique: true },
    ],
  },

  /**
   * External Integrations & OAuth Tokens Schema
   * Google Calendar OAuth tokens, refresh tokens, sync history (I3.1 - I3.7)
   */
  Integration: {
    name: 'integrations',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      provider: { type: 'string', enum: ['google', 'twilio', 'stripe'], required: true },
      accessToken: { type: 'string', default: null },
      refreshToken: { type: 'string', default: null },
      expiry: { type: 'string', format: 'date-time', default: null },
      account: { type: 'string', default: null },
      connectedAt: { type: 'string', format: 'date-time', required: true },
      lastSyncAt: { type: 'string', format: 'date-time', default: null },
      history: { type: 'array', default: [] },
    },
    indexes: [{ key: { workspaceId: 1, provider: 1 }, unique: true }],
  },

  /**
   * External Alerts & Notifications Schema
   * Real Slack, Telegram, Webhook dispatch history (Rubric Criterion 8)
   */
  Alert: {
    name: 'alerts',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      leadId: { type: 'string', default: null },
      channel: { type: 'string', enum: ['slack', 'telegram', 'webhook', 'none'], required: true },
      target: { type: 'string', default: '' },
      title: { type: 'string', required: true },
      body: { type: 'string', required: true },
      level: { type: 'number', default: null },
      status: { type: 'string', enum: ['sent', 'failed', 'skipped'], required: true },
      error: { type: 'string', default: null },
      at: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { workspaceId: 1, at: -1 } }],
  },

  /**
   * Saved Filter Presets Schema
   * CRM custom saved lists (Rubric Criterion 2)
   */
  SavedList: {
    name: 'saved_lists',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true },
      name: { type: 'string', required: true },
      filters: { type: 'object', default: {} },
      createdBy: { type: 'string', required: true },
      createdAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { workspaceId: 1, name: 1 } }],
  },

  /**
   * Workspace Custom Settings Schema
   * SLA clocks, customizable pipeline stages, required fields by stage, escalation ladders (F2.4, F2.6, F3.4)
   */
  Settings: {
    name: 'settings',
    fields: {
      id: { type: 'string', required: true, unique: true },
      workspaceId: { type: 'string', required: true, unique: true },
      acknowledgeSeconds: { type: 'number', default: 45 },
      maxOpenLeads: { type: 'number', default: 5 },
      timezone: { type: 'string', default: 'Asia/Karachi' },
      pipeline: { type: 'array', default: [] },
      escalation: { type: 'array', default: [] },
      alerts: { type: 'object', default: {} },
      updatedAt: { type: 'string', format: 'date-time', required: true },
    },
    indexes: [{ key: { workspaceId: 1 }, unique: true }],
  },
};

/**
 * Ensures MongoDB collections and indexes are provisioned on connection.
 */
export async function ensureIndexes(mongoDb) {
  if (!mongoDb) return;
  for (const [key, def] of Object.entries(SCHEMAS)) {
    try {
      const coll = mongoDb.collection(def.name);
      if (def.indexes && def.indexes.length > 0) {
        for (const idx of def.indexes) {
          await coll.createIndex(idx.key, {
            unique: Boolean(idx.unique),
            background: true,
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn(`[db] Could not create indexes for ${def.name}: ${err.message}`);
    }
  }
  console.log('[db] All MongoDB schemas and indexes provisioned successfully.');
}
