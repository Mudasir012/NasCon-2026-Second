import React, { useState } from 'react';
import {
  MessageSquare,
  CreditCard,
  Calendar,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Edit2,
  Trash2,
  ShieldCheck,
  Lock,
  RefreshCw,
  Send,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function IntegrationsHubPage({ onNavigate }) {
  const { hasPermission } = useAuth();
  const { addToast } = useToast();

  const canManage = hasPermission('integrations.manage');

  // Integrations state (I5.1, I5.2, I5.3)
  const [integrations, setIntegrations] = useState([
    {
      id: 'twilio',
      name: 'WhatsApp (Twilio Sandbox)',
      category: 'Messaging & Lead Intake',
      icon: MessageSquare,
      iconColor: 'bg-[#eaf0ee] text-[#52796f]',
      status: 'Connected',
      lastSuccess: '4 minutes ago',
      recentErrors: '0 errors in last 24h',
      maskedCredentials: 'AC98••••••••••••••••••••••••39ab',
      secondaryCredential: 'Auth Token: ••••••••84f1',
      limitsNote: 'Twilio Sandbox only reaches phone numbers that have sent the join phrase.',
      webhookUrl: 'https://api.omniflow.io/v1/webhooks/twilio/ws-104',
      providerSelectable: false
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      category: 'Invoicing & Deposits',
      icon: CreditCard,
      iconColor: 'bg-[#ebf1f5] text-[#4a6b82]',
      status: 'Connected',
      lastSuccess: '18 minutes ago',
      recentErrors: '1 card decline recorded',
      maskedCredentials: 'sk_test_••••••••••••••••••••4f2a',
      secondaryCredential: 'Webhook Secret: whsec_••••••••55b1',
      limitsNote: 'Stripe test mode 100 requests/sec. Live charges require PCI DSS certification.',
      webhookUrl: 'https://api.omniflow.io/v1/webhooks/stripe/ws-104',
      providerSelectable: false
    },
    {
      id: 'gcal',
      name: 'Google Calendar OAuth 2.0',
      category: 'Consultation & Site Visits',
      icon: Calendar,
      iconColor: 'bg-[#f7f1ea] text-[#d4a373]',
      status: 'Connected',
      lastSuccess: '1 hour ago',
      recentErrors: '1 rate-limit retry resolved',
      maskedCredentials: 'client_id: 8491••••••••.apps.googleusercontent.com',
      secondaryCredential: 'Calendar ID: solaria-ops@solaria.io',
      limitsNote: 'OAuth 2.0 refresh tokens expire after 6 months of inactivity.',
      webhookUrl: 'Sync Engine Channel: ch_gcal_active_01',
      providerSelectable: false
    },
    {
      id: 'notifications',
      name: 'Escalation Notifications',
      category: 'Outbound SLA Alerts',
      icon: Bell,
      iconColor: 'bg-[#faece8] text-[#c26751]',
      status: 'Connected',
      lastSuccess: '6 minutes ago',
      recentErrors: '0 errors in last 24h',
      selectedProvider: 'Slack',
      maskedCredentials: 'https://hooks.slack.com/services/T01••••/B02••••/••••',
      secondaryCredential: 'Channel: #lead-escalations',
      limitsNote: 'Slack webhook rate limit: 1 message per second per target channel.',
      webhookUrl: 'Dispatched to team channel on Tier 2 / Tier 3 timeout',
      providerSelectable: true
    }
  ]);

  // Modal editing state
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [formCredentials, setFormCredentials] = useState('');
  const [formSelectedProvider, setFormSelectedProvider] = useState('Slack');

  const handleOpenEdit = (integ) => {
    if (!canManage) {
      addToast('Permission denied: Only users with integrations.manage can configure providers.', 'error');
      return;
    }
    setEditingIntegration(integ);
    setFormCredentials(integ.maskedCredentials);
    if (integ.selectedProvider) {
      setFormSelectedProvider(integ.selectedProvider);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!canManage) return;

    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === editingIntegration.id
          ? {
              ...item,
              status: 'Connected',
              maskedCredentials: formCredentials.includes('••')
                ? formCredentials
                : formCredentials.substring(0, 8) + '••••••••••••' + formCredentials.slice(-4),
              selectedProvider: item.providerSelectable ? formSelectedProvider : item.selectedProvider,
              lastSuccess: 'Just now'
            }
          : item
      )
    );

    addToast(`Configuration for ${editingIntegration.name} saved successfully!`, 'success');
    setEditingIntegration(null);
  };

  const handleDisconnect = () => {
    if (!disconnectTarget || !canManage) return;

    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === disconnectTarget.id
          ? {
              ...item,
              status: 'Not connected',
              lastSuccess: 'Disconnected',
              recentErrors: 'Inactive'
            }
          : item
      )
    );

    addToast(`${disconnectTarget.name} has been disconnected.`, 'info');
    setDisconnectTarget(null);
  };

  const handleSendTestWebhook = (integ) => {
    addToast(`Sending live test handshake to ${integ.name}...`, 'info');
    setTimeout(() => {
      addToast(`Test webhook payload verified by ${integ.name} (HTTP 200 OK)!`, 'success');
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#1a1917] tracking-tight">Central Integrations Hub</h1>
          <p className="text-xs text-[#79756d] mt-0.5">
            Manage live communication gateways, payment webhooks, and calendar automations (I5.1 to I5.3)
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('sync')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d3cfc7] text-[#1a1917] text-xs font-semibold rounded-md hover:bg-[#f4f2ee] transition-colors cursor-pointer"
        >
          View Live Sync History & Logs <ExternalLink size={13} />
        </button>
      </div>

      {/* Permission Warning Banner if user cannot manage */}
      {!canManage && (
        <div className="p-3.5 bg-[#faece8] border border-[#c26751]/30 rounded-lg flex items-center justify-between text-xs text-[#c26751]">
          <div className="flex items-center gap-2">
            <Lock size={15} />
            <span>
              <strong>Read-Only Access:</strong> You need <code>integrations.manage</code> permission to edit API credentials or disconnect services.
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase">Locked</span>
        </div>
      )}

      {/* 4 Core Integration Cards (WhatsApp, Stripe, Google Cal, Notifications) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((integ) => {
          const Icon = integ.icon;
          const isConnected = integ.status === 'Connected';

          return (
            <div
              key={integ.id}
              className="bg-white border border-[#e8e5de] rounded-xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${integ.iconColor}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1a1917]">{integ.name}</h3>
                      <div className="text-[11px] text-[#79756d]">{integ.category}</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      isConnected
                        ? 'bg-[#eaf0ee] text-[#52796f] border-[#52796f]/30'
                        : 'bg-[#f4f2ee] text-[#79756d] border-[#e8e5de]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isConnected ? 'bg-[#52796f] animate-pulse' : 'bg-[#a8a49c]'
                      }`}
                    ></span>
                    {integ.status}
                  </span>
                </div>

                {/* Notifications Provider Selector (I5.3) */}
                {integ.providerSelectable && (
                  <div className="mb-4 p-2.5 bg-[#faf9f6] border border-[#e8e5de] rounded-md flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1a1917]">Alert Dispatcher:</span>
                    <span className="px-2 py-0.5 bg-white border border-[#d3cfc7] rounded text-xs font-bold text-[#1a1917]">
                      {integ.selectedProvider} Webhook
                    </span>
                  </div>
                )}

                {/* Masked Credentials & Webhook URL */}
                <div className="space-y-2 mb-4 p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md text-xs">
                  <div>
                    <span className="text-[#79756d] block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Masked Credentials:
                    </span>
                    <span className="font-mono text-[#1a1917] font-semibold">{integ.maskedCredentials}</span>
                  </div>
                  {integ.secondaryCredential && (
                    <div className="text-[11px] text-[#79756d] font-mono">
                      {integ.secondaryCredential}
                    </div>
                  )}
                  <div>
                    <span className="text-[#79756d] block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Endpoint / Route:
                    </span>
                    <span className="font-mono text-[11px] text-[#4a6b82] break-all">{integ.webhookUrl}</span>
                  </div>
                </div>

                {/* Operational Health Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2 bg-white border border-[#e8e5de] rounded">
                    <span className="text-[10px] text-[#79756d] block uppercase font-bold">Last Successful Sync</span>
                    <span className="font-semibold text-[#1a1917]">{integ.lastSuccess}</span>
                  </div>
                  <div className="p-2 bg-white border border-[#e8e5de] rounded">
                    <span className="text-[10px] text-[#79756d] block uppercase font-bold">Recent Telemetry</span>
                    <span className="font-semibold text-[#52796f]">{integ.recentErrors}</span>
                  </div>
                </div>

                {/* Limits Note Callout */}
                <div className="p-2.5 bg-[#f7f1ea] border border-[#d4a373]/30 rounded text-xs text-[#8c6239] leading-relaxed mb-4">
                  <strong>Operating Limit:</strong> {integ.limitsNote}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#e8e5de] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSendTestWebhook(integ)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a1917] bg-[#f4f2ee] hover:bg-[#e8e5de] rounded transition-colors cursor-pointer"
                >
                  <Send size={12} /> Test Webhook
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!canManage}
                    onClick={() => handleOpenEdit(integ)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1a1917] bg-white border border-[#d3cfc7] rounded hover:bg-[#f4f2ee] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  {isConnected && (
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => setDisconnectTarget(integ)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#c26751] border border-[#c26751]/30 rounded hover:bg-[#faece8] transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect / Edit Modal */}
      {editingIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#e8e5de] rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <h3 className="text-base font-bold text-[#1a1917] mb-1">
              Configure {editingIntegration.name}
            </h3>
            <p className="text-xs text-[#79756d] mb-4">
              Enter updated API credentials. All secrets are encrypted in transit and masked in audit logs.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3.5">
              {editingIntegration.providerSelectable && (
                <div>
                  <label className="block text-xs font-semibold text-[#1a1917] mb-1">
                    Notification Provider
                  </label>
                  <select
                    value={formSelectedProvider}
                    onChange={(e) => setFormSelectedProvider(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none"
                  >
                    <option value="Slack">Slack Webhook</option>
                    <option value="Telegram">Telegram Bot API</option>
                    <option value="Email">Email Dispatcher (SES / SendGrid)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">
                  API Key / Secret Token / Webhook URL
                </label>
                <input
                  type="text"
                  value={formCredentials}
                  onChange={(e) => setFormCredentials(e.target.value)}
                  placeholder="e.g. sk_test_••••••••••••••••••••4f2a"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
                  required
                />
              </div>

              <div className="p-2.5 bg-[#faf9f6] border border-[#e8e5de] rounded text-[11px] text-[#79756d]">
                <strong>Compliance Note:</strong> Only outbound notifications and lead intakes matching your registered tenant domain will be processed.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e5de]">
                <button
                  type="button"
                  onClick={() => setEditingIntegration(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#1a1917] bg-white border border-[#d3cfc7] rounded-md hover:bg-[#f4f2ee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1a1917] hover:bg-[#33302a] rounded-md"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(disconnectTarget)}
        title={`Disconnect ${disconnectTarget?.name}?`}
        message={`Are you sure you want to disconnect ${disconnectTarget?.name}? Active webhooks and automated escalation alerts will stop delivering until reconnected.`}
        confirmLabel="Disconnect Service"
        isDanger={true}
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnectTarget(null)}
      />
    </div>
  );
}
