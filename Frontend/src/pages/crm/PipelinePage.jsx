import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Lock, Building } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

function formatValue(lead) {
  if (lead.valueMasked) return '•••••';
  return `$${(Number(lead.value) || 0).toLocaleString('en-US')}`;
}

export default function PipelinePage({ onNavigate }) {
  const { leads, stages, loading, error, updateStage } = useCRM();

  const [validationError, setValidationError] = useState(null);

  const handleStageMoveAttempt = async (lead, nextStage) => {
    try {
      await updateStage(lead.id, nextStage.id);
      setValidationError(null);
    } catch (err) {
      setValidationError({
        oppTitle: lead.name,
        stageName: nextStage.name,
        message: err.fields?.stage || err.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#1a1917]">Pipeline & Stages</h1>
            <span className="text-xs bg-[#ebf1f5] text-[#4a6b82] border border-[#4a6b82]/30 px-2.5 py-0.5 rounded-full font-semibold">
              F2.4 Stage-Gated Validation Active
            </span>
          </div>
          <p className="text-xs text-[#79756d]">
            Leads flow between the workspace's configured stages. Movement is enforced against stage-specific required fields.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#faece8] border border-[#c26751]/30 text-[#c26751] rounded-lg text-xs font-medium flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Stage-Specific Required Fields Block Notice (F2.4) */}
      {validationError && (
        <div className="p-4 bg-[#faece8] border border-[#c26751]/40 rounded-lg text-xs text-[#c26751] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Stage Transition Blocked (F2.4):</strong> Cannot move{' '}
              <span className="underline font-semibold">{validationError.oppTitle}</span> into{' '}
              <span className="underline font-semibold">{validationError.stageName}</span>.
              <div className="mt-1.5">{validationError.message}</div>
            </div>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-xs font-semibold px-2 py-1 bg-white border border-[#c26751]/30 rounded hover:bg-[#faece8]"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading && leads.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#79756d]">Loading pipeline…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {stages.map((stage, idx) => {
            const stageLeads = leads.filter((lead) => lead.stage === stage.id);
            const nextStage = stages[idx + 1];

            return (
              <div key={stage.id} className="bg-[#f4f2ee] border border-[#e8e5de] rounded-lg p-3 min-w-[220px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-xs text-[#1a1917]">{stage.name}</div>
                    <span className="text-[11px] font-bold text-[#79756d] bg-white px-1.5 py-0.2 rounded border border-[#e8e5de]">
                      {stageLeads.length}
                    </span>
                  </div>

                  {stage.requiredFields.length > 0 && (
                    <div className="text-[10px] text-[#79756d] mb-3 flex items-center gap-1 font-medium">
                      <Lock size={10} className="text-[#b08945]" />
                      <span>Requires {stage.requiredFields.length} fields</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => onNavigate && onNavigate('opportunity')}
                        className="bg-white border border-[#e8e5de] rounded-md p-3 hover:border-[#d3cfc7] shadow-2xs cursor-pointer transition-all"
                      >
                        <div className="font-bold text-xs text-[#1a1917] mb-1">{lead.name}</div>
                        <div className="text-[11px] text-[#79756d] flex items-center gap-1 mb-2">
                          <Building size={11} /> {lead.fields?.company || lead.programme || '—'}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#f4f2ee]">
                          <span className="font-extrabold text-[#52796f]">{formatValue(lead)}</span>
                          <span className="text-[10px] text-[#a8a49c]">{lead.assigneeName || 'Unassigned'}</span>
                        </div>

                        {nextStage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStageMoveAttempt(lead, nextStage);
                            }}
                            className="w-full mt-2.5 flex items-center justify-center gap-1 py-1 bg-[#faf9f6] border border-[#e8e5de] hover:bg-[#eaf0ee] hover:text-[#52796f] rounded text-[11px] font-semibold text-[#79756d] transition-colors"
                          >
                            <span>Move to {nextStage.name.split(' ')[0]}</span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {stageLeads.length === 0 && (
                  <div className="p-4 text-center text-[11px] text-[#a8a49c] border border-dashed border-[#d3cfc7] rounded mt-2">
                    No active opportunities
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
