import React, { useState, useEffect } from 'react';
import './LandingPage.css';
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
  FileText
} from 'lucide-react';

export default function LandingPage({ onEnterApp }) {
  // Interactive Simulator State
  const [leadStatus, setLeadStatus] = useState('pending'); // 'pending' | 'acknowledged' | 'escalated'
  const [slaTime, setSlaTime] = useState(45);
  const [assignedRep, setAssignedRep] = useState('Marcus Vance');
  const [repStatus, setRepStatus] = useState('Available');
  const [logs, setLogs] = useState([
    { time: '11:42 AM', event: 'Inbound lead received via Twilio WhatsApp Sandbox' },
    { time: '11:42 AM', event: 'Lead assigned to Marcus Vance (Round-robin #1)' }
  ]);
  const [activeTab, setActiveTab] = useState('escalation');

  // Countdown timer for simulator
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
    <div className="landing-wrapper">
      {/* Navigation */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#" className="lp-brand">
            <div className="lp-brand-mark">
              <ShieldCheck size={18} />
            </div>
            <span>OmniFlow</span>
          </a>

          <ul className="lp-nav-links">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#product">Product</a></li>
            <li><a href="#integrations">Integrations</a></li>
            <li><a href="#solutions">Industries</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>

          <div className="lp-nav-actions">
            <button className="lp-btn lp-btn-ghost" onClick={onEnterApp}>
              Sign In
            </button>
            <button className="lp-btn lp-btn-primary" onClick={onEnterApp}>
              Launch Workspace
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="lp-hero">
        <div className="lp-pill-badge">
          <span className="lp-pill-dot"></span>
          Built for teams of 5 to 30 service professionals
        </div>

        <h1 className="lp-hero-title">
          Every inbound lead answered. <span>Guaranteed.</span>
        </h1>

        <p className="lp-hero-sub">
          Stop losing revenue to missed notifications and vacation gaps. OmniFlow unites sales pipeline management, deterministic SLA lead escalation, and real external customer conversations in one place.
        </p>

        <div className="lp-hero-ctas">
          <button className="lp-btn lp-btn-primary" onClick={onEnterApp}>
            Open Live Workspace
            <ArrowRight size={16} />
          </button>
          <a href="#simulator" className="lp-btn lp-btn-outline">
            Test Live SLA Simulator Below
          </a>
        </div>

        {/* Live Interactive SLA Escalation Simulator */}
        <div id="simulator" className="lp-sim-card">
          <div className="lp-sim-header">
            <div className="lp-sim-title-group">
              <span className="lp-sim-badge">Live Interactive Simulator</span>
              <strong style={{ fontSize: '0.92rem', color: 'var(--lp-text-title)' }}>
                Deterministic Lead Protection in Action
              </strong>
            </div>
            <button
              onClick={resetSimulator}
              className="lp-btn lp-btn-ghost"
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              <RotateCcw size={14} /> Reset State
            </button>
          </div>

          <div className="lp-sim-body">
            {/* Left: Lead Card */}
            <div className="lp-lead-box">
              <div className="lp-lead-top">
                <div>
                  <div className="lp-lead-name">Sarah Jenkins</div>
                  <div className="lp-lead-source">Source: Twilio WhatsApp Sandbox (Inbound #2094)</div>
                </div>

                <div className={`lp-sla-indicator ${leadStatus === 'acknowledged' ? 'lp-sla-ack' : 'lp-sla-active'}`}>
                  <Clock size={14} />
                  {leadStatus === 'acknowledged' && 'Acknowledged'}
                  {leadStatus === 'pending' && `SLA Window: ${slaTime}s`}
                  {leadStatus === 'escalated' && 'Escalated to Tier 2'}
                </div>
              </div>

              <div className="lp-lead-details">
                <div><strong>Inquiry:</strong> Commercial Solar Roof Installation (40 kW)</div>
                <div><strong>Assigned To:</strong> {assignedRep}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    color: leadStatus === 'acknowledged' ? 'var(--pastel-sage)' :
                           leadStatus === 'escalated' ? 'var(--pastel-terracotta)' : 'var(--pastel-amber)'
                  }}>
                    {leadStatus === 'acknowledged' ? 'Active Conversation' :
                     leadStatus === 'escalated' ? 'Escalated / Backup Assigned' : 'Awaiting Acknowledgement'}
                  </span>
                </div>
              </div>

              <div className="lp-lead-actions">
                {leadStatus !== 'acknowledged' ? (
                  <button className="lp-btn lp-btn-primary" onClick={handleSimAcknowledge}>
                    <CheckCircle2 size={16} /> Acknowledge Lead
                  </button>
                ) : (
                  <button className="lp-btn lp-btn-outline" onClick={onEnterApp}>
                    Open Customer 360 View <ArrowRight size={14} />
                  </button>
                )}
                <button className="lp-btn lp-btn-outline" onClick={handleSimEscalate} disabled={leadStatus === 'acknowledged'}>
                  Force Escalate
                </button>
              </div>

              {/* Event Log */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--lp-border)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lp-text-muted)', marginBottom: '8px' }}>
                  IMMUTABLE AUDIT TRAIL
                </div>
                {logs.slice(0, 3).map((l, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--lp-text-body)', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--lp-text-faint)', marginRight: '8px' }}>{l.time}</span>
                    {l.event}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Availability & Escalation Controls */}
            <div className="lp-sim-controls">
              <div className="lp-control-group">
                <h4>Simulate Real-World Conditions</h4>
                <div className="lp-rep-status-list">
                  <div className="lp-rep-item">
                    <div className="lp-rep-info">
                      <div className="lp-rep-avatar">MV</div>
                      <div>
                        <strong>Marcus Vance</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--lp-text-muted)' }}>Primary Rep</div>
                      </div>
                    </div>
                    <select
                      className="lp-status-select"
                      value={repStatus}
                      onChange={(e) => handleRepStatusChange(e.target.value)}
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="On leave">On leave</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>

                  <div className="lp-rep-item">
                    <div className="lp-rep-info">
                      <div className="lp-rep-avatar" style={{ background: 'var(--pastel-sand-light)', color: 'var(--pastel-sand)' }}>
                        ER
                      </div>
                      <div>
                        <strong>Elena Rostova</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--lp-text-muted)' }}>Backup / Manager</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--pastel-sage)', fontWeight: 600 }}>Available</span>
                  </div>
                </div>

                <div className="lp-sim-hint">
                  <strong>Try it:</strong> Switch Marcus to <em>"On leave"</em>. Notice how OmniFlow immediately reassigns the unacknowledged lead to Elena without losing a second.
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--lp-text-faint)', marginTop: '16px' }}>
                Zero duplicate actions • Server-side concurrency control • Configurable response windows
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Integrations Strip */}
      <section className="lp-integrations-bar" id="integrations">
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lp-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Real Connections, Zero Mockups
        </span>
        <div className="lp-integration-chip">
          <MessageSquare size={16} color="var(--pastel-slate)" /> Twilio WhatsApp Sandbox
        </div>
        <div className="lp-integration-chip">
          <CreditCard size={16} color="var(--pastel-terracotta)" /> Stripe Test Mode
        </div>
        <div className="lp-integration-chip">
          <Calendar size={16} color="var(--pastel-sage)" /> Google Calendar OAuth 2.0
        </div>
        <div className="lp-integration-chip">
          <AlertTriangle size={16} color="var(--pastel-amber)" /> Slack & Telegram Escalations
        </div>
      </section>

      {/* Core Problems & Solutions */}
      <section className="lp-section" id="how-it-works">
        <div className="lp-section-header">
          <span className="lp-section-tag">Root Cause Analysis</span>
          <h2 className="lp-section-title">Why Service Businesses Lose Inbound Revenue</h2>
        </div>

        <div className="lp-grid-3">
          <div className="lp-feature-card">
            <div className="lp-icon-box terracotta">
              <Clock size={22} />
            </div>
            <h3>Informal Assignment & Dodged Ownership</h3>
            <p>
              When leads arrive in shared inboxes or team chats, everyone assumes someone else is handling it. OmniFlow assigns every lead to exactly one accountable person with a hard acknowledgement countdown.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-icon-box sage">
              <Users size={22} />
            </div>
            <h3>Absence & Unbalanced Workloads</h3>
            <p>
              Standard CRMs route leads to employees who are sick, in client meetings, or off shift. OmniFlow monitors live availability statuses and caps active leads per rep before round-robin distribution.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-icon-box slate">
              <Layers size={22} />
            </div>
            <h3>Fragmented Tools & Record Gaps</h3>
            <p>
              Customer conversations happen in WhatsApp, payments on Stripe, and appointments on Google Calendar. OmniFlow ties real webhooks from all three directly to the customer 360 record.
            </p>
          </div>
        </div>
      </section>

      {/* Deep-Dive Feature Tabs */}
      <section className="lp-tab-section" id="product">
        <div className="lp-tab-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Modular System Architecture</span>
            <h2 className="lp-section-title">Engineered to Support Your Actual Workflow</h2>
          </div>

          <div className="lp-tabs-bar">
            <button
              className={`lp-tab-trigger ${activeTab === 'escalation' ? 'active' : ''}`}
              onClick={() => setActiveTab('escalation')}
            >
              Lead Escalation & Recovery
            </button>
            <button
              className={`lp-tab-trigger ${activeTab === 'crm' ? 'active' : ''}`}
              onClick={() => setActiveTab('crm')}
            >
              Customizable Pipeline & Stages
            </button>
            <button
              className={`lp-tab-trigger ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveTab('customer')}
            >
              Unified Customer 360 View
            </button>
            <button
              className={`lp-tab-trigger ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Roles & Field-Level Protection
            </button>
          </div>

          <div className="lp-preview-box">
            {activeTab === 'escalation' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lp-text-title)', marginBottom: '12px' }}>
                    Multi-Tier Escalation Chains
                  </h3>
                  <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
                    Configure exact response windows in seconds for quick testing. When an unacknowledged lead expires, it steps up:
                  </p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                    <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className="lp-sim-badge">Tier 1</span> Next Available Round-Robin Colleague
                    </li>
                    <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className="lp-sim-badge" style={{ background: 'var(--pastel-sand-light)', color: 'var(--pastel-amber)' }}>Tier 2</span> Designated Team Backup Specialist
                    </li>
                    <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className="lp-sim-badge" style={{ background: 'var(--pastel-terracotta-light)', color: 'var(--pastel-terracotta)' }}>Tier 3</span> Sales Manager & Dedicated Recovery Queue
                    </li>
                  </ul>
                </div>

                <div style={{ background: 'var(--lp-surface)', padding: '20px', borderRadius: 'var(--lp-radius-lg)', border: '1px solid var(--lp-border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--lp-text-title)', marginBottom: '10px' }}>
                    The Recovery Queue
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--lp-text-muted)', marginBottom: '14px' }}>
                    A dedicated safety net listing leads that escalated multiple times or remained untouched. Managers can reassign with a single click.
                  </p>
                  <div style={{ padding: '10px 14px', background: 'var(--lp-surface-subtle)', borderRadius: 'var(--lp-radius-md)', fontSize: '0.8rem', borderLeft: '3px solid var(--pastel-terracotta)' }}>
                    <strong>3 Leads in Recovery Queue</strong> (Avg wait time: 4m 12s)
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'crm' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lp-text-title)', marginBottom: '12px' }}>
                    Customizable Pipeline & Required Stage Fields
                  </h3>
                  <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
                    Add, rename, reorder, and remove stages without developer help. Require specific fields before moving deals to critical milestones (e.g., Quote Amount before Proposal Sent).
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="lp-pill-badge" style={{ margin: 0 }}>No-code Custom Fields</span>
                    <span className="lp-pill-badge" style={{ margin: 0 }}>Multi-Criteria Saved Lists</span>
                  </div>
                </div>

                <div style={{ background: 'var(--lp-surface)', padding: '20px', borderRadius: 'var(--lp-radius-lg)', border: '1px solid var(--lp-border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--lp-text-title)', marginBottom: '10px' }}>
                    Stage Gate Validation
                  </div>
                  <div style={{ padding: '12px', background: 'var(--pastel-terracotta-light)', color: 'var(--pastel-terracotta)', borderRadius: 'var(--lp-radius-md)', fontSize: '0.82rem', border: '1px solid rgba(194, 103, 81, 0.25)' }}>
                    <strong>Movement Blocked:</strong> Cannot transition to "Quote Delivered" until <em>"Survey Inspection Date"</em> and <em>"Estimated System Size"</em> are filled.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lp-text-title)', marginBottom: '12px' }}>
                    One Contact Record. Every Event.
                  </h3>
                  <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
                    No more toggling across four browser tabs. The Customer 360 page synchronizes WhatsApp conversations, Stripe checkout links, and Google Calendar appointments into a chronological timeline.
                  </p>
                </div>

                <div style={{ background: 'var(--lp-surface)', padding: '20px', borderRadius: 'var(--lp-radius-lg)', border: '1px solid var(--lp-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                    <div style={{ padding: '8px 12px', background: 'var(--pastel-slate-light)', borderRadius: 'var(--lp-radius-sm)', color: 'var(--pastel-slate)' }}>
                      <strong>WhatsApp:</strong> "Yes, Friday 10 AM works for our on-site inspection."
                    </div>
                    <div style={{ padding: '8px 12px', background: 'var(--pastel-sage-light)', borderRadius: 'var(--lp-radius-sm)', color: 'var(--pastel-sage)' }}>
                      <strong>Google Calendar:</strong> Booked: On-site Inspection (10:00 - 11:00 AM)
                    </div>
                    <div style={{ padding: '8px 12px', background: 'var(--pastel-amber-light)', borderRadius: 'var(--lp-radius-sm)', color: 'var(--pastel-amber)' }}>
                      <strong>Stripe:</strong> Payment Link generated for $500 Deposit (Pending)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lp-text-title)', marginBottom: '12px' }}>
                    Workspace Isolation & Field-Level Protection
                  </h3>
                  <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
                    Strict company workspace boundaries ensure no cross-tenant data leaks. Granular permissions allow masking opportunity values from junior employees or external collaborators.
                  </p>
                </div>

                <div style={{ background: 'var(--lp-surface)', padding: '20px', borderRadius: 'var(--lp-radius-lg)', border: '1px solid var(--lp-border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--lp-text-title)', marginBottom: '8px' }}>
                    Field-Level Masking Example
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--lp-surface-subtle)', borderRadius: 'var(--lp-radius-sm)', fontSize: '0.82rem' }}>
                    <span>Solar Commercial Contract (User View):</span>
                    <strong style={{ letterSpacing: '0.1em', color: 'var(--lp-text-muted)' }}>$ ••••••••</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--lp-surface-subtle)', borderRadius: 'var(--lp-radius-sm)', fontSize: '0.82rem', marginTop: '6px' }}>
                    <span>Solar Commercial Contract (Owner/Admin):</span>
                    <strong style={{ color: 'var(--pastel-sage)' }}>$48,500.00</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Target Industries (Problem Statement Section 2) */}
      <section className="lp-section" id="solutions">
        <div className="lp-section-header">
          <span className="lp-section-tag">Target Workspaces</span>
          <h2 className="lp-section-title">Built Specifically for High-Intent Service Teams</h2>
        </div>

        <div className="lp-grid-3">
          <div className="lp-feature-card">
            <h3>Real Estate Agencies</h3>
            <p>
              High-value buyers call after hours or text during property viewings. Automatic SLA escalation guarantees inquiries are answered before buyers call another agent.
            </p>
          </div>

          <div className="lp-feature-card">
            <h3>Solar Installation Teams</h3>
            <p>
              Roof inspection appointments, custom wattage fields, and Stripe deposit links all synced from web forms into active technician calendars.
            </p>
          </div>

          <div className="lp-feature-card">
            <h3>Specialist & Dental Clinics</h3>
            <p>
              Patient-acquisition coordinators route incoming appointment requests without conflicts, tracking confirmation status via WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Clean Pricing */}
      <section className="lp-section" id="pricing" style={{ background: 'var(--lp-surface)', borderTop: '1px solid var(--lp-border)' }}>
        <div className="lp-section-header">
          <span className="lp-section-tag">Predictable Workspace Billing</span>
          <h2 className="lp-section-title">One Fixed Price for the Entire Office</h2>
        </div>

        <div className="lp-pricing-grid">
          <div className="lp-price-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--lp-text-title)' }}>Small Service Team</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--lp-text-muted)', marginTop: '4px' }}>For boutique agencies with up to 10 staff</p>
            <div className="lp-price-tag">$149 <span>/ workspace / month</span></div>

            <ul className="lp-price-features">
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Up to 10 user seats included</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Automatic Round-Robin & SLA timers</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Twilio WhatsApp Sandbox integration</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Stripe test & live payment links</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Full immutable audit trail</li>
            </ul>

            <button className="lp-btn lp-btn-outline" onClick={onEnterApp}>
              Get Started
            </button>
          </div>

          <div className="lp-price-card featured">
            <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--pastel-slate)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', textTransform: 'uppercase' }}>
              Standard Workspace
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--lp-text-title)' }}>Growing Service Agency</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--lp-text-muted)', marginTop: '4px' }}>For teams with 10 to 30 employees</p>
            <div className="lp-price-tag">$289 <span>/ workspace / month</span></div>

            <ul className="lp-price-features">
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Up to 30 user seats included</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Advanced multi-tier escalation chains</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Unlimited custom fields & pipelines</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Google Calendar OAuth scheduling</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Dedicated Recovery Queue & drill-down</li>
              <li><CheckCircle2 size={16} color="var(--pastel-sage)" /> Field-level protection & masking</li>
            </ul>

            <button className="lp-btn lp-btn-primary" onClick={onEnterApp}>
              Launch Workspace Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="lp-brand-mark" style={{ width: '22px', height: '22px' }}>
              <ShieldCheck size={14} />
            </div>
            <strong style={{ color: 'var(--lp-text-title)' }}>OmniFlow</strong>
            <span style={{ marginLeft: '12px' }}>Unified Business Management & Lead Protection Platform</span>
          </div>

          <div>
            Built strictly in accordance with Unified Business Management Platform specifications.
          </div>
        </div>
      </footer>
    </div>
  );
}
