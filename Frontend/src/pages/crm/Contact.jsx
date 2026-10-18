import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  AtSign,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CalendarPlus,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Globe,
  History,
  Kanban,
  LayoutDashboard,
  Link2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  PenLine,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  Receipt,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

const PIPELINE_STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

const STAGE_STYLES = {
  'New Lead': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Contacted: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  Qualified: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  'Proposal Sent': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Negotiation: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Lost: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const STAGE_DOTS = {
  'New Lead': 'bg-sky-500',
  Contacted: 'bg-indigo-500',
  Qualified: 'bg-violet-500',
  'Proposal Sent': 'bg-amber-500',
  Negotiation: 'bg-orange-500',
  Won: 'bg-emerald-500',
  Lost: 'bg-rose-500',
};

const TAG_STYLES = {
  Enterprise: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  Hot: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Priority: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Solar: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Healthcare: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  Referral: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  SMB: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Inbound: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'Churn Risk': 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const AVAILABLE_STATUS = {
  Available: { dot: 'bg-emerald-500', text: 'text-emerald-700', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  Busy: { dot: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  Offline: { dot: 'bg-slate-400', text: 'text-slate-500', chip: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
};

const PAYMENT_STATUS = {
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Expired: 'bg-slate-100 text-slate-500 ring-slate-500/20',
};

const SOURCE_META = {
  'Web Form': { icon: Globe, chip: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  WhatsApp: { icon: MessageCircle, chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  Manual: { icon: PenLine, chip: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  Referral: { icon: Users, chip: 'bg-violet-50 text-violet-700 ring-violet-600/20' },
  Import: { icon: Download, chip: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
};

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-fuchsia-500',
];

const EMPLOYEES = [
  { id: 'e1', name: 'Marcus Vance', role: 'Senior Sales Rep', status: 'Available' },
  { id: 'e2', name: 'Elena Rostova', role: 'Sales Manager', status: 'Busy' },
  { id: 'e3', name: 'Priya Nair', role: 'Account Executive', status: 'Available' },
  { id: 'e4', name: 'David Okafor', role: 'Solutions Engineer', status: 'Busy' },
  { id: 'e5', name: 'Sofia Almeida', role: 'Support Specialist', status: 'Available' },
  { id: 'e6', name: 'Jonas Weber', role: 'Sales Rep', status: 'Available' },
];

const employeeById = (id) => EMPLOYEES.find((e) => e.id === id);

const MOCK_CONTACTS = [
  {
    id: 'c1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@brightwave.io',
    phone: '+1 (415) 555-0132',
    company: 'Brightwave Solar',
    title: 'Operations Director',
    location: 'San Francisco, CA',
    ownerId: 'e1',
    stage: 'Proposal Sent',
    tags: ['Enterprise', 'Hot', 'Solar'],
    source: 'Web Form',
    createdAt: 'Mar 12, 2026',
    lastActivity: '2h ago',
    lastActivityAt: '2026-10-18',
    customFields: [
      { label: 'Property Type', value: 'Commercial', type: 'select', required: true },
      { label: 'Estimated System Size', value: '40', type: 'number', unit: 'kW', required: true },
      { label: 'Site Inspection Date', value: 'Oct 24, 2026', type: 'date' },
      { label: 'Budget Range', value: '65000', type: 'currency' },
      { label: 'Preferred Channel', value: 'WhatsApp', type: 'select' },
      { label: 'Site Access Notes', value: 'Loading dock access after 8am. Contact building manager on arrival.', type: 'textarea' },
    ],
    opportunities: [
      { title: 'Commercial Solar Roof — 40 kW', stage: 'Proposal Sent', value: 48500, probability: 60, closeDate: 'Nov 04, 2026', ownerId: 'e1' },
      { title: 'Battery Storage Add-on', stage: 'Qualified', value: 12000, probability: 35, closeDate: 'Nov 20, 2026', ownerId: 'e4' },
    ],
    conversations: [
      { channel: 'WhatsApp', direction: 'inbound', body: 'Hi! We reviewed the proposal — it looks good. Can we lock in the site inspection for Friday?', time: 'Today · 09:14', status: 'Delivered' },
      { channel: 'WhatsApp', direction: 'outbound', body: 'Absolutely. Friday 10:00 AM works — I have just sent the calendar invite.', time: 'Today · 09:22', status: 'Read' },
      { channel: 'WhatsApp', direction: 'outbound', body: 'I also generated the $500 deposit link so we can hold the crew slot.', time: 'Today · 09:23', status: 'Delivered' },
    ],
    payments: [
      { id: 'pi_3Nx…aB2', amount: 500, status: 'Paid', createdAt: 'Oct 16, 2026', description: 'Site inspection deposit' },
      { id: 'pi_3Ny…kQ9', amount: 9700, status: 'Pending', createdAt: 'Oct 18, 2026', description: 'Equipment reservation (20%)' },
    ],
    appointments: [
      { title: 'On-site Inspection', start: 'Fri, Oct 24 · 10:00 AM', end: '11:00 AM', location: '1420 Marsh Ln, San Jose, CA', status: 'Confirmed' },
    ],
    activity: [
      { time: '2h ago', actor: 'Marcus Vance', type: 'stage', text: 'Moved opportunity “Commercial Solar Roof — 40 kW” to Proposal Sent' },
      { time: '5h ago', actor: 'Sarah Jenkins', type: 'message', text: 'Replied on WhatsApp about inspection scheduling' },
      { time: 'Yesterday', actor: 'System', type: 'payment', text: 'Stripe payment of $500.00 marked as Paid' },
      { time: 'Oct 15', actor: 'Marcus Vance', type: 'note', text: 'Added a note: “Budget approved by board, decision expected next week.”' },
      { time: 'Oct 12', actor: 'System', type: 'field', text: 'Updated custom field “Estimated System Size” to 40 kW' },
    ],
  },
  {
    id: 'c2',
    name: 'Daniel Mercer',
    email: 'd.mercer@northlinerealty.com',
    phone: '+1 (206) 555-0177',
    company: 'Northline Realty',
    title: 'Managing Broker',
    location: 'Seattle, WA',
    ownerId: 'e2',
    stage: 'Negotiation',
    tags: ['Hot', 'Referral'],
    source: 'WhatsApp',
    createdAt: 'Feb 28, 2026',
    lastActivity: '35m ago',
    lastActivityAt: '2026-10-18',
    customFields: [
      { label: 'Property Type', value: 'Residential', type: 'select', required: true },
      { label: 'Units Managed', value: '128', type: 'number' },
      { label: 'Contract Term', value: '24 months', type: 'select', required: true },
      { label: 'Annual Budget', value: '42000', type: 'currency' },
    ],
    opportunities: [
      { title: 'Portfolio Lead Routing Plan', stage: 'Negotiation', value: 27800, probability: 75, closeDate: 'Oct 30, 2026', ownerId: 'e2' },
    ],
    conversations: [
      { channel: 'WhatsApp', direction: 'inbound', body: 'Can we discount if we commit to 24 months instead of 12?', time: 'Today · 11:02', status: 'Delivered' },
      { channel: 'WhatsApp', direction: 'outbound', body: 'Yes — annual commitment unlocks the 15% tier. Sending the revised quote now.', time: 'Today · 11:09', status: 'Read' },
    ],
    payments: [
      { id: 'pi_3Nv…tR4', amount: 2780, status: 'Paid', createdAt: 'Oct 10, 2026', description: 'First month retainer' },
    ],
    appointments: [
      { title: 'Contract Review Call', start: 'Tue, Oct 21 · 2:00 PM', end: '2:30 PM', location: 'Google Meet', status: 'Confirmed' },
    ],
    activity: [
      { time: '35m ago', actor: 'Elena Rostova', type: 'stage', text: 'Moved “Portfolio Lead Routing Plan” to Negotiation' },
      { time: '3d ago', actor: 'Elena Rostova', type: 'assignment', text: 'Reassigned this contact from Priya Nair to Elena Rostova' },
      { time: '1w ago', actor: 'Daniel Mercer', type: 'message', text: 'Requested a 24-month commitment discount' },
    ],
  },
  {
    id: 'c3',
    name: 'Aisha Rahman',
    email: 'aisha.rahman@cobaltdental.com',
    phone: '+1 (312) 555-0198',
    company: 'Cobalt Dental Group',
    title: 'Practice Manager',
    location: 'Chicago, IL',
    ownerId: 'e3',
    stage: 'Qualified',
    tags: ['Healthcare', 'Enterprise'],
    source: 'Web Form',
    createdAt: 'Apr 02, 2026',
    lastActivity: '3h ago',
    lastActivityAt: '2026-10-18',
    customFields: [
      { label: 'Clinic Locations', value: '6', type: 'number', required: true },
      { label: 'Compliance Review', value: 'Yes', type: 'select', required: true },
      { label: 'Primary Use Case', value: 'Patient acquisition routing', type: 'text' },
      { label: 'Target Go-Live', value: 'Dec 01, 2026', type: 'date' },
    ],
    opportunities: [
      { title: 'Multi-clinic Rollout', stage: 'Qualified', value: 34500, probability: 50, closeDate: 'Nov 15, 2026', ownerId: 'e3' },
    ],
    conversations: [
      { channel: 'WhatsApp', direction: 'inbound', body: 'Our compliance officer needs a summary of where patient data is stored.', time: 'Today · 08:40', status: 'Delivered' },
      { channel: 'WhatsApp', direction: 'outbound', body: 'Of course — I have shared our data-residency overview with you just now.', time: 'Today · 08:55', status: 'Delivered' },
    ],
    payments: [],
    appointments: [
      { title: 'Compliance Discovery', start: 'Wed, Oct 22 · 11:00 AM', end: '12:00 PM', location: 'Google Meet', status: 'Pending' },
    ],
    activity: [
      { time: '3h ago', actor: 'Priya Nair', type: 'field', text: 'Updated custom field “Compliance Review” to Yes' },
      { time: 'Yesterday', actor: 'System', type: 'stage', text: 'Stage changed from Contacted to Qualified' },
      { time: '4d ago', actor: 'Priya Nair', type: 'note', text: 'Added a note: “Six locations, HIPAA review required before pilot.”' },
    ],
  },
  {
    id: 'c4',
    name: 'Tomás Oliveira',
    email: 'tomas@vantageroofing.co',
    phone: '+1 (512) 555-0143',
    company: 'Vantage Roofing Co.',
    title: 'Owner',
    location: 'Austin, TX',
    ownerId: 'e1',
    stage: 'Contacted',
    tags: ['SMB'],
    source: 'Manual',
    createdAt: 'Sep 19, 2026',
    lastActivity: '1d ago',
    lastActivityAt: '2026-10-17',
    customFields: [
      { label: 'Team Size', value: '9', type: 'number' },
      { label: 'Preferred Contact', value: 'Phone', type: 'select' },
      { label: 'Interested In', value: 'SLA escalation + round-robin', type: 'text' },
    ],
    opportunities: [],
    conversations: [
      { channel: 'WhatsApp', direction: 'outbound', body: 'Hi Tomás — following up on the missed-lead problem you mentioned. Free for 15 minutes this week?', time: 'Yesterday · 16:20', status: 'Delivered' },
    ],
    payments: [],
    appointments: [],
    activity: [
      { time: '1d ago', actor: 'Marcus Vance', type: 'message', text: 'Sent a WhatsApp follow-up about booking a demo' },
      { time: 'Sep 19', actor: 'Marcus Vance', type: 'note', text: 'Created this contact manually after a trade-show conversation' },
    ],
  },
  {
    id: 'c5',
    name: 'Grace Lin',
    email: 'grace.lin@meridianpg.com',
    phone: '+1 (646) 555-0121',
    company: 'Meridian Property Group',
    title: 'VP of Sales',
    location: 'New York, NY',
    ownerId: 'e2',
    stage: 'Won',
    tags: ['Enterprise', 'Priority', 'Referral'],
    source: 'Referral',
    createdAt: 'Jan 14, 2026',
    lastActivity: '2d ago',
    lastActivityAt: '2026-10-16',
    customFields: [
      { label: 'Seats', value: '28', type: 'number', required: true },
      { label: 'Contract Term', value: '24 months', type: 'select', required: true },
      { label: 'Renewal Date', value: 'Jan 14, 2028', type: 'date' },
      { label: 'Account Tier', value: 'Standard Workspace', type: 'select' },
    ],
    opportunities: [
      { title: 'Enterprise Workspace — 28 seats', stage: 'Won', value: 92400, probability: 100, closeDate: 'Oct 09, 2026', ownerId: 'e2' },
      { title: 'Additional WhatsApp Numbers', stage: 'Qualified', value: 6400, probability: 45, closeDate: 'Dec 05, 2026', ownerId: 'e5' },
    ],
    conversations: [
      { channel: 'WhatsApp', direction: 'outbound', body: 'Welcome aboard, Grace! Your workspace is live and the team has been onboarded.', time: 'Oct 09 · 14:05', status: 'Read' },
      { channel: 'WhatsApp', direction: 'inbound', body: 'The rollout went smoothly — thank you. We may need two more WhatsApp numbers.', time: '2d ago', status: 'Delivered' },
    ],
    payments: [
      { id: 'pi_3Nk…mZ1', amount: 7700, status: 'Paid', createdAt: 'Oct 09, 2026', description: 'Annual workspace invoice' },
    ],
    appointments: [
      { title: 'Quarterly Business Review', start: 'Thu, Nov 06 · 3:00 PM', end: '3:45 PM', location: 'Google Meet', status: 'Confirmed' },
    ],
    activity: [
      { time: '2d ago', actor: 'Elena Rostova', type: 'stage', text: 'Closed “Enterprise Workspace — 28 seats” as Won' },
      { time: 'Oct 09', actor: 'System', type: 'payment', text: 'Stripe payment of $7,700.00 marked as Paid' },
      { time: 'Oct 08', actor: 'Elena Rostova', type: 'note', text: 'Added a note: “Signed 24-month agreement, 28 seats.”' },
      { time: 'Jan 14', actor: 'System', type: 'field', text: 'Contact created from referral source' },
    ],
  },
  {
    id: 'c6',
    name: 'Omar Haddad',
    email: 'omar.haddad@sunpeakinstallers.com',
    phone: '+1 (480) 555-0166',
    company: 'SunPeak Installers',
    title: 'Head of Growth',
    location: 'Phoenix, AZ',
    ownerId: 'e6',
    stage: 'New Lead',
    tags: ['Solar', 'Inbound'],
    source: 'Web Form',
    createdAt: 'Oct 17, 2026',
    lastActivity: '6h ago',
    lastActivityAt: '2026-10-18',
    customFields: [
      { label: 'Property Type', value: 'Commercial', type: 'select', required: true },
      { label: 'Estimated System Size', value: '85', type: 'number', unit: 'kW', required: true },
      { label: 'How did you hear about us?', value: 'Google Search', type: 'select' },
    ],
    opportunities: [],
    conversations: [],
    payments: [],
    appointments: [],
    activity: [
      { time: '6h ago', actor: 'System', type: 'assignment', text: 'Inbound lead assigned to Jonas Weber (round-robin #3)' },
      { time: '6h ago', actor: 'System', type: 'field', text: 'Contact created from Web Form submission' },
    ],
  },
  {
    id: 'c7',
    name: 'Nina Kowalski',
    email: 'n.kowalski@harborviewclinics.org',
    phone: '+1 (617) 555-0110',
    company: 'Harborview Clinics',
    title: 'Operations Lead',
    location: 'Boston, MA',
    ownerId: 'e5',
    stage: 'Contacted',
    tags: ['Healthcare'],
    source: 'Import',
    createdAt: 'Aug 30, 2026',
    lastActivity: '4d ago',
    lastActivityAt: '2026-10-14',
    customFields: [
      { label: 'Clinic Locations', value: '2', type: 'number' },
      { label: 'Primary Use Case', value: 'Appointment confirmations', type: 'text' },
      { label: 'Preferred Channel', value: 'WhatsApp', type: 'select' },
    ],
    opportunities: [],
    conversations: [
      { channel: 'WhatsApp', direction: 'outbound', body: 'Hi Nina — sharing a short video on how appointment confirmations work end-to-end.', time: '4d ago · 10:12', status: 'Delivered' },
    ],
    payments: [],
    appointments: [],
    activity: [
      { time: '4d ago', actor: 'Sofia Almeida', type: 'message', text: 'Shared an onboarding walkthrough video' },
      { time: 'Aug 30', actor: 'System', type: 'field', text: 'Imported from “clinics-west.csv”' },
    ],
  },
  {
    id: 'c8',
    name: "Liam O'Sullivan",
    email: 'liam@greengridenergy.ie',
    phone: '+353 1 555 0142',
    company: 'GreenGrid Energy',
    title: 'Commercial Director',
    location: 'Dublin, IE',
    ownerId: 'e4',
    stage: 'Proposal Sent',
    tags: ['Solar', 'Enterprise'],
    source: 'Web Form',
    createdAt: 'Jun 21, 2026',
    lastActivity: '2d ago',
    lastActivityAt: '2026-10-16',
    customFields: [
      { label: 'Property Type', value: 'Industrial', type: 'select', required: true },
      { label: 'Estimated System Size', value: '320', type: 'number', unit: 'kW', required: true },
      { label: 'Site Inspection Date', value: 'Nov 02, 2026', type: 'date' },
      { label: 'Budget Range', value: '240000', type: 'currency' },
    ],
    opportunities: [
      { title: 'Industrial Rooftop Array — 320 kW', stage: 'Proposal Sent', value: 186000, probability: 55, closeDate: 'Dec 12, 2026', ownerId: 'e4' },
    ],
    conversations: [
      { channel: 'WhatsApp', direction: 'inbound', body: 'The proposal is with our board. Expect a decision within two weeks.', time: '2d ago · 13:44', status: 'Delivered' },
    ],
    payments: [],
    appointments: [
      { title: 'Site Survey', start: 'Mon, Nov 02 · 9:00 AM', end: '11:00 AM', location: "GreenGrid HQ, Dublin", status: 'Confirmed' },
    ],
    activity: [
      { time: '2d ago', actor: "Liam O'Sullivan", type: 'message', text: 'Confirmed the proposal is under board review' },
      { time: '6d ago', actor: 'David Okafor', type: 'stage', text: 'Moved “Industrial Rooftop Array — 320 kW” to Proposal Sent' },
      { time: '2w ago', actor: 'David Okafor', type: 'note', text: 'Added a note: “Industrial site — needs structural survey before install.”' },
    ],
  },
  {
    id: 'c9',
    name: 'Fatima Noor',
    email: 'fatima@arcadiainteriors.ae',
    phone: '+971 4 555 0188',
    company: 'Arcadia Interiors',
    title: 'Founder',
    location: 'Dubai, AE',
    ownerId: 'e3',
    stage: 'Lost',
    tags: ['SMB', 'Churn Risk'],
    source: 'Manual',
    createdAt: 'May 05, 2026',
    lastActivity: '3w ago',
    lastActivityAt: '2026-09-27',
    customFields: [
      { label: 'Team Size', value: '4', type: 'number' },
      { label: 'Lost Reason', value: 'Budget', type: 'select' },
    ],
    opportunities: [
      { title: 'Starter Workspace', stage: 'Lost', value: 4200, probability: 0, closeDate: 'Sep 20, 2026', ownerId: 'e3' },
    ],
    conversations: [
      { channel: 'WhatsApp', direction: 'outbound', body: 'Understandable — I will check back next quarter in case budgets reopen.', time: '3w ago', status: 'Read' },
    ],
    payments: [],
    appointments: [],
    activity: [
      { time: '3w ago', actor: 'Priya Nair', type: 'stage', text: 'Marked “Starter Workspace” as Lost (reason: budget)' },
      { time: '3w ago', actor: 'Priya Nair', type: 'note', text: 'Added a note: “Deferred to next quarter — revisit in January.”' },
    ],
  },
  {
    id: 'c10',
    name: 'Ethan Brooks',
    email: 'ethan.brooks@summitsolar.io',
    phone: '+1 (720) 555-0154',
    company: 'Summit Solar Solutions',
    title: 'Sales Lead',
    location: 'Denver, CO',
    ownerId: 'e6',
    stage: 'Qualified',
    tags: ['Solar', 'Hot'],
    source: 'WhatsApp',
    createdAt: 'Jul 08, 2026',
    lastActivity: '9h ago',
    lastActivityAt: '2026-10-18',
    customFields: [
      { label: 'Property Type', value: 'Residential', type: 'select', required: true },
      { label: 'Estimated System Size', value: '12', type: 'number', unit: 'kW' },
      { label: 'Preferred Contact', value: 'WhatsApp', type: 'select' },
      { label: 'Target Go-Live', value: 'Nov 18, 2026', type: 'date' },
    ],
    opportunities: [
      { title: 'Residential Lead Capture Pilot', stage: 'Qualified', value: 9600, probability: 45, closeDate: 'Nov 25, 2026', ownerId: 'e6' },
    ],
    conversations: [
      { channel: 'WhatsApp', direction: 'inbound', body: 'How fast can we get the SLA timers configured for our weekend crew?', time: 'Today · 07:30', status: 'Delivered' },
      { channel: 'WhatsApp', direction: 'outbound', body: 'Under 10 minutes — I can walk you through it on a quick call.', time: 'Today · 07:41', status: 'Delivered' },
    ],
    payments: [
      { id: 'pi_3Nq…xY7', amount: 960, status: 'Pending', createdAt: 'Oct 17, 2026', description: 'Pilot setup fee' },
    ],
    appointments: [
      { title: 'Configuration Walkthrough', start: 'Mon, Oct 20 · 1:00 PM', end: '1:30 PM', location: 'Google Meet', status: 'Confirmed' },
    ],
    activity: [
      { time: '9h ago', actor: 'Jonas Weber', type: 'message', text: 'Replied on WhatsApp about SLA configuration' },
      { time: '1d ago', actor: 'System', type: 'payment', text: 'Stripe payment link for $960.00 created (Pending)' },
      { time: '2d ago', actor: 'Jonas Weber', type: 'stage', text: 'Stage changed from Contacted to Qualified' },
    ],
  },
];

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Pipelines', icon: Kanban },
  { label: 'Contacts', icon: Users, active: true },
  { label: 'Conversations', icon: MessageSquare },
  { label: 'Payments', icon: CreditCard },
  { label: 'Calendar', icon: Calendar },
  { label: 'Escalations', icon: Bell },
  { label: 'Integrations', icon: Zap },
  { label: 'Settings', icon: Settings },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'activity', label: 'Activity', icon: History },
];

const ACTIVITY_META = {
  stage: { icon: Kanban, chip: 'bg-indigo-50 text-indigo-600' },
  message: { icon: MessageCircle, chip: 'bg-emerald-50 text-emerald-600' },
  payment: { icon: CreditCard, chip: 'bg-violet-50 text-violet-600' },
  note: { icon: Pencil, chip: 'bg-slate-100 text-slate-600' },
  field: { icon: SlidersHorizontal, chip: 'bg-amber-50 text-amber-600' },
  assignment: { icon: UserPlus, chip: 'bg-sky-50 text-sky-600' },
};

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
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

function gradientFor(name) {
  return AVATAR_GRADIENTS[hashString(name) % AVATAR_GRADIENTS.length];
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function daysAgo(iso) {
  const then = new Date(`${iso}T00:00:00`).getTime();
  return Math.max(0, Math.round((Date.now() - then) / 86400000));
}

function Avatar({ name, size = 'md', ring = false }) {
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-16 w-16 text-lg',
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${gradientFor(
        name,
      )} ${sizes[size]} ${ring ? 'ring-2 ring-white' : ''}`}
    >
      {initialsOf(name)}
    </span>
  );
}

function StageBadge({ stage }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        STAGE_STYLES[stage] || 'bg-slate-100 text-slate-600 ring-slate-500/20'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STAGE_DOTS[stage] || 'bg-slate-400'}`} />
      {stage}
    </span>
  );
}

function TagPill({ tag }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        TAG_STYLES[tag] || 'bg-slate-100 text-slate-600 ring-slate-500/20'
      }`}
    >
      {tag}
    </span>
  );
}

function StatusDot({ status }) {
  const meta = AVAILABLE_STATUS[status] || AVAILABLE_STATUS.Offline;
  return <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} />;
}

function EmployeeChip({ employee, size = 'md' }) {
  if (!employee) return <span className="text-xs text-slate-400">Unassigned</span>;
  const meta = AVAILABLE_STATUS[employee.status] || AVAILABLE_STATUS.Offline;
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar name={employee.name} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-slate-700">{employee.name}</span>
        <span className={`flex items-center gap-1 text-[11px] ${meta.text}`}>
          <StatusDot status={employee.status} />
          {employee.status}
        </span>
      </span>
    </span>
  );
}

function SourceTag({ source }) {
  const meta = SOURCE_META[source] || SOURCE_META.Manual;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${meta.chip}`}>
      <Icon className="h-3.5 w-3.5" />
      {source}
    </span>
  );
}

function Select({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`relative block ${className}`}>
      {label ? <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span> : null}
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(92vw,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <span
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              toast.tone === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {toast.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </span>
          <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => onDismiss(toast.id)}
            className="text-slate-300 transition hover:text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
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

export default function Contact({ embedded = false }) {
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('overview');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [maskValues, setMaskValues] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastContact, setLastContact] = useState(null);

  const pageSize = 6;

  const selected = contacts.find((contact) => contact.id === selectedId) || null;
  const view = selected || lastContact;

  const tags = useMemo(() => {
    const set = new Set();
    contacts.forEach((contact) => contact.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesQuery =
        !query ||
        [contact.name, contact.email, contact.company, contact.phone, ...contact.tags]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesStage = stageFilter === 'all' || contact.stage === stageFilter;
      const matchesOwner = ownerFilter === 'all' || contact.ownerId === ownerFilter;
      const matchesTag = tagFilter === 'all' || contact.tags.includes(tagFilter);
      const matchesDate = dateFilter === 'all' || daysAgo(contact.lastActivityAt) <= Number(dateFilter);
      return matchesQuery && matchesStage && matchesOwner && matchesTag && matchesDate;
    });
  }, [contacts, search, stageFilter, ownerFilter, tagFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const metrics = useMemo(() => {
    const openOpportunities = contacts
      .flatMap((contact) => contact.opportunities)
      .filter((opportunity) => opportunity.stage !== 'Won' && opportunity.stage !== 'Lost');
    const pipelineValue = openOpportunities.reduce((sum, opportunity) => sum + opportunity.value, 0);
    const pendingPayments = contacts
      .flatMap((contact) => contact.payments)
      .filter((payment) => payment.status === 'Pending');
    return {
      total: contacts.length,
      openOpportunities: openOpportunities.length,
      pipelineValue,
      pendingPayments: pendingPayments.length,
    };
  }, [contacts]);

  function resetPage() {
    setPage(1);
  }

  const drawerOpen = Boolean(selected);
  const anyOverlayOpen = drawerOpen || addOpen || navOpen;

  useEffect(() => {
    if (!anyOverlayOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
        setNavOpen(false);
        if (addOpen) setAddOpen(false);
        else setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [anyOverlayOpen, addOpen]);

  function pushToast(message, tone = 'success') {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }

  function openContact(contact) {
    setSelectedId(contact.id);
    setLastContact(contact);
    setTab('overview');
    setOpenMenuId(null);
  }

  function patchContact(contactId, updater) {
    setContacts((prev) => prev.map((contact) => (contact.id === contactId ? updater(contact) : contact)));
  }

  function sendMessage(contactId, body) {
    const trimmed = body.trim();
    if (!trimmed) return;
    const messageId = `m-${Date.now()}`;
    patchContact(contactId, (contact) => ({
      ...contact,
      lastActivity: 'Just now',
      lastActivityAt: new Date().toISOString().slice(0, 10),
      conversations: [
        ...contact.conversations,
        { id: messageId, channel: 'WhatsApp', direction: 'outbound', body: trimmed, time: 'Just now', status: 'Sent' },
      ],
      activity: [
        { time: 'Just now', actor: 'You', type: 'message', text: 'Sent a WhatsApp message' },
        ...contact.activity,
      ],
    }));
    window.setTimeout(() => {
      patchContact(contactId, (contact) => ({
        ...contact,
        conversations: contact.conversations.map((message) =>
          message.id === messageId ? { ...message, status: 'Delivered' } : message,
        ),
      }));
    }, 1400);
  }

  function createPaymentLink(contactId) {
    const id = `pi_${Math.random().toString(36).slice(2, 6)}…${Math.random().toString(36).slice(2, 5)}`;
    patchContact(contactId, (contact) => ({
      ...contact,
      payments: [
        {
          id,
          amount: 500,
          status: 'Pending',
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          description: 'Checkout link (Stripe test mode)',
        },
        ...contact.payments,
      ],
      activity: [
        { time: 'Just now', actor: 'You', type: 'payment', text: 'Created a Stripe payment link for $500.00' },
        ...contact.activity,
      ],
    }));
    pushToast('Stripe test payment link created for $500.00');
  }

  function bookAppointment(contactId) {
    patchContact(contactId, (contact) => ({
      ...contact,
      appointments: [
        ...contact.appointments,
        { title: 'Discovery Call', start: 'Thu, Oct 30 · 10:00 AM', end: '10:30 AM', location: 'Google Meet', status: 'Pending' },
      ],
      activity: [
        { time: 'Just now', actor: 'You', type: 'note', text: 'Booked a Google Calendar appointment' },
        ...contact.activity,
      ],
    }));
    pushToast('Appointment booked — invitation sent via Google Calendar');
  }

  function deleteContact(contactId) {
    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
    setOpenMenuId(null);
    if (selectedId === contactId) setSelectedId(null);
    pushToast('Contact removed', 'error');
  }

  function copyToClipboard(value, label) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    pushToast(`${label} copied to clipboard`);
  }

  function clearFilters() {
    setSearch('');
    setStageFilter('all');
    setOwnerFilter('all');
    setTagFilter('all');
    setDateFilter('all');
    setPage(1);
  }

  function exportContacts() {
    const header = ['Name', 'Email', 'Phone', 'Company', 'Stage', 'Assigned To', 'Tags', 'Last Activity'];
    const rows = filtered.map((contact) => [
      contact.name,
      contact.email,
      contact.phone,
      contact.company,
      contact.stage,
      employeeById(contact.ownerId)?.name || '',
      contact.tags.join(' | '),
      contact.lastActivity,
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
  }

  function handleAddContact(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    if (!name || !email) {
      pushToast('Name and email are required', 'error');
      return;
    }
    const tagList = String(data.get('tags') || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const newContact = {
      id: `c${Date.now()}`,
      name,
      email,
      phone: String(data.get('phone') || '').trim() || '—',
      company: String(data.get('company') || '').trim() || '—',
      title: 'New Contact',
      location: '—',
      ownerId: String(data.get('owner') || EMPLOYEES[0].id),
      stage: String(data.get('stage') || PIPELINE_STAGES[0]),
      tags: tagList,
      source: String(data.get('source') || 'Manual'),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lastActivity: 'Just now',
      lastActivityAt: new Date().toISOString().slice(0, 10),
      customFields: [
        { label: 'Property Type', value: 'Not set', type: 'text' },
        { label: 'Preferred Channel', value: 'WhatsApp', type: 'select' },
      ],
      opportunities: [],
      conversations: [],
      payments: [],
      appointments: [],
      activity: [
        { time: 'Just now', actor: 'You', type: 'note', text: 'Created this contact' },
        { time: 'Just now', actor: 'System', type: 'assignment', text: `Assigned to ${employeeById(String(data.get('owner') || EMPLOYEES[0].id))?.name}` },
      ],
    };
    setContacts((prev) => [newContact, ...prev]);
    setAddOpen(false);
    setSelectedId(newContact.id);
    setLastContact(newContact);
    setTab('overview');
    pushToast(`${name} added to Contacts`);
  }

  const activeFilterCount = [stageFilter, ownerFilter, tagFilter, dateFilter].filter((value) => value !== 'all').length;

  const stageOptions = [
    { value: 'all', label: 'All stages' },
    ...PIPELINE_STAGES.map((stage) => ({ value: stage, label: stage })),
  ];
  const ownerOptions = [
    { value: 'all', label: 'All owners' },
    ...EMPLOYEES.map((employee) => ({ value: employee.id, label: employee.name })),
  ];
  const tagOptions = [{ value: 'all', label: 'All tags' }, ...tags.map((tag) => ({ value: tag, label: tag }))];
  const dateOptions = [
    { value: 'all', label: 'Any time' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
  ];

  const kpis = [
    { label: 'Total contacts', value: metrics.total.toLocaleString('en-US'), icon: Users, tone: 'bg-indigo-50 text-indigo-600', trend: '+12% this month' },
    { label: 'Open opportunities', value: metrics.openOpportunities.toLocaleString('en-US'), icon: Briefcase, tone: 'bg-violet-50 text-violet-600', trend: 'Across 6 stages' },
    { label: 'Pipeline value', value: formatMoney(metrics.pipelineValue), icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-600', trend: '+8.4% vs last month' },
    { label: 'Pending payments', value: metrics.pendingPayments.toLocaleString('en-US'), icon: Wallet, tone: 'bg-amber-50 text-amber-600', trend: 'Stripe test mode' },
  ];

  return (
    <div className={`text-slate-900 ${embedded ? '' : 'min-h-screen bg-slate-100'}`}>
      {!embedded && navOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 p-4 text-slate-300 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-white">OmniFlow</span>
              </div>
              <button type="button" aria-label="Close" onClick={() => setNavOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    item.active ? 'bg-indigo-500/15 text-white' : 'text-slate-400'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <div className={embedded ? '' : 'flex min-h-screen'}>
        {!embedded ? (
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900 px-3 py-4 lg:flex">
          <div className="mb-6 flex items-center gap-2 px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">OmniFlow</p>
              <p className="text-[11px] text-slate-500">Workspace · Acme Solar</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <span
                key={item.label}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  item.active ? 'bg-indigo-500/15 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" /> : null}
              </span>
            ))}
          </nav>
          <div className="mt-4 rounded-xl bg-slate-800/60 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Tenant isolation active
            </div>
            <p className="mt-1 text-[11px] text-slate-500">All data scoped to this workspace only.</p>
          </div>
        </aside>
        ) : null}

        <div className={embedded ? '' : 'flex min-w-0 flex-1 flex-col'}>
          <header className={embedded ? 'rounded-xl border border-slate-200 bg-white shadow-sm' : 'sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur'}>
            <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                {!embedded ? (
                  <button
                    type="button"
                    aria-label="Open navigation"
                    onClick={() => setNavOpen(true)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                ) : null}
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
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      {filtered.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name, email, company, or tag…"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportContacts}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:flex-none"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:flex-none"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className={embedded ? '' : 'flex-1 px-4 py-5 sm:px-6'}>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                  <p className="mt-1 text-[11px] text-slate-400">{kpi.trend}</p>
                </div>
              ))}
            </div>

            <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
                  {activeFilterCount > 0 ? (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                      {activeFilterCount} active
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-slate-500 transition hover:text-indigo-600"
                >
                  Reset all
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
                <Select label="Pipeline stage" value={stageFilter} onChange={(value) => { setStageFilter(value); resetPage(); }} options={stageOptions} />
                <Select label="Assigned owner" value={ownerFilter} onChange={(value) => { setOwnerFilter(value); resetPage(); }} options={ownerOptions} />
                <Select label="Tag" value={tagFilter} onChange={(value) => { setTagFilter(value); resetPage(); }} options={tagOptions} />
                <Select label="Last activity" value={dateFilter} onChange={(value) => { setDateFilter(value); resetPage(); }} options={dateOptions} />
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-800">
                  All contacts <span className="font-normal text-slate-400">· {filtered.length} results</span>
                </h2>
                <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
                  <Clock className="h-3.5 w-3.5" />
                  Synced with Twilio, Stripe &amp; Google Calendar
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  title="No contacts match your filters"
                  description="Try adjusting the search term or clearing the active filters to see more results."
                />
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
                        {paged.map((contact) => {
                          const owner = employeeById(contact.ownerId);
                          return (
                            <tr
                              key={contact.id}
                              onClick={() => openContact(contact)}
                              className="cursor-pointer transition hover:bg-slate-50/80"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar name={contact.name} />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-800">{contact.name}</p>
                                    <p className="truncate text-xs text-slate-400">{contact.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                  <span className="truncate">{contact.company}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <EmployeeChip employee={owner} />
                              </td>
                              <td className="px-4 py-3">
                                <StageBadge stage={contact.stage} />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap items-center gap-1">
                                  {contact.tags.slice(0, 2).map((tag) => (
                                    <TagPill key={tag} tag={tag} />
                                  ))}
                                  {contact.tags.length > 2 ? (
                                    <span className="text-[11px] font-medium text-slate-400">+{contact.tags.length - 2}</span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  {contact.lastActivity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="relative inline-block">
                                  <button
                                    type="button"
                                    aria-label="Row actions"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setOpenMenuId(openMenuId === contact.id ? null : contact.id);
                                    }}
                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                  {openMenuId === contact.id ? (
                                    <>
                                      <button
                                        type="button"
                                        aria-label="Close menu"
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setOpenMenuId(null);
                                        }}
                                      />
                                      <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg">
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            openContact(contact);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                                        >
                                          <Eye className="h-4 w-4 text-slate-400" /> View details
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setOpenMenuId(null);
                                            pushToast(`Opening WhatsApp thread with ${contact.name}`);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                                        >
                                          <Send className="h-4 w-4 text-slate-400" /> Send message
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setOpenMenuId(null);
                                            copyToClipboard(contact.email, 'Email');
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                                        >
                                          <Copy className="h-4 w-4 text-slate-400" /> Copy email
                                        </button>
                                        <div className="my-1 border-t border-slate-100" />
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            deleteContact(contact.id);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                                        >
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
                    {paged.map((contact) => {
                      const owner = employeeById(contact.ownerId);
                      return (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => openContact(contact)}
                          className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar name={contact.name} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-800">{contact.name}</p>
                              <p className="truncate text-xs text-slate-400">{contact.email}</p>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                {contact.company}
                              </div>
                            </div>
                            <StageBadge stage={contact.stage} />
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <EmployeeChip employee={owner} />
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="h-3.5 w-3.5" />
                              {contact.lastActivity}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <TagPill key={tag} tag={tag} />
                            ))}
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
                            currentPage === index + 1
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
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
          </main>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!drawerOpen}>
        <div
          onClick={() => setSelectedId(null)}
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ${
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {view ? (
            <>
              <div className="border-b border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar name={view.name} size="xl" ring />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-semibold text-slate-900">{view.name}</h2>
                        <StageBadge stage={view.stage} />
                      </div>
                      <p className="truncate text-sm text-slate-500">
                        {view.title} · {view.company}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(view.email, 'Email')}
                          className="flex items-center gap-1.5 transition hover:text-indigo-600"
                        >
                          <AtSign className="h-3.5 w-3.5 text-slate-400" />
                          {view.email}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(view.phone, 'Phone')}
                          className="flex items-center gap-1.5 transition hover:text-indigo-600"
                        >
                          <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
                          {view.phone}
                        </button>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {view.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close panel"
                    onClick={() => setSelectedId(null)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {employeeById(view.ownerId)?.name}
                    <span className="inline-flex items-center gap-1">
                      <StatusDot status={employeeById(view.ownerId)?.status} />
                      {employeeById(view.ownerId)?.status}
                    </span>
                  </span>
                  <SourceTag source={view.source} />
                  {view.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('conversations');
                      pushToast('Opening WhatsApp composer');
                    }}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <MessageSquare className="h-4 w-4" /> Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => createPaymentLink(view.id)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <Link2 className="h-4 w-4 text-slate-500" /> Create Payment Link
                  </button>
                  <button
                    type="button"
                    onClick={() => bookAppointment(view.id)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <CalendarPlus className="h-4 w-4 text-slate-500" /> Book Appointment
                  </button>
                </div>

                <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 sm:px-4">
                  {TABS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition ${
                        tab === item.id
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                      {item.id === 'conversations' && view.conversations.length > 0 ? (
                        <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">
                          {view.conversations.length}
                        </span>
                      ) : null}
                      {item.id === 'payments' && view.payments.length > 0 ? (
                        <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">
                          {view.payments.length}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                {tab === 'overview' ? (
                  <div className="space-y-5">
                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <User className="h-4 w-4 text-slate-400" /> Contact details
                      </h3>
                      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                        {[
                          { label: 'Email', value: view.email, icon: Mail },
                          { label: 'Phone', value: view.phone, icon: Phone },
                          { label: 'Company', value: view.company, icon: Building2 },
                          { label: 'Job title', value: view.title, icon: Briefcase },
                          { label: 'Location', value: view.location, icon: MapPin },
                          { label: 'Created', value: view.createdAt, icon: Calendar },
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
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ClipboardList className="h-4 w-4 text-slate-400" /> Custom fields
                        </h3>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                          {view.stage} form
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {view.customFields.map((field) => (
                          <div key={field.label} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">{field.label}</p>
                              {field.required ? (
                                <span className="rounded bg-rose-50 px-1 text-[10px] font-semibold text-rose-600">required</span>
                              ) : null}
                            </div>
                            {field.type === 'textarea' ? (
                              <p className="mt-1 text-sm leading-relaxed text-slate-700">{field.value}</p>
                            ) : (
                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {field.type === 'currency' ? formatMoney(field.value) : field.value}
                                {field.unit ? <span className="ml-1 text-xs font-normal text-slate-400">{field.unit}</span> : null}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Fields rendered dynamically from this workspace&apos;s pipeline configuration.
                      </p>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Tag className="h-4 w-4 text-slate-400" /> Tags
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {view.tags.length > 0 ? (
                          view.tags.map((tag) => <TagPill key={tag} tag={tag} />)
                        ) : (
                          <span className="text-sm text-slate-400">No tags applied.</span>
                        )}
                      </div>
                    </section>
                  </div>
                ) : null}

                {tab === 'opportunities' ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {view.opportunities.length} linked opportunit
                          {view.opportunities.length === 1 ? 'y' : 'ies'}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {formatMoney(view.opportunities.reduce((sum, opportunity) => sum + opportunity.value, 0))}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMaskValues((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        {maskValues ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {maskValues ? 'Show values' : 'Mask values'}
                      </button>
                    </div>

                    {view.opportunities.length === 0 ? (
                      <EmptyState
                        icon={Briefcase}
                        title="No opportunities yet"
                        description="Link this contact to a sales opportunity to track stage, value and probability."
                      />
                    ) : (
                      view.opportunities.map((opportunity) => (
                        <div key={opportunity.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">{opportunity.title}</p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                Owner: {employeeById(opportunity.ownerId)?.name} · Close date {opportunity.closeDate}
                              </p>
                            </div>
                            <StageBadge stage={opportunity.stage} />
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                              <CircleDollarSign className="h-4 w-4 text-slate-400" />
                              {maskValues ? (
                                <span className="tracking-widest text-slate-400">$ ••••••••</span>
                              ) : (
                                formatMoney(opportunity.value)
                              )}
                            </div>
                            <div className="flex flex-1 items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${STAGE_DOTS[opportunity.stage] || 'bg-slate-400'}`}
                                  style={{ width: `${opportunity.probability}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400">{opportunity.probability}%</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <button
                      type="button"
                      onClick={() => pushToast('Opening the opportunity composer')}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                      <Plus className="h-4 w-4" /> Create opportunity
                    </button>
                  </div>
                ) : null}

                {tab === 'conversations' ? (
                  <ConversationsTab contact={view} onSend={(body) => sendMessage(view.id, body)} />
                ) : null}

                {tab === 'payments' ? (
                  <PaymentsTab
                    contact={view}
                    onCreate={() => createPaymentLink(view.id)}
                    onCopy={(link) => copyToClipboard(link, 'Payment link')}
                  />
                ) : null}

                {tab === 'appointments' ? (
                  <AppointmentsTab contact={view} onBook={() => bookAppointment(view.id)} />
                ) : null}

                {tab === 'activity' ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <History className="h-4 w-4 text-slate-400" /> Audit trail
                    </h3>
                    <ol className="space-y-4">
                      {view.activity.map((entry, index) => {
                        const meta = ACTIVITY_META[entry.type] || ACTIVITY_META.note;
                        return (
                          <li key={`${entry.time}-${index}`} className="flex gap-3">
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.chip}`}>
                              <meta.icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-0">
                              <p className="text-sm text-slate-700">{entry.text}</p>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {entry.actor} · {entry.time}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {addOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setAddOpen(false)}
          />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add contact</h2>
                <p className="text-sm text-slate-500">Create a new record in this workspace.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setAddOpen(false)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Full name *</span>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Jordan Blake"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Email *</span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Phone</span>
                  <input
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Company</span>
                  <input
                    name="company"
                    placeholder="e.g. Brightwave Solar"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Pipeline stage</span>
                  <span className="relative block">
                    <select
                      name="stage"
                      defaultValue={PIPELINE_STAGES[0]}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {PIPELINE_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Assigned employee</span>
                  <span className="relative block">
                    <select
                      name="owner"
                      defaultValue={EMPLOYEES[0].id}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {EMPLOYEES.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} — {employee.status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Creation source</span>
                  <span className="relative block">
                    <select
                      name="source"
                      defaultValue="Manual"
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {Object.keys(SOURCE_META).map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Tags</span>
                  <input
                    name="tags"
                    placeholder="Hot, Enterprise"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" /> Create contact
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
    </div>
  );
}

function ConversationsTab({ contact, onSend }) {
  const [draft, setDraft] = useState('');

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Twilio WhatsApp Sandbox</p>
            <p className="text-[11px] text-slate-400">Connected · masked number {contact.phone}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" /> Live
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {contact.conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Start the conversation — messages are delivered through Twilio WhatsApp."
          />
        ) : (
          contact.conversations.map((message, index) => {
            const outbound = message.direction === 'outbound';
            return (
              <div key={`${message.time}-${index}`} className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    outbound ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <p className="leading-relaxed">{message.body}</p>
                  <div
                    className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                      outbound ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {message.time}
                    {outbound ? (
                      message.status === 'Read' ? (
                        <CheckCheck className="h-3.5 w-3.5 text-sky-300" />
                      ) : message.status === 'Delivered' ? (
                        <CheckCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )
                    ) : null}
                    {message.status ? <span className="sr-only">{message.status}</span> : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend(draft);
              setDraft('');
            }
          }}
          placeholder="Type a WhatsApp message…"
          className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => {
            onSend(draft);
            setDraft('');
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </button>
      </div>
    </div>
  );
}

function PaymentsTab({ contact, onCreate, onCopy }) {
  const total = contact.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Stripe</p>
            <p className="text-[11px] text-slate-400">Test mode · {formatMoney(total)} lifetime</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Link2 className="h-3.5 w-3.5" /> New payment link
        </button>
      </div>

      {contact.payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments yet"
          description="Create a Stripe test-mode checkout link to request a deposit or invoice."
        />
      ) : (
        contact.payments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : payment.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                {payment.status === 'Paid' ? <CheckCircle2 className="h-4 w-4" /> : payment.status === 'Pending' ? <Clock className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{payment.description}</p>
                <p className="truncate font-mono text-[11px] text-slate-400">
                  {payment.id} · {payment.createdAt}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{formatMoney(payment.amount)}</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${PAYMENT_STATUS[payment.status]}`}>
                {payment.status}
              </span>
              <button
                type="button"
                onClick={() => onCopy(`https://checkout.stripe.com/c/pay/${payment.id}`)}
                aria-label="Copy payment link"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AppointmentsTab({ contact, onBook }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <Calendar className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Google Calendar</p>
            <p className="text-[11px] text-slate-400">OAuth 2.0 connected · primary calendar</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBook}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <CalendarPlus className="h-3.5 w-3.5" /> Book appointment
        </button>
      </div>

      {contact.appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments scheduled"
          description="Book a slot and it will sync straight to the assigned employee's calendar."
        />
      ) : (
        contact.appointments.map((appointment) => (
          <div key={appointment.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{appointment.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {appointment.start} – {appointment.end}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {appointment.location}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                  appointment.status === 'Confirmed'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                }`}
              >
                {appointment.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open in Calendar
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> Reschedule
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
