import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export const CRMContext = createContext(null);

/**
 * Owns CRM data (leads, pipeline stages, sources, stats) for the signed-in workspace.
 * Every mutation goes to the API and then re-fetches; there are no local mock fallbacks.
 */
export function CRMProvider({ children }) {
  const { currentUser } = useAuth();

  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [sources, setSources] = useState([]);
  const [stats, setStats] = useState({ total: 0, byStage: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const [leadsRes, statsRes, metaRes] = await Promise.all([
        api.crm.listLeads(),
        api.crm.getStats(),
        api.crm.getMeta(),
      ]);

      setLeads(leadsRes?.leads ?? []);
      setStats(statsRes ?? { total: 0, byStage: {} });

      if (metaRes?.stages) {
        setStages(
          metaRes.stages.map((stage) => ({
            id: stage.key ?? stage.id,
            name: stage.label ?? stage.name,
            requiredFields: stage.required ?? [],
          })),
        );
      }
      if (metaRes?.sources) setSources(metaRes.sources);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshData();
    } else {
      setLeads([]);
      setStages([]);
      setSources([]);
      setStats({ total: 0, byStage: {} });
      setError('');
    }
  }, [currentUser, refreshData]);

  const acknowledgeLead = async (id) => {
    await api.crm.acknowledgeLead(id);
    await refreshData();
  };

  const reassignLead = async (id, assigneeId) => {
    await api.crm.reassignLead(id, assigneeId);
    await refreshData();
  };

  const updateStage = async (id, stage) => {
    const result = await api.crm.updateStage(id, stage);
    await refreshData();
    return result;
  };

  const createLead = async (data) => {
    const result = await api.crm.createLead(data);
    await refreshData();
    return result?.lead;
  };

  const deleteLead = async (id) => {
    await api.crm.deleteLead(id);
    await refreshData();
  };

  const addActivity = async (id, activity) => {
    const result = await api.crm.addActivity(id, activity);
    await refreshData();
    return result?.activity;
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        stages,
        sources,
        stats,
        loading,
        error,
        refreshData,
        acknowledgeLead,
        reassignLead,
        updateStage,
        createLead,
        deleteLead,
        addActivity,
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
