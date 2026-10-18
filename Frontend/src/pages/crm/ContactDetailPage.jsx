import React, { useMemo, useState } from 'react';
import {
  Phone,
  Mail,
  Building2,
  Tag,
  BellOff,
  Bell,
  MessageSquare,
  StickyNote,
  CalendarPlus,
  Receipt,
  X,
  Send,
  Briefcase,
  CreditCard,
  Calendar,
  History,
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  CheckCheck,
  ChevronRight,
  Users,
  ExternalLink,
  Copy,
  AlertCircle,
  RotateCcw,
  DollarSign,
  Layers,
} from 'lucide-react';

const CONTACT = {
  id: 'c1',
  name: 'Sarah Jenkins',
  title: 'Operations Director',
  email: 'sarah.jenkins@brightwave.io',
  phone: '+1 (415) 555-0132',
  company: 'Brightwave Solar',
  location: 'San Francisco, CA',
  createdAt: 'Mar 12, 2026',
  source: 'Web Form',
  stage: 'Proposal Sent',
  owner: { name: 'Marcus Vance', role: 'Senior Sales Rep', status: 'Available' },
  tags: ['Enterprise', 'Hot', 'Solar'],
  customFields: [
    { label: 'Property Type', value: 'Commercial', type: 'select', required: true },
    { label: 'Estimated System Size', value: '40', unit: 'kW', type: 'number', required: true },
    { label: 'Site Inspection Date', value: 'Oct 24, 2026', type: 'date' },
    { label: 'Budget Range', value: 65000, type: 'currency' },
    { label: 'Preferred Channel', value: 'WhatsApp', type: 'select' },
    { label: 'Site Access Notes', value: 'Loading dock access after 8am. Contact building manager on arrival.', type: 'textarea' },
  ],
  opportunities: [
    { id: 'OPP-401', title: 'Commercial Solar Roof — 40 kW', stage: 'Proposal Sent', value: 48500, probability: 60, closeDate: 'Nov 04, 2026', owner: 'Marcus Vance' },
    { id: 'OPP-402', title: 'Battery Storage Add-on', stage: 'Qualified', value: 12000, probability: 35, closeDate: 'Nov 20, 2026', owner: 'David Okafor' },
  ],
  conversations: [
    { id: 'm1', channel: 'WhatsApp', direction: 'inbound', body: 'We reviewed the proposal — it looks good. Can we lock in the site inspection for Friday?', time: 'Today · 09:14', status: 'Delivered' },
    { id: 'm2', channel: 'WhatsApp', direction: 'outbound', body: 'Absolutely. Friday 10:00 AM works — I have just sent the calendar invite.', time: 'Today · 09:22', status: 'Read' },
    { id: 'm3', channel: 'SMS', direction: 'outbound', body: 'I also generated the $500 deposit link so we can hold the crew slot.', time: 'Today · 09:23', status: 'Sent' },
  ],
  payments: [
    { id: 'pi_3Nx…aB2', amount: 500, currency: 'USD', status: 'Paid', createdAt: 'Oct 16, 2026', description: 'Site inspection deposit' },
    { id: 'pi_3Ny…kQ9', amount: 9700, currency: 'USD', status: 'Pending', createdAt: 'Oct 18, 2026', description: 'Equipment reservation (20%)' },
    { id: 'pi_3Nw…dP4', amount: 250, currency: 'USD', status: 'Expired', createdAt: 'Oct 02, 2026', description: 'Design retainer' },
    { id: 'pi_3Nt…fR8', amount: 1200, currency: 'USD', status: 'Failed', createdAt: 'Sep 28, 2026', description: 'Mobilization fee' },
    { id: 'pi_3Ns…hT1', amount: 300, currency: 'USD', status: 'Refunded', createdAt: 'Sep 21, 2026', description: 'Duplicate charge' },
  ],
  appointments: [
    { id: 'a1', title: 'On-site Inspection', start: 'Fri, Oct 24 · 10:00 AM', end: '11:00 AM', location: '1420 Marsh Ln, San Jose, CA', status: 'Confirmed' },
    { id: 'a2', title: 'Proposal Review Call', start: 'Wed, Oct 22 · 2:00 PM', end: '2:30 PM', location: 'Google Meet', status: 'Pending' },
  ],
  activity: [
    { time: '2h ago', actor: 'Marcus Vance', type: 'stage', text: 'Moved “Commercial Solar Roof — 40 kW” to Proposal Sent' },
    { time: '5h ago', actor: 'Sarah Jenkins', type: 'message', text: 'Replied on WhatsApp about inspection scheduling' },
    { time: 'Yesterday', actor: 'System', type: 'payment', text: 'Stripe payment of $500.00 marked as Paid' },
    { time: 'Oct 15', actor: 'Marcus Vance', type: 'note', text: 'Added a note: “Budget approved by board, decision expected next week.”' },
    { time: 'Oct 12', actor: 'System', type: 'field', text: 'Updated custom field “Estimated System Size” to 40 kW' },
    { time: 'Oct 04', actor: 'OmniFlow Engine', type: 'assignment', text: 'Lead auto-assigned via Round-Robin distribution' },
  ],
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'activity', label: 'Activity Timeline', icon: History },
];

