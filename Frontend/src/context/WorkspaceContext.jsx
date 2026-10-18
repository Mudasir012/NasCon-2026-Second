import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export const WorkspaceContext = createContext(null);

/**
 * Loads the caller's workspace, membership, settings, member list, and the server-driven
 * permission set (used by hasPermission). Re-fetches whenever the signed-in account changes.
 */
export function WorkspaceProvider({ children }) {
  const { currentUser, setPermissions } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [member, setMember] = useState(null);
  const [settings, setSettings] = useState(null);
  const [members, setMembers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [permissionCatalogue, setPermissionCatalogue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!currentUser) return null;
    setLoading(true);
    setError('');
    try {
      const data = await api.workspace.get();
      setWorkspace(data.workspace ?? null);
      setMember(data.member ?? null);
      setSettings(data.settings ?? null);
      setMembers(data.members ?? []);
      setLevels(data.levels ?? []);
      setPermissionCatalogue(data.permissions ?? []);
      setPermissions(data.member?.permissions ?? []);
      if (data.workspace?.id) api.client.setWorkspaceId(data.workspace.id);
      return data;
    } catch (err) {
      setError(err.message);
      setPermissions([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, setPermissions]);

  useEffect(() => {
    if (currentUser) {
      refresh();
    } else {
      setWorkspace(null);
      setMember(null);
      setSettings(null);
      setMembers([]);
      setPermissions([]);
    }
  }, [currentUser, refresh, setPermissions]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        member,
        settings,
        members,
        levels,
        permissionCatalogue,
        loading,
        error,
        refresh,
        setSettings,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
