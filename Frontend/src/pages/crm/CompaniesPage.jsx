import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  X,
  Mail,
  Phone,
  MapPin,
  Users,
  ChevronRight,
  Lock,
  ShieldCheck,
  Globe,
  Calendar,
  CircleDollarSign,
  Target,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Inbox,
} from 'lucide-react';

const MASK_TEXT = '\u2022\u2022\u2022\u2022\u2022\u2022';

const INDUSTRIES = [
  'Solar Installation',
  'Real Estate',
  'Healthcare',
  'Manufacturing',
  'Retail & E-commerce',
  'Construction',
  'Hospitality',
  'Financial Services',
];

const STAGE_STYLES = {
  New: 'bg-slate-100 text-slate-600 ring-slate-200',
  Qualified: 'bg-sky-50 text-sky-700 ring-sky-200',
  'Proposal Sent': 'bg-amber-50 text-amber-700 ring-amber-200',
  Negotiation: 'bg-violet-50 text-violet-700 ring-violet-200',
  Won: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Lost: 'bg-rose-50 text-rose-700 ring-rose-200',
};

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

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount || 0);
}

function getInitials(name) {
  const words = String(name)
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const second = words.length > 1 ? words[1][0] : '';
  return (first + second).toUpperCase();
}

function colorFor(seed) {
  let hash = 0;
  const text = String(seed);
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 9973;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function isOpenOpportunity(opportunity) {
  return opportunity.stage !== 'Won' && opportunity.stage !== 'Lost';
}

function companyStats(company) {
  const openCount = company.opportunities.filter(isOpenOpportunity).length;
  const totalValue = company.opportunities.reduce((sum, deal) => sum + (deal.value || 0), 0);
  return { contactCount: company.contacts.length, openCount, totalValue };
}

const INITIAL_COMPANIES = [
  {
    id: 'cmp-01',
    name: 'Helios Solar Systems',
    industry: 'Solar Installation',
    location: 'San Francisco, CA',
    phone: '+1 (415) 555-0142',
    email: 'hello@heliossolar.com',
    address: '2480 Mission St, Suite 400, San Francisco, CA 94110',
    owner: 'Marcus Vance',
    lastActivity: '2 hours ago',
    contacts: [
      { id: 'ct-01', name: 'Sarah Jenkins', role: 'Head of Procurement', email: 'sarah.jenkins@heliossolar.com', phone: '+1 (415) 555-0188' },
      { id: 'ct-02', name: 'Daniel Okafor', role: 'Facilities Director', email: 'd.okafor@heliossolar.com', phone: '+1 (415) 555-0134' },
    ],
    opportunities: [
      { id: 'op-01', title: 'Commercial Roof Installation (40 kW)', stage: 'Negotiation', value: 48500, owner: 'Marcus Vance', closeDate: 'Nov 12, 2026' },
      { id: 'op-02', title: 'Annual Maintenance Contract', stage: 'Won', value: 12000, owner: 'Elena Rostova', closeDate: 'Sep 30, 2026' },
    ],
  },
  {
    id: 'cmp-02',
    name: 'Beacon Realty Group',
    industry: 'Real Estate',
    location: 'Austin, TX',
    phone: '+1 (512) 555-0107',
    email: 'team@beaconrealty.com',
    address: '1100 Congress Ave, Floor 12, Austin, TX 78701',
    owner: 'Elena Rostova',
    lastActivity: 'Yesterday',
    contacts: [
      { id: 'ct-03', name: 'Priya Nair', role: 'Managing Broker', email: 'priya@beaconrealty.com', phone: '+1 (512) 555-0173' },
      { id: 'ct-04', name: 'Tom Whitfield', role: 'Client Success Lead', email: 'tom.w@beaconrealty.com', phone: '+1 (512) 555-0166' },
      { id: 'ct-05', name: 'Rachel Adams', role: 'Listing Agent', email: 'rachel@beaconrealty.com', phone: '+1 (512) 555-0121' },
    ],
    opportunities: [
      { id: 'op-03', title: 'Portfolio Listing Subscription', stage: 'Proposal Sent', value: 32000, owner: 'Elena Rostova', closeDate: 'Dec 05, 2026' },
      { id: 'op-04', title: 'Buyer Lead Routing Pilot', stage: 'Qualified', value: 8500, owner: 'Marcus Vance', closeDate: 'Nov 28, 2026' },
      { id: 'op-05', title: 'Legacy CRM Migration', stage: 'Lost', value: 15000, owner: 'Elena Rostova', closeDate: 'Aug 14, 2026' },
    ],
  },
  {
    id: 'cmp-03',
    name: 'Northwind Manufacturing Co.',
    industry: 'Manufacturing',
    location: 'Detroit, MI',
    phone: '+1 (313) 555-0198',
    email: 'contact@northwindmfg.com',
    address: '9800 Harper Ave, Detroit, MI 48213',
    owner: 'Marcus Vance',
    lastActivity: '3 days ago',
    contacts: [
      { id: 'ct-06', name: 'Gregory Leblanc', role: 'Plant Operations Manager', email: 'gleblanc@northwindmfg.com', phone: '+1 (313) 555-0140' },
      { id: 'ct-07', name: 'Amara Diallo', role: 'Supply Chain Analyst', email: 'adiallo@northwindmfg.com', phone: '+1 (313) 555-0119' },
    ],
    opportunities: [
      { id: 'op-06', title: 'Predictive Maintenance Rollout', stage: 'Negotiation', value: 76000, owner: 'Marcus Vance', closeDate: 'Jan 20, 2027' },
      { id: 'op-07', title: 'Warehouse Sensor Network', stage: 'New', value: 24000, owner: 'Elena Rostova', closeDate: 'Feb 02, 2027' },
    ],
  },
  {
    id: 'cmp-04',
    name: 'Cedar & Pine Dental Studio',
    industry: 'Healthcare',
    location: 'Portland, OR',
    phone: '+1 (503) 555-0155',
    email: 'front.desk@cedarpinedental.com',
    address: '700 SW Morrison St, Portland, OR 97205',
    owner: 'Elena Rostova',
    lastActivity: '5 days ago',
    contacts: [
      { id: 'ct-08', name: 'Dr. Hannah Cole', role: 'Practice Owner', email: 'hannah@cedarpinedental.com', phone: '+1 (503) 555-0102' },
    ],
    opportunities: [
      { id: 'op-08', title: 'Patient Intake Automation', stage: 'Qualified', value: 14500, owner: 'Elena Rostova', closeDate: 'Dec 18, 2026' },
    ],
  },
  {
    id: 'cmp-05',
    name: 'Lumen Retail Collective',
    industry: 'Retail & E-commerce',
    location: 'Brooklyn, NY',
    phone: '+1 (718) 555-0177',
    email: 'partners@lumenretail.co',
    address: '55 Washington St, Suite 210, Brooklyn, NY 11201',
    owner: 'Marcus Vance',
    lastActivity: 'Today',
    contacts: [
      { id: 'ct-09', name: 'Isabella Romano', role: 'Head of Growth', email: 'isabella@lumenretail.co', phone: '+1 (718) 555-0190' },
      { id: 'ct-10', name: 'Kwame Mensah', role: 'E-commerce Manager', email: 'kwame@lumenretail.co', phone: '+1 (718) 555-0143' },
      { id: 'ct-11', name: 'Nina Petrova', role: 'Merchandising Lead', email: 'nina@lumenretail.co', phone: '+1 (718) 555-0128' },
      { id: 'ct-12', name: 'Owen Hart', role: 'Ops Coordinator', email: 'owen@lumenretail.co', phone: '+1 (718) 555-0111' },
    ],
    opportunities: [
      { id: 'op-09', title: 'Omnichannel Support Suite', stage: 'Negotiation', value: 58000, owner: 'Marcus Vance', closeDate: 'Dec 09, 2026' },
      { id: 'op-10', title: 'Loyalty Program Integration', stage: 'Proposal Sent', value: 21000, owner: 'Elena Rostova', closeDate: 'Jan 15, 2027' },
      { id: 'op-11', title: 'Returns Portal Add-on', stage: 'Won', value: 9500, owner: 'Marcus Vance', closeDate: 'Oct 01, 2026' },
    ],
  },
  {
    id: 'cmp-06',
    name: 'Ironclad Construction Ltd.',
    industry: 'Construction',
    location: 'Denver, CO',
    phone: '+1 (303) 555-0139',
    email: 'bids@ironcladbuild.com',
    address: '1450 Wynkoop St, Denver, CO 80202',
    owner: 'Elena Rostova',
    lastActivity: '1 week ago',
    contacts: [
      { id: 'ct-13', name: 'Victor Ramos', role: 'Estimating Manager', email: 'vramos@ironcladbuild.com', phone: '+1 (303) 555-0165' },
      { id: 'ct-14', name: 'Lauren Fields', role: 'Project Coordinator', email: 'lfields@ironcladbuild.com', phone: '+1 (303) 555-0132' },
    ],
    opportunities: [
      { id: 'op-12', title: 'Multi-site Project Tracking', stage: 'Qualified', value: 39000, owner: 'Elena Rostova', closeDate: 'Feb 11, 2027' },
    ],
  },
  {
    id: 'cmp-07',
    name: 'Harborview Hospitality Group',
    industry: 'Hospitality',
    location: 'Seattle, WA',
    phone: '+1 (206) 555-0184',
    email: 'reservations@harborviewhg.com',
    address: '1901 Alaskan Way, Seattle, WA 98101',
    owner: 'Marcus Vance',
    lastActivity: '4 hours ago',
    contacts: [
      { id: 'ct-15', name: 'Mei Tanaka', role: 'Group Revenue Manager', email: 'mei.tanaka@harborviewhg.com', phone: '+1 (206) 555-0157' },
      { id: 'ct-16', name: 'Andre Silva', role: 'Guest Experience Director', email: 'andre@harborviewhg.com', phone: '+1 (206) 555-0126' },
    ],
    opportunities: [
      { id: 'op-13', title: 'Booking & Calendar Sync', stage: 'Proposal Sent', value: 27500, owner: 'Marcus Vance', closeDate: 'Dec 22, 2026' },
      { id: 'op-14', title: 'Corporate Rate Contracts', stage: 'New', value: 18000, owner: 'Elena Rostova', closeDate: 'Mar 04, 2027' },
    ],
  },
  {
    id: 'cmp-08',
    name: 'Meridian Capital Partners',
    industry: 'Financial Services',
    location: 'Chicago, IL',
    phone: '+1 (312) 555-0112',
    email: 'advisory@meridiancap.com',
    address: '200 W Madison St, Floor 30, Chicago, IL 60606',
    owner: 'Elena Rostova',
    lastActivity: '2 days ago',
    contacts: [
      { id: 'ct-17', name: 'Jonathan Reyes', role: 'Partner', email: 'jreyes@meridiancap.com', phone: '+1 (312) 555-0149' },
      { id: 'ct-18', name: 'Fatima Al-Sayed', role: 'Compliance Officer', email: 'fatima@meridiancap.com', phone: '+1 (312) 555-0105' },
      { id: 'ct-19', name: 'Peter Nwosu', role: 'Client Advisor', email: 'peter.n@meridiancap.com', phone: '+1 (312) 555-0176' },
    ],
    opportunities: [
      { id: 'op-15', title: 'Secure Document Workflow', stage: 'Negotiation', value: 92000, owner: 'Elena Rostova', closeDate: 'Jan 30, 2027' },
      { id: 'op-16', title: 'Advisor Client Portal', stage: 'Proposal Sent', value: 41000, owner: 'Marcus Vance', closeDate: 'Feb 18, 2027' },
    ],
  },
];

function Avatar({ name, seed, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-base',
  };
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl font-semibold ring-1 ring-inset ring-black/5 ${sizes[size]} ${colorFor(seed || name)}`}
    >
      {getInitials(name)}
    </span>
  );
}

function StageBadge({ stage }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STAGE_STYLES[stage] || STAGE_STYLES.New}`}
    >
      {stage}
    </span>
  );
}

