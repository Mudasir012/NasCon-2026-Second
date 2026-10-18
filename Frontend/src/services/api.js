/**
 * OmniFlow Unified API Service Client
 * Interconnects React Frontend with Express + MongoDB Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('omniflow_token') || null;
    this.workspaceId = localStorage.getItem('omniflow_workspace_id') || null;
    this.onUnauthorized = null;
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

    let response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (err) {
      console.warn(`[api] Backend unreachable at ${url}.`);
      throw err;
    }

    const data = await response.json().catch(() => null);

    if (response.status === 401 && this.token && !endpoint.startsWith('/auth/')) {
      this.setToken(null);
      this.setWorkspaceId(null);
      if (this.onUnauthorized) this.onUnauthorized();
    }

    if (!response.ok) {
      const error = new Error(data?.error || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.fields = data?.fields;
      throw error;
    }

    return data;
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

  // Auth
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
    me: () => client.get('/auth/me'),
    logout: () => {
      client.setToken(null);
      client.setWorkspaceId(null);
    },
  },

  // CRM & Leads
  crm: {
    getMeta: () => client.get('/crm/meta'),
    getStats: () => client.get('/crm/stats'),
    listLeads: (params = {}) => client.get(`/crm/leads${toQuery(params)}`),
    getLead: (id) => client.get(`/crm/leads/${id}`),
    createPublicLead: (data) => client.post('/crm/demo-request', data),
    createLead: (data) => client.post('/crm/leads', data),
    updateLead: (id, patch) => client.patch(`/crm/leads/${id}`, patch),
    deleteLead: (id) => client.delete(`/crm/leads/${id}`),
    acknowledgeLead: (id) => client.post(`/crm/leads/${id}/acknowledge`),
    reassignLead: (id, assigneeId) => client.post(`/crm/leads/${id}/assign`, { memberId: assigneeId }),
    getRecoveryQueue: () => client.get('/crm/recovery-queue'),
    recoverLead: (id, targetMemberId) => client.post(`/crm/leads/${id}/recover`, { targetMemberId }),
    getSavedLists: () => client.get('/crm/saved-lists'),
    createSavedList: (name, filters) => client.post('/crm/saved-lists', { name, filters }),
    updateStage: (id, stage) => client.patch(`/crm/leads/${id}`, { stage }),
    listActivities: (params = {}) => client.get(`/crm/activities${toQuery(params)}`),
    addActivity: (id, activity) => client.post('/crm/activities', { leadId: id, ...activity }),
    getAlerts: () => client.get('/crm/alerts'),
  },

  // Workspace & Members
  workspace: {
    get: () => client.get('/workspace'),
    bootstrap: (workspaceName) => client.post('/workspace/bootstrap', { workspaceName }),
    updateSettings: (settings) => client.put('/workspace/settings', settings),
    listMembers: () => client.get('/workspace/members'),
    updateMember: (id, patch) => client.patch(`/workspace/members/${id}`, patch),
    deleteMember: (id) => client.delete(`/workspace/members/${id}`),
    listRoles: () => client.get('/workspace/roles'),
    createRole: (data) => client.post('/workspace/roles', data),
    updateRole: (id, patch) => client.patch(`/workspace/roles/${id}`, patch),
    deleteRole: (id) => client.delete(`/workspace/roles/${id}`),
  },

  // Payments / Stripe
  payments: {
    list: () => client.get('/payments'),
    getStatus: () => client.get('/payments/status'),
    getMetrics: () => client.get('/payments/metrics'),
    createLink: (data) => client.post('/payments/create-link', data),
    simulateWebhook: (providerRef, status) => client.post('/payments/simulate-webhook', { providerRef, status }),
  },

  // WhatsApp
  whatsapp: {
    info: () => client.get('/whatsapp/info'),
    listConversations: () => client.get('/whatsapp/conversations'),
    simulateIncoming: (from, body) => client.post('/whatsapp/simulate-incoming', { from, body }),
    getConversation: (contactId) => client.get(`/whatsapp/conversation/${contactId}`),
    sendMessage: (contactId, body) => client.post('/whatsapp/send', { contactId, body }),
    getFailures: () => client.get('/whatsapp/failures'),
    retryMessage: (id) => client.post(`/whatsapp/messages/${id}/retry`),
    setOptOut: (contactId, optedOut) => client.post(`/whatsapp/contacts/${contactId}/opt-out`, { optedOut }),
  },

  // Calendar / Google
  calendar: {
    getStatus: () => client.get('/calendar/status'),
    getAuthUrl: () => client.get('/calendar/authorize'),
    disconnect: () => client.delete('/calendar/connection'),
    bookAppointment: (data) => client.post('/calendar/book', data),
    getBusySlots: (params = {}) => client.get(`/calendar/busy${toQuery(params)}`),
  },

  // Audit Log
  audit: {
    list: (params = {}) => client.get(`/audit${toQuery(params)}`),
  },
};
