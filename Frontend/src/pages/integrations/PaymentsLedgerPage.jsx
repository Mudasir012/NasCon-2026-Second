import React, { useMemo, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Wallet,
  Search,
  Filter,
  Plus,
  Copy,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Link2,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  User,
  ExternalLink,
  Layers,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

const symbolOf = (code) => CURRENCIES.find((c) => c.code === code)?.symbol || '';

const PAYMENT_STATUS = {
  Paid: { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: CheckCircle2 },
  Pending: { chip: 'bg-amber-50 text-amber-700 ring-amber-600/20', icon: Clock },
  Expired: { chip: 'bg-slate-100 text-slate-500 ring-slate-500/20', icon: XCircle },
  Failed: { chip: 'bg-rose-50 text-rose-700 ring-rose-600/20', icon: XCircle },
  Refunded: { chip: 'bg-violet-50 text-violet-700 ring-violet-600/20', icon: RotateCcw },
};

const OPPORTUNITIES = [
  { id: 'OPP-401', title: 'Commercial Solar Roof — 40 kW', contact: 'Sarah Jenkins', value: 48500 },
  { id: 'OPP-402', title: 'Battery Storage Add-on', contact: 'Sarah Jenkins', value: 12000 },
  { id: 'OPP-403', title: 'Industrial Rooftop Array — 320 kW', contact: "Liam O'Sullivan", value: 186000 },
  { id: 'OPP-404', title: 'Residential Lead Capture Pilot', contact: 'Ethan Brooks', value: 9600 },
];

const OPEN_OPPORTUNITY_VALUE = OPPORTUNITIES.reduce((sum, opportunity) => sum + opportunity.value, 0);

const INITIAL_TRANSACTIONS = [
  { id: 'pi_3Nx…aB2', eventId: 'evt_101', amount: 500, currency: 'USD', status: 'Paid', opportunity: 'OPP-401', contact: 'Sarah Jenkins', requestedBy: 'Marcus Vance', createdAt: 'Oct 16, 2026' },
  { id: 'pi_3Ny…kQ9', eventId: 'evt_102', amount: 9700, currency: 'USD', status: 'Pending', opportunity: 'OPP-401', contact: 'Sarah Jenkins', requestedBy: 'Marcus Vance', createdAt: 'Oct 18, 2026' },
  { id: 'pi_3Nw…dP4', eventId: 'evt_103', amount: 250, currency: 'USD', status: 'Expired', opportunity: 'OPP-402', contact: 'Sarah Jenkins', requestedBy: 'David Okafor', createdAt: 'Oct 02, 2026' },
  { id: 'pi_3Nt…fR8', eventId: 'evt_104', amount: 1200, currency: 'EUR', status: 'Failed', opportunity: 'OPP-403', contact: "Liam O'Sullivan", requestedBy: 'David Okafor', createdAt: 'Sep 28, 2026' },
  { id: 'pi_3Ns…hT1', eventId: 'evt_105', amount: 300, currency: 'USD', status: 'Refunded', opportunity: 'OPP-402', contact: 'Sarah Jenkins', requestedBy: 'Priya Nair', createdAt: 'Sep 21, 2026' },
  { id: 'pi_3Nq…xY7', eventId: 'evt_106', amount: 960, currency: 'GBP', status: 'Pending', opportunity: 'OPP-404', contact: 'Ethan Brooks', requestedBy: 'Jonas Weber', createdAt: 'Oct 17, 2026' },
  { id: 'pi_3Np…mZ3', eventId: 'evt_107', amount: 7700, currency: 'USD', status: 'Paid', opportunity: 'OPP-403', contact: "Liam O'Sullivan", requestedBy: 'Elena Rostova', createdAt: 'Oct 09, 2026' },
  { id: 'pi_3No…qW5', eventId: 'evt_108', amount: 4250, currency: 'USD', status: 'Paid', opportunity: 'OPP-404', contact: 'Ethan Brooks', requestedBy: 'Jonas Weber', createdAt: 'Oct 04, 2026' },
  { id: 'pi_3Nn…rE9', eventId: 'evt_109', amount: 640, currency: 'EUR', status: 'Refunded', opportunity: 'OPP-403', contact: "Liam O'Sullivan", requestedBy: 'Elena Rostova', createdAt: 'Sep 30, 2026' },
];

const PAGE_SIZE = 6;

function formatMoney(value, currency = 'USD') {
  return `${symbolOf(currency)}${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PaymentsLedgerPage() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [processedEvents, setProcessedEvents] = useState(() => new Set(INITIAL_TRANSACTIONS.map((t) => t.eventId)));
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ opportunity: OPPORTUNITIES[0].id, amount: '', currency: 'USD' });
  const [lastWebhook, setLastWebhook] = useState(null);
  const [toast, setToast] = useState(null);

  const pushToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3200);
  };

  const metrics = useMemo(() => {
    const sum = (predicate) => transactions.filter(predicate).reduce((acc, t) => acc + t.amount, 0);
    const paidTotal = sum((t) => t.status === 'Paid');
    const refundedTotal = sum((t) => t.status === 'Refunded');
    const unpaidTotal = sum((t) => t.status === 'Pending');
    return {
      collected: paidTotal - refundedTotal,
      projected: OPEN_OPPORTUNITY_VALUE + unpaidTotal,
      paidTotal,
      refundedTotal,
      unpaidTotal,
    };
  }, [transactions]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesQuery =
        !query ||
        [t.id, t.opportunity, t.contact, t.requestedBy, t.status, t.currency].join(' ').toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesCurrency = currencyFilter === 'all' || t.currency === currencyFilter;
      return matchesQuery && matchesStatus && matchesCurrency;
    });
  }, [transactions, search, statusFilter, currencyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const checkoutUrl = (id) => `https://checkout.stripe.com/c/pay/${id}`;

  function handleCreate(event) {
    event.preventDefault();
    const amount = Number(draft.amount);
    if (!amount || amount <= 0) return pushToast('Enter a valid amount', 'error');
    const opportunity = OPPORTUNITIES.find((o) => o.id === draft.opportunity);
    const rand = Math.random().toString(36).slice(2, 6);
    const id = `pi_${rand}…${Math.random().toString(36).slice(2, 5)}`;
    const newTx = {
      id,
      eventId: `evt_${Date.now()}`,
      amount,
      currency: draft.currency,
      status: 'Pending',
      opportunity: opportunity.id,
      contact: opportunity.contact,
      requestedBy: 'Alex Mercer',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setProcessedEvents((prev) => new Set(prev).add(newTx.eventId));
    setCreateOpen(false);
    setDraft({ opportunity: OPPORTUNITIES[0].id, amount: '', currency: 'USD' });
    setPage(1);
    pushToast(`Payment request created · ${checkoutUrl(id)}`);
  }

  function simulateWebhook({ duplicate = false } = {}) {
    const target = transactions.find((t) => t.status === 'Pending');
    if (!target) {
      pushToast('No pending payment to settle', 'error');
      return;
    }
    const eventId = target.eventId;

    if (processedEvents.has(eventId)) {
      setLastWebhook({ eventId, result: 'duplicate', tx: target.id });
      pushToast(`Duplicate event ${eventId} ignored — idempotent, counted once`, 'error');
      return;
    }

    setProcessedEvents((prev) => new Set(prev).add(eventId));
    setTransactions((prev) => prev.map((t) => (t.id === target.id ? { ...t, status: 'Paid' } : t)));
    setLastWebhook({ eventId, result: duplicate ? 'duplicate' : 'settled', tx: target.id });
    pushToast(`${target.id} marked Paid via Stripe webhook ${eventId}`);
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Payments & Ledger</h1>
            <p className="text-sm text-slate-500">Stripe test-mode reconciliation and payment requests (I2.1–I2.8).</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5" /> No card data is stored
            </span>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Create payment request
            </button>
          </div>
        </header>

        {/* Reconciliation cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Wallet className="h-4 w-4" />
                </span>
                Collected revenue
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Paid − Refunds</span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{formatMoney(metrics.collected)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Paid {formatMoney(metrics.paidTotal)}</span>
              <span className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-violet-500" /> Refunded {formatMoney(metrics.refundedTotal)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <TrendingUp className="h-4 w-4" />
                </span>
                Projected revenue
              </span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">Open opps + unpaid</span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{formatMoney(metrics.projected)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-indigo-500" /> Open opportunities {formatMoney(OPEN_OPPORTUNITY_VALUE)}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /> Unpaid requests {formatMoney(metrics.unpaidTotal)}</span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <AlertCircle className="h-3 w-3" /> Projected is not collected cash — it is expected pipeline value plus outstanding requests.
            </p>
          </div>
        </div>

        {/* Webhook simulator */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Stripe webhook simulator (developer)</p>
              <p className="text-xs text-slate-500">
                {lastWebhook
                  ? `Last event ${lastWebhook.eventId} → ${lastWebhook.result === 'duplicate' ? 'duplicate ignored (idempotent)' : `settled ${lastWebhook.tx}`}`
                  : 'Fires a checkout.session.completed event. Duplicate events are deduped by event id.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => simulateWebhook()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              <Zap className="h-3.5 w-3.5" /> Simulate Stripe webhook
            </button>
            <button
              type="button"
              onClick={() => simulateWebhook({ duplicate: true })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Simulate duplicate event
            </button>
          </div>
        </div>

        {/* Filters */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search stripe ref, opportunity, contact…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400"
                >
                  <option value="all">All statuses</option>
                  {Object.keys(PAYMENT_STATUS).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="relative">
                <select
                  value={currencyFilter}
                  onChange={(event) => {
                    setCurrencyFilter(event.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400"
                >
                  <option value="all">All currencies</option>
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>{currency.code}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Transactions table */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Transactions <span className="font-normal text-slate-400">· {filtered.length} results</span>
            </h2>
            <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
              <CreditCard className="h-3.5 w-3.5" /> Stripe test mode · no card data stored
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CreditCard className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-slate-700">No transactions match</p>
              <p className="text-sm text-slate-500">Adjust the filters or search term to see more results.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Opportunity</th>
                      <th className="px-4 py-3 font-semibold">Contact</th>
                      <th className="px-4 py-3 font-semibold">Requested by</th>
                      <th className="px-4 py-3 font-semibold">Stripe reference</th>
                      <th className="px-4 py-3 text-right font-semibold">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.map((t) => {
                      const meta = PAYMENT_STATUS[t.status];
                      const StatusIcon = meta.icon;
                      return (
                        <tr key={t.id} className="transition hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                              {formatMoney(t.amount, t.currency)}
                              <span className="text-[11px] font-normal text-slate-400">{t.currency}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.chip}`}>
                              <StatusIcon className="h-3 w-3" /> {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Layers className="h-3.5 w-3.5 text-slate-400" /> {t.opportunity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-sm text-slate-600">
                              <User className="h-3.5 w-3.5 text-slate-400" /> {t.contact}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" /> {t.requestedBy}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[11px] text-slate-400">{t.id}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator.clipboard) navigator.clipboard.writeText(checkoutUrl(t.id)).catch(() => {});
                                pushToast('Checkout link copied to clipboard');
                              }}
                              aria-label="Copy checkout link"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-medium text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}</span>–
                  <span className="font-medium text-slate-700">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of{' '}
                  <span className="font-medium text-slate-700">{filtered.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPage(index + 1)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                        currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Create payment request modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCreateOpen(false)} />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Create payment request</h2>
                <p className="text-sm text-slate-500">Generates a Stripe test-mode checkout link. No card data is stored.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Opportunity</span>
                <div className="relative">
                  <select
                    value={draft.opportunity}
                    onChange={(event) => setDraft((prev) => ({ ...prev, opportunity: event.target.value }))}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    {OPPORTUNITIES.map((opportunity) => (
                      <option key={opportunity.id} value={opportunity.id}>
                        {opportunity.id} · {opportunity.title} ({formatMoney(opportunity.value)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Amount</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={draft.amount}
                    onChange={(event) => setDraft((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="500.00"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Currency</span>
                  <div className="relative">
                    <select
                      value={draft.currency}
                      onChange={(event) => setDraft((prev) => ({ ...prev, currency: event.target.value }))}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.code}>{currency.code} ({currency.symbol})</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </label>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-1.5 text-xs font-medium text-slate-500">Generated mock checkout URL</p>
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[11px] text-slate-500">
                    {checkoutUrl(draft.amount ? `test_${draft.currency.toLowerCase()}_${draft.amount}` : 'test_new_request')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) navigator.clipboard.writeText(checkoutUrl('test_new_request')).catch(() => {});
                      pushToast('Checkout link copied');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Copy link
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => pushToast('Sending checkout link via Twilio WhatsApp…')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Send className="h-4 w-4" /> Send via WhatsApp
                </button>
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                  <Plus className="h-4 w-4" /> Generate request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[90] w-[min(92vw,22rem)]">
          <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast.tone === 'error' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {toast.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCheck className="h-4 w-4" />}
            </span>
            <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
            <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="text-slate-300 transition hover:text-slate-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
