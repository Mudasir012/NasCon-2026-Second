import React, { useState } from 'react';
import {
  Users,
  Clock,
  AlertTriangle,
  CreditCard,
  Calendar,
  Layers,
  TrendingUp,
  Filter,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

export default function OperationalDashboardPage({ onNavigate }) {
  // Role-aware toggle (F5.4): User sees personal figures vs Owner/Admin company-wide
  const [viewScope, setViewScope] = useState('company'); // 'company' | 'personal'
  const [selectedDrilldown, setSelectedDrilldown] = useState(null);

  // Basic customization (F5.5): show/hide figures
  const [visibleCards, setVisibleCards] = useState({
    leads: true,
    pipeline: true,
    response: true,
    recovery: true,
    escalations: true,
    availability: true,
    appointments: true,
    payments: true
  });
  const [showConfig, setShowConfig] = useState(false);

  const toggleCard = (key) => {
    setVisibleCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Metrics data according to Section 7 definitions
  const metrics = {
    company: {
      newLeads: 18,
      pipelineValue: '$148,200',
      avgResponse: '42s',
      recoveryQueue: 3,
      escalations24h: 4,
      collectedRevenue: '$32,450',
      appointmentsToday: 7,
      availability: { available: 5, busy: 2, onLeave: 1, offline: 1 }
    },
    personal: {
      newLeads: 4,
      pipelineValue: '$34,500',
      avgResponse: '31s',
      recoveryQueue: 0,
      escalations24h: 1,
      collectedRevenue: '$8,200',
      appointmentsToday: 2,
      availability: { available: 1, busy: 0, onLeave: 0, offline: 0 }
    }
  };

  const current = metrics[viewScope];

  // Pipeline breakdown by stage (F5.1, Section 7 Open Pipeline Value)
  const pipelineStages = [
    { name: 'Discovery & Intake', count: 6, value: '$24,000' },
    { name: 'Site Inspection Booked', count: 4, value: '$38,200' },
    { name: 'Proposal Delivered', count: 5, value: '$56,000' },
    { name: 'Contract Negotiation', count: 2, value: '$30,000' }
  ];

  // Drilldown data preview (F5.3)
  const drilldownData = {
    recovery: [
      { id: 'LD-902', name: 'Dr. Aaron Patel', source: 'WhatsApp', reason: 'Unacknowledged beyond 45s SLA', time: '12m ago' },
      { id: 'LD-905', name: 'Apex Logistics LLC', source: 'Web Form', reason: 'Assigned rep marked On leave', time: '28m ago' },
      { id: 'LD-908', name: 'Highland Villas HOA', source: 'Phone Call', reason: 'Escalated 2x (Tier 2 expired)', time: '41m ago' }
    ],
    escalations: [
      { id: 'ESC-44', lead: 'Dr. Aaron Patel', from: 'Marcus Vance', to: 'Elena Rostova', reason: 'Timer expired (45s)' },
      { id: 'ESC-43', lead: 'Beacon Ridge Solar', from: 'Jordan Reed', to: 'Marcus Vance', reason: 'Rep busy limit reached' },
      { id: 'ESC-42', lead: 'Solaria Plaza', from: 'Marcus Vance', to: 'Alex Mercer (Owner)', reason: 'Tier 2 fallback' },
      { id: 'ESC-41', lead: 'GreenField Clinic', from: 'Elena Rostova', to: 'Recovery Queue', reason: 'Idle period reached' }
    ],
    appointments: [
      { id: 'APT-1', customer: 'Vanguard Medical', rep: 'Marcus Vance', time: '01:30 PM', status: 'Google Synced' },
      { id: 'APT-2', customer: 'Apex Logistics', rep: 'Elena Rostova', time: '03:00 PM', status: 'Google Synced' },
      { id: 'APT-3', customer: 'Sarah Jenkins', rep: 'Marcus Vance', time: '04:15 PM', status: 'Pending Confirmation' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1917]">Operational Dashboard</h1>
          <p className="text-xs text-[#79756d]">
            Live company performance, SLA health, and revenue according to Section 7 definitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Role-Aware View Switcher (F5.4) */}
          <div className="flex items-center rounded-md border border-[#d3cfc7] bg-white p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewScope('company')}
              className={`px-3 py-1 rounded transition-colors ${
                viewScope === 'company' ? 'bg-[#1a1917] text-white' : 'text-[#79756d] hover:text-[#1a1917]'
              }`}
            >
              Company View (Owner/Admin)
            </button>
            <button
              onClick={() => setViewScope('personal')}
              className={`px-3 py-1 rounded transition-colors ${
                viewScope === 'personal' ? 'bg-[#1a1917] text-white' : 'text-[#79756d] hover:text-[#1a1917]'
              }`}
            >
              Personal View (My Leads)
            </button>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d3cfc7] text-[#1a1917] rounded-md text-xs font-semibold hover:bg-[#f4f2ee]"
          >
            <Filter size={13} />
            <span>Customize Figures</span>
          </button>
        </div>
      </div>

      {/* Basic Customization Drawer / Box (F5.5) */}
      {showConfig && (
        <div className="bg-white border border-[#e8e5de] rounded-lg p-4 text-xs">
          <div className="font-semibold text-[#1a1917] mb-2">Display Preferences (Saved per User):</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(visibleCards).map((key) => (
              <button
                key={key}
                onClick={() => toggleCard(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                  visibleCards[key]
                    ? 'bg-[#eaf0ee] border-[#52796f]/40 text-[#52796f]'
                    : 'bg-[#f4f2ee] border-[#d3cfc7] text-[#79756d]'
                }`}
              >
                {visibleCards[key] ? <Eye size={12} /> : <EyeOff size={12} />}
                <span className="capitalize">{key}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stat Tiles Grid (F5.1, F5.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleCards.leads && (
          <div className="bg-white border border-[#e8e5de] rounded-lg p-4 hover:border-[#d3cfc7] transition-colors">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d] mb-1">New Leads Today</div>
            <div className="text-2xl font-extrabold text-[#1a1917]">{current.newLeads}</div>
            <div className="text-xs text-[#52796f] mt-1 font-medium">100% assigned with active SLA</div>
          </div>
        )}

        {visibleCards.response && (
          <div className="bg-white border border-[#e8e5de] rounded-lg p-4 hover:border-[#d3cfc7] transition-colors">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d] mb-1">Avg Time to First Response</div>
            <div className="text-2xl font-extrabold text-[#1a1917] font-mono">{current.avgResponse}</div>
            <div className="text-xs text-[#79756d] mt-1">First assignment to acknowledgement</div>
          </div>
        )}

        {/* Drill-down Clickable Tile 1: Recovery Queue (F5.3) */}
        {visibleCards.recovery && (
          <div
            onClick={() => setSelectedDrilldown('recovery')}
            className="bg-white border border-[#e8e5de] rounded-lg p-4 hover:border-[#c26751] transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#c26751] mb-1">
              <span>Items in Recovery Queue</span>
              <ExternalLink size={12} />
            </div>
            <div className="text-2xl font-extrabold text-[#c26751]">{current.recoveryQueue}</div>
            <div className="text-xs text-[#79756d] mt-1">Click to drill down into rescue items</div>
          </div>
        )}

        {/* Drill-down Clickable Tile 2: Escalations (F5.3) */}
        {visibleCards.escalations && (
          <div
            onClick={() => setSelectedDrilldown('escalations')}
            className="bg-white border border-[#e8e5de] rounded-lg p-4 hover:border-[#b08945] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#b08945] mb-1">
              <span>Escalations (Last 24h)</span>
              <ExternalLink size={12} />
            </div>
            <div className="text-2xl font-extrabold text-[#1a1917]">{current.escalations24h}</div>
            <div className="text-xs text-[#79756d] mt-1">Automatic SLA tier breaches</div>
          </div>
        )}

        {visibleCards.pipeline && (
          <div className="bg-white border border-[#e8e5de] rounded-lg p-4 hover:border-[#d3cfc7] transition-colors">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d] mb-1">Open Pipeline Value</div>
            <div className="text-2xl font-extrabold text-[#1a1917]">{current.pipelineValue}</div>
            <div className="text-xs text-[#79756d] mt-1">Excludes Won & Lost deals</div>
          </div>
        )}

        {visibleCards.payments && (
          <div className="bg-white border border-[#e8e5de] rounded-lg p-4 hover:border-[#d3cfc7] transition-colors">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d] mb-1">Collected Revenue (This Month)</div>
            <div className="text-2xl font-extrabold text-[#52796f]">{current.collectedRevenue}</div>
            <div className="text-xs text-[#79756d] mt-1">Confirmed Stripe webhooks only</div>
          </div>
        )}

        {/* Drill-down Clickable Tile 3: Appointments (F5.3) */}
        {visibleCards.appointments && (
          <div
            onClick={() => setSelectedDrilldown('appointments')}
            className="bg-white border border-[#e8e5de] rounded-lg p-4 hover:border-[#4a6b82] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#4a6b82] mb-1">
              <span>Upcoming Appointments</span>
              <ExternalLink size={12} />
            </div>
            <div className="text-2xl font-extrabold text-[#1a1917]">{current.appointmentsToday}</div>
            <div className="text-xs text-[#79756d] mt-1">Google Calendar sync active</div>
          </div>
        )}

        {visibleCards.availability && (
          <div className="bg-white border border-[#e8e5de] rounded-lg p-4 hover:border-[#d3cfc7] transition-colors">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d] mb-1">Team Availability</div>
            <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
              <span className="text-[#52796f]">{current.availability.available} Available</span>
              <span className="text-[#b08945]">{current.availability.busy} Busy</span>
              <span className="text-[#c26751]">{current.availability.onLeave} Leave</span>
            </div>
            <div className="text-[11px] text-[#79756d] mt-2">Leads route to Available staff only</div>
          </div>
        )}
      </div>

      {/* Drill-down Modal / Drawer (F5.3) */}
      {selectedDrilldown && (
        <div className="bg-white border-2 border-[#1a1917] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e8e5de]">
            <div className="font-bold text-[#1a1917] text-sm uppercase tracking-wider">
              Filtered Records Drill-down: {selectedDrilldown}
            </div>
            <button
              onClick={() => setSelectedDrilldown(null)}
              className="text-xs font-semibold text-[#79756d] hover:text-[#1a1917] px-2 py-1 bg-[#f4f2ee] rounded"
            >
              Close Drill-down
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f2ee] text-[#79756d] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-2.5">Identifier</th>
                  <th className="p-2.5">Target / Record</th>
                  <th className="p-2.5">Context / Assignee</th>
                  <th className="p-2.5">Reason / Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e5de]">
                {selectedDrilldown === 'recovery' && drilldownData.recovery.map((r) => (
                  <tr key={r.id} className="hover:bg-[#faf9f6]">
                    <td className="p-2.5 font-mono font-semibold text-[#c26751]">{r.id}</td>
                    <td className="p-2.5 font-bold text-[#1a1917]">{r.name}</td>
                    <td className="p-2.5 text-[#79756d]">{r.source}</td>
                    <td className="p-2.5">{r.reason} <span className="text-[#a8a49c] ml-1">({r.time})</span></td>
                  </tr>
                ))}

                {selectedDrilldown === 'escalations' && drilldownData.escalations.map((e) => (
                  <tr key={e.id} className="hover:bg-[#faf9f6]">
                    <td className="p-2.5 font-mono font-semibold">{e.id}</td>
                    <td className="p-2.5 font-bold text-[#1a1917]">{e.lead}</td>
                    <td className="p-2.5 text-[#79756d]">{e.from} → {e.to}</td>
                    <td className="p-2.5 text-[#b08945]">{e.reason}</td>
                  </tr>
                ))}

                {selectedDrilldown === 'appointments' && drilldownData.appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-[#faf9f6]">
                    <td className="p-2.5 font-mono font-semibold">{a.id}</td>
                    <td className="p-2.5 font-bold text-[#1a1917]">{a.customer}</td>
                    <td className="p-2.5 text-[#79756d]">{a.rep}</td>
                    <td className="p-2.5 text-[#52796f]">{a.time} - {a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pipeline Summary by Stage (F5.1) */}
      <div className="bg-white border border-[#e8e5de] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#1a1917]">Open Pipeline Stage Distribution</h2>
          <span className="text-xs text-[#79756d]">Total Open: $148,200 across 17 opportunities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pipelineStages.map((st) => (
            <div key={st.name} className="p-3 bg-[#faf9f6] border border-[#e8e5de] rounded-md">
              <div className="text-xs font-semibold text-[#1a1917] mb-1">{st.name}</div>
              <div className="text-lg font-bold text-[#1a1917]">{st.value}</div>
              <div className="text-[11px] text-[#79756d] mt-1">{st.count} Active Deals</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
