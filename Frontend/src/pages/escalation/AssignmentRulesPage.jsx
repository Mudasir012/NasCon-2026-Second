import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  Users,
  AlertTriangle,
  Bell,
  Save,
  CheckCircle2,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function AssignmentRulesPage() {
  const [roundRobinEnabled, setRoundRobinEnabled] = useState(true);
  const [maxOpenLeads, setMaxOpenLeads] = useState(5);
  const [ackWindowSeconds, setAckWindowSeconds] = useState(45); // Seconds for easy demo (Section 4)
  const [tier1Timeout, setTier1Timeout] = useState(45);
  const [tier2Timeout, setTier2Timeout] = useState(60);
  const [tier3Action, setTier3Action] = useState('manager_recovery');
  const [reassignOnLeave, setReassignOnLeave] = useState(true);
  const [acknowledgedLeadTreatment, setAcknowledgedLeadTreatment] = useState('retain_with_warning');
  const [notificationChannel, setNotificationChannel] = useState('slack');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXXX');
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
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
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1917] text-white rounded-md text-xs font-semibold hover:bg-[#33302a] transition-all shadow-sm"
        >
          <Save size={14} />
          <span>Save Rule Engine</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-3 bg-[#eaf0ee] border border-[#52796f]/30 text-[#52796f] rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>Assignment and SLA escalation rules updated successfully. Real-time engine synced.</span>
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
              max="25"
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
              Time the assignee has to click Acknowledge or record an action before escalating (configurable in seconds for demo).
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="600"
                value={ackWindowSeconds}
                onChange={(e) => setAckWindowSeconds(Number(e.target.value))}
                className="w-32 p-1.5 border border-[#d3cfc7] rounded bg-white text-[#1a1917] text-xs font-mono font-bold"
              />
              <span className="text-[#79756d] text-xs">seconds ({Math.round(ackWindowSeconds / 60 * 10) / 10} mins)</span>
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
              <div className="flex justify-between font-semibold text-[#1a1917] mb-1">
                <span>Tier 1: Next Eligible Round-Robin Employee</span>
                <span className="font-mono text-[#c26751]">{tier1Timeout}s SLA</span>
              </div>
              <div className="text-[11px] text-[#79756d]">Triggers automatically when primary assignee window expires.</div>
            </div>

            <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md">
              <div className="flex justify-between font-semibold text-[#1a1917] mb-1">
                <span>Tier 2: Designated Backup Specialist (Elena Rostova)</span>
                <span className="font-mono text-[#c26751]">{tier2Timeout}s SLA</span>
              </div>
              <div className="text-[11px] text-[#79756d]">High-priority escalation to pre-assigned backup specialist.</div>
            </div>

            <div className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md">
              <div className="flex justify-between font-semibold text-[#1a1917] mb-1">
                <span>Tier 3: Sales Manager & Recovery Queue</span>
                <span className="text-[#52796f] font-semibold">Immediate</span>
              </div>
              <div className="text-[11px] text-[#79756d]">Places lead in Recovery Queue with urgent manager broadcast.</div>
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
              {['slack', 'telegram', 'email'].map((ch) => (
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
