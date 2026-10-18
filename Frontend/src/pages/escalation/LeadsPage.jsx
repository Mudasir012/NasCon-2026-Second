import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  CheckCircle2,
  MessageSquare,
  Globe,
  UserPlus,
  Search,
  AlertCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const SOURCE_LABELS = {
  website: 'Web Form',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  'walk-in': 'Walk-in',
  phone: 'Phone',
  referral: 'Referral',
  event: 'Event',
  manual: 'Manual Entry',
};

function SourceBadge({ source }) {
  const label = SOURCE_LABELS[source] ?? source;
  const style =
    source === 'whatsapp'
      ? 'bg-[#ebf1f5] text-[#4a6b82] border-[#4a6b82]/30'
      : source === 'website'
        ? 'bg-[#eaf0ee] text-[#52796f] border-[#52796f]/30'
        : 'bg-[#f7f1ea] text-[#b08945] border-[#b08945]/30';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${style}`}>
      {source === 'whatsapp' && <MessageSquare size={11} />}
      {source === 'website' && <Globe size={11} />}
      {source === 'manual' && <UserPlus size={11} />}
      <span>{label}</span>
    </span>
  );
}

export default function LeadsPage({ onNavigate }) {
  const { leads, sources, loading, error, acknowledgeLead, createLead } = useCRM();

  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'manual', programme: '' });
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secondsRemaining = (lead) => {
    if (!lead.ackDeadline || lead.acknowledgedAt) return 0;
    return Math.max(0, Math.round((new Date(lead.ackDeadline).getTime() - now) / 1000));
  };

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeLead(id);
    } catch (err) {
      console.warn('[leads] acknowledge failed:', err.message);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLead.name) return;
    setSubmitting(true);
    try {
      await createLead(newLead);
      setIsModalOpen(false);
      setNewLead({ name: '', email: '', phone: '', source: 'manual', programme: '' });
    } catch (err) {
      console.warn('[leads] create failed:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      (lead.name ?? '').toLowerCase().includes(query) ||
      (lead.programme ?? '').toLowerCase().includes(query) ||
      (lead.assigneeName ?? '').toLowerCase().includes(query);
    return matchesSource && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1917]">Leads Ledger & Intake</h1>
          <p className="text-xs text-[#79756d]">
            Inbound multi-source capture (F3.1) with guaranteed single ownership and SLA response windows (F3.4).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1a1917] text-white rounded-md text-xs font-semibold hover:bg-[#33302a] transition-all"
        >
          <Plus size={14} />
          <span>Create Inbound Lead</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-[#c26751]/30 bg-[#faece8] px-3 py-2 text-xs text-[#c26751]">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar (F2.6, F3.1) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#e8e5de] rounded-lg">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-[#79756d]" />
          <input
            type="text"
            placeholder="Search leads, project, or assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs text-[#1a1917] outline-none bg-transparent w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#79756d] font-medium">Source Filter:</span>
          {['ALL', ...sources].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                sourceFilter === src
                  ? 'bg-[#1a1917] text-white border-[#1a1917]'
                  : 'bg-white text-[#79756d] border-[#d3cfc7] hover:bg-[#f4f2ee]'
              }`}
            >
              {src === 'ALL' ? 'ALL' : SOURCE_LABELS[src] ?? src}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-[#e8e5de] rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f4f2ee] text-[#79756d] uppercase font-bold text-[10px] border-b border-[#e8e5de]">
            <tr>
              <th className="p-3">Lead ID & Customer</th>
              <th className="p-3">Source (F3.1)</th>
              <th className="p-3">Inquiry / Opportunity</th>
              <th className="p-3">Assigned Owner</th>
              <th className="p-3">Response SLA Window (F3.4)</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e5de]">
            {loading && leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#79756d]">Loading leads…</td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#79756d]">
                  No leads match the current filters.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const isPending = !lead.acknowledgedAt;
                const remaining = secondsRemaining(lead);
                return (
                  <tr key={lead.id} className="hover:bg-[#faf9f6]">
                    <td className="p-3">
                      <div className="font-bold text-[#1a1917]">{lead.name}</div>
                      <div className="text-[11px] text-[#79756d] font-mono">
                        {lead.id.slice(0, 8)} • {lead.email || lead.phone || 'no contact'}
                      </div>
                    </td>

                    <td className="p-3">
                      <SourceBadge source={lead.source} />
                    </td>

                    <td className="p-3 text-[#3c3933]">
                      <div className="font-medium">{lead.programme || lead.notes || '—'}</div>
                      <div className="text-[11px] text-[#a8a49c]">Stage: {lead.stage}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-[#1a1917]">{lead.assigneeName || 'Unassigned'}</div>
                      <div className="text-[10px] text-[#52796f]">Single ownership guaranteed</div>
                    </td>

                    <td className="p-3">
                      {isPending ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#faece8] border border-[#c26751]/30 text-[#c26751] font-mono font-bold text-xs">
                          <Clock size={12} />
                          <span>{remaining}s remaining</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[#52796f] font-semibold text-xs">
                          <CheckCircle2 size={13} />
                          <span>Acknowledged</span>
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {isPending ? (
                        <button
                          onClick={() => handleAcknowledge(lead.id)}
                          className="px-3 py-1 bg-[#1a1917] text-white rounded text-xs font-semibold hover:bg-[#33302a] transition-all"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate && onNavigate('opportunity')}
                          className="px-2.5 py-1 text-[#4a6b82] hover:text-[#1a1917] text-xs font-semibold hover:underline"
                        >
                          Open Record →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Inbound Lead Intake */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-[#e8e5de] rounded-xl shadow-lg p-6">
            <h3 className="text-base font-bold text-[#1a1917] mb-1">Capture Inbound Lead (F3.1)</h3>
            <p className="text-xs text-[#79756d] mb-4">
              Creates a lead via the API and triggers automated round-robin assignment.
            </p>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1a1917] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Vance"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#1a1917] mb-1">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1a1917] mb-1">Phone</label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1a1917] mb-1">Intake Source Channel (F3.1)</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="website">Public Website Form</option>
                  <option value="phone">Phone</option>
                  <option value="referral">Referral</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1a1917] mb-1">Inquiry / Project Details</label>
                <input
                  type="text"
                  placeholder="e.g. 50kW Commercial Solar Roof Inspection"
                  value={newLead.programme}
                  onChange={(e) => setNewLead({ ...newLead, programme: e.target.value })}
                  className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e8e5de]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-[#d3cfc7] text-[#79756d] rounded hover:bg-[#f4f2ee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#1a1917] text-white font-semibold rounded hover:bg-[#33302a] disabled:opacity-50"
                >
                  {submitting ? 'Dispatching…' : 'Dispatch to Round-Robin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
