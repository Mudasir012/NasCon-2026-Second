import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  DollarSign,
  User,
  Building
} from 'lucide-react';

export default function PipelinePage({ onNavigate }) {
  // Two pipelines showing different custom field sets (F2.3)
  const [selectedPipeline, setSelectedPipeline] = useState('commercial'); // 'commercial' | 'residential'

  const [stages, setStages] = useState([
    { id: 'st-1', name: 'Discovery & Intake', requiredFields: [] },
    { id: 'st-2', name: 'Site Survey Scheduled', requiredFields: ['surveyDate', 'inspectorAssigned'] },
    { id: 'st-3', name: 'Proposal & CAD Design', requiredFields: ['systemKwSize', 'inverterType'] },
    { id: 'st-4', name: 'Contract Negotiation', requiredFields: ['quoteAmount', 'depositTerms'] },
    { id: 'st-5', name: 'Closed Won', requiredFields: ['stripeDepositRef'] }
  ]);

  const [opportunities, setOpportunities] = useState([
    {
      id: 'OPP-301',
      title: 'Vanguard Medical Center Solar',
      company: 'Vanguard Healthcare Corp',
      contact: 'Dr. Aaron Patel',
      value: '$58,000',
      stageId: 'st-1',
      owner: 'Marcus Vance',
      customFields: { surveyDate: '', systemKwSize: '65 kW' }
    },
    {
      id: 'OPP-302',
      title: 'Apex Logistics Cold Storage Array',
      company: 'Apex Precision Logistics',
      contact: 'David Ross',
      value: '$42,500',
      stageId: 'st-2',
      owner: 'Elena Rostova',
      customFields: { surveyDate: '2026-10-25', inspectorAssigned: 'Tech Lead Kyle', systemKwSize: '40 kW' }
    },
    {
      id: 'OPP-303',
      title: 'Highland Villas Community Array',
      company: 'Highland Estates HOA',
      contact: 'Sarah Jenkins',
      value: '$78,000',
      stageId: 'st-3',
      owner: 'Marcus Vance',
      customFields: { surveyDate: '2026-10-18', inspectorAssigned: 'Tech Lead Kyle', systemKwSize: '90 kW', inverterType: 'SolarEdge Commercial' }
    }
  ]);

  // Stage gate validation modal / error notice (F2.4)
  const [validationError, setValidationError] = useState(null);
  const [targetMove, setTargetMove] = useState(null);

  const handleStageMoveAttempt = (opp, targetStage) => {
    // Check if target stage has required fields (F2.4)
    const missing = [];
    targetStage.requiredFields.forEach((fieldKey) => {
      if (!opp.customFields[fieldKey]) {
        missing.push(fieldKey);
      }
    });

    if (missing.length > 0) {
      setValidationError({
        oppTitle: opp.title,
        stageName: targetStage.name,
        missingFields: missing
      });
      return;
    }

    // Success: advance stage
    setOpportunities((prev) =>
      prev.map((o) => (o.id === opp.id ? { ...o, stageId: targetStage.id } : o))
    );
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5de] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#1a1917]">Customizable Pipeline & Stages</h1>
            <span className="text-xs bg-[#ebf1f5] text-[#4a6b82] border border-[#4a6b82]/30 px-2.5 py-0.5 rounded-full font-semibold">
              F2.4 Stage-Gated Validation Active
            </span>
          </div>
          <p className="text-xs text-[#79756d]">
            Drag or transition deals between stages. Movement is enforced against stage-specific required fields without code.
          </p>
        </div>

        {/* Pipeline Switcher (F2.3) */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#79756d] font-medium">Pipeline:</span>
          <select
            value={selectedPipeline}
            onChange={(e) => setSelectedPipeline(e.target.value)}
            className="p-1.5 border border-[#d3cfc7] rounded bg-white text-[#1a1917] font-semibold outline-none"
          >
            <option value="commercial">Commercial Rooftop Pipeline (High Wattage)</option>
            <option value="residential">Residential Micro-Inverter Pipeline</option>
          </select>
        </div>
      </div>

      {/* Stage-Specific Required Fields Block Notice (F2.4) */}
      {validationError && (
        <div className="p-4 bg-[#faece8] border border-[#c26751]/40 rounded-lg text-xs text-[#c26751] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Stage Transition Blocked (F2.4):</strong> Cannot move{' '}
              <span className="underline font-semibold">{validationError.oppTitle}</span> into{' '}
              <span className="underline font-semibold">{validationError.stageName}</span> until required custom fields are filled:
              <div className="flex flex-wrap gap-1.5 mt-2">
                {validationError.missingFields.map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded bg-white border border-[#c26751]/30 font-mono font-bold text-[11px]">
                    {f}
                  </span>
                ))}
              </div>
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

      {/* Kanban Board (F2.5) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
        {stages.map((stage, idx) => {
          const stageOpps = opportunities.filter((o) => o.stageId === stage.id);
          const nextStage = stages[idx + 1];

          return (
            <div key={stage.id} className="bg-[#f4f2ee] border border-[#e8e5de] rounded-lg p-3 min-w-[220px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xs text-[#1a1917]">{stage.name}</div>
                  <span className="text-[11px] font-bold text-[#79756d] bg-white px-1.5 py-0.2 rounded border border-[#e8e5de]">
                    {stageOpps.length}
                  </span>
                </div>

                {stage.requiredFields.length > 0 && (
                  <div className="text-[10px] text-[#79756d] mb-3 flex items-center gap-1 font-medium">
                    <Lock size={10} className="text-[#b08945]" />
                    <span>Requires {stage.requiredFields.length} fields</span>
                  </div>
                )}

                {/* Cards List */}
                <div className="space-y-2.5">
                  {stageOpps.map((opp) => (
                    <div
                      key={opp.id}
                      onClick={() => onNavigate && onNavigate('opportunity')}
                      className="bg-white border border-[#e8e5de] rounded-md p-3 hover:border-[#d3cfc7] shadow-2xs cursor-pointer transition-all"
                    >
                      <div className="font-bold text-xs text-[#1a1917] mb-1">{opp.title}</div>
                      <div className="text-[11px] text-[#79756d] flex items-center gap-1 mb-2">
                        <Building size={11} /> {opp.company}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#f4f2ee]">
                        <span className="font-extrabold text-[#52796f]">{opp.value}</span>
                        <span className="text-[10px] text-[#a8a49c]">{opp.owner}</span>
                      </div>

                      {nextStage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStageMoveAttempt(opp, nextStage);
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

              {stageOpps.length === 0 && (
                <div className="p-4 text-center text-[11px] text-[#a8a49c] border border-dashed border-[#d3cfc7] rounded mt-2">
                  No active opportunities
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