const PAYMENT_STATUS = {
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Expired: 'bg-slate-100 text-slate-500 ring-slate-500/20',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Refunded: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const STAGE_STYLES = {
  Qualified: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  'Proposal Sent': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Negotiation: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Lost: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const ACTIVITY_META = {
  stage: { icon: Layers, chip: 'bg-indigo-50 text-indigo-600' },
  message: { icon: MessageSquare, chip: 'bg-emerald-50 text-emerald-600' },
  payment: { icon: CreditCard, chip: 'bg-violet-50 text-violet-600' },
  note: { icon: StickyNote, chip: 'bg-slate-100 text-slate-600' },
  field: { icon: ClipboardList, chip: 'bg-amber-50 text-amber-600' },
  assignment: { icon: Users, chip: 'bg-sky-50 text-sky-600' },
  appointment: { icon: Calendar, chip: 'bg-teal-50 text-teal-600' },
};

function formatMoney(value, currency = 'USD') {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '';
  return `${symbol}${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function initialsOf(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] w-[min(92vw,22rem)]">
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            toast.tone === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {toast.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </span>
        <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
      </div>
    </div>
  );
}

export default function ContactDetailPage({ onNavigate }) {
  const [contact, setContact] = useState(CONTACT);
  const [activeTab, setActiveTab] = useState('overview');
  const [optedOut, setOptedOut] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [toast, setToast] = useState(null);

  const pushToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3000);
  };

  const addActivity = (contactState, entry) => ({ ...contactState, activity: [entry, ...contactState.activity] });

  const openCount = useMemo(
    () => contact.opportunities.filter((o) => o.stage !== 'Won' && o.stage !== 'Lost').length,
    [contact.opportunities],
  );

  function handleSendMessage() {
    setActiveTab('conversations');
    pushToast('Twilio WhatsApp composer ready');
  }

  function handleAddNote(event) {
    event.preventDefault();
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    setContact((prev) =>
      addActivity(prev, { time: 'Just now', actor: 'Alex Mercer', type: 'note', text: `Added a note: “${trimmed}”` }),
    );
    setNoteDraft('');
    setNoteOpen(false);
    pushToast('Note added to activity timeline');
  }

  function handleBookAppointment() {
    setContact((prev) =>
      addActivity(
        {
          ...prev,
          appointments: [
            ...prev.appointments,
            { id: `a-${Date.now()}`, title: 'Discovery Call', start: 'Thu, Oct 30 · 10:00 AM', end: '10:30 AM', location: 'Google Meet', status: 'Pending' },
          ],
        },
        { time: 'Just now', actor: 'Alex Mercer', type: 'appointment', text: 'Booked a Google Calendar appointment' },
      ),
    );
    setActiveTab('appointments');
    pushToast('Appointment booked — invitation sent via Google Calendar');
  }

  function handleCreatePayment() {
    setContact((prev) =>
      addActivity(
        {
          ...prev,
          payments: [
            {
              id: `pi_${Math.random().toString(36).slice(2, 6)}…${Math.random().toString(36).slice(2, 5)}`,
              amount: 500,
              currency: 'USD',
              status: 'Pending',
              createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              description: 'Checkout link (Stripe test mode)',
            },
            ...prev.payments,
          ],
        },
        { time: 'Just now', actor: 'Alex Mercer', type: 'payment', text: 'Created a Stripe payment link for $500.00' },
      ),
    );
    setActiveTab('payments');
    pushToast('Stripe test payment link created for $500.00');
  }

  function retryPayment(payment) {
    setContact((prev) =>
      addActivity(
        {
          ...prev,
          payments: prev.payments.map((p) => (p.id === payment.id ? { ...p, status: 'Paid' } : p)),
        },
        { time: 'Just now', actor: 'System', type: 'payment', text: `Retried ${payment.id} — now Paid` },
      ),
    );
    pushToast('Payment retried successfully');
  }

  const quickActions = [
    { label: 'Send Message', icon: MessageSquare, onClick: handleSendMessage, primary: true },
    { label: 'Add Note', icon: StickyNote, onClick: () => setNoteOpen(true) },
    { label: 'Book Appointment', icon: CalendarPlus, onClick: handleBookAppointment },
    { label: 'Create Payment Request', icon: Receipt, onClick: handleCreatePayment },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span>Workspace</span>
          <ChevronRight className="h-3 w-3" />
          <span>CRM</span>
          <ChevronRight className="h-3 w-3" />
          <button type="button" onClick={() => onNavigate?.('contacts')} className="transition hover:text-indigo-600">
            Contacts
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-600">{contact.name}</span>
        </nav>

        {/* Header */}
        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white">
                {initialsOf(contact.name)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">{contact.name}</h1>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STAGE_STYLES[contact.stage]}`}>
                    {contact.stage}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  {contact.title} · {contact.company}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {contact.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {contact.phone}
                  </span>
                  <button
                    type="button"
                    onClick={() => pushToast(`Opening ${contact.company} company record`)}
                    className="flex items-center gap-1.5 transition hover:text-indigo-600"
                  >
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {contact.company}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    <span className={`inline-block h-2 w-2 rounded-full ${contact.owner.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {contact.owner.name}
                    <span className="text-slate-400">· {contact.owner.status}</span>
                  </span>
                  {contact.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Opt-out toggle */}
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <button
                type="button"
                onClick={() => {
                  setOptedOut((prev) => !prev);
                  pushToast(optedOut ? `${contact.name} opted back in to WhatsApp` : `${contact.name} opted out of WhatsApp messaging`);
                }}
                aria-pressed={optedOut}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  optedOut
                    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {optedOut ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                {optedOut ? 'Opted-out of messaging' : 'Opted-in to messaging'}
                <span className={`relative ml-1 inline-flex h-4 w-7 items-center rounded-full transition ${optedOut ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                  <span className={`absolute h-3 w-3 rounded-full bg-white transition-all ${optedOut ? 'left-3.5' : 'left-0.5'}`} />
                </span>
              </button>
              <p className="text-[11px] text-slate-400">
                {optedOut ? 'Outbound sends are blocked for this contact.' : 'Contact has consented to receive messages.'}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition ${
                  action.primary
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </button>
            ))}
          </div>
        </header>

        {/* Tabs */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-2 sm:px-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.id === 'conversations' && (
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">{contact.conversations.length}</span>
                )}
                {tab.id === 'opportunities' && (
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">{contact.opportunities.length}</span>
                )}
                {tab.id === 'payments' && (
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">{contact.payments.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <ClipboardList className="h-4 w-4 text-slate-400" /> Dynamic attributes
                  </h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    {[
                      { label: 'Company', value: contact.company, icon: Building2 },
                      { label: 'Job title', value: contact.title, icon: Briefcase },
                      { label: 'Location', value: contact.location, icon: Building2 },
                      { label: 'Source', value: contact.source, icon: Layers },
                      { label: 'Created', value: contact.createdAt, icon: Calendar },
                      { label: 'Assigned to', value: contact.owner.name, icon: Users },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start gap-2">
                        <row.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">{row.label}</p>
                          <p className="truncate text-sm text-slate-700">{row.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Layers className="h-4 w-4 text-slate-400" /> Custom fields
                    </h2>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                      {contact.stage} form
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {contact.customFields.map((field) => (
                      <div key={field.label} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">{field.label}</p>
                          {field.required && (
                            <span className="rounded bg-rose-50 px-1 text-[10px] font-semibold text-rose-600">required</span>
                          )}
                        </div>
                        {field.type === 'textarea' ? (
                          <p className="mt-1 text-sm leading-relaxed text-slate-700">{field.value}</p>
                        ) : (
                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {field.type === 'currency' ? formatMoney(field.value) : field.value}
                            {field.unit && <span className="ml-1 text-xs font-normal text-slate-400">{field.unit}</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'conversations' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Twilio WhatsApp & SMS</p>
                      <p className="text-[11px] text-slate-400">Unified thread · {contact.conversations.length} messages</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('messaging')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Open in Messaging <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                {contact.conversations.map((message) => {
                  const outbound = message.direction === 'outbound';
                  return (
                    <button
                      key={message.id}
                      type="button"
                      onClick={() => onNavigate?.('messaging')}
                      className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${outbound ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {message.channel === 'WhatsApp' ? 'WA' : 'SMS'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-700">{outbound ? 'You' : contact.name}</span>
                          <span className="text-[10px] text-slate-400">{message.time}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{message.body}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  {openCount} open deal{openCount === 1 ? '' : 's'} linked to this contact.
                </p>
                {contact.opportunities.map((opp) => (
                  <div key={opp.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{opp.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {opp.id} · Owner {opp.owner} · Close {opp.closeDate}
                        </p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STAGE_STYLES[opp.stage]}`}>
                        {opp.stage}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        {formatMoney(opp.value)}
                      </span>
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${opp.probability}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{opp.probability}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => pushToast('Opening the opportunity composer')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  <Plus className="h-4 w-4" /> Link another opportunity
                </button>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                  <p className="text-xs font-medium text-slate-600">Stripe test mode</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    <AlertCircle className="h-3 w-3" /> No card data is stored
                  </span>
                </div>
                {contact.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-600'
                          : payment.status === 'Pending' ? 'bg-amber-50 text-amber-600'
                            : payment.status === 'Failed' ? 'bg-rose-50 text-rose-600'
                              : payment.status === 'Refunded' ? 'bg-violet-50 text-violet-600'
                                : 'bg-slate-100 text-slate-500'
                      }`}>
                        {payment.status === 'Paid' ? <CheckCircle2 className="h-4 w-4" />
                          : payment.status === 'Pending' ? <Clock className="h-4 w-4" />
                            : payment.status === 'Refunded' ? <RotateCcw className="h-4 w-4" />
                              : <XCircle className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{payment.description}</p>
                        <p className="truncate font-mono text-[11px] text-slate-400">{payment.id} · {payment.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">{formatMoney(payment.amount, payment.currency)}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${PAYMENT_STATUS[payment.status]}`}>
                        {payment.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => pushToast(`Opening Stripe link ${payment.id}`)}
                        aria-label="Copy payment link"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {(payment.status === 'Failed' || payment.status === 'Expired') && (
                        <button
                          type="button"
                          onClick={() => retryPayment(payment)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <RotateCcw className="h-3 w-3" /> Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                  <Calendar className="h-4 w-4 text-sky-500" />
                  <p className="text-xs font-medium text-slate-600">Synced with Google Calendar</p>
                </div>
                {contact.appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{appointment.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {appointment.start} – {appointment.end}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {appointment.location}
                        </p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                        appointment.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <History className="h-4 w-4 text-slate-400" /> Who did what, and when
                </h2>
                <ol className="space-y-4">
                  {contact.activity.map((entry, index) => {
                    const meta = ACTIVITY_META[entry.type] || ACTIVITY_META.note;
                    const Icon = meta.icon;
                    return (
                      <li key={`${entry.time}-${index}`} className="flex gap-3">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.chip}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-0">
                          <p className="text-sm text-slate-700">{entry.text}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            <span className="font-medium text-slate-500">{entry.actor}</span> · {entry.time}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add note modal */}
      {noteOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setNoteOpen(false)} />
          <div className="relative z-10 w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add note</h2>
                <p className="text-sm text-slate-500">Notes are logged to the activity timeline with your name and timestamp.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setNoteOpen(false)} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                rows={4}
                autoFocus
                placeholder="e.g. Budget approved by board, decision expected next week."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setNoteOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                  <StickyNote className="h-4 w-4" /> Save note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
