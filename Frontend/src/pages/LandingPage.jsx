import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  ArrowRight,
  MessageSquare,
  CreditCard,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function LandingPage({ onEnterApp }) {
  const [leadStatus, setLeadStatus] = useState('pending');
  const [slaTime, setSlaTime] = useState(45);
  const [assignedRep, setAssignedRep] = useState('Marcus Vance');
  const [repStatus, setRepStatus] = useState('Available');
  const [logs, setLogs] = useState([
    { time: '11:42 AM', event: 'Inbound lead received via Twilio WhatsApp Sandbox' },
    { time: '11:42 AM', event: 'Lead assigned to Marcus Vance (Round-robin #1)' }
  ]);
  const [activeTab, setActiveTab] = useState('escalation');

  useEffect(() => {
    let timer;
    if (leadStatus === 'pending' && slaTime > 0) {
      timer = setInterval(() => {
        setSlaTime((prev) => {
          if (prev <= 1) {
            handleSimEscalate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [leadStatus, slaTime]);

  const handleSimEscalate = () => {
    setLeadStatus('escalated');
    setAssignedRep('Elena Rostova (Backup Specialist)');
    setLogs((prev) => [
      { time: 'Just now', event: 'SLA expired: Lead automatically escalated to Tier 2 (Elena Rostova)' },
      ...prev
    ]);
  };

  const handleSimAcknowledge = () => {
    setLeadStatus('acknowledged');
    setLogs((prev) => [
      { time: 'Just now', event: `Acknowledged by ${assignedRep}. SLA timer cleared.` },
      ...prev
    ]);
  };

  const handleRepStatusChange = (newStatus) => {
    setRepStatus(newStatus);
    if (newStatus === 'On leave' || newStatus === 'Offline') {
      if (leadStatus === 'pending') {
        setAssignedRep('Elena Rostova (Reassigned)');
        setLogs((prev) => [
          { time: 'Just now', event: `Marcus marked ${newStatus}. Unacknowledged lead immediately reassigned to Elena Rostova.` },
          ...prev
        ]);
      }
    } else {
      setAssignedRep('Marcus Vance');
    }
  };

  const resetSimulator = () => {
    setLeadStatus('pending');
    setSlaTime(45);
    setAssignedRep('Marcus Vance');
    setRepStatus('Available');
    setLogs([
      { time: '11:42 AM', event: 'Inbound lead received via Twilio WhatsApp Sandbox' },
      { time: '11:42 AM', event: 'Lead assigned to Marcus Vance (Round-robin #1)' }
    ]);
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] text-[#3c3933]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#e8e5de] bg-[#faf9f6]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 font-bold text-[#1a1917] text-lg tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#4a6b82] text-white">
              <ShieldCheck size={16} />
            </div>
            <span>OmniFlow</span>
          </div>

          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-[#79756d]">
            <li><a href="#how-it-works" className="hover:text-[#1a1917] transition-colors">How It Works</a></li>
            <li><a href="#product" className="hover:text-[#1a1917] transition-colors">Product</a></li>
            <li><a href="#integrations" className="hover:text-[#1a1917] transition-colors">Integrations</a></li>
            <li><a href="#solutions" className="hover:text-[#1a1917] transition-colors">Industries</a></li>
            <li><a href="#pricing" className="hover:text-[#1a1917] transition-colors">Pricing</a></li>
          </ul>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="px-3.5 py-2 text-sm font-semibold text-[#1a1917] hover:bg-[#f4f2ee] rounded-md transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onEnterApp('dashboard')}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#1a1917] hover:bg-[#33302a] rounded-md transition-all shadow-sm"
            >
              Launch Workspace
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[#d4a373]/30 bg-[#f7f1ea] text-xs font-semibold text-[#8c6239]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8c6239]"></span>
          Built for teams of 5 to 30 service professionals
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1a1917] mb-5 leading-tight">
          Every inbound lead answered. <span className="text-[#4a6b82]">Guaranteed.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-[#79756d] mb-8 font-normal leading-relaxed">
          Stop losing revenue to missed notifications and leave gaps. OmniFlow unites sales pipeline management, deterministic SLA lead escalation, and real external customer conversations in one place.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <button
            onClick={() => onEnterApp('dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1917] text-white rounded-md text-sm font-semibold hover:bg-[#33302a] transition-all shadow-sm"
          >
            Open Live Workspace
            <ArrowRight size={16} />
          </button>
          <a
            href="#simulator"
            className="px-5 py-2.5 bg-white border border-[#d3cfc7] text-[#1a1917] rounded-md text-sm font-semibold hover:bg-[#f4f2ee] transition-colors"
          >
            Test Live SLA Simulator Below
          </a>
        </div>

        {/* Live Simulator Card */}
        <div id="simulator" className="mx-auto max-w-4xl text-left bg-white border border-[#e8e5de] rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#f4f2ee] border-b border-[#e8e5de]">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#eaf0ee] text-[#52796f] border border-[#52796f]/25">
                Live Interactive Simulator
              </span>
              <span className="text-sm font-semibold text-[#1a1917]">
                Deterministic Lead Protection in Action
              </span>
            </div>
            <button
              onClick={resetSimulator}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#79756d] hover:text-[#1a1917] px-2.5 py-1 rounded hover:bg-[#e8e5de] transition-colors"
            >
              <RotateCcw size={13} /> Reset State
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Lead Box */}
            <div className="md:col-span-7 bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#1a1917]">Sarah Jenkins</h3>
                  <div className="text-xs text-[#79756d]">Source: Twilio WhatsApp Sandbox (Inbound #2094)</div>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold ${
                  leadStatus === 'acknowledged' ? 'bg-[#eaf0ee] text-[#52796f] border border-[#52796f]/30' : 'bg-[#faece8] text-[#c26751] border border-[#c26751]/30'
                }`}>
                  <Clock size={13} />
                  {leadStatus === 'acknowledged' && 'Acknowledged'}
                  {leadStatus === 'pending' && `SLA Window: ${slaTime}s`}
                  {leadStatus === 'escalated' && 'Escalated to Tier 2'}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#3c3933] mb-5">
                <div><strong className="text-[#1a1917]">Inquiry:</strong> Commercial Solar Roof Installation (40 kW)</div>
                <div><strong className="text-[#1a1917]">Assigned To:</strong> {assignedRep}</div>
                <div>
                  <strong className="text-[#1a1917]">Status:</strong>{' '}
                  <span className={leadStatus === 'acknowledged' ? 'text-[#52796f] font-semibold' : leadStatus === 'escalated' ? 'text-[#c26751] font-semibold' : 'text-[#b08945] font-semibold'}>
                    {leadStatus === 'acknowledged' ? 'Active Conversation' : leadStatus === 'escalated' ? 'Escalated / Backup Assigned' : 'Awaiting Acknowledgement'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 mb-5">
                {leadStatus !== 'acknowledged' ? (
                  <button
                    onClick={handleSimAcknowledge}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a1917] text-white text-xs font-semibold rounded hover:bg-[#33302a] transition-all"
                  >
                    <CheckCircle2 size={14} /> Acknowledge Lead
                  </button>
                ) : (
                  <button
                    onClick={() => onEnterApp('leads')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#d3cfc7] text-[#1a1917] text-xs font-semibold rounded hover:bg-[#f4f2ee]"
                  >
                    View in Leads Table <ArrowRight size={13} />
                  </button>
                )}
                <button
                  onClick={handleSimEscalate}
                  disabled={leadStatus === 'acknowledged'}
                  className="px-3.5 py-1.5 bg-white border border-[#d3cfc7] text-[#1a1917] text-xs font-semibold rounded hover:bg-[#f4f2ee] disabled:opacity-40"
                >
                  Force Escalate
                </button>
              </div>

              <div className="pt-3 border-t border-[#e8e5de]">
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#79756d] mb-2">
                  Immutable Audit Trail
                </div>
                {logs.slice(0, 3).map((l, i) => (
                  <div key={i} className="text-xs text-[#3c3933] mb-1">
                    <span className="text-[#a8a49c] mr-2">{l.time}</span>
                    {l.event}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Controls */}
            <div className="md:col-span-5 md:border-l md:border-[#e8e5de] md:pl-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#79756d] mb-3">
                  Simulate Rep Status
                </h4>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-2.5 bg-[#f4f2ee] border border-[#e8e5de] rounded-md text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#ebf1f5] text-[#4a6b82] flex items-center justify-center font-bold text-[11px]">
                        MV
                      </div>
                      <div>
                        <div className="font-semibold text-[#1a1917]">Marcus Vance</div>
                        <div className="text-[10px] text-[#79756d]">Primary Rep</div>
                      </div>
                    </div>
                    <select
                      className="px-2 py-1 bg-white border border-[#d3cfc7] rounded text-xs text-[#1a1917] outline-none"
                      value={repStatus}
                      onChange={(e) => handleRepStatusChange(e.target.value)}
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="On leave">On leave</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#f4f2ee] border border-[#e8e5de] rounded-md text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#f7f1ea] text-[#d4a373] flex items-center justify-center font-bold text-[11px]">
                        ER
                      </div>
                      <div>
                        <div className="font-semibold text-[#1a1917]">Elena Rostova</div>
                        <div className="text-[10px] text-[#79756d]">Backup Specialist</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#52796f]">Available</span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-[#f7f1ea] border border-[#d4a373]/30 text-xs text-[#3c3933] leading-relaxed">
                  <strong>Try it:</strong> Switch Marcus to <em>"On leave"</em>. OmniFlow immediately reassigns the unacknowledged lead to Elena without losing a second.
                </div>
              </div>

              <div className="text-[11px] text-[#a8a49c] mt-4 pt-3 border-t border-[#e8e5de]">
                Zero duplicate actions • Concurrency control • Configurable SLA timers
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Integrations bar */}
      <section className="w-full border-y border-[#e8e5de] bg-white py-6" id="integrations">
        <div className="mx-auto max-w-6xl px-6 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-[#3c3933]">
          <span className="text-[#a8a49c] uppercase tracking-wider font-bold">Real Connections:</span>
          <div className="flex items-center gap-2"><MessageSquare size={15} className="text-[#4a6b82]" /> Twilio WhatsApp Sandbox</div>
          <div className="flex items-center gap-2"><CreditCard size={15} className="text-[#c26751]" /> Stripe Test Mode</div>
          <div className="flex items-center gap-2"><Calendar size={15} className="text-[#52796f]" /> Google Calendar OAuth 2.0</div>
          <div className="flex items-center gap-2"><AlertTriangle size={15} className="text-[#b08945]" /> Slack & Telegram Escalations</div>
        </div>
      </section>

      {/* Problem & Solution Breakdown */}
      <section className="mx-auto max-w-6xl px-6 py-16" id="how-it-works">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4a6b82] mb-2 block">Root Cause Analysis</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1917] tracking-tight">Why Service Businesses Lose Inbound Revenue</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#e8e5de] rounded-lg p-6 hover:border-[#d3cfc7] transition-all">
            <div className="h-10 w-10 rounded bg-[#faece8] text-[#c26751] flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-[#1a1917] mb-2">Informal Assignment & Dodged Ownership</h3>
            <p className="text-sm text-[#79756d] leading-relaxed">
              When leads arrive in shared inboxes or chats, ownership is vague and responsibility is easy to dodge. OmniFlow assigns every lead to exactly one accountable person with an enforceable countdown.
            </p>
          </div>

          <div className="bg-white border border-[#e8e5de] rounded-lg p-6 hover:border-[#d3cfc7] transition-all">
            <div className="h-10 w-10 rounded bg-[#eaf0ee] text-[#52796f] flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <h3 className="text-base font-bold text-[#1a1917] mb-2">Absence & Overload Blindspots</h3>
            <p className="text-sm text-[#79756d] leading-relaxed">
              Traditional CRMs assign leads to staff who are sick, in appointments, or overwhelmed. OmniFlow tracks live availability states and caps open leads before distributing.
            </p>
          </div>

          <div className="bg-white border border-[#e8e5de] rounded-lg p-6 hover:border-[#d3cfc7] transition-all">
            <div className="h-10 w-10 rounded bg-[#ebf1f5] text-[#4a6b82] flex items-center justify-center mb-4">
              <Layers size={20} />
            </div>
            <h3 className="text-base font-bold text-[#1a1917] mb-2">Fragmented Records & Tool Switching</h3>
            <p className="text-sm text-[#79756d] leading-relaxed">
              Customer conversations stay in WhatsApp, payments in Stripe, and appointments in Google Calendar. OmniFlow ties real webhooks from all three into one customer 360 record.
            </p>
          </div>
        </div>
      </section>

      {/* Target Industries */}
      <section className="mx-auto max-w-6xl px-6 pb-16" id="solutions">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4a6b82] mb-2 block">Target Workspaces</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1917] tracking-tight">Built for 5 to 30 Person Service Teams</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#e8e5de] rounded-lg p-6">
            <h3 className="text-base font-bold text-[#1a1917] mb-2">Real Estate Agencies</h3>
            <p className="text-sm text-[#79756d] leading-relaxed">
              High-value buyers text while agents are in showings. Automated escalation guarantees inquiries are answered before buyers browse other listings.
            </p>
          </div>

          <div className="bg-white border border-[#e8e5de] rounded-lg p-6">
            <h3 className="text-base font-bold text-[#1a1917] mb-2">Solar Installation Teams</h3>
            <p className="text-sm text-[#79756d] leading-relaxed">
              Roof inspection appointments, custom kilowatt fields, and Stripe deposit links all synced from web forms into active technician calendars.
            </p>
          </div>

          <div className="bg-white border border-[#e8e5de] rounded-lg p-6">
            <h3 className="text-base font-bold text-[#1a1917] mb-2">Specialist & Dental Clinics</h3>
            <p className="text-sm text-[#79756d] leading-relaxed">
              Patient coordinators handle incoming consultation bookings without scheduling conflicts, confirmed via WhatsApp sandbox.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#e8e5de] bg-[#f4f2ee] py-8 text-xs text-[#79756d]">
        <div className="mx-auto max-w-6xl px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#1a1917] font-bold">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#4a6b82] text-white">
              <ShieldCheck size={12} />
            </div>
            <span>OmniFlow</span>
            <span className="font-normal text-[#79756d] ml-2">Unified Business Management & Lead Protection Platform</span>
          </div>
          <div>
            Built strictly to specification for 5–30 employee service businesses.
          </div>
        </div>
      </footer>
    </div>
  );
}
