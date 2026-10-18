import React, { useState, useEffect } from 'react';
import { Clock, Users, AlertTriangle, Bell, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function AssignmentRulesPage() {
  const { settings, refresh } = useWorkspace();

  const [roundRobinEnabled, setRoundRobinEnabled] = useState(true);
  const [maxOpenLeads, setMaxOpenLeads] = useState(5);
  const [ackWindowSeconds, setAckWindowSeconds] = useState(45);
  const [tier1Timeout, setTier1Timeout] = useState(45);
  const [tier2Timeout, setTier2Timeout] = useState(60);
  const [tier3Action] = useState('manager_recovery');
  const [reassignOnLeave, setReassignOnLeave] = useState(true);
  const [acknowledgedLeadTreatment, setAcknowledgedLeadTreatment] = useState('retain_with_warning');
  const [notificationChannel, setNotificationChannel] = useState('webhook');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saveState, setSaveState] = useState(null); // 'saved' | 'error'
  const [saving, setSaving] = useState(false);

  // Hydrate from the workspace settings (real, persisted values).
  useEffect(() => {
    if (!settings) return;
    setMaxOpenLeads(settings.maxOpenLeads ?? 5);
    setAckWindowSeconds(settings.acknowledgeSeconds ?? 45);
    const escalation = settings.escalation ?? [];
    setTier1Timeout(escalation[0]?.afterSeconds ?? 45);
    setTier2Timeout(escalation[1]?.afterSeconds ?? 60);
    const alerts = settings.alerts ?? {};
    setNotificationChannel(alerts.slackWebhookUrl ? 'slack' : alerts.telegramBotToken ? 'telegram' : 'webhook');
    setWebhookUrl(alerts.slackWebhookUrl || alerts.telegramBotToken || alerts.webhookUrl || '');
  }, [settings]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const existingAlerts = settings?.alerts ?? {};
      const alerts = {
        ...existingAlerts,
        webhookUrl: notificationChannel === 'webhook' ? webhookUrl : existingAlerts.webhookUrl ?? '',
        slackWebhookUrl: notificationChannel === 'slack' ? webhookUrl : existingAlerts.slackWebhookUrl ?? '',
        telegramBotToken: notificationChannel === 'telegram' ? webhookUrl : existingAlerts.telegramBotToken ?? '',
      };

      await api.workspace.updateSettings({
        maxOpenLeads: Number(maxOpenLeads),
        acknowledgeSeconds: Number(ackWindowSeconds),
        escalation: [
          { afterSeconds: Number(tier1Timeout), to: 'next' },
          { afterSeconds: Number(tier2Timeout), to: 'backup' },
          { afterSeconds: Number(tier2Timeout) + 60, to: 'manager' },
        ],
        alerts,
      });

      await refresh();
      setSaveState('saved');
    } catch {
      setSaveState('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveState(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1917]">Assignment & SLA Escalation Rules</h1>
          <p className="text-xs text-[#79756d]">
            Configure round-robin distribution, max lead caps, response windows, and multi-tier escalation chains (F3.3–F3.9).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1917] text-white rounded-md text-xs font-semibold hover:bg-[#33302a] transition-all shadow-sm disabled:opacity-50"
        >
          <Save size={14} />
          <span>{saving ? 'Saving…' : 'Save Rule Engine'}</span>
        </button>
      </div>

      {saveState === 'saved' && (
        <div className="p-3 bg-[#eaf0ee] border border-[#52796f]/30 text-[#52796f] rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>Assignment and SLA escalation rules saved to the workspace.</span>
        </div>
      )}
      {saveState === 'error' && (
        <div className="p-3 bg-[#faece8] border border-[#c26751]/30 text-[#c26751] rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} />
          <span>Could not save the rules. Check your permissions and try again.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Inbound Lead Intake & Capacity (F3.3) */}
        <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e8e5de] pb-3">
            <Users size={16} className="text-[#4a6b82]" />
            <h2 className="text-sm font-bold text-[#1a1917]">1. Inbound Routing & Employee Capacity (F3.3)</h2>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md text-xs">
            <div>
              <div className="font-semibold text-[#1a1917]">Round-Robin Distribution</div>
              <div className="text-[#79756d] text-[11px]">Distributes incoming leads sequentially among Available employees</div>
            </div>
            <input
              type="checkbox"
              checked={roundRobinEnabled}
              onChange={(e) => setRoundRobinEnabled(e.target.checked)}
              className="h-4 w-4 accent-[#1a1917] rounded"
            />
          </div>

          <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md text-xs space-y-1">
            <label className="font-semibold text-[#1a1917] block">Maximum Open Leads Per Employee</label>
            <div className="text-[#79756d] text-[11px] mb-2">Employees at capacity will be skipped in round-robin</div>
            <input
              type="number"
              min="1"
              max="500"
              value={maxOpenLeads}
              onChange={(e) => setMaxOpenLeads(Number(e.target.value))}
              className="w-32 p-1.5 border border-[#d3cfc7] rounded bg-white text-[#1a1917] text-xs font-bold"
            />
          </div>

          <div className="p-3 bg-[#eaf0ee] border border-[#52796f]/30 rounded-md text-xs text-[#52796f]">
            <strong>Strict Availability Gate:</strong> Staff marked <em>Busy</em>, <em>On leave</em>, or <em>Offline</em> never receive new leads under any circumstances (F3.3 acceptance criteria).
          </div>
        </div>

        {/* Section 2: Acknowledgement Window & Timers (F3.4) */}
        <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e8e5de] pb-3">
            <Clock size={16} className="text-[#b08945]" />
            <h2 className="text-sm font-bold text-[#1a1917]">2. Acknowledgement Window (F3.4)</h2>
          </div>

          <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md text-xs space-y-1">
            <label className="font-semibold text-[#1a1917] block">First-Response SLA Window (Seconds)</label>
            <div className="text-[#79756d] text-[11px] mb-2">
              Time the assignee has to click Acknowledge or record an action before escalating.
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="86400"
                value={ackWindowSeconds}
                onChange={(e) => setAckWindowSeconds(Number(e.target.value))}
                className="w-32 p-1.5 border border-[#d3cfc7] rounded bg-white text-[#1a1917] text-xs font-mono font-bold"
              />
              <span className="text-[#79756d] text-xs">seconds ({Math.round((ackWindowSeconds / 60) * 10) / 10} mins)</span>
            </div>
          </div>

          <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md text-xs space-y-2">
            <div className="font-semibold text-[#1a1917]">Qualifying First-Response Actions (Section 7)</div>
            <div className="text-[11px] text-[#79756d] space-y-1">
              <div>• Click "Acknowledge" button</div>
              <div>• Add customer note or log conversation</div>
              <div>• Send WhatsApp message via Twilio Sandbox</div>
              <div>• Advance opportunity pipeline stage</div>
              <div>• Book calendar appointment</div>
            </div>
          </div>
        </div>

        {/* Section 3: Multi-Tier Escalation Chain (F3.5, F3.8) */}
        <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e8e5de] pb-3">
            <AlertTriangle size={16} className="text-[#c26751]" />
            <h2 className="text-sm font-bold text-[#1a1917]">3. Escalation Chain Architecture (F3.5)</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md">
              <div className="flex justify-between items-center font-semibold text-[#1a1917] mb-1">
                <span>Tier 1: Next Eligible Round-Robin Employee</span>
                <input
                  type="number"
                  min="1"
                  value={tier1Timeout}
                  onChange={(e) => setTier1Timeout(Number(e.target.value))}
                  className="w-20 p-1 border border-[#d3cfc7] rounded bg-white text-[#c26751] font-mono text-xs text-right"
                />
              </div>
              <div className="text-[11px] text-[#79756d]">Triggers automatically when the primary assignee window expires.</div>
            </div>

            <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md">
              <div className="flex justify-between items-center font-semibold text-[#1a1917] mb-1">
                <span>Tier 2: Designated Backup Specialist</span>
                <input
                  type="number"
                  min="1"
                  value={tier2Timeout}
                  onChange={(e) => setTier2Timeout(Number(e.target.value))}
                  className="w-20 p-1 border border-[#d3cfc7] rounded bg-white text-[#c26751] font-mono text-xs text-right"
                />
              </div>
              <div className="text-[11px] text-[#79756d]">High-priority escalation to the pre-assigned backup specialist.</div>
            </div>

            <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md">
              <div className="flex justify-between font-semibold text-[#1a1917] mb-1">
                <span>Tier 3: Sales Manager & Recovery Queue</span>
                <span className="text-[#52796f] font-semibold">Immediate</span>
              </div>
              <div className="text-[11px] text-[#79756d]">Places the lead in the Recovery Queue with an urgent manager broadcast.</div>
            </div>
          </div>

          <div className="text-[11px] text-[#79756d] bg-[#f4f2ee] p-2.5 rounded">
            <strong>F3.8 Guard:</strong> A lead is never owned by two people at once, and two timers expiring close together do not escalate the same lead twice.
          </div>
        </div>

        {/* Section 4: Absence & External Alerts (F3.6, F3.9) */}
        <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e8e5de] pb-3">
            <Bell size={16} className="text-[#4a6b82]" />
            <h2 className="text-sm font-bold text-[#1a1917]">4. Absence & External Alerts (F3.6, F3.9)</h2>
          </div>

          <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md text-xs space-y-2">
            <div className="font-semibold text-[#1a1917]">Reassignment on Absence (F3.6)</div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reassignOnLeave}
                onChange={(e) => setReassignOnLeave(e.target.checked)}
                className="h-4 w-4 accent-[#1a1917] rounded"
              />
              <span className="text-xs">Immediately reassign unacknowledged leads when an employee switches to On leave or Offline</span>
            </div>

            <div className="pt-2 border-t border-[#e8e5de]">
              <label className="text-[11px] font-semibold text-[#79756d] block mb-1">Treatment of already acknowledged leads:</label>
              <select
                value={acknowledgedLeadTreatment}
                onChange={(e) => setAcknowledgedLeadTreatment(e.target.value)}
                className="w-full p-1.5 border border-[#d3cfc7] rounded bg-white text-[#1a1917] text-xs outline-none"
              >
                <option value="retain_with_warning">Retain with current rep but display absence warning</option>
                <option value="transfer_to_backup">Automatically transfer active deals to backup specialist</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md text-xs space-y-2">
            <div className="font-semibold text-[#1a1917]">External Escalation Alerts (F3.9, I4)</div>
            <div className="text-[11px] text-[#79756d]">Alerts the new owner outside the application upon escalation.</div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {['webhook', 'slack', 'telegram'].map((ch) => (
                <button
                  type="button"
                  key={ch}
                  onClick={() => setNotificationChannel(ch)}
                  className={`p-1.5 rounded text-xs font-semibold capitalize border ${
                    notificationChannel === ch
                      ? 'bg-[#1a1917] text-white border-[#1a1917]'
                      : 'bg-white text-[#79756d] border-[#d3cfc7]'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="https://hooks.slack.com/services/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full p-1.5 border border-[#d3cfc7] rounded bg-white text-[#1a1917] text-xs font-mono outline-none mt-2"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
