import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Lock,
  Clock,
  User,
  Bot,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import ForbiddenPage from '../error/ForbiddenPage';

export default function AuditHistoryPage({ onNavigate }) {
  const { hasPermission } = useAuth();

  // Access denied state for users without 'audit.view'
  if (!hasPermission('audit.view')) {
    return (
      <ForbiddenPage
        requiredPermission="audit.view"
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
      />
    );
  }

  // Filter States
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('7d');

  // Realistic Audit Trail Records (F4.1, F4.2, F4.3)
  const auditLogs = [
    {
      id: 'aud-1098',
      time: '2026-10-18 12:42:15',
      actor: 'System (SLA Engine)',
      isSystem: true,
      eventType: 'lead.escalated',
      target: 'Lead #2094 (Sarah Jenkins)',
      summary: 'SLA timer expired (45s). Automatically escalated from Marcus Vance to Elena Rostova (Tier 2).',
      diff: {
        before: {
          assignedTo: 'Marcus Vance',
          escalationTier: 1,
          status: 'Awaiting Acknowledgement',
          slaRemainingSeconds: 0
        },
        after: {
          assignedTo: 'Elena Rostova',
          escalationTier: 2,
          status: 'Escalated - Backup Assigned',
          slaRemainingSeconds: 60
        }
      }
    },
    {
      id: 'aud-1097',
      time: '2026-10-18 12:40:02',
      actor: 'Sara Chen (Admin)',
      isSystem: false,
      eventType: 'rule.modified',
      target: 'Rule #3 (Solar Inbound SLA)',
      summary: 'Updated acknowledgement window from 60 seconds to 45 seconds for Commercial Solar pipeline.',
      diff: {
        before: {
          ruleName: 'Solar Inbound SLA',
          ackWindowSeconds: 60,
          fallbackOrder: ['Marcus Vance', 'Elena Rostova', 'Sara Chen']
        },
        after: {
          ruleName: 'Solar Inbound SLA',
          ackWindowSeconds: 45,
          fallbackOrder: ['Marcus Vance', 'Elena Rostova', 'Sara Chen']
        }
      }
    },
    {
      id: 'aud-1096',
      time: '2026-10-18 12:15:30',
      actor: 'Alex Mercer (Owner)',
      isSystem: false,
      eventType: 'user.invited',
      target: 'liam.thornton@solaria.io',
      summary: 'Invited new workspace member Liam Thornton with role Support Specialist (Level: User).',
      diff: {
        before: null,
        after: {
          email: 'liam.thornton@solaria.io',
          role: 'Support Specialist',
          level: 'User',
          status: 'Pending Invite'
        }
      }
    },
    {
      id: 'aud-1095',
      time: '2026-10-18 11:58:12',
      actor: 'System (Twilio Webhook)',
      isSystem: true,
      eventType: 'integration.synced',
      target: 'Twilio WhatsApp (+1 415 523 8886)',
      summary: 'Inbound WhatsApp webhook received from Sarah Jenkins (+1 555-019-2834). Lead initialized.',
      diff: {
        before: null,
        after: {
          phone: '+1 555-019-2834',
          channel: 'WhatsApp',
          initialMessage: 'Hi, I need a 40kW commercial solar estimate.',
          leadId: 'lead-2094'
        }
      }
    },
    {
      id: 'aud-1094',
      time: '2026-10-18 10:22:45',
      actor: 'Elena Rostova (User)',
      isSystem: false,
      eventType: 'crm.opportunity.updated',
      target: 'Deal #402 (Apex Commercial Roof)',
      summary: 'Moved deal stage from Discovery to Proposal Sent. Value updated to $48,000.',
      diff: {
        before: {
          stage: 'Discovery',
          probability: '25%',
          estimatedValue: 42000
        },
        after: {
          stage: 'Proposal Sent',
          probability: '60%',
          estimatedValue: 48000
        }
      }
    },
    {
      id: 'aud-1093',
      time: '2026-10-18 09:12:00',
      actor: 'System (Stripe Webhook)',
      isSystem: true,
      eventType: 'payment.received',
      target: 'Invoice #INV-8821',
      summary: 'Deposit payment of $5,000 confirmed via Stripe test mode. Invoice marked Paid.',
      diff: {
        before: {
          paymentStatus: 'Unpaid',
          depositReceived: 0
        },
        after: {
          paymentStatus: 'Paid',
          depositReceived: 5000,
          stripeChargeId: 'ch_3M3J128sF'
        }
      }
    },
    {
      id: 'aud-1092',
      time: '2026-10-17 17:30:19',
      actor: 'Marcus Vance (Manager)',
      isSystem: false,
      eventType: 'auth.login',
      target: 'Session (IP: 192.168.1.42)',
      summary: 'Successful login from Chrome on Windows. Session created with Remember Me.',
      diff: {
        before: { sessionActive: false },
        after: { sessionActive: true, userAgent: 'Chrome/124.0.0.0 Windows' }
      }
    }
  ];

  // Filtering
  const filteredData = auditLogs.filter((item) => {
    if (eventTypeFilter !== 'all' && !item.eventType.startsWith(eventTypeFilter)) {
      return false;
    }
    if (actorFilter === 'system' && !item.isSystem) return false;
    if (actorFilter === 'user' && item.isSystem) return false;
    return true;
  });

  const columns = [
    {
      key: 'time',
      label: 'Timestamp (UTC)',
      width: '170px',
      render: (val) => (
        <div className="font-mono text-xs text-[#79756d] flex items-center gap-1.5">
          <Clock size={12} className="text-[#a8a49c]" />
          <span>{val}</span>
        </div>
      )
    },
    {
      key: 'actor',
      label: 'Actor / Trigger',
      width: '190px',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              row.isSystem
                ? 'bg-[#ebf1f5] text-[#4a6b82]'
                : 'bg-[#f4f2ee] text-[#1a1917]'
            }`}
          >
            {row.isSystem ? <Bot size={13} /> : <User size={13} />}
          </div>
          <span className="font-semibold text-[#1a1917]">{val}</span>
        </div>
      )
    },
    {
      key: 'eventType',
      label: 'Event Type',
      width: '160px',
      render: (val) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#faf9f6] border border-[#e8e5de] text-[#3c3933]">
          {val}
        </span>
      )
    },
    {
      key: 'target',
      label: 'Target Entity',
      width: '180px',
      render: (val) => <span className="font-medium text-[#1a1917]">{val}</span>
    },
    {
      key: 'summary',
      label: 'Summary / Description',
      render: (val) => <span className="text-[#3c3933]">{val}</span>
    }
  ];

  // Expandable Row Renderer showing Before/After Diff
  const renderRowDiff = (row) => {
    return (
      <div className="p-2 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#79756d] uppercase tracking-wider">
          <span>State Change Audit Diff (Record #{row.id})</span>
          <span className="flex items-center gap-1 text-[#52796f]">
            <CheckCircle2 size={12} /> Cryptographically Hashed (F4.3)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before State */}
          <div className="bg-white border border-[#e8e5de] rounded-md p-3">
            <div className="text-[11px] font-bold text-[#c26751] mb-2 flex items-center gap-1">
              <span>[-] Previous State:</span>
            </div>
            {row.diff.before ? (
              <pre className="text-[11px] font-mono text-[#79756d] bg-[#faece8]/30 p-2.5 rounded overflow-x-auto">
                {JSON.stringify(row.diff.before, null, 2)}
              </pre>
            ) : (
              <div className="text-xs text-[#a8a49c] italic py-2">
                None (Initial creation record)
              </div>
            )}
          </div>

          {/* After State */}
          <div className="bg-white border border-[#e8e5de] rounded-md p-3">
            <div className="text-[11px] font-bold text-[#52796f] mb-2 flex items-center gap-1">
              <span>[+] Applied New State:</span>
            </div>
            <pre className="text-[11px] font-mono text-[#1a1917] bg-[#eaf0ee]/40 p-2.5 rounded overflow-x-auto">
              {JSON.stringify(row.diff.after, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#1a1917] tracking-tight">Audit Trail & Governance</h1>
          <p className="text-xs text-[#79756d] mt-0.5">
            Immutable, write-only log of all authentication, SLA escalation, CRM modifications, and integrations (F4.1 to F4.3)
          </p>
        </div>

        {/* Immutability Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#faece8] border border-[#c26751]/30 text-xs font-bold text-[#c26751]">
          <Lock size={13} />
          <span>Entries cannot be modified or deleted</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-white border border-[#e8e5de] rounded-lg">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#1a1917]">Event Type:</span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-[#d3cfc7] rounded outline-none"
          >
            <option value="all">All Events</option>
            <option value="lead">Lead & SLA Escalations</option>
            <option value="rule">Rule Modifications</option>
            <option value="crm">CRM Operations</option>
            <option value="integration">Integration Syncs</option>
            <option value="auth">Auth & Sessions</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#1a1917]">Actor:</span>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-[#d3cfc7] rounded outline-none"
          >
            <option value="all">All Actors</option>
            <option value="system">System Automated</option>
            <option value="user">Human Staff</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#1a1917]">Date Window:</span>
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-[#d3cfc7] rounded outline-none"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">Full History</option>
          </select>
        </div>
      </div>

      {/* Read-Only DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Search audit events, targets, summaries..."
        searchKeys={['actor', 'eventType', 'target', 'summary', 'time']}
        expandableRowRender={renderRowDiff}
        pageSize={10}
        emptyTitle="No audit records found"
        emptyDescription="No events match your current filter criteria."
      />

      <div className="text-right text-[11px] text-[#a8a49c]">
        Protected by Section F4.3 • Read-Only Table • No edit or delete capabilities exposed
      </div>
    </div>
  );
}