function ValueText({ value, masked, className = '' }) {
  if (masked) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-slate-400 ${className}`} title="Value masked by field-level permissions">
        {MASK_TEXT}
      </span>
    );
  }
  return <span className={className}>{formatCurrency(value)}</span>;
}

function StatCard({ icon: Icon, label, value, masked, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {masked ? <span className="tracking-widest text-slate-400">{MASK_TEXT}</span> : value}
      </div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = 'text', required = false, error }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
          error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-slate-400'
        }`}
      />
      {error ? <span className="mt-1 block text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}

const EMPTY_FORM = { name: '', industry: INDUSTRIES[0], phone: '', email: '', address: '' };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [query, setQuery] = useState('');
  const [maskValues, setMaskValues] = useState(false);

  const [drawerCompany, setDrawerCompany] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast === null) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setDrawerOpen(false);
      setModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const locked = drawerOpen || drawerCompany !== null || modal !== null;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen, drawerCompany, modal]);

  const filteredCompanies = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return companies;
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(needle) ||
        company.industry.toLowerCase().includes(needle),
    );
  }, [companies, query]);

  const totals = useMemo(() => {
    return companies.reduce(
      (acc, company) => {
        const stats = companyStats(company);
        acc.contacts += stats.contactCount;
        acc.open += stats.openCount;
        acc.value += stats.totalValue;
        return acc;
      },
      { contacts: 0, open: 0, value: 0 },
    );
  }, [companies]);

  const notify = (message) => setToast(message);

  const openDrawer = (company) => {
    setDrawerCompany(company);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal({ mode: 'add' });
  };

  const openEditModal = (company) => {
    setForm({
      name: company.name,
      industry: company.industry,
      phone: company.phone,
      email: company.email,
      address: company.address,
    });
    setFormError('');
    setModal({ mode: 'edit', id: company.id });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError('Company name is required.');
      return;
    }

    if (modal.mode === 'add') {
      const newCompany = {
        id: `cmp-${Date.now()}`,
        name: form.name.trim(),
        industry: form.industry,
        location: form.address.split(',').slice(-2).join(',').trim() || '\u2014',
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        owner: 'You',
        lastActivity: 'Just now',
        contacts: [],
        opportunities: [],
      };
      setCompanies((prev) => [newCompany, ...prev]);
      notify(`"${newCompany.name}" was added to your companies.`);
    } else {
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === modal.id
            ? {
                ...company,
                name: form.name.trim(),
                industry: form.industry,
                phone: form.phone.trim(),
                email: form.email.trim(),
                address: form.address.trim(),
              }
            : company,
        ),
      );
      setDrawerCompany((prev) =>
        prev && prev.id === modal.id
          ? {
              ...prev,
              name: form.name.trim(),
              industry: form.industry,
              phone: form.phone.trim(),
              email: form.email.trim(),
              address: form.address.trim(),
            }
          : prev,
      );
      notify('Company details updated.');
    }

    setModal(null);
  };

  const handleExport = () => {
    notify(`Exported ${filteredCompanies.length} compan${filteredCompanies.length === 1 ? 'y' : 'ies'} to CSV.`);
  };

  const drawerStats = drawerCompany ? companyStats(drawerCompany) : null;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Companies Management
              </h1>
              <p className="text-sm text-slate-500">
                Unified accounts, linked contacts and pipeline value in one place
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMaskValues((prev) => !prev)}
              aria-pressed={maskValues}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                maskValues
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Toggle field-level permission masking (F1.4 / F2.1)"
            >
              {maskValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline">{maskValues ? 'Values masked' : 'Mask values'}</span>
              <span
                className={`relative ml-0.5 hidden h-4 w-7 rounded-full transition-colors sm:inline-block ${
                  maskValues ? 'bg-white/30' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                    maskValues ? 'left-3.5' : 'left-0.5'
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              title="Export companies (crm.export)"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Company
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Building2} label="Companies" value={companies.length} />
          <StatCard icon={Users} label="Contacts" value={totals.contacts} />
          <StatCard icon={Target} label="Open Deals" value={totals.open} />
          <StatCard
            icon={CircleDollarSign}
            label="Pipeline Value"
            value={formatCurrency(totals.value)}
            masked={maskValues}
            hint={maskValues ? 'Hidden by permissions' : 'All opportunities'}
          />
        </div>

        {/* Toolbar */}
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
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>
              Showing <span className="font-semibold text-slate-700">{filteredCompanies.length}</span> of{' '}
              {companies.length} companies
            </span>
          </div>
        </div>

        {/* Desktop table */}
        <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 font-semibold">Industry</th>
                <th className="px-5 py-3 font-semibold">Contacts</th>
                <th className="px-5 py-3 font-semibold">Open Opportunities</th>
                <th className="px-5 py-3 text-right font-semibold">Total Value</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map((company) => {
                const stats = companyStats(company);
                return (
                  <tr
                    key={company.id}
                    onClick={() => openDrawer(company)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50"
                  >
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
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {company.industry}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {stats.contactCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-slate-400" />
                        {stats.openCount} open
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {maskValues ? <Lock className="h-3.5 w-3.5 text-slate-300" /> : null}
                        <ValueText value={stats.totalValue} masked={maskValues} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDrawer(company);
                          }}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`View ${company.name}`}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditModal(company);
                          }}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Edit ${company.name}`}
                          title="Edit company"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Inbox className="h-5 w-5" />
              </span>
              <p className="font-medium text-slate-700">No companies match your search</p>
              <p className="text-sm text-slate-500">Try a different name or industry keyword.</p>
            </div>
          ) : null}
        </div>

        {/* Mobile cards */}
        <div className="mt-4 space-y-3 md:hidden">
          {filteredCompanies.map((company) => {
            const stats = companyStats(company);
            return (
              <div
                key={company.id}
                onClick={() => openDrawer(company)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors active:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={company.name} seed={company.id} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{company.name}</div>
                      <div className="truncate text-xs text-slate-500">{company.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditModal(company);
                      }}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Edit ${company.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {company.industry}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">Contacts</div>
                    <div className="text-sm font-semibold text-slate-800">{stats.contactCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">Open</div>
                    <div className="text-sm font-semibold text-slate-800">{stats.openCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">Value</div>
                    <div className="text-sm font-semibold text-slate-800">
                      <ValueText value={stats.totalValue} masked={maskValues} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Inbox className="h-5 w-5" />
              </span>
              <p className="font-medium text-slate-700">No companies match your search</p>
              <p className="text-sm text-slate-500">Try a different name or industry keyword.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Detail slide-over drawer */}
      {drawerCompany ? (
        <>
          <div
            className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
              drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${drawerCompany.name} details`}
            onTransitionEnd={() => {
              if (!drawerOpen) setDrawerCompany(null);
            }}
            className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
              drawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer header */}
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={drawerCompany.name} seed={drawerCompany.id} size="lg" />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                      {drawerCompany.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {drawerCompany.industry}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {drawerCompany.lastActivity}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Contacts</div>
                  <div className="text-sm font-semibold text-slate-800">{drawerStats.contactCount}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Open deals</div>
                  <div className="text-sm font-semibold text-slate-800">{drawerStats.openCount}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Total value</div>
                  <div className="text-sm font-semibold text-slate-800">
                    <ValueText value={drawerStats.totalValue} masked={maskValues} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(drawerCompany)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit company
                </button>
                <a
                  href={`mailto:${drawerCompany.email}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Company information */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Company Information
                </h3>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Email</div>
                      <div className="truncate text-sm text-slate-800">{drawerCompany.email || '\u2014'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Phone</div>
                      <div className="truncate text-sm text-slate-800">{drawerCompany.phone || '\u2014'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Address</div>
                      <div className="text-sm text-slate-800">{drawerCompany.address || '\u2014'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Account Owner</div>
                      <div className="truncate text-sm text-slate-800">{drawerCompany.owner}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Linked contacts */}
              <section className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Linked Contacts
                  </h3>
                  <span className="text-xs text-slate-400">{drawerCompany.contacts.length} total</span>
                </div>

                {drawerCompany.contacts.length > 0 ? (
                  <div className="space-y-2">
                    {drawerCompany.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <Avatar name={contact.name} seed={contact.id} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">{contact.name}</div>
                          <div className="truncate text-xs text-slate-500">{contact.email}</div>
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                          {contact.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    <Inbox className="h-4 w-4 text-slate-400" />
                    No contacts linked to this company yet.
                  </div>
                )}
              </section>

              {/* Opportunities */}
              <section className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Opportunities
                  </h3>
                  <span className="text-xs text-slate-400">
                    {drawerCompany.opportunities.length} deal{drawerCompany.opportunities.length === 1 ? '' : 's'}
                  </span>
                </div>

                {drawerCompany.opportunities.length > 0 ? (
                  <div className="space-y-2">
                    {drawerCompany.opportunities.map((deal) => (
                      <div
                        key={deal.id}
                        className="rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-slate-900">{deal.title}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {deal.owner}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {deal.closeDate}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-sm font-semibold text-slate-900">
                              <ValueText value={deal.value} masked={maskValues} />
                            </div>
                            <div className="mt-1">
                              <StageBadge stage={deal.stage} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    <Inbox className="h-4 w-4 text-slate-400" />
                    No opportunities recorded for this account.
                  </div>
                )}
              </section>

              {maskValues ? (
                <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Opportunity values are masked by field-level permissions (F1.4). Toggle
                    &ldquo;Mask values&rdquo; in the header to reveal them.
                  </span>
                </div>
              ) : null}
            </div>
          </aside>
        </>
      ) : null}

      {/* Add / Edit modal */}
      {modal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setModal(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={modal.mode === 'add' ? 'Add company' : 'Edit company'}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                  {modal.mode === 'add' ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {modal.mode === 'add' ? 'Add Company' : 'Edit Company'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {modal.mode === 'add'
                      ? 'Create a new account record'
                      : 'Update account details'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4 px-5 py-5">
                <FormField
                  label="Company Name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Helios Solar Systems"
                  required
                  error={formError}
                />

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Industry</span>
                  <select
                    name="industry"
                    value={form.industry}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="+1 (555) 000-0000"
                  />
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="hello@company.com"
                  />
                </div>

                <FormField
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Street, city, state ZIP"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {modal.mode === 'add' ? 'Create Company' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Toast */}
      {toast ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      ) : null}
    </div>
  );
}
