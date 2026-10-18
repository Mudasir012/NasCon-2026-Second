import React, { useEffect, useMemo, useState } from 'react';
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
  Briefcase,
  CreditCard,
  Calendar,
  History,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ChevronRight,
  Users,
  Copy,
  AlertCircle,
  DollarSign,
  Layers,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../services/api';

const TABS = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'opportunity', label: 'Opportunity', icon: Briefcase },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'activity', label: 'Activity Timeline', icon: History },
];

const PAYMENT_STATUS = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  unpaid: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  expired: 'bg-slate-100 text-slate-500 ring-slate-500/20',
  failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  refunded: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const SOURCE_LABELS = {
  website: 'Web Form',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  'walk-in': 'Walk-in',
  phone: 'Phone',
  referral: 'Referral',
  event: 'Event',
  manual: 'Manual',
};

function formatMoney(value) {
  if (value == null) return '•••••';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function relativeTime(iso) {
  if (!iso) return '—';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.split(',').map((tag) => tag.trim());
  return [];
}

function initialsOf(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
}

export default function ContactDetailPage({ onNavigate, contactId }) {
  const { leads, stages } = useCRM();
  const { members, settings } = useWorkspace();

  const [selectedId, setSelectedId] = useState(contactId || null);
  const [detail, setDetail] = useState(null);
  const [payments, setPayments] = useState([]);
  const [waConversations, setWaConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [toast, setToast] = useState(null);

  const pushToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3000);
  };

  const lead = detail ?? leads.find((row) => row.id === selectedId) ?? leads[0] ?? null;

  useEffect(() => {
    if (!selectedId && leads[0]) setSelectedId(leads[0].id);
  }, [leads, selectedId]);

  const loadPayments = () => api.payments.list().then((res) => setPayments(res?.payments ?? [])).catch(() => {});
  const loadConversations = () =>
    api.whatsapp.listConversations().then((res) => setWaConversations(res?.conversations ?? [])).catch(() => {});

  useEffect(() => {
    loadPayments();
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    api.crm.getLead(selectedId).then((res) => setDetail(res?.lead ?? null)).catch(() => setDetail(null));
  }, [selectedId]);

  const waContact = useMemo(() => {
    if (!lead?.phone) return null;
    return waConversations.find((conversation) => conversation.phone === lead.phone) ?? null;
  }, [lead, waConversations]);

  useEffect(() => {
    if (!waContact) { setMessages([]); return; }
    api.whatsapp.getConversation(waContact.contactId).then((res) => setMessages(res?.conversation ?? [])).catch(() => setMessages([]));
  }, [waContact]);

  const owner = members.find((member) => member.id === lead?.assigneeId);
  const stageLabel = stages.find((stage) => stage.id === lead?.stage)?.name ?? lead?.stage ?? '';
  const leadPayments = payments.filter((payment) => payment.opportunityId === lead?.id);
  const customFieldDefs = settings?.customFields ?? [];

  const handleSendMessage = () => {
    setActiveTab('conversations');
    if (!waContact) pushToast('No WhatsApp thread for this number yet', 'error');
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    const trimmed = noteDraft.trim();
    if (!trimmed || !lead) return;
    try {
      await api.crm.addActivity(lead.id, { kind: 'note', summary: trimmed });
      const res = await api.crm.getLead(lead.id);
      setDetail(res?.lead ?? detail);
      setNoteDraft('');
      setNoteOpen(false);
      pushToast('Note added to activity timeline');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleBookAppointment = async () => {
    if (!lead) return;
    const start = new Date(Date.now() + 86400000);
    const end = new Date(start.getTime() + 30 * 60000);
    try {
      await api.calendar.bookAppointment({ leadId: lead.id, start: start.toISOString(), end: end.toISOString() });
      pushToast('Appointment booked — invitation sent via Google Calendar');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleCreatePayment = async () => {
    if (!lead) return;
    try {
      await api.payments.createLink({ opportunityId: lead.id, amount: 500, description: `Deposit for ${lead.name}` });
      await loadPayments();
      setActiveTab('payments');
      pushToast('Stripe payment link created for $500.00');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleOptOut = async () => {
    if (!waContact) { pushToast('No WhatsApp contact to update', 'error'); return; }
    try {
      await api.whatsapp.setOptOut(waContact.contactId, !waContact.optedOut);
      await loadConversations();
      pushToast(`${lead.name} ${waContact.optedOut ? 'opted back in to' : 'opted out of'} WhatsApp messaging`);
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const quickActions = [
    { label: 'Send Message', icon: MessageSquare, onClick: handleSendMessage, primary: true },
    { label: 'Add Note', icon: StickyNote, onClick: () => setNoteOpen(true) },
    { label: 'Book Appointment', icon: CalendarPlus, onClick: handleBookAppointment },
    { label: 'Create Payment Request', icon: Receipt, onClick: handleCreatePayment },
  ];

  if (!lead) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500 sm:px-6">
        No contacts in this workspace yet.
      </div>
    );
  }

  const optedOut = Boolean(waContact?.optedOut);

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span>Workspace</span>
          <ChevronRight className="h-3 w-3" />
          <span>CRM</span>
          <ChevronRight className="h-3 w-3" />
          <button type="button" onClick={() => onNavigate?.('contacts')} className="transition hover:text-indigo-600">Contacts</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-600">{lead.name}</span>
        </nav>

        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white">
                {initialsOf(lead.name)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">{lead.name}</h1>
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">{stageLabel}</span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{lead.programme || '—'} · {lead.fields?.company || '—'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {lead.email || '—'}</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {lead.phone || '—'}</span>
                  <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" /> {lead.fields?.company || '—'}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    <span className={`inline-block h-2 w-2 rounded-full ${owner?.available === false ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    {owner?.name || 'Unassigned'}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{SOURCE_LABELS[lead.source] ?? lead.source}</span>
                  {asArray(lead.fields?.tags).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                      <Tag className="h-3 w-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <button
                type="button"
                onClick={handleOptOut}
                disabled={!waContact}
                aria-pressed={optedOut}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${optedOut ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                {optedOut ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                {optedOut ? 'Opted-out of messaging' : 'Opted-in to messaging'}
              </button>
              <p className="text-[11px] text-slate-400">
                {waContact ? (optedOut ? 'Outbound sends are blocked for this contact.' : 'Contact has consented to receive messages.') : 'No WhatsApp contact record yet.'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition ${action.primary ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                <action.icon className="h-4 w-4" /> {action.label}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-2 sm:px-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                {tab.id === 'conversations' && <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">{messages.length}</span>}
                {tab.id === 'payments' && <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">{leadPayments.length}</span>}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><ClipboardList className="h-4 w-4 text-slate-400" /> Attributes</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    {[
                      { label: 'Company', value: lead.fields?.company || '—', icon: Building2 },
                      { label: 'Programme', value: lead.programme || '—', icon: Briefcase },
                      { label: 'Location', value: lead.fields?.location || '—', icon: Building2 },
                      { label: 'Source', value: SOURCE_LABELS[lead.source] ?? lead.source, icon: Layers },
                      { label: 'Created', value: formatDate(lead.createdAt), icon: Calendar },
                      { label: 'Assigned to', value: owner?.name || 'Unassigned', icon: Users },
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
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><Layers className="h-4 w-4 text-slate-400" /> Custom fields</h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {customFieldDefs.map((field) => {
                      const key = field.key || field.name;
                      return (
                        <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">{field.label || field.name}</p>
                          <p className="mt-1 text-sm font-medium text-slate-800">{lead.fields?.[key] ?? '—'}</p>
                        </div>
                      );
                    })}
                    {Object.entries(lead.fields ?? {}).filter(([key]) => key !== 'tags' && !customFieldDefs.some((field) => (field.key || field.name) === key)).map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">{key}</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{String(value)}</p>
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
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><MessageSquare className="h-4 w-4" /></span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">WhatsApp</p>
                      <p className="text-[11px] text-slate-400">{waContact ? `Thread · ${messages.length} messages` : 'No WhatsApp thread for this number yet'}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => onNavigate?.('messaging')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                    Open in Messaging <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                {messages.length === 0 ? (
                  <p className="px-1 py-6 text-center text-sm text-slate-400">No messages yet.</p>
                ) : (
                  messages.map((message) => {
                    const outbound = message.direction === 'outbound';
                    return (
                      <div key={message.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${outbound ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>WA</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700">{outbound ? 'You' : lead.name}</span>
                            <span className="text-[10px] text-slate-400">{relativeTime(message.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-slate-600">{message.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'opportunity' && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{lead.name} — {lead.programme || 'Opportunity'}</p>
                    <p className="mt-0.5 text-xs text-slate-400">Owner {owner?.name || 'Unassigned'}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">{stageLabel}</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  {lead.valueMasked ? <span className="tracking-widest text-slate-400">$ ••••••••</span> : formatMoney(lead.value)}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                  <p className="text-xs font-medium text-slate-600">Stripe</p>
                  <button type="button" onClick={handleCreatePayment} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                    <CreditCard className="h-3.5 w-3.5" /> New payment link
                  </button>
                </div>
                {leadPayments.length === 0 ? (
                  <p className="px-1 py-6 text-center text-sm text-slate-400">No payments yet.</p>
                ) : (
                  leadPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : payment.status === 'unpaid' ? 'bg-amber-50 text-amber-600' : payment.status === 'refunded' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                          {payment.status === 'paid' ? <CheckCircle2 className="h-4 w-4" /> : payment.status === 'unpaid' ? <Clock className="h-4 w-4" /> : payment.status === 'refunded' ? <RotateCcw className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{formatMoney(payment.amount)} {payment.currency}</p>
                          <p className="truncate font-mono text-[11px] text-slate-400">{payment.providerRef} · {formatDate(payment.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${PAYMENT_STATUS[payment.status]}`}>{payment.status === 'unpaid' ? 'Pending' : payment.status}</span>
                        <button type="button" onClick={() => { navigator.clipboard?.writeText(payment.checkoutUrl || payment.providerRef); pushToast('Payment link copied'); }} aria-label="Copy payment link" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800"><History className="h-4 w-4 text-slate-400" /> Who did what, and when</h2>
                {(lead.activities ?? []).length === 0 ? (
                  <p className="text-sm text-slate-400">No activity recorded yet.</p>
                ) : (
                  <ol className="space-y-4">
                    {lead.activities.map((entry) => (
                      <li key={entry.id} className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><History className="h-3.5 w-3.5" /></span>
                        <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-0">
                          <p className="text-sm text-slate-700">{entry.summary}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400"><span className="font-medium text-slate-500">{entry.by}</span> · {entry.kind} · {relativeTime(entry.at)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {noteOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setNoteOpen(false)} />
          <div className="relative z-10 w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add note</h2>
                <p className="text-sm text-slate-500">Notes are logged to the activity timeline.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setNoteOpen(false)} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50"><X className="h-4 w-4" /></button>
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
                <button type="button" onClick={() => setNoteOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"><StickyNote className="h-4 w-4" /> Save note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[90] w-[min(92vw,22rem)]">
          <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast.tone === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {toast.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </span>
            <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
