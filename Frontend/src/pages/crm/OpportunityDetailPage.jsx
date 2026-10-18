import React, { useEffect, useState } from 'react';
import {
  User,
  DollarSign,
  Calendar,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../services/api';

const STAGE_LABELS = {
  new: 'New Lead',
  contacted: 'Contacted',
  qualified: 'Qualified',
  applied: 'Applied',
  enrolled: 'Won',
  lost: 'Lost',
};

function relativeTime(iso) {
  if (!iso) return '—';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function OpportunityDetailPage() {
  const { leads, stages } = useCRM();
  const { members } = useWorkspace();

  const [detail, setDetail] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [error, setError] = useState('');

  const lead = detail ?? leads[0] ?? null;

  useEffect(() => {
    const first = leads[0];
    if (!first) return;
    api.crm.getLead(first.id).then((res) => setDetail(res?.lead ?? null)).catch(() => setDetail(null));
  }, [leads]);

  if (!lead) {
    return <div className="px-4 py-16 text-center text-sm text-[#79756d]">No leads in this workspace yet.</div>;
  }

  const owner = members.find((member) => member.id === lead.assigneeId);
  const stageLabel = stages.find((stage) => stage.id === lead.stage)?.name ?? STAGE_LABELS[lead.stage] ?? lead.stage;

  const handleCreatePayment = async () => {
    setError('');
    try {
      const res = await api.payments.createLink({ opportunityId: lead.id, amount: 500, description: `Deposit for ${lead.name}` });
      setPaymentUrl(res?.payment?.checkoutUrl || 'Payment link created');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBookSlot = async () => {
    setError('');
    const start = new Date(Date.now() + 86400000);
    const end = new Date(start.getTime() + 60 * 60000);
    try {
      await api.calendar.bookAppointment({ leadId: lead.id, start: start.toISOString(), end: end.toISOString() });
      setAppointmentBooked(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const customFields = Object.entries(lead.fields ?? {}).filter(([key]) => key !== 'tags');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#79756d]">{lead.id.slice(0, 8)}</span>
            <span className="text-xs bg-[#eaf0ee] text-[#52796f] px-2 py-0.5 rounded font-semibold border border-[#52796f]/25">
              {stageLabel}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1917] mt-1">{lead.name}</h1>
          <p className="text-xs text-[#79756d]">
            Company: <strong className="text-[#1a1917]">{lead.fields?.company || '—'}</strong> • Programme:{' '}
            <strong className="text-[#1a1917]">{lead.programme || '—'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#d3cfc7] rounded-md px-3 py-1.5 text-xs">
          <span className="text-[#79756d] font-semibold">Value visibility:</span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold ${lead.valueMasked ? 'bg-[#faece8] text-[#c26751] border border-[#c26751]/30' : 'bg-[#1a1917] text-white'}`}>
            {lead.valueMasked ? <EyeOff size={12} /> : <DollarSign size={12} />}
            {lead.valueMasked ? 'Masked (F1.4)' : 'Visible'}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-[#c26751]/30 bg-[#faece8] px-3 py-2 text-xs text-[#c26751]">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#e8e5de] rounded-lg p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#e8e5de] pb-4 mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d]">Opportunity Value (F1.4)</div>
                <div className="text-2xl font-extrabold text-[#1a1917] mt-1">
                  {lead.valueMasked ? (
                    <span className="text-[#79756d] font-mono tracking-widest bg-[#f4f2ee] px-2 py-0.5 rounded">$ ••••••••</span>
                  ) : (
                    <span className="text-[#52796f]">${Number(lead.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
                <div className="text-[10px] text-[#79756d] mt-1">{lead.valueMasked ? 'Masked: financial permission required' : 'Visible to your role'}</div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d]">Assigned Account Owner</div>
                <div className="text-base font-bold text-[#1a1917] mt-1">{owner?.name || 'Unassigned'}</div>
                <div className="text-[10px] text-[#52796f]">{owner?.available === false ? 'Away' : 'Available'}</div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d]">Pipeline</div>
                <div className="text-xs font-semibold text-[#1a1917] mt-1">Workspace pipeline</div>
                <div className="text-[10px] text-[#79756d]">{stages.length} stages configured</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#1a1917] mb-3">Custom Fields (F2.2)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {customFields.length === 0 ? (
                  <p className="text-[#79756d]">No custom fields set for this record.</p>
                ) : (
                  customFields.map(([key, value]) => (
                    <div key={key} className="p-2.5 bg-[#faf9f6] border border-[#e8e5de] rounded">
                      <span className="text-[#79756d] text-[11px] font-semibold uppercase">{key}:</span>
                      <div className="font-bold text-[#1a1917] mt-0.5">{String(value)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e8e5de] rounded-lg p-5">
            <h2 className="text-sm font-bold text-[#1a1917] mb-3">Activity Log (F2.7)</h2>
            {(lead.activities ?? []).length === 0 ? (
              <p className="text-xs text-[#79756d]">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {lead.activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-[#f4f2ee] last:border-none">
                    <div className="h-6 w-6 rounded bg-[#f4f2ee] text-[#4a6b82] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      {act.kind === 'note' ? <MessageSquare size={13} /> : <CheckCircle2 size={13} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1a1917]">{act.by}</span>
                        <span className="text-[10px] text-[#a8a49c]">{relativeTime(act.at)}</span>
                      </div>
                      <div className="text-[#3c3933] mt-0.5">{act.summary}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#1a1917] border-b border-[#e8e5de] pb-2">Customer 360 Profile (F2.8)</h2>
            <div>
              <div className="font-bold text-sm text-[#1a1917] flex items-center gap-1.5"><User size={14} /> {lead.name}</div>
            </div>
            <div className="space-y-1.5 text-[#3c3933]">
              <div><strong>Email:</strong> {lead.email || '—'}</div>
              <div><strong>Phone:</strong> {lead.phone || '—'}</div>
              <div><strong>Company:</strong> {lead.fields?.company || '—'}</div>
            </div>
          </div>

          <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#1a1917]">
              <CreditCard size={15} className="text-[#c26751]" />
              <span>Stripe Checkout Link (I2.1)</span>
            </div>
            <p className="text-[#79756d] text-[11px]">Generate a test-mode payment link for a $500.00 deposit.</p>
            {paymentUrl ? (
              <div className="p-2.5 bg-[#eaf0ee] border border-[#52796f]/30 rounded text-[#52796f] font-mono text-[11px] break-all">{paymentUrl}</div>
            ) : (
              <button onClick={handleCreatePayment} className="w-full py-2 bg-[#1a1917] text-white rounded font-semibold hover:bg-[#33302a] transition-all">
                Create $500 Payment Link
              </button>
            )}
          </div>

          <div className="bg-white border border-[#e8e5de] rounded-lg p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#1a1917]">
              <Calendar size={15} className="text-[#52796f]" />
              <span>Google Calendar Booking (I3.3)</span>
            </div>
            <p className="text-[#79756d] text-[11px]">Books an appointment with automatic conflict checking.</p>
            {appointmentBooked ? (
              <div className="p-2.5 bg-[#eaf0ee] border border-[#52796f]/30 rounded text-[#52796f] font-semibold text-[11px]">
                Event synced to Google Calendar.
              </div>
            ) : (
              <button onClick={handleBookSlot} className="w-full py-2 bg-white border border-[#d3cfc7] text-[#1a1917] rounded font-semibold hover:bg-[#f4f2ee]">
                Book Inspection Slot
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
