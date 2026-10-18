import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  RotateCcw,
  ExternalLink,
  Filter
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { useToast } from '../../components/common/Toast';

export default function SyncHistoryPage({ onNavigate }) {
  const { addToast } = useToast();

  const [providerFilter, setProviderFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  // Integration Sync & Webhook Log Entries (I5.4)
  const [syncLogs, setSyncLogs] = useState([
    {
      id: 'sync-501',
      time: '2026-10-18 12:44:10',
      direction: 'inbound',
      provider: 'Twilio WhatsApp',
      eventName: 'message.received',
      result: 'Success',
      httpStatus: 200,
      referenceId: 'wh_tw_8892a01bf',
      retryCount: 0,
      failureReason: null,
      headers: {
        'x-twilio-signature': 'sha1=••••••••••••94f2',
        'content-type': 'application/x-www-form-urlencoded'
      },
      payload: {
        From: 'whatsapp:+15550192834',
        To: 'whatsapp:+14155238886',
        Body: 'Hi, I need a 40kW commercial solar estimate.',
        MessageSid: 'SM98a72b••••••••••••',
        AccountSid: 'AC••••••••••••••••••••••••39ab'
      }
    },
    {
      id: 'sync-502',
      time: '2026-10-18 12:35:40',
      direction: 'outbound',
      provider: 'Slack',
      eventName: 'alert.escalated',
      result: 'Success',
      httpStatus: 200,
      referenceId: 'req_slk_331b99',
      retryCount: 0,
      failureReason: null,
      headers: {
        authorization: 'Bearer xoxb-••••••••••••-••••••••••••',
        'content-type': 'application/json'
      },
      payload: {
        channel: '#lead-escalations',
        text: '⚠️ SLA Expired: Lead #2094 escalated to Tier 2 (Elena Rostova)'
      }
    },
    {
      id: 'sync-503',
      time: '2026-10-18 11:50:22',
      direction: 'inbound',
      provider: 'Stripe',
      eventName: 'payment_intent.succeeded',
      result: 'Success',
      httpStatus: 200,
      referenceId: 'evt_3M1908KJa',
      retryCount: 0,
      failureReason: null,
      headers: {
        'stripe-signature': 't=1690000000,v1=••••••••••••55b1',
        'content-type': 'application/json'
      },
      payload: {
        id: 'pi_3M1908KJa',
        amount: 500000,
        currency: 'usd',
        customer: 'cus_N8912',
        status: 'succeeded',
        api_secret: 'sk_test_••••••••••••••••••••4f2a'
      }
    },
    {
      id: 'sync-504',
      time: '2026-10-18 10:14:05',
      direction: 'outbound',
      provider: 'Google Calendar',
      eventName: 'events.insert',
      result: 'Failed',
      httpStatus: 429,
      referenceId: 'req_gcal_00918a',
      retryCount: 2,
      failureReason: 'Google Calendar API rate limit exceeded (User-rate limit 10 queries/sec). Queued for exponential backoff.',
      headers: {
        authorization: 'Bearer ya29.••••••••••••••••',
        'content-type': 'application/json'
      },
      payload: {
        summary: 'Solar Roof Inspection - Sarah Jenkins',
        start: { dateTime: '2026-10-20T10:00:00Z' },
        end: { dateTime: '2026-10-20T11:00:00Z' },
        attendees: [{ email: 'sarah.j@example.com' }]
      }
    },
    {
      id: 'sync-505',
      time: '2026-10-18 08:30:11',
      direction: 'inbound',
      provider: 'Twilio WhatsApp',
      eventName: 'webhook.handshake',
      result: 'Failed',
      httpStatus: 403,
      referenceId: 'wh_tw_7712c9',
      retryCount: 1,
      failureReason: 'Invalid Twilio cryptographic authentication signature. Request origin verification failed.',
      headers: {
        'x-twilio-signature': 'invalid_signature_••••',
        'content-type': 'application/x-www-form-urlencoded'
      },
      payload: {
        Status: 'rejected',
        Reason: 'HMAC-SHA1 mismatch with Auth Token'
      }
    }
  ]);

  const handleRetryWebhook = (row) => {
    addToast(`Retrying ${row.provider} sync (${row.referenceId})...`, 'info');
    setTimeout(() => {
      setSyncLogs((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                result: 'Success',
                httpStatus: 200,
                retryCount: item.retryCount + 1,
                failureReason: null
              }
            : item
        )
      );
      addToast(`Sync ${row.referenceId} re-dispatched and succeeded (200 OK)!`, 'success');
    }, 1000);
  };

  const filteredLogs = syncLogs.filter((item) => {
    if (providerFilter !== 'all' && item.provider !== providerFilter) return false;
    if (directionFilter !== 'all' && item.direction !== directionFilter) return false;
    if (resultFilter !== 'all' && item.result !== resultFilter) return false;
    return true;
  });

  const columns = [
    {
      key: 'time',
      label: 'Timestamp (UTC)',
      width: '160px',
      render: (val) => (
        <div className="font-mono text-xs text-[#79756d] flex items-center gap-1">
          <Clock size={12} className="text-[#a8a49c]" />
          <span>{val}</span>
        </div>
      )
    },
    {
      key: 'direction',
      label: 'Direction',
      width: '130px',
      render: (val) => (
        <div className="flex items-center gap-1.5 font-semibold text-xs">
          {val === 'inbound' ? (
            <span className="inline-flex items-center gap-1 text-[#4a6b82] bg-[#ebf1f5] px-2 py-0.5 rounded">
              <ArrowDownLeft size={13} /> Inbound
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#52796f] bg-[#eaf0ee] px-2 py-0.5 rounded">
              <ArrowUpRight size={13} /> Outbound
            </span>
          )}
        </div>
      )
    },
    {
      key: 'provider',
      label: 'Provider',
      width: '150px',
      render: (val) => <span className="font-bold text-[#1a1917]">{val}</span>
    },
    {
      key: 'eventName',
      label: 'Event Name',
      width: '160px',
      render: (val) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#faf9f6] border border-[#e8e5de] text-[#3c3933]">
          {val}
        </span>
      )
    },
    {
      key: 'httpStatus',
      label: 'HTTP Status',
      width: '110px',
      render: (val, row) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
            val >= 200 && val < 300
              ? 'bg-[#eaf0ee] text-[#52796f] border-[#52796f]/30'
              : 'bg-[#faece8] text-[#c26751] border-[#c26751]/30'
          }`}
        >
          {val} {val === 200 ? 'OK' : val === 429 ? 'Rate Limit' : 'Error'}
        </span>
      )
    },
    {
      key: 'result',
      label: 'Result',
      width: '110px',
      render: (val) => (
        <span
          className={`flex items-center gap-1 font-semibold text-xs ${
            val === 'Success' ? 'text-[#52796f]' : 'text-[#c26751]'
          }`}
        >
          {val === 'Success' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          {val}
        </span>
      )
    },
    {
      key: 'referenceId',
      label: 'Reference ID',
      width: '150px',
      render: (val) => <span className="font-mono text-xs text-[#79756d]">{val}</span>
    },
    {
      key: 'actions',
      label: 'Retry / Action',
      sortable: false,
      render: (_, row) => (
        <div>
          {row.result === 'Failed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRetryWebhook(row);
              }}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#c26751] bg-[#faece8] hover:bg-[#c26751] hover:text-white border border-[#c26751]/30 rounded transition-all cursor-pointer"
            >
              <RotateCcw size={11} /> Retry ({row.retryCount})
            </button>
          )}
        </div>
      )
    }
  ];

  // Expandable JSON Payload with Masked Secrets (I5.4)
  const renderPayloadViewer = (row) => {
    return (
      <div className="p-3 space-y-3">
        {row.failureReason && (
          <div className="p-2.5 bg-[#faece8] border border-[#c26751]/30 rounded text-xs text-[#c26751]">
            <strong>Plain-Language Failure Reason:</strong> {row.failureReason} (Attempted {row.retryCount} times)
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Headers */}
          <div>
            <div className="font-bold text-[#1a1917] mb-1.5 flex items-center justify-between">
              <span>Request Headers:</span>
              <span className="text-[10px] text-[#52796f] font-normal">Tokens Masked (••••)</span>
            </div>
            <pre className="bg-white border border-[#e8e5de] p-3 rounded font-mono text-[11px] text-[#3c3933] overflow-x-auto">
              {JSON.stringify(row.headers, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div>
            <div className="font-bold text-[#1a1917] mb-1.5 flex items-center justify-between">
              <span>Payload Data:</span>
              <span className="text-[10px] text-[#52796f] font-normal">Credentials Masked</span>
            </div>
            <pre className="bg-white border border-[#e8e5de] p-3 rounded font-mono text-[11px] text-[#3c3933] overflow-x-auto">
              {JSON.stringify(row.payload, null, 2)}
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
          <h1 className="text-xl font-extrabold text-[#1a1917] tracking-tight">Sync History & Webhook Stream</h1>
          <p className="text-xs text-[#79756d] mt-0.5">
            Monitor real-time inbound payloads and outbound API calls with masked secrets and retry controls (I5.4)
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('integrations')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d3cfc7] text-[#1a1917] text-xs font-semibold rounded-md hover:bg-[#f4f2ee] transition-colors"
        >
          Manage Integrations Hub <ExternalLink size={13} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-white border border-[#e8e5de] rounded-lg">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#1a1917]">Provider:</span>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-[#d3cfc7] rounded outline-none"
          >
            <option value="all">All Providers</option>
            <option value="Twilio WhatsApp">Twilio WhatsApp</option>
            <option value="Stripe">Stripe</option>
            <option value="Google Calendar">Google Calendar</option>
            <option value="Slack">Slack</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#1a1917]">Direction:</span>
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-[#d3cfc7] rounded outline-none"
          >
            <option value="all">All Directions</option>
            <option value="inbound">Inbound Webhooks</option>
            <option value="outbound">Outbound Calls</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#1a1917]">Result:</span>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-[#d3cfc7] rounded outline-none"
          >
            <option value="all">All Results</option>
            <option value="Success">Success (2xx)</option>
            <option value="Failed">Failed (4xx/5xx)</option>
          </select>
        </div>
      </div>

      {/* Sync DataTable */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        searchPlaceholder="Search reference ID, event name, or payload..."
        searchKeys={['provider', 'eventName', 'referenceId', 'failureReason']}
        expandableRowRender={renderPayloadViewer}
        pageSize={10}
        emptyTitle="No webhook events found"
        emptyDescription="No events match your current filter criteria."
      />
    </div>
  );
}
