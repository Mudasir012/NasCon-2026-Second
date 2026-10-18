/**
 * OmniFlow Unified API Service Client
 * Interconnects React Frontend with Express + MongoDB Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('omniflow_token') || null;
    this.workspaceId = localStorage.getItem('omniflow_workspace_id') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('omniflow_token', token);
    else localStorage.removeItem('omniflow_token');
  }

  setWorkspaceId(id) {
    this.workspaceId = id;
    if (id) localStorage.setItem('omniflow_workspace_id', id);
    else localStorage.removeItem('omniflow_workspace_id');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(this.workspaceId ? { 'X-Workspace-Id': this.workspaceId } : {}),
      ...(options.headers || {}),
    };

    const url = `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(data?.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.fields = data?.fields;
        throw error;
      }

      return data;
    } catch (err) {
      // In development or when offline, fallback gracefully with informational message
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        console.warn(`[api] Backend unreachable at ${url}. Operating with client fallback.`);
      }
      throw err;
    }
  }

  get(endpoint, headers) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body), headers });
  }

  put(endpoint, body, headers) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers });
  }

  patch(endpoint, body, headers) {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body), headers });
  }

  delete(endpoint, headers) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

const client = new ApiClient();

export const api = {
  client,

  // Health
  health: () => client.get('/health'),

  // Auth (F1.1)
  auth: {
    login: async (email, password) => {
      const data = await client.post('/auth/login', { email, password });
      if (data?.token) client.setToken(data.token);
      return data;
    },
    signup: async (name, email, password) => {
      const data = await client.post('/auth/signup', { name, email, password });
      if (data?.token) client.setToken(data.token);
      return data;
    },
    logout: () => {
      client.setToken(null);
      client.setWorkspaceId(null);
    },
  },

  // CRM & Leads (F2.1 - F2.8, F3.1 - F3.7)
  crm: {
    getMeta: () => client.get('/crm/meta'),
    getStats: () => client.get('/crm/stats'),
    listLeads: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return client.get(`/crm/leads${query ? `?${query}` : ''}`);
    },
    getLead: (id) => client.get(`/crm/leads/${id}`),
    createPublicLead: (data) => client.post('/crm/demo-request', data),
    createLead: (data) => client.post('/crm/leads', data),
    acknowledgeLead: (id) => client.post(`/crm/leads/${id}/acknowledge`),
    reassignLead: (id, assigneeId) => client.post(`/crm/leads/${id}/reassign`, { assigneeId }),
    updateStage: (id, stage) => client.patch(`/crm/leads/${id}/stage`, { stage }),
    addActivity: (id, activity) => client.post(`/crm/leads/${id}/activity`, activity),
  },

  // Workspace & Members (F1.2, F1.3, F3.2)
  workspace: {
    get: () => client.get('/workspace'),
    updateSettings: (settings) => client.put('/workspace/settings', settings),
    listMembers: () => client.get('/workspace/members'),
    updateMember: (id, patch) => client.patch(`/workspace/members/${id}`, patch),
  },

  // Payments / Stripe (I2.1 - I2.8)
  payments: {
    getStatus: () => client.get('/payments/status'),
    getMetrics: () => client.get('/payments/metrics'),
    createLink: (data) => client.post('/payments/create-link', data),
    simulateWebhook: (providerRef, status) => client.post('/payments/simulate-webhook', { providerRef, status }),
  },

  // WhatsApp / Twilio (I1.1 - I1.9)
  whatsapp: {
    simulateIncoming: (from, body) => client.post('/whatsapp/simulate-incoming', { from, body }),
    getConversation: (contactId) => client.get(`/whatsapp/conversation/${contactId}`),
    sendMessage: (contactId, body) => client.post('/whatsapp/send', { contactId, body }),
  },

  // Calendar / Google (I3.1 - I3.7)
  calendar: {
    getAuthUrl: () => client.get('/calendar/auth-url'),
    bookAppointment: (data) => client.post('/calendar/book', data),
    getBusySlots: (params) => client.get('/calendar/busy', params),
  },

  // Audit Log (F4.1 - F4.3)
  audit: {
    list: () => client.get('/audit'),
  },
};
