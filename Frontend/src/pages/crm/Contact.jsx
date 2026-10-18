import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  AtSign,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Copy,
  Download,
  Eye,
  Filter,
  History,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Phone,
  PhoneCall,
  Plus,
  Receipt,
  Search,
  Send,
  SlidersHorizontal,
  Tag,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../services/api';

const STAGE_PALETTE = [
  'bg-sky-50 text-sky-700 ring-sky-600/20',
  'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'bg-violet-50 text-violet-700 ring-violet-600/20',
  'bg-amber-50 text-amber-700 ring-amber-600/20',
  'bg-orange-50 text-orange-700 ring-orange-600/20',
  'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'bg-rose-50 text-rose-700 ring-rose-600/20',
];

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-fuchsia-500',
];

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

const TABS = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'opportunity', label: 'Opportunity', icon: Briefcase },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'activity', label: 'Activity', icon: History },
];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsOf(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
}

function gradientFor(name = '') {
  return AVATAR_GRADIENTS[hashString(name) % AVATAR_GRADIENTS.length];
}

function formatMoney(value) {
  if (value == null) return '•••••';
  return `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function relativeTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
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

function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-9 w-9 text-xs', xl: 'h-16 w-16 text-lg' };
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${gradientFor(name)} ${sizes[size]}`}>
      {initialsOf(name)}
    </span>
  );
}

