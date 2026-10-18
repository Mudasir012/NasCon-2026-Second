import React, { useMemo, useState } from 'react';
import {
  Building2,
  Search,
  Eye,
  EyeOff,
  X,
  Mail,
  Phone,
  MapPin,
  Users,
  ChevronRight,
  Lock,
  CircleDollarSign,
  Target,
  Clock,
  Inbox,
  FileSpreadsheet,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const MASK_TEXT = '\u2022\u2022\u2022\u2022\u2022\u2022';

const AVATAR_COLORS = [
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
];

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function formatCurrency(amount) {
  return currencyFormatter.format(amount || 0);
}

function getInitials(name) {
  const words = String(name).replace(/[^a-zA-Z0-9 ]/g, ' ').split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  return (words[0][0] + (words.length > 1 ? words[1][0] : '')).toUpperCase();
}

function colorFor(seed) {
  let hash = 0;
  const text = String(seed);
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) % 9973;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
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

function stageLabel(lead, stages) {
  return stages.find((stage) => stage.id === lead.stage)?.name ?? lead.stage;
}

function Avatar({ name, seed, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-base' };
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-xl font-semibold ring-1 ring-inset ring-black/5 ${sizes[size]} ${colorFor(seed || name)}`}>
      {getInitials(name)}
    </span>
  );
}

function ValueText({ value, masked, className = '' }) {
  if (masked) {
    return <span className={`inline-flex items-center gap-1.5 text-slate-400 ${className}`} title="Value masked by field-level permissions">{MASK_TEXT}</span>;
  }
  return <span className={className}>{formatCurrency(value)}</span>;
}

function StatCard({ icon: Icon, label, value, masked, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {masked ? <span className="tracking-widest text-slate-400">{MASK_TEXT}</span> : value}
      </div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}

export default function CompaniesPage() {
  const { leads, stages, loading, error } = useCRM();
  const [query, setQuery] = useState('');
  const [maskValues, setMaskValues] = useState(false);
  const [drawerCompany, setDrawerCompany] = useState(null);

  // Companies are derived from leads by their `company` field (the backend models no company entity).
  const companies = useMemo(() => {
    const map = new Map();
    for (const lead of leads) {
      const name = (lead.fields?.company || '').trim() || 'Unassigned';
      if (!map.has(name)) {
        map.set(name, {
          id: name,
          name,
          industry: lead.fields?.industry || '—',
          location: lead.fields?.location || '—',
          contacts: [],
          deals: [],
          lastActivity: null,
          monthToDate: null,
          masked: false,
        });
      }
      const company = map.get(name);
      company.contacts.push(lead);
      company.deals.push(lead);
      if (lead.valueMasked) company.masked = true;
      if (!company.lastActivity || (lead.updatedAt && lead.updatedAt > company.lastActivity)) company.lastActivity = lead.updatedAt;
    }
    return Array.from(map.values());
  }, [leads]);

  const openDeals = (company) => company.deals.filter((deal) => deal.stage !== 'lost' && deal.stage !== 'enrolled');
  const companyValue = (company) => company.deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);

  const filteredCompanies = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return companies;
    return companies.filter((company) => company.name.toLowerCase().includes(needle) || company.industry.toLowerCase().includes(needle));
  }, [companies, query]);

  const totals = useMemo(
    () =>
      companies.reduce(
        (acc, company) => {
          acc.contacts += company.contacts.length;
          acc.open += openDeals(company).length;
          acc.value += companyValue(company);
          if (company.masked) acc.masked = true;
          return acc;
        },
        { contacts: 0, open: 0, value: 0, masked: false },
      ),
    [companies],
  );

  const handleExport = () => {
    const header = ['Company', 'Industry', 'Contacts', 'Open Deals', 'Total Value'];
    const rows = filteredCompanies.map((company) => [company.name, company.industry, company.contacts.length, openDeals(company).length, companyValue(company)]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'omniflow-companies.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full text-slate-900">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm"><Building2 className="h-5 w-5" /></span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Companies Management</h1>
              <p className="text-sm text-slate-500">Accounts derived from lead records, grouped by company name</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMaskValues((prev) => !prev)}
              aria-pressed={maskValues}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${maskValues ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              {maskValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline">{maskValues ? 'Values masked' : 'Mask values'}</span>
            </button>
            <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              <FileSpreadsheet className="h-4 w-4" /><span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Building2} label="Companies" value={companies.length} />
          <StatCard icon={Users} label="Contacts" value={totals.contacts} />
          <StatCard icon={Target} label="Open Deals" value={totals.open} />
          <StatCard icon={CircleDollarSign} label="Pipeline Value" value={formatCurrency(totals.value)} masked={maskValues || totals.masked} hint={totals.masked ? 'Some values hidden by permissions' : 'All leads'} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search companies by name or industry..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            {query ? (
              <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Clear search"><X className="h-3.5 w-3.5" /></button>
            ) : null}
          </div>
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredCompanies.length}</span> of {companies.length} companies
          </div>
        </div>

        <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 font-semibold">Contacts</th>
                <th className="px-5 py-3 font-semibold">Open Opportunities</th>
                <th className="px-5 py-3 font-semibold">Last Activity</th>
                <th className="px-5 py-3 text-right font-semibold">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && companies.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">Loading companies…</td></tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} onClick={() => setDrawerCompany(company)} className="group cursor-pointer transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={company.name} seed={company.id} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <span className="truncate">{company.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                          </div>
                          <div className="truncate text-xs text-slate-500">{company.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" />{company.contacts.length}</span></td>
                    <td className="px-5 py-4 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-slate-400" />{openDeals(company).length} open</span></td>
                    <td className="px-5 py-4 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />{relativeTime(company.lastActivity)}</span></td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {(maskValues || company.masked) ? <Lock className="h-3.5 w-3.5 text-slate-300" /> : null}
                        <ValueText value={companyValue(company)} masked={maskValues || company.masked} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Inbox className="h-5 w-5" /></span>
              <p className="font-medium text-slate-700">No companies found</p>
              <p className="text-sm text-slate-500">Companies appear automatically once leads include a company.</p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {filteredCompanies.map((company) => (
            <div key={company.id} onClick={() => setDrawerCompany(company)} className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors active:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={company.name} seed={company.id} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900">{company.name}</div>
                    <div className="truncate text-xs text-slate-500">{company.location}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
                <div><div className="text-[11px] uppercase tracking-wide text-slate-400">Contacts</div><div className="text-sm font-semibold text-slate-800">{company.contacts.length}</div></div>
                <div><div className="text-[11px] uppercase tracking-wide text-slate-400">Open</div><div className="text-sm font-semibold text-slate-800">{openDeals(company).length}</div></div>
                <div><div className="text-[11px] uppercase tracking-wide text-slate-400">Value</div><div className="text-sm font-semibold text-slate-800"><ValueText value={companyValue(company)} masked={maskValues || company.masked} /></div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {drawerCompany ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setDrawerCompany(null)} aria-hidden="true" />
          <aside role="dialog" aria-modal="true" aria-label={`${drawerCompany.name} details`} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={drawerCompany.name} seed={drawerCompany.id} size="lg" />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{drawerCompany.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{relativeTime(drawerCompany.lastActivity)}</span>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => setDrawerCompany(null)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close details"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] uppercase tracking-wide text-slate-400">Contacts</div><div className="text-sm font-semibold text-slate-800">{drawerCompany.contacts.length}</div></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] uppercase tracking-wide text-slate-400">Open deals</div><div className="text-sm font-semibold text-slate-800">{openDeals(drawerCompany).length}</div></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] uppercase tracking-wide text-slate-400">Total value</div><div className="text-sm font-semibold text-slate-800"><ValueText value={companyValue(drawerCompany)} masked={maskValues || drawerCompany.masked} /></div></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Linked Contacts</h3>
                <div className="space-y-2">
                  {drawerCompany.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                      <Avatar name={contact.name} seed={contact.id} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">{contact.name}</div>
                        <div className="truncate text-xs text-slate-500">{contact.email || contact.phone || '—'}</div>
                      </div>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{stageLabel(contact, stages)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Opportunities</h3>
                <div className="space-y-2">
                  {drawerCompany.deals.map((deal) => (
                    <div key={deal.id} className="rounded-xl border border-slate-200 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{deal.name}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{deal.assigneeName || 'Unassigned'}</span>
                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{relativeTime(deal.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-semibold text-slate-900"><ValueText value={deal.value} masked={maskValues || deal.valueMasked} /></div>
                          <div className="mt-1 text-[11px] text-slate-500">{stageLabel(deal, stages)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {(maskValues || drawerCompany.masked) ? (
                <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Opportunity values are masked by field-level permissions (F1.4).</span>
                </div>
              ) : null}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
