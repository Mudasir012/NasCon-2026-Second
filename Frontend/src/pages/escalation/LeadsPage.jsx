import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Globe,
  UserPlus,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

export default function LeadsPage({ onNavigate }) {
  const [leads, setLeads] = useState([
    {
      id: 'LD-101',
      name: 'Sarah Jenkins',
      email: 's.jenkins@apexroof.com',
      phone: '+1 415 992 0184',
      source: 'WhatsApp',
      inquiry: 'Commercial Solar Installation (45 kW)',
      assignedTo: 'Marcus Vance',
      assignedAt: '2m ago',
      timeRemaining: 34,
      status: 'Pending Acknowledgment'
    },
    {
      id: 'LD-102',
      name: 'Michael Chang',
      email: 'mchang@novabuilders.io',
      phone: '+1 408 551 2290',
      source: 'Web Form',
      inquiry: 'Inverter Upgrade & Battery Backup',
      assignedTo: 'Elena Rostova',
      assignedAt: '8m ago',
      timeRemaining: 0,
      status: 'Acknowledged'
    },
    {
      id: 'LD-103',
      name: 'Highland Dental Associates',
      email: 'office@highlanddental.com',
      phone: '+1 212 884 9310',
      source: 'Manual Entry',
      inquiry: 'Clinic HVAC Solar Integration',
      assignedTo: 'Marcus Vance',
      assignedAt: '1m ago',
      timeRemaining: 52,
      status: 'Pending Acknowledgment'
    },
    {
      id: 'LD-104',
      name: 'David K. Ross',
      email: 'david@rossrealty.net',
      phone: '+1 617 339 4481',
      source: 'WhatsApp',
      inquiry: 'Multi-family residential quote',
      assignedTo: 'Jordan Reed',
      assignedAt: '25m ago',
      timeRemaining: 0,
      status: 'Acknowledged'
    }
  ]);

  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'Manual Entry', inquiry: '' });

  // Countdown timer simulation for unacknowledged leads (F3.4)
  useEffect(() => {
    const timer = setInterval(() => {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.status === 'Pending Acknowledgment' && lead.timeRemaining > 0) {
            return { ...lead, timeRemaining: lead.timeRemaining - 1 };
          }
          return lead;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAcknowledge = (id) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Acknowledged', timeRemaining: 0 } : l))
    );
  };

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLead.name) return;

    const created = {
      id: `LD-${Math.floor(105 + Math.random() * 900)}`,
      name: newLead.name,
      email: newLead.email || 'lead@intake.com',
      phone: newLead.phone || '+1 555 0192',
      source: newLead.source,
      inquiry: newLead.inquiry || 'Service Request',
      assignedTo: 'Marcus Vance',
      assignedAt: 'Just now',
      timeRemaining: 60,
      status: 'Pending Acknowledgment'
    };

    setLeads([created, ...leads]);
    setIsModalOpen(false);
    setNewLead({ name: '', email: '', phone: '', source: 'Manual Entry', inquiry: '' });
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;
    const matchesQuery =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.inquiry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1a1917] text-white rounded-md text-xs font-semibold hover:bg-[#33302a] transition-all"
          >
            <Plus size={14} />
            <span>Create Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* Filters Bar (F2.6, F3.1) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#e8e5de] rounded-lg">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-[#79756d]" />
          <input
            type="text"
            placeholder="Search leads, inquiry, or assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs text-[#1a1917] outline-none bg-transparent w-64"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#79756d] font-medium">Source Filter:</span>
          {['ALL', 'WhatsApp', 'Web Form', 'Manual Entry'].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                sourceFilter === src
                  ? 'bg-[#1a1917] text-white border-[#1a1917]'
                  : 'bg-white text-[#79756d] border-[#d3cfc7] hover:bg-[#f4f2ee]'
              }`}
            >
              {src}
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
            {filteredLeads.map((lead) => {
              const isPending = lead.status === 'Pending Acknowledgment';
              return (
                <tr key={lead.id} className="hover:bg-[#faf9f6]">
                  <td className="p-3">
                    <div className="font-bold text-[#1a1917]">{lead.name}</div>
                    <div className="text-[11px] text-[#79756d] font-mono">{lead.id} • {lead.email}</div>
                  </td>

                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      lead.source === 'WhatsApp' ? 'bg-[#ebf1f5] text-[#4a6b82] border-[#4a6b82]/30' :
                      lead.source === 'Web Form' ? 'bg-[#eaf0ee] text-[#52796f] border-[#52796f]/30' :
                      'bg-[#f7f1ea] text-[#b08945] border-[#b08945]/30'
                    }`}>
                      {lead.source === 'WhatsApp' && <MessageSquare size={11} />}
                      {lead.source === 'Web Form' && <Globe size={11} />}
                      {lead.source === 'Manual Entry' && <UserPlus size={11} />}
                      <span>{lead.source}</span>
                    </span>
                  </td>

                  <td className="p-3 text-[#3c3933]">
                    <div className="font-medium">{lead.inquiry}</div>
                    <div className="text-[11px] text-[#a8a49c]">Assigned {lead.assignedAt}</div>
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-[#1a1917]">{lead.assignedTo}</div>
                    <div className="text-[10px] text-[#52796f]">Available Rep (Cap: 3/5)</div>
                  </td>

                  <td className="p-3">
                    {isPending ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#faece8] border border-[#c26751]/30 text-[#c26751] font-mono font-bold text-xs">
                        <Clock size={12} />
                        <span>{lead.timeRemaining}s remaining</span>
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
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Inbound Lead Intake Simulator */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-[#e8e5de] rounded-xl shadow-lg p-6">
            <h3 className="text-base font-bold text-[#1a1917] mb-1">Simulate Inbound Lead Capture (F3.1)</h3>
            <p className="text-xs text-[#79756d] mb-4">
              Enter details or select an intake channel to test the automated assignment round-robin.
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

              <div>
                <label className="block font-semibold text-[#1a1917] mb-1">Intake Source Channel (F3.1)</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full p-2 border border-[#d3cfc7] rounded bg-white text-[#1a1917] outline-none"
                >
                  <option value="Manual Entry">Manual Entry</option>
                  <option value="WhatsApp">Twilio WhatsApp Sandbox</option>
                  <option value="Web Form">Public Website Contact Form</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1a1917] mb-1">Inquiry / Project Details</label>
                <input
                  type="text"
                  placeholder="e.g. 50kW Commercial Solar Roof Inspection"
                  value={newLead.inquiry}
                  onChange={(e) => setNewLead({ ...newLead, inquiry: e.target.value })}
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
                  className="px-4 py-1.5 bg-[#1a1917] text-white font-semibold rounded hover:bg-[#33302a]"
                >
                  Dispatch to Round-Robin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
