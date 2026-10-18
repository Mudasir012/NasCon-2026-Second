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
  RotateCcw,
  Sparkles,
  Lock,
  Kanban,
  FileText,
  UserX,
  Play,
  Check,
  Building,
  Sun,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function LandingPage({ onEnterApp }) {
  // Navigation helper
  const handleNav = (route) => {
    if (onEnterApp) onEnterApp(route);
  };

  // ----------------------------------------------------
  // SHOWPIECE: Live SLA Escalation Simulator
  // 4-Stage Chain: Owner -> Next Employee -> Backup -> Manager
  // ----------------------------------------------------
  const STAGES = [
    { id: 0, title: 'Owner', name: 'Alex Mercer', role: 'Initial Assignee' },
    { id: 1, title: 'Next Employee', name: 'Sara Chen', role: 'Primary Specialist' },
    { id: 2, title: 'Backup Rep', name: 'Elena Rostova', role: 'Secondary Coverage' },
    { id: 3, title: 'Manager', name: 'Marcus Vance', role: 'Final Safeguard' }
  ];

  const [simActive, setSimActive] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [ackWindow, setAckWindow] = useState(8); // seconds per level
  const [timeLeft, setTimeLeft] = useState(8);
  const [isEmployeeAbsent, setIsEmployeeAbsent] = useState(false);
  const [simStatus, setSimStatus] = useState('idle'); // 'idle' | 'running' | 'acknowledged' | 'failed'
  const [simLogs, setSimLogs] = useState([
    { time: '12:00:00', text: 'Simulator ready. Click "Simulate incoming lead" to start.', type: 'info' }
  ]);

  // Active product feature tab
  const [activeFeatureTab, setActiveFeatureTab] = useState('protection');

  // Trigger incoming lead simulation
  const startSimulation = () => {
    setSimActive(true);
    setCurrentStageIndex(0);
    setTimeLeft(ackWindow);
    setIsEmployeeAbsent(false);
    setSimStatus('running');
    setSimLogs([
      {
        time: new Date().toLocaleTimeString(),
        text: 'New lead received via WhatsApp: "Commercial Solar Rooftop 45kW"',
        type: 'start'
      },
      {
        time: new Date().toLocaleTimeString(),
        text: `Assigned to Stage 1: Owner (${STAGES[0].name}). Timer started (${ackWindow}s window).`,
        type: 'assigned'
      }
    ]);
  };

  // Timer loop for simulation
  useEffect(() => {
    let interval;
    if (simStatus === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (simStatus === 'running' && timeLeft === 0) {
      // Stage timed out -> escalate!
      handleEscalateTimeout();
    }
    return () => clearInterval(interval);
  }, [simStatus, timeLeft]);

  // Handle stage timeout escalation
  const handleEscalateTimeout = () => {
    const currentStage = STAGES[currentStageIndex];
    const nextIndex = currentStageIndex + 1;

    if (nextIndex < STAGES.length) {
      const nextStage = STAGES[nextIndex];
      setCurrentStageIndex(nextIndex);
      setTimeLeft(ackWindow);
      setSimLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          text: `Lead assigned to ${currentStage.name}, no response within ${ackWindow}s, escalated to ${nextStage.title} (${nextStage.name}).`,
          type: 'escalated'
        },
        ...prev
      ]);
    } else {
      // Reached end of chain without ack
      setSimStatus('failed');
      setSimLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          text: `All 4 tiers exhausted without response! Routed to Emergency Executive Queue.`,
          type: 'alert'
        },
        ...prev
      ]);
    }
  };

  // Handle manual acknowledge by current stage assignee
  const handleAcknowledge = () => {
    if (simStatus !== 'running') return;
    setSimStatus('acknowledged');
    const assigned = STAGES[currentStageIndex];
    setSimLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        text: `Lead successfully acknowledged by ${assigned.title} (${assigned.name}). Escalation timer halted. Opportunity moved to Active CRM Pipeline.`,
        type: 'success'
      },
      ...prev
    ]);
  };

  // Toggle Employee Absent simulation
  const toggleAbsent = () => {
    const nextAbsent = !isEmployeeAbsent;
    setIsEmployeeAbsent(nextAbsent);

    if (nextAbsent && simStatus === 'running') {
      const currentStage = STAGES[currentStageIndex];
      const nextIndex = currentStageIndex + 1;
      if (nextIndex < STAGES.length) {
        const nextStage = STAGES[nextIndex];
        setCurrentStageIndex(nextIndex);
        setTimeLeft(ackWindow);
        setSimLogs((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            text: `${currentStage.name} marked ABSENT / ON LEAVE. Immediate zero-latency skip to ${nextStage.title} (${nextStage.name}).`,
            type: 'absent'
          },
          ...prev
        ]);
      }
    }
  };

  const resetSimulator = () => {
    setSimStatus('idle');
    setSimActive(false);
    setCurrentStageIndex(0);
    setTimeLeft(ackWindow);
    setIsEmployeeAbsent(false);
    setSimLogs([
      { time: new Date().toLocaleTimeString(), text: 'Simulator reset. Click "Simulate incoming lead" to start.', type: 'info' }
    ]);
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] text-[#3c3933] flex flex-col font-sans">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#e8e5de] bg-[#faf9f6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5 font-bold text-[#1a1917] text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4a6b82] text-white shadow-xs">
              <ShieldCheck size={18} />
            </div>
            <span className="font-extrabold">OmniFlow</span>
            <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eaf0ee] text-[#52796f] border border-[#52796f]/20">
              Deterministic Lead Protection
            </span>
          </div>

          <ul className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#79756d]">
            <li><a href="#simulator" className="hover:text-[#1a1917] transition-colors">SLA Simulator</a></li>
            <li><a href="#features" className="hover:text-[#1a1917] transition-colors">Platform Features</a></li>
            <li><a href="#industries" className="hover:text-[#1a1917] transition-colors">Industry Solutions</a></li>
            <li><a href="#security" className="hover:text-[#1a1917] transition-colors">RBAC & Governance</a></li>
          </ul>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleNav('login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#1a1917] hover:bg-[#f4f2ee] rounded-md transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={() => handleNav('signup')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1a1917] hover:bg-[#33302a] rounded-md transition-all shadow-xs cursor-pointer"
            >
              Get started
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[#d4a373]/30 bg-[#f7f1ea] text-xs font-semibold text-[#8c6239]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8c6239] animate-pulse"></span>
          Built for teams of 5 to 30 service professionals
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1a1917] mb-5 leading-tight">
          Every inbound lead answered. <span className="text-[#4a6b82]">Guaranteed.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-base md:text-lg text-[#79756d] mb-8 font-normal leading-relaxed">
          Stop losing high-ticket clients to delayed notifications and unmonitored shared inboxes. OmniFlow enforces deterministic SLA lead escalation, unified CRM pipelines, and immutable audit logs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <button
            onClick={() => handleNav('signup')}
            className="flex items-center gap-2 px-6 py-3 bg-[#1a1917] text-white rounded-md text-xs font-bold hover:bg-[#33302a] transition-all shadow-sm cursor-pointer"
          >
            Get started (Owner Workspace)
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => handleNav('login')}
            className="px-5 py-3 bg-white border border-[#d3cfc7] text-[#1a1917] rounded-md text-xs font-bold hover:bg-[#f4f2ee] transition-colors cursor-pointer"
          >
            Log in to Existing Workspace
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* SHOWPIECE: Live SLA Escalation Simulator Card                      */}
        {/* Visual Chain: Owner -> Next Employee -> Backup -> Manager           */}
        {/* ------------------------------------------------------------------- */}
        <div id="simulator" className="mx-auto max-w-4xl text-left bg-white border border-[#e8e5de] rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#f4f2ee] border-b border-[#e8e5de]">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#eaf0ee] text-[#52796f] border border-[#52796f]/25">
                Interactive Showpiece
              </span>
              <strong className="text-sm text-[#1a1917]">
                Live SLA Escalation Chain Simulator
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetSimulator}
                className="flex items-center gap-1 text-xs font-semibold text-[#79756d] hover:text-[#1a1917] px-2.5 py-1 rounded hover:bg-[#e8e5de] transition-colors cursor-pointer"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Simulator Controls Bar */}
            <div className="p-4 bg-[#faf9f6] border border-[#e8e5de] rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={startSimulation}
                  disabled={simStatus === 'running'}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1917] hover:bg-[#33302a] text-white font-bold rounded-md transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  <Play size={13} /> Simulate incoming lead
                </button>

                {simStatus === 'running' && (
                  <button
                    onClick={handleAcknowledge}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#52796f] hover:bg-[#43645b] text-white font-bold rounded-md transition-all shadow-xs cursor-pointer animate-pulse"
                  >
                    <CheckCircle2 size={13} /> Acknowledge Lead Now
                  </button>
                )}
              </div>

              {/* Controls: acknowledgement window and employee absent toggle */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#79756d]">Ack Window:</span>
                  <input
                    type="range"
                    min="4"
                    max="15"
                    value={ackWindow}
                    disabled={simStatus === 'running'}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setAckWindow(v);
                      if (simStatus !== 'running') setTimeLeft(v);
                    }}
                    className="w-20 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-[#1a1917]">{ackWindow}s</span>
                </div>

                <div className="h-4 w-px bg-[#e8e5de]"></div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEmployeeAbsent}
                    onChange={toggleAbsent}
                    className="rounded border-[#d3cfc7] text-[#c26751] focus:ring-0"
                  />
                  <span className="font-semibold text-[#1a1917] flex items-center gap-1">
                    <UserX size={13} className="text-[#c26751]" />
                    Employee Absent / Skip
                  </span>
                </label>
              </div>
            </div>

            {/* Visual 4-Stage Chain: Owner -> Next employee -> Backup -> Manager */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d] mb-3">
                Escalation Chain Flow (Owner → Next Employee → Backup → Manager)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {STAGES.map((stg, idx) => {
                  const isCurrent = simStatus === 'running' && currentStageIndex === idx;
                  const isPassed = currentStageIndex > idx;
                  const isAckedHere = simStatus === 'acknowledged' && currentStageIndex === idx;

                  return (
                    <div
                      key={stg.id}
                      className={`relative p-3.5 rounded-lg border transition-all ${
                        isAckedHere
                          ? 'bg-[#eaf0ee] border-[#52796f] text-[#52796f] shadow-sm'
                          : isCurrent
                          ? 'bg-white border-[#1a1917] shadow-md ring-2 ring-[#4a6b82]/30'
                          : isPassed
                          ? 'bg-[#f4f2ee] border-[#e8e5de] opacity-60'
                          : 'bg-white border-[#e8e5de]'
                      }`}
                    >
                      {/* Top stage header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#79756d]">
                          Tier {idx + 1}: {stg.title}
                        </span>
                        {isAckedHere ? (
                          <span className="h-4 w-4 rounded-full bg-[#52796f] text-white flex items-center justify-center text-[10px]">
                            <Check size={10} />
                          </span>
                        ) : isCurrent ? (
                          <span className="h-2 w-2 rounded-full bg-[#c26751] animate-ping"></span>
                        ) : null}
                      </div>

                      <div className="font-bold text-xs text-[#1a1917] mb-0.5">{stg.name}</div>
                      <div className="text-[10px] text-[#79756d] mb-3">{stg.role}</div>

                      {/* Countdown Ring / Bar per level */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#a8a49c]">Timer:</span>
                          <span className="font-mono font-bold">
                            {isCurrent ? `${timeLeft}s / ${ackWindow}s` : isPassed ? 'Expired' : `${ackWindow}s`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#e8e5de] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isAckedHere
                                ? 'bg-[#52796f] w-full'
                                : isCurrent
                                ? timeLeft <= 2 ? 'bg-[#c26751]' : 'bg-[#4a6b82]'
                                : isPassed
                                ? 'bg-[#c26751] w-full'
                                : 'bg-[#d3cfc7] w-0'
                            }`}
                            style={{
                              width: isCurrent
                                ? `${(timeLeft / ackWindow) * 100}%`
                                : isPassed || isAckedHere
                                ? '100%'
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Log Terminal */}
            <div className="bg-[#1a1917] rounded-lg p-4 font-mono text-xs text-[#f4f2ee] space-y-1.5 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] text-[#a8a49c] uppercase tracking-wider pb-2 border-b border-white/10 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#52796f]"></span>
                  Live Escalation Audit Log Stream
                </span>
                <span>Real-time</span>
              </div>
              {simLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#a8a49c] shrink-0">[{log.time}]</span>
                  <span
                    className={
                      log.type === 'escalated'
                        ? 'text-[#f59e0b]'
                        : log.type === 'absent'
                        ? 'text-[#f87171]'
                        : log.type === 'success'
                        ? 'text-[#34d399]'
                        : log.type === 'alert'
                        ? 'text-[#ef4444] font-bold'
                        : 'text-[#e2e8f0]'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Product Feature Tabs */}
      <section className="mx-auto max-w-6xl px-6 py-16" id="features">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4a6b82] mb-2 block">
            End-To-End Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1917] tracking-tight">
            Six Pillars of Reliable Business Operations
          </h2>
        </div>

        {/* 6 Tabs: Lead Protection, CRM, Messaging, Payments, Calendar, Audit */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'protection', label: 'Lead Protection', icon: ShieldCheck },
            { id: 'crm', label: 'CRM & Pipelines', icon: Kanban },
            { id: 'messaging', label: 'Messaging & WhatsApp', icon: MessageSquare },
            { id: 'payments', label: 'Payments & Stripe', icon: CreditCard },
            { id: 'calendar', label: 'Calendar Booking', icon: Calendar },
            { id: 'audit', label: 'Audit & Governance', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeatureTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1a1917] text-white shadow-xs'
                    : 'bg-white border border-[#e8e5de] text-[#79756d] hover:text-[#1a1917] hover:border-[#d3cfc7]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Tab Details Card */}
        <div className="bg-white border border-[#e8e5de] rounded-xl p-8 shadow-xs max-w-4xl mx-auto">
          {activeFeatureTab === 'protection' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs font-bold text-[#52796f] uppercase tracking-wider">Deterministic SLA</span>
                <h3 className="text-xl font-bold text-[#1a1917] mt-1 mb-3">Zero-Drop Escalation Chains</h3>
                <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                  Every lead is bound to a countdown window. If the assignee is on leave or does not acknowledge within the allotted seconds, the lead escalates automatically to backup personnel without human oversight required.
                </p>
                <ul className="space-y-2 text-xs text-[#3c3933]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Concurrency locks prevent double-booking or lost leads</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Immediate absence rerouting on employee status changes</li>
                </ul>
              </div>
              <div className="bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-5 text-xs space-y-3 font-mono">
                <div className="text-[#52796f] font-bold">Rule #1: Commercial Rooftop Lead</div>
                <div>Trigger: Inbound WhatsApp</div>
                <div>Timeout: 45 seconds</div>
                <div>Cascade: Alex Mercer → Sara Chen → Elena Rostova</div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'crm' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs font-bold text-[#4a6b82] uppercase tracking-wider">Visual Pipeline</span>
                <h3 className="text-xl font-bold text-[#1a1917] mt-1 mb-3">Custom Deal Stages & Value Masking</h3>
                <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                  Drag and drop deals across New, Contacted, Proposal, Negotiation, and Closed stages. Strict role-based security allows hiding high-value financials from unauthorized users.
                </p>
                <ul className="space-y-2 text-xs text-[#3c3933]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Opportunity value visibility controlled by RBAC</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> CSV export rights reserved for Owner & Admin</li>
                </ul>
              </div>
              <div className="bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-5 text-xs space-y-2">
                <div className="font-bold text-[#1a1917]">Pipeline Velocity Metrics</div>
                <div className="flex justify-between border-b border-[#e8e5de] py-1"><span>Total Pipeline:</span> <strong>$328,500</strong></div>
                <div className="flex justify-between border-b border-[#e8e5de] py-1"><span>Conversion Rate:</span> <strong>34.2%</strong></div>
                <div className="flex justify-between py-1"><span>Avg SLA Response:</span> <strong>38 seconds</strong></div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'messaging' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs font-bold text-[#52796f] uppercase tracking-wider">Real Conversations</span>
                <h3 className="text-xl font-bold text-[#1a1917] mt-1 mb-3">Twilio WhatsApp Sandbox Intake</h3>
                <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                  Incoming WhatsApp messages from prospective buyers automatically create verified lead records and start the SLA escalation clock without manual copy-pasting.
                </p>
                <ul className="space-y-2 text-xs text-[#3c3933]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Automated webhook verification with HMAC signature</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Direct bi-directional chat threads per lead</li>
                </ul>
              </div>
              <div className="bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-5 text-xs space-y-2 font-mono">
                <div className="text-[#4a6b82] font-bold">Inbound Webhook Payload</div>
                <div>From: whatsapp:+15550192834</div>
                <div>Body: "Need quotation for clinic solar battery backup"</div>
                <div>Status: Auto-Escalation Dispatched</div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'payments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs font-bold text-[#c26751] uppercase tracking-wider">Financial Assurance</span>
                <h3 className="text-xl font-bold text-[#1a1917] mt-1 mb-3">Stripe Invoices & Deposit Links</h3>
                <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                  Generate Stripe checkout sessions directly from the lead ledger. Webhooks automatically update customer balances and mark initial deposits paid.
                </p>
                <ul className="space-y-2 text-xs text-[#3c3933]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Secure test & live key masking in credentials hub</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Immutable ledger updates on Stripe webhook receipt</li>
                </ul>
              </div>
              <div className="bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-5 text-xs space-y-2 font-mono">
                <div className="text-[#c26751] font-bold">Stripe Payment Intent #evt_3M1908KJa</div>
                <div>Amount: $5,000.00 USD</div>
                <div>Deposit Status: Confirmed</div>
                <div>Lead Status: Moved to "Deposit Secured"</div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'calendar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs font-bold text-[#d4a373] uppercase tracking-wider">Scheduling</span>
                <h3 className="text-xl font-bold text-[#1a1917] mt-1 mb-3">Google Calendar Synchronization</h3>
                <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                  Sync consultation calls, site inspection visits, and customer audits directly to staff Google calendars with zero overlapping double-bookings.
                </p>
                <ul className="space-y-2 text-xs text-[#3c3933]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> OAuth 2.0 integration with automatic token refreshes</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Rate-limit exponential retry protection</li>
                </ul>
              </div>
              <div className="bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-5 text-xs space-y-2 font-mono">
                <div className="text-[#d4a373] font-bold">Calendar Event Synced</div>
                <div>Event: Commercial Roof Assessment</div>
                <div>Attendee: Sarah Jenkins & Alex Mercer</div>
                <div>Status: Confirmed</div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'audit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs font-bold text-[#79756d] uppercase tracking-wider">Compliance</span>
                <h3 className="text-xl font-bold text-[#1a1917] mt-1 mb-3">Immutable Audit History</h3>
                <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                  Every login attempt, permission escalation, webhook sync, and assignment transition is recorded permanently. Entries cannot be modified or deleted.
                </p>
                <ul className="space-y-2 text-xs text-[#3c3933]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Before & After diff visualizers for every modification</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#52796f]" /> Strict 403 access control for non-audit roles</li>
                </ul>
              </div>
              <div className="bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-5 text-xs space-y-2 font-mono">
                <div className="text-[#1a1917] font-bold">Audit Block #aud-1098</div>
                <div>Actor: System (SLA Engine)</div>
                <div>Action: Lead Escalated (Tier 1 → Tier 2)</div>
                <div>Immutability: Cryptographically Signed</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Industry Use-Case Cards: Real Estate, Solar Installers, Clinics */}
      <section className="mx-auto max-w-6xl px-6 pb-20" id="industries">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4a6b82] mb-2 block">
            Target Vertical Solutions
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1917] tracking-tight">
            Built for High-Ticket Service Professionals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Real Estate */}
          <div className="bg-white border border-[#e8e5de] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#ebf1f5] text-[#4a6b82] flex items-center justify-center mb-4">
                <Building size={20} />
              </div>
              <h3 className="text-base font-bold text-[#1a1917] mb-2">Real Estate Agencies</h3>
              <div className="mb-3 p-2.5 bg-[#faece8] border border-[#c26751]/30 rounded text-xs text-[#c26751]">
                <strong>Pain Point:</strong> High-value buyers text while primary agents are hosting showings. If unanswered within 10 minutes, buyers contact competing listings.
              </div>
              <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                <strong>Platform Solution:</strong> Instant round-robin assignment with 60-second acknowledgement SLAs. If the agent does not respond, the lead cascades to the on-duty associate or broker immediately.
              </p>
            </div>
            <div className="pt-3 border-t border-[#e8e5de] text-[11px] font-semibold text-[#4a6b82]">
              Average Lead Response: Reduced from 4 hours to 45 seconds.
            </div>
          </div>

          {/* Solar Installers */}
          <div className="bg-white border border-[#e8e5de] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#f7f1ea] text-[#d4a373] flex items-center justify-center mb-4">
                <Sun size={20} />
              </div>
              <h3 className="text-base font-bold text-[#1a1917] mb-2">Solar Installation Teams</h3>
              <div className="mb-3 p-2.5 bg-[#faece8] border border-[#c26751]/30 rounded text-xs text-[#c26751]">
                <strong>Pain Point:</strong> Technicians doing roof inspections cannot answer calls. Web quote requests are dropped during field appointments.
              </div>
              <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                <strong>Platform Solution:</strong> Technicians toggle "Offline" or "Busy" with one click. OmniFlow automatically reassigns incoming solar inquiries to available back-office estimators and syncs roof survey visits to Google Calendar.
              </p>
            </div>
            <div className="pt-3 border-t border-[#e8e5de] text-[11px] font-semibold text-[#d4a373]">
              Zero leads lost during on-site inspections.
            </div>
          </div>

          {/* Clinics */}
          <div className="bg-white border border-[#e8e5de] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#eaf0ee] text-[#52796f] flex items-center justify-center mb-4">
                <Activity size={20} />
              </div>
              <h3 className="text-base font-bold text-[#1a1917] mb-2">Specialist & Dental Clinics</h3>
              <div className="mb-3 p-2.5 bg-[#faece8] border border-[#c26751]/30 rounded text-xs text-[#c26751]">
                <strong>Pain Point:</strong> Patient consultation queries received after hours or during procedures sit unread, resulting in cancelled bookings and no-shows.
              </div>
              <p className="text-xs text-[#79756d] leading-relaxed mb-4">
                <strong>Platform Solution:</strong> WhatsApp sandbox leads are captured 24/7 with automated preliminary intake. Inquiries are routed to available clinical coordinators with backup fallback to practice managers.
              </p>
            </div>
            <div className="pt-3 border-t border-[#e8e5de] text-[11px] font-semibold text-[#52796f]">
              100% of patient inquiries acknowledged and booked.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#e8e5de] bg-[#f4f2ee] py-10 text-xs text-[#79756d] mt-auto">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#1a1917] font-bold text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#4a6b82] text-white">
                <ShieldCheck size={14} />
              </div>
              <span>OmniFlow</span>
            </div>
            <p className="text-[11px] text-[#79756d]">
              Unified Business Operations & Deterministic Lead Protection Platform. Built for 5–30 employee service businesses.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNav('login')}
              className="text-[#79756d] hover:text-[#1a1917] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNav('signup')}
              className="text-[#79756d] hover:text-[#1a1917] transition-colors cursor-pointer"
            >
              Get Started (Sign Up)
            </button>
            <button
              onClick={() => handleNav('dashboard')}
              className="text-[#79756d] hover:text-[#1a1917] transition-colors cursor-pointer"
            >
              Workspace Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