function StageBadge({ index, label }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STAGE_PALETTE[index % STAGE_PALETTE.length]}`}>
      {label}
    </span>
  );
}

function TagPill({ tag }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
      {tag}
    </span>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}

function EmptyState({ title, description, icon: Icon = Search }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default function Contact() {
  const { leads, stages, loading, error, createLead, deleteLead } = useCRM();
  const { members, settings } = useWorkspace();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('overview');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [payments, setPayments] = useState([]);
  const [waConversations, setWaConversations] = useState([]);
  const [detail, setDetail] = useState(null);
  const [messages, setMessages] = useState([]);

  const pageSize = 6;
  const customFieldDefs = settings?.customFields ?? [];
  const stageById = useMemo(() => new Map(stages.map((stage, index) => [stage.id, { ...stage, index }])), [stages]);
  const memberById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const pushToast = (message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3200);
  };

  const loadPayments = () => api.payments.list().then((res) => setPayments(res?.payments ?? [])).catch(() => {});
  const loadConversations = () =>
    api.whatsapp.listConversations().then((res) => setWaConversations(res?.conversations ?? [])).catch(() => {});

  useEffect(() => {
    loadPayments();
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    api.crm.getLead(selectedId).then((res) => setDetail(res?.lead ?? null)).catch(() => setDetail(null));
  }, [selectedId]);

  const waContactId = useMemo(() => {
    const phone = detail?.phone;
    if (!phone) return null;
    return waConversations.find((conversation) => conversation.phone === phone)?.contactId ?? null;
  }, [detail, waConversations]);

  useEffect(() => {
    if (!waContactId) { setMessages([]); return; }
    api.whatsapp
      .getConversation(waContactId)
      .then((res) => setMessages(res?.conversation ?? []))
      .catch(() => setMessages([]));
  }, [waContactId]);

  const stageLabel = (id) => stageById.get(id)?.name ?? id;
  const stageIndex = (id) => stageById.get(id)?.index ?? 0;
  const leadTags = (lead) => asArray(lead.fields?.tags);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const tags = asArray(lead.fields?.tags);
      const matchesQuery =
        !query ||
        [lead.name, lead.email, lead.phone, lead.fields?.company, ...tags].join(' ').toLowerCase().includes(query);
      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchesOwner = ownerFilter === 'all' || lead.assigneeId === ownerFilter;
      return matchesQuery && matchesStage && matchesOwner;
    });
  }, [leads, search, stageFilter, ownerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const metrics = useMemo(() => {
    const open = leads.filter((lead) => lead.stage !== 'lost' && lead.stage !== 'enrolled');
    const pipelineValue = open.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
    const pending = payments.filter((payment) => payment.status === 'unpaid');
    return {
      total: leads.length,
      openOpportunities: open.length,
      pipelineValue,
      pendingPayments: pending.length,
    };
  }, [leads, payments]);

  const leadPayments = (lead) => payments.filter((payment) => payment.opportunityId === lead.id);

  const openContact = (lead) => {
    setSelectedId(lead.id);
    setTab('overview');
    setOpenMenuId(null);
  };

  const handleAddContact = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    if (!name) { pushToast('Name is required', 'error'); return; }
    try {
      await createLead({
        name,
        email,
        phone: String(data.get('phone') || '').trim(),
        source: String(data.get('source') || 'manual'),
        programme: String(data.get('programme') || '').trim(),
        fields: { company: String(data.get('company') || '').trim() },
      });
      setAddOpen(false);
      pushToast(`${name} added to Contacts`);
    } catch (err) {
      pushToast(err.fields ? Object.values(err.fields).join(' ') : err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    try {
      await deleteLead(id);
      if (selectedId === id) setSelectedId(null);
      pushToast('Contact removed', 'error');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleSend = async (body) => {
    const trimmed = body.trim();
    if (!trimmed || !waContactId) return;
    try {
      await api.whatsapp.sendMessage(waContactId, trimmed);
      const res = await api.whatsapp.getConversation(waContactId);
      setMessages(res?.conversation ?? []);
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleCreatePayment = async (lead) => {
    try {
      await api.payments.createLink({ opportunityId: lead.id, amount: 500, description: `Deposit for ${lead.name}` });
      await loadPayments();
      pushToast('Payment link created for $500.00');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleBookAppointment = async (lead) => {
    const start = new Date(Date.now() + 86400000);
    const end = new Date(start.getTime() + 30 * 60000);
    try {
      await api.calendar.bookAppointment({ leadId: lead.id, start: start.toISOString(), end: end.toISOString() });
      pushToast('Appointment booked via Google Calendar');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const copyToClipboard = (value, label) => {
    if (navigator.clipboard && value) navigator.clipboard.writeText(value).catch(() => {});
    pushToast(`${label} copied to clipboard`);
  };

  const exportContacts = () => {
    const header = ['Name', 'Email', 'Phone', 'Company', 'Stage', 'Assigned To'];
    const rows = filtered.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.fields?.company ?? '',
      stageLabel(lead.stage),
      memberById.get(lead.assigneeId)?.name ?? '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'omniflow-contacts.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    pushToast(`Exported ${filtered.length} contact${filtered.length === 1 ? '' : 's'} to CSV`);
  };

  const stageOptions = [
    { value: 'all', label: 'All stages' },
    ...stages.map((stage) => ({ value: stage.id, label: stage.name })),
  ];
  const ownerOptions = [
    { value: 'all', label: 'All owners' },
    ...members.map((member) => ({ value: member.id, label: member.name })),
  ];

  const kpis = [
    { label: 'Total contacts', value: metrics.total.toLocaleString('en-US'), icon: Users, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Open opportunities', value: metrics.openOpportunities.toLocaleString('en-US'), icon: Briefcase, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Pipeline value', value: formatMoney(metrics.pipelineValue), icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending payments', value: metrics.pendingPayments.toLocaleString('en-US'), icon: Wallet, tone: 'bg-amber-50 text-amber-600' },
  ];

  const drawerOpen = Boolean(selectedId);
  const view = detail;

  return (
    <div className="text-slate-900">
      <header className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <span>Workspace</span>
              <ChevronRight className="h-3 w-3" />
              <span>CRM</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-600">Contacts</span>
            </nav>
            <div className="mt-0.5 flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">Contacts</h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{filtered.length}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Search name, email, company, or tag…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={exportContacts} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:flex-none">
                <Download className="h-4 w-4" /> Export
              </button>
              <button type="button" onClick={() => setAddOpen(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:flex-none">
                <Plus className="h-4 w-4" /> Add Contact
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.tone}`}>
                  <kpi.icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
              <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2">
            <Select label="Pipeline stage" value={stageFilter} onChange={(value) => { setStageFilter(value); setPage(1); }} options={stageOptions} />
            <Select label="Assigned owner" value={ownerFilter} onChange={(value) => { setOwnerFilter(value); setPage(1); }} options={ownerOptions} />
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              All contacts <span className="font-normal text-slate-400">· {filtered.length} results</span>
            </h2>
          </div>

          {loading && leads.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-slate-500">Loading contacts…</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No contacts match your filters" description="Add a contact or adjust the filters to see results." />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[880px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Contact</th>
                      <th className="px-4 py-3 font-semibold">Company</th>
                      <th className="px-4 py-3 font-semibold">Assigned</th>
                      <th className="px-4 py-3 font-semibold">Stage</th>
                      <th className="px-4 py-3 font-semibold">Tags</th>
                      <th className="px-4 py-3 font-semibold">Last activity</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.map((lead) => {
                      const owner = memberById.get(lead.assigneeId);
                      const tags = leadTags(lead);
                      return (
                        <tr key={lead.id} onClick={() => openContact(lead)} className="cursor-pointer transition hover:bg-slate-50/80">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={lead.name} />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-800">{lead.name}</p>
                                <p className="truncate text-xs text-slate-400">{lead.email || lead.phone || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate">{lead.fields?.company || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar name={owner?.name || 'Unassigned'} size="sm" />
                              <span className="text-sm text-slate-700">{owner?.name || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><StageBadge index={stageIndex(lead.stage)} label={stageLabel(lead.stage)} /></td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-1">
                              {tags.slice(0, 2).map((tag) => <TagPill key={tag} tag={tag} />)}
                              {tags.length > 2 ? <span className="text-[11px] font-medium text-slate-400">+{tags.length - 2}</span> : null}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Clock className="h-3.5 w-3.5 text-slate-400" /> {relativeTime(lead.updatedAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="relative inline-block">
                              <button
                                type="button"
                                aria-label="Row actions"
                                onClick={(event) => { event.stopPropagation(); setOpenMenuId(openMenuId === lead.id ? null : lead.id); }}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openMenuId === lead.id ? (
                                <>
                                  <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={(event) => { event.stopPropagation(); setOpenMenuId(null); }} />
                                  <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg">
                                    <button type="button" onClick={(event) => { event.stopPropagation(); openContact(lead); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
                                      <Eye className="h-4 w-4 text-slate-400" /> View details
                                    </button>
                                    <button type="button" onClick={(event) => { event.stopPropagation(); setOpenMenuId(null); copyToClipboard(lead.email, 'Email'); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
                                      <Copy className="h-4 w-4 text-slate-400" /> Copy email
                                    </button>
                                    <div className="my-1 border-t border-slate-100" />
                                    <button type="button" onClick={(event) => { event.stopPropagation(); handleDelete(lead.id); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50">
                                      <Trash2 className="h-4 w-4" /> Delete
                                    </button>
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {paged.map((lead) => {
                  const owner = memberById.get(lead.assigneeId);
                  return (
                    <button key={lead.id} type="button" onClick={() => openContact(lead)} className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-slate-50">
                      <div className="flex items-start gap-3">
                        <Avatar name={lead.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{lead.name}</p>
                          <p className="truncate text-xs text-slate-400">{lead.email || lead.phone || '—'}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" /> {lead.fields?.company || '—'}
                          </div>
                        </div>
                        <StageBadge index={stageIndex(lead.stage)} label={stageLabel(lead.stage)} />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">{owner?.name || 'Unassigned'}</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400"><Clock className="h-3.5 w-3.5" /> {relativeTime(lead.updatedAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-medium text-slate-700">{(currentPage - 1) * pageSize + 1}</span>–
                  <span className="font-medium text-slate-700">{Math.min(currentPage * pageSize, filtered.length)}</span> of{' '}
                  <span className="font-medium text-slate-700">{filtered.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </button>
                  <span className="px-2 text-xs text-slate-500">{currentPage} / {totalPages}</span>
                  <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Detail drawer */}
      <div className={`fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!drawerOpen}>
        <div onClick={() => setSelectedId(null)} className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {view ? (
            <>
              <div className="border-b border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar name={view.name} size="xl" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-semibold text-slate-900">{view.name}</h2>
                        <StageBadge index={stageIndex(view.stage)} label={stageLabel(view.stage)} />
                      </div>
                      <p className="truncate text-sm text-slate-500">{view.programme || '—'} · {view.fields?.company || '—'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <button type="button" onClick={() => copyToClipboard(view.email, 'Email')} className="flex items-center gap-1.5 transition hover:text-indigo-600">
                          <AtSign className="h-3.5 w-3.5 text-slate-400" /> {view.email || '—'}
                        </button>
                        <button type="button" onClick={() => copyToClipboard(view.phone, 'Phone')} className="flex items-center gap-1.5 transition hover:text-indigo-600">
                          <PhoneCall className="h-3.5 w-3.5 text-slate-400" /> {view.phone || '—'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="button" aria-label="Close panel" onClick={() => setSelectedId(null)} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    <Users className="h-3.5 w-3.5 text-slate-400" /> {memberById.get(view.assigneeId)?.name || 'Unassigned'}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{SOURCE_LABELS[view.source] ?? view.source}</span>
                  {asArray(view.fields?.tags).map((tag) => <TagPill key={tag} tag={tag} />)}
                </div>

                <div className="flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6">
                  <button type="button" onClick={() => setTab('conversations')} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                    <MessageSquare className="h-4 w-4" /> Send Message
                  </button>
                  <button type="button" onClick={() => handleCreatePayment(view)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <CircleDollarSign className="h-4 w-4 text-slate-500" /> Create Payment Link
                  </button>
                  <button type="button" onClick={() => handleBookAppointment(view)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <Calendar className="h-4 w-4 text-slate-500" /> Book Appointment
                  </button>
                </div>

                <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 sm:px-4">
                  {TABS.map((item) => (
                    <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition ${tab === item.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                      <item.icon className="h-3.5 w-3.5" /> {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                {tab === 'overview' ? (
                  <div className="space-y-5">
                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><User className="h-4 w-4 text-slate-400" /> Contact details</h3>
                      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                        {[
                          { label: 'Email', value: view.email || '—', icon: Mail },
                          { label: 'Phone', value: view.phone || '—', icon: Phone },
                          { label: 'Company', value: view.fields?.company || '—', icon: Building2 },
                          { label: 'Programme', value: view.programme || '—', icon: Briefcase },
                          { label: 'Location', value: view.fields?.location || '—', icon: MapPin },
                          { label: 'Created', value: formatDate(view.createdAt), icon: Calendar },
                        ].map((row) => (
                          <div key={row.label} className="flex items-start gap-2">
                            <row.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                              <dt className="text-[11px] uppercase tracking-wide text-slate-400">{row.label}</dt>
                              <dd className="truncate text-sm text-slate-700">{row.value}</dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <SlidersHorizontal className="h-4 w-4 text-slate-400" /> Custom fields
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {customFieldDefs.map((field) => {
                          const key = field.key || field.name;
                          return (
                            <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">{field.label || field.name}</p>
                              <p className="mt-1 text-sm font-medium text-slate-800">{view.fields?.[key] ?? '—'}</p>
                            </div>
                          );
                        })}
                        {Object.entries(view.fields ?? {})
                          .filter(([key]) => key !== 'tags' && !customFieldDefs.some((field) => (field.key || field.name) === key))
                          .map(([key, value]) => (
                            <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">{key}</p>
                              <p className="mt-1 text-sm font-medium text-slate-800">{String(value)}</p>
                            </div>
                          ))}
                      </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><Tag className="h-4 w-4 text-slate-400" /> Tags</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {asArray(view.fields?.tags).length > 0 ? asArray(view.fields?.tags).map((tag) => <TagPill key={tag} tag={tag} />) : <span className="text-sm text-slate-400">No tags applied.</span>}
                      </div>
                    </section>
                  </div>
                ) : null}

                {tab === 'opportunity' ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{view.name} — {view.programme || 'Opportunity'}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Owner: {memberById.get(view.assigneeId)?.name || 'Unassigned'}</p>
                      </div>
                      <StageBadge index={stageIndex(view.stage)} label={stageLabel(view.stage)} />
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <CircleDollarSign className="h-4 w-4 text-slate-400" />
                      {view.valueMasked ? <span className="tracking-widest text-slate-400">$ ••••••••</span> : formatMoney(view.value)}
                    </div>
                  </div>
                ) : null}

                {tab === 'conversations' ? (
                  <div className="flex h-full flex-col">
                    <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><MessageCircle className="h-4 w-4" /></span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">WhatsApp</p>
                          <p className="text-[11px] text-slate-400">{waContactId ? `Contact ${view.phone}` : 'No WhatsApp thread for this number yet'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {messages.length === 0 ? (
                        <EmptyState icon={MessageSquare} title="No messages yet" description="Inbound WhatsApp messages will appear here once the contact reaches out." />
                      ) : (
                        messages.map((message, index) => {
                          const outbound = message.direction === 'outbound';
                          return (
                            <div key={message.id || index} className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${outbound ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'}`}>
                                <p className="leading-relaxed">{message.body}</p>
                                <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${outbound ? 'text-indigo-100' : 'text-slate-400'}`}>
                                  {relativeTime(message.createdAt)}
                                  {outbound ? (message.status === 'delivered' ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <DrawerComposer disabled={!waContactId} onSend={handleSend} />
                  </div>
                ) : null}

                {tab === 'payments' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{leadPayments(view).length} payment(s)</span>
                      <button type="button" onClick={() => handleCreatePayment(view)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                        <Plus className="h-3.5 w-3.5" /> New payment link
                      </button>
                    </div>
                    {leadPayments(view).length === 0 ? (
                      <EmptyState icon={Receipt} title="No payments yet" description="Create a Stripe checkout link to collect a deposit." />
                    ) : (
                      leadPayments(view).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{formatMoney(payment.amount)} <span className="text-xs font-normal text-slate-400">{payment.currency}</span></p>
                            <p className="text-[11px] text-slate-400">{formatDate(payment.createdAt)} · {payment.providerRef}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'refunded' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'}`}>
                            {payment.status === 'unpaid' ? 'Pending' : payment.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}

                {tab === 'activity' ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800"><History className="h-4 w-4 text-slate-400" /> Activity</h3>
                    {(view.activities ?? []).length === 0 ? (
                      <p className="text-sm text-slate-400">No activity recorded yet.</p>
                    ) : (
                      <ol className="space-y-4">
                        {view.activities.map((entry) => (
                          <li key={entry.id} className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><History className="h-3.5 w-3.5" /></span>
                            <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-0">
                              <p className="text-sm text-slate-700">{entry.summary}</p>
                              <p className="mt-0.5 text-[11px] text-slate-400">{entry.kind} · {entry.by} · {relativeTime(entry.at)}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Add contact dialog */}
      {addOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add contact</h2>
                <p className="text-sm text-slate-500">Create a new CRM record in this workspace.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setAddOpen(false)} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Full name *</span>
                  <input name="name" required placeholder="e.g. Jordan Blake" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Email</span>
                  <input name="email" type="email" placeholder="name@company.com" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Phone</span>
                  <input name="phone" placeholder="+1 (555) 000-0000" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Company</span>
                  <input name="company" placeholder="e.g. Brightwave Solar" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Source</span>
                  <span className="relative block">
                    <select name="source" defaultValue="manual" className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                      {Object.entries(SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Programme / Inquiry</span>
                  <input name="programme" placeholder="e.g. 50kW Commercial Solar" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setAddOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"><Plus className="h-4 w-4" /> Create contact</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {toasts.length > 0 ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(92vw,22rem)] flex-col gap-2">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast.tone === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {toast.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </span>
              <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
              <button type="button" aria-label="Dismiss" onClick={() => setToasts((prev) => prev.filter((entry) => entry.id !== toast.id))} className="text-slate-300 transition hover:text-slate-500"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DrawerComposer({ disabled, onSend }) {
  const [draft, setDraft] = useState('');
  return (
    <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <input
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend(draft);
            setDraft('');
          }
        }}
        placeholder={disabled ? 'No WhatsApp contact for this number' : 'Type a WhatsApp message…'}
        className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
      />
      <button type="button" disabled={disabled} onClick={() => { onSend(draft); setDraft(''); }} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40">
        <Send className="h-3.5 w-3.5" /> Send
      </button>
    </div>
  );
}
