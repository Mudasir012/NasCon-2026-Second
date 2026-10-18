import React, { useState, useEffect, useCallback } from 'react';
import { AlertOctagon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function RecoveryQueuePage() {
  const { members } = useWorkspace();

  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationMsg, setNotificationMsg] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.crm.getRecoveryQueue();
      setQueueItems(res?.queue ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleReassign = async (leadId, targetRepName, targetRepId) => {
    if (!targetRepId) return;
    try {
      await api.crm.recoverLead(leadId, targetRepId);
      setQueueItems((prev) => prev.filter((item) => item.leadId !== leadId));
      setNotificationMsg(`Lead recovered and locked to ${targetRepName}. Concurrency lock applied (F3.8).`);
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const availableRep = (item) => members.find((m) => m.available && m.id !== item.currentAssigneeId);
  const managerRep = (item) =>
    members.find((m) => (m.level === 'owner' || m.level === 'admin') && m.id !== item.currentAssigneeId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#1a1917]">Recovery Queue (F3.7)</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#faece8] text-[#c26751] border border-[#c26751]/30">
              {queueItems.length} Leads At Risk
            </span>
          </div>
          <p className="text-xs text-[#79756d]">
            Safety net for leads unacknowledged beyond window, escalated twice or more, or idle past configured thresholds.
          </p>
        </div>

        <div className="text-xs text-[#79756d] bg-white border border-[#d3cfc7] px-3 py-1.5 rounded-md font-medium">
          Lock Guard: <span className="text-[#52796f] font-semibold">Active (No duplicate ownership F3.8)</span>
        </div>
      </div>

      {/* Reassignment Toast */}
      {notificationMsg && (
        <div className="p-3 bg-[#eaf0ee] border border-[#52796f]/30 text-[#52796f] rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-[#faece8] border border-[#c26751]/30 text-[#c26751] rounded-lg text-xs font-medium flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{actionError}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#faece8] border border-[#c26751]/30 text-[#c26751] rounded-lg text-xs font-medium flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Safety Net Table */}
      <div className="bg-white border border-[#e8e5de] rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f4f2ee] text-[#79756d] uppercase font-bold text-[10px] border-b border-[#e8e5de]">
            <tr>
              <th className="p-3">Queue ID & Customer</th>
              <th className="p-3">Current Owner</th>
              <th className="p-3">Escalation Count</th>
              <th className="p-3">Root Cause / Recovery Reason (F3.7)</th>
              <th className="p-3">Time In Queue</th>
              <th className="p-3 text-right">Recovery Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e5de]">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#79756d]">Loading recovery queue…</td>
              </tr>
            ) : queueItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#79756d]">
                  <CheckCircle2 size={24} className="mx-auto text-[#52796f] mb-2" />
                  <div className="font-semibold text-sm text-[#1a1917]">Recovery Queue is Clear</div>
                  <div className="text-xs mt-1">All inbound leads are actively owned and responded to within SLA.</div>
                </td>
              </tr>
            ) : (
              queueItems.map((item) => {
                const rep = availableRep(item);
                const manager = managerRep(item);
                return (
                  <tr key={item.id} className="hover:bg-[#faf9f6]">
                    <td className="p-3">
                      <div className="font-bold text-[#1a1917]">{item.customerName}</div>
                      <div className="text-[11px] text-[#79756d] font-mono">{item.id}</div>
                      <div className="text-[11px] text-[#a8a49c]">{item.contact} ({item.intakeSource})</div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-[#1a1917]">{item.currentAssignee}</div>
                      <div className="text-[10px] text-[#c26751]">No action recorded</div>
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#faece8] text-[#c26751] border border-[#c26751]/30">
                        <AlertOctagon size={11} />
                        <span>{item.escalationCount}x Escalated</span>
                      </span>
                    </td>

                    <td className="p-3 text-[#3c3933] max-w-sm">
                      <div className="font-medium leading-relaxed">{item.reason}</div>
                    </td>

                    <td className="p-3 font-mono font-semibold text-[#79756d]">{item.timeInQueue}</td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={!rep}
                          onClick={() => handleReassign(item.leadId, rep.name, rep.id)}
                          className="px-2.5 py-1 bg-[#1a1917] text-white rounded text-xs font-semibold hover:bg-[#33302a] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Reassign to Available Rep
                        </button>
                        <button
                          disabled={!manager}
                          onClick={() => handleReassign(item.leadId, manager.name, manager.id)}
                          className="px-2.5 py-1 bg-white border border-[#d3cfc7] text-[#1a1917] rounded text-xs font-semibold hover:bg-[#f4f2ee] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Escalate to Manager
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* SLA Policy Note */}
      <div className="bg-[#f7f1ea] border border-[#d4a373]/30 rounded-lg p-4 text-xs text-[#3c3933] leading-relaxed">
        <strong>Section 7 Metric Definition:</strong> A Recovery Queue item is a lead that is unacknowledged beyond its window, has escalated two or more times, or has no recorded action for the configured idle period. Resolving an item transfers ownership and registers an immutable entry in the audit history.
      </div>
    </div>
  );
}
