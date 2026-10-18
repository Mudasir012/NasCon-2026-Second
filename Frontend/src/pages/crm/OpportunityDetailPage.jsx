import React, { useState } from 'react';
import {
  Building,
  User,
  DollarSign,
  Calendar,
  CreditCard,
  MessageSquare,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function OpportunityDetailPage() {
  // Field-level protection demonstration toggle (F1.4)
  // Owner/Admin sees full value ($48,500.00), User without permission sees masked value
  const [hasFinancialPermission, setHasFinancialPermission] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [paymentGenerated, setPaymentGenerated] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  const opportunity = {
    id: 'OPP-302',
    title: 'Apex Logistics Cold Storage Solar Array',
    rawAmount: 42500,
    formattedAmount: '$42,500.00',
    company: 'Apex Precision Logistics Inc.',
    contact: {
      name: 'David K. Ross',
      email: 'd.ross@apexlogistics.com',
      phone: '+1 415 992 0184',
      title: 'VP of Facility Operations'
    },
    pipeline: 'Commercial Rooftop Pipeline',
    stage: 'Site Survey Completed',
    assignedTo: 'Elena Rostova',
    customFields: {
      surveyDate: '2026-10-25',
      inspectorAssigned: 'Tech Lead Kyle',
      systemKwSize: '40 kW Commercial',
      inverterType: 'SolarEdge Pro 3-Phase',
      utilityProvider: 'Pacific Gas & Electric'
    }
  };

  const activityHistory = [
    { type: 'payment', actor: 'Stripe Webhook', time: '10:45 AM', text: 'Stripe payment link generated for $500.00 site deposit' },
    { type: 'appointment', actor: 'Google Calendar Sync', time: 'Yesterday', text: 'On-site engineering inspection confirmed for Oct 25, 10:00 AM' },
    { type: 'stage', actor: 'Elena Rostova', time: '2 days ago', text: 'Moved deal from Discovery to Site Survey (Validated required fields)' },
    { type: 'message', actor: 'David K. Ross (WhatsApp)', time: '3 days ago', text: '"We have 12,000 sq ft flat roof available for mounting."' },
    { type: 'assignment', actor: 'OmniFlow Engine', time: '4 days ago', text: 'Lead auto-assigned via Round-Robin distribution' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#79756d]">{opportunity.id}</span>
            <span className="text-xs bg-[#eaf0ee] text-[#52796f] px-2 py-0.5 rounded font-semibold border border-[#52796f]/25">
              {opportunity.stage}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1917] mt-1">{opportunity.title}</h1>
          <p className="text-xs text-[#79756d]">
            Connected to Company: <strong className="text-[#1a1917]">{opportunity.company}</strong> • Contact:{' '}
            <strong className="text-[#1a1917]">{opportunity.contact.name}</strong> (F2.1)
          </p>
        </div>

        {/* Field-Level Protection Simulator (F1.4) */}
        <div className="flex items-center gap-2 bg-white border border-[#d3cfc7] rounded-md px-3 py-1.5 text-xs">
          <span className="text-[#79756d] font-semibold">Simulate Role:</span>
          <button
            onClick={() => setHasFinancialPermission(!hasFinancialPermission)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold transition-colors ${
              hasFinancialPermission
                ? 'bg-[#1a1917] text-white'
                : 'bg-[#faece8] text-[#c26751] border border-[#c26751]/30'
            }`}
          >
            {hasFinancialPermission ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>{hasFinancialPermission ? 'Owner View (Unmasked)' : 'Restricted User (Masked F1.4)'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Details & 360 Customer View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Deal & Financial Protection */}
        <div className="lg:col-span-8 space-y-6">
          {/* Key Value & Details Banner */}
          <div className="bg-white border border-[#e8e5de] rounded-lg p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#e8e5de] pb-4 mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d]">
                  Opportunity Value (F1.4)
                </div>
                <div className="text-2xl font-extrabold text-[#1a1917] mt-1">
                  {hasFinancialPermission ? (
                    <span className="text-[#52796f]">{opportunity.formattedAmount}</span>
                  ) : (
                    <span className="text-[#79756d] font-mono tracking-widest bg-[#f4f2ee] px-2 py-0.5 rounded">
                      $ ••••••••
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#79756d] mt-1">
                  {hasFinancialPermission ? 'Verified Stripe collected' : 'Masked: Financial permission required'}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d]">Assigned Account Owner</div>
                <div className="text-base font-bold text-[#1a1917] mt-1">{opportunity.assignedTo}</div>
                <div className="text-[10px] text-[#52796f]">Available (Online)</div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d]">Pipeline Context (F2.3)</div>
                <div className="text-xs font-semibold text-[#1a1917] mt-1">{opportunity.pipeline}</div>
                <div className="text-[10px] text-[#79756d]">Commercial Custom Field Set</div>
              </div>
            </div>

            {/* Custom Fields (F2.2, F2.3) */}
            <div>
              <div className="text-xs font-bold text-[#1a1917] mb-3">Custom Fields (Created from UI without code F2.2)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(opportunity.customFields).map(([k, v]) => (
                  <div key={k} className="p-2.5 bg-[#faf9f6] border border-[#e8e5de] rounded">
                    <span className="text-[#79756d] text-[11px] font-semibold uppercase">{k}:</span>
                    <div className="font-bold text-[#1a1917] mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity History Log (F2.7) */}
          <div className="bg-white border border-[#e8e5de] rounded-lg p-5">
            <h2 className="text-sm font-bold text-[#1a1917] mb-3">Time-Ordered Activity Log (F2.7)</h2>
            <div className="space-y-3">
              {activityHistory.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs pb-3 border-b border-[#f4f2ee] last:border-none">
                  <div className="h-6 w-6 rounded bg-[#f4f2ee] text-[#4a6b82] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {act.type === 'payment' && <CreditCard size={13} />}
                    {act.type === 'appointment' && <Calendar size={13} />}
                    {act.type === 'stage' && <CheckCircle2 size={13} />}
                    {act.type === 'message' && <MessageSquare size={13} />}
                    {act.type === 'assignment' && <User size={13} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1a1917]">{act.actor}</span>
                      <span className="text-[10px] text-[#a8a49c]">{act.time}</span>
                    </div>
                    <div className="text-[#3c3933] mt-0.5">{act.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer 360 Actions (F2.8, I2, I3) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer 360 Profile */}
          <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#1a1917] border-b border-[#e8e5de] pb-2">
              Customer 360 Profile (F2.8)
            </h2>

            <div>
              <div className="font-bold text-sm text-[#1a1917]">{opportunity.contact.name}</div>
              <div className="text-[#79756d] text-[11px]">{opportunity.contact.title}</div>
            </div>

            <div className="space-y-1.5 text-[#3c3933]">
              <div><strong>Email:</strong> {opportunity.contact.email}</div>
              <div><strong>Phone:</strong> {opportunity.contact.phone}</div>
              <div><strong>Company:</strong> {opportunity.company}</div>
            </div>

            <div className="pt-2 border-t border-[#e8e5de]">
              <span className="text-[11px] font-semibold text-[#52796f] bg-[#eaf0ee] px-2 py-0.5 rounded border border-[#52796f]/25">
                Opted-In to Twilio WhatsApp (I1.9)
              </span>
            </div>
          </div>

          {/* Integration Trigger 1: Stripe Payment Link (I2.1) */}
          <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#1a1917]">
              <CreditCard size={15} className="text-[#c26751]" />
              <span>Stripe Checkout Link (I2.1)</span>
            </div>
            <p className="text-[#79756d] text-[11px]">
              Generate a test-mode payment link for the 10% inspection deposit ($500.00).
            </p>

            {paymentGenerated ? (
              <div className="p-2.5 bg-[#eaf0ee] border border-[#52796f]/30 rounded text-[#52796f] font-mono text-[11px]">
                https://buy.stripe.com/test_session_apex_solar
              </div>
            ) : (
              <button
                onClick={() => setPaymentGenerated(true)}
                className="w-full py-2 bg-[#1a1917] text-white rounded font-semibold hover:bg-[#33302a] transition-all"
              >
                Create $500 Payment Link
              </button>
            )}
          </div>

          {/* Integration Trigger 2: Google Calendar (I3.3) */}
          <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#1a1917]">
              <Calendar size={15} className="text-[#52796f]" />
              <span>Google Calendar Booking (I3.3)</span>
            </div>
            <p className="text-[#79756d] text-[11px]">
              Books appointment on Elena's calendar with automatic conflict checking.
            </p>

            {appointmentBooked ? (
              <div className="p-2.5 bg-[#eaf0ee] border border-[#52796f]/30 rounded text-[#52796f] font-semibold text-[11px]">
                Event Synced to Google Calendar (Oct 25, 10:00 AM)
              </div>
            ) : (
              <button
                onClick={() => setAppointmentBooked(true)}
                className="w-full py-2 bg-white border border-[#d3cfc7] text-[#1a1917] rounded font-semibold hover:bg-[#f4f2ee]"
              >
                Book Inspection Slot
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
