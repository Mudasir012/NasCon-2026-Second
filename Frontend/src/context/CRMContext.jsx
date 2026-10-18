import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const CRMContext = createContext(null);

const DEFAULT_STAGES = [
  { id: 'new', name: 'Discovery & Intake', requiredFields: [] },
  { id: 'contacted', name: 'Initial Contact', requiredFields: [] },
  { id: 'survey', name: 'Site Survey Scheduled', requiredFields: ['surveyDate', 'inspectorAssigned'] },
  { id: 'proposal', name: 'Proposal Delivered', requiredFields: ['systemKwSize', 'inverterType'] },
  { id: 'negotiation', name: 'Contract Negotiation', requiredFields: ['quoteAmount'] },
  { id: 'won', name: 'Closed Won', requiredFields: ['stripeDepositRef'] },
  { id: 'lost', name: 'Closed Lost', requiredFields: [] },
];

const INITIAL_OPPORTUNITIES = [
  {
    id: 'OPP-301',
    title: 'Vanguard Medical Center Solar',
    company: 'Vanguard Healthcare Corp',
    contact: 'Dr. Aaron Patel',
    value: '$58,000',
    stageId: 'new',
    owner: 'Marcus Vance',
    customFields: { surveyDate: '', systemKwSize: '65 kW' },
  },
  {
    id: 'OPP-302',
    title: 'Apex Logistics Cold Storage Array',
    company: 'Apex Precision Logistics',
    contact: 'David Ross',
    value: '$42,500',
    stageId: 'survey',
    owner: 'Elena Rostova',
    customFields: { surveyDate: '2026-10-25', inspectorAssigned: 'Tech Lead Kyle', systemKwSize: '40 kW' },
  },
  {
    id: 'OPP-303',
    title: 'Highland Villas Community Array',
    company: 'Highland Estates HOA',
    contact: 'Sarah Jenkins',
    value: '$78,000',
    stageId: 'proposal',
    owner: 'Marcus Vance',
    customFields: { surveyDate: '2026-10-18', inspectorAssigned: 'Tech Lead Kyle', systemKwSize: '90 kW', inverterType: 'SolarEdge Commercial' },
  },
];

export function CRMProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [stats, setStats] = useState({ total: 0, open: 0, unacknowledged: 0, byStage: {} });
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Sync with backend API
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, statsRes, metaRes] = await Promise.all([
        api.crm.listLeads().catch(() => null),
        api.crm.getStats().catch(() => null),
        api.crm.getMeta().catch(() => null),
      ]);

      if (leadsRes?.leads) {
        setLeads(leadsRes.leads);
        setBackendAvailable(true);
      }
      if (statsRes) setStats(statsRes);
      if (metaRes?.stages) {
        setStages(metaRes.stages.map((s) => ({ id: s.key || s.id, name: s.label || s.name, requiredFields: s.required || [] })));
      }
    } catch {
      setBackendAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Acknowledge lead (F3.4)
  const acknowledgeLead = async (id) => {
    try {
      await api.crm.acknowledgeLead(id);
    } catch {}
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Acknowledged', acknowledgedAt: new Date().toISOString(), timeRemaining: 0 } : l))
    );
  };

  // Reassign lead (F3.6)
  const reassignLead = async (id, assigneeId) => {
    try {
      await api.crm.reassignLead(id, assigneeId);
    } catch {}
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, assigneeId, assignedTo: assigneeId } : l))
    );
  };

  // Move stage with stage-specific required fields enforcement (F2.4)
  const moveOpportunityStage = (oppId, targetStageId) => {
    const opp = opportunities.find((o) => o.id === oppId);
    const targetStage = stages.find((s) => s.id === targetStageId);
    if (!opp || !targetStage) return { success: false, error: 'Target stage not found' };

    const missing = (targetStage.requiredFields || []).filter((f) => !opp.customFields?.[f]);
    if (missing.length > 0) {
      return {
        success: false,
        error: `Cannot move to "${targetStage.name}" until required fields are filled: ${missing.join(', ')}`,
        missingFields: missing,
      };
    }

    setOpportunities((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, stageId: targetStageId } : o))
    );
    return { success: true };
  };

  // Create lead (F3.1)
  const createLead = async (data) => {
    try {
      const res = await api.crm.createLead(data);
      if (res?.lead) {
        setLeads((prev) => [res.lead, ...prev]);
        return res.lead;
      }
    } catch {}
    const localLead = {
      id: `LD-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      source: data.source || 'manual',
      inquiry: data.inquiry || data.notes || 'Service Request',
      assignedTo: 'Marcus Vance',
      assignedAt: 'Just now',
      timeRemaining: 45,
      status: 'Pending Acknowledgment',
    };
    setLeads((prev) => [localLead, ...prev]);
    return localLead;
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        opportunities,
        stages,
        stats,
        loading,
        backendAvailable,
        refreshData,
        acknowledgeLead,
        reassignLead,
        moveOpportunityStage,
        createLead,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  return context;
}
