import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext(null);

function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';
}

function normalizeUser(user) {
  if (!user) return null;
  return { ...user, avatar: initials(user.name) };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Only trust a stored user if we also hold a token — otherwise it is stale demo data.
    if (!localStorage.getItem('omniflow_token')) return null;
    try {
      const saved = localStorage.getItem('omniflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [permissions, setPermissions] = useState([]);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('omniflow_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('omniflow_user');
    }
  }, [currentUser]);

  // Any 401 from the API tears the session down and returns the user to login.
  useEffect(() => {
    api.client.onUnauthorized = () => {
      setCurrentUser(null);
      setPermissions([]);
      localStorage.removeItem('omniflow_user');
    };
    return () => {
      api.client.onUnauthorized = null;
    };
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      if (!permission) return true;
      return permissions.includes(permission);
    },
    [permissions],
  );

  const login = async (email, password, isRemember = true) => {
    const data = await api.auth.login(email, password);
    setCurrentUser(normalizeUser(data.user));
    setRememberMe(isRemember);
    setSessionExpired(false);
    return data.user;
  };

  const signup = async ({ companyName, name, email, password }) => {
    const data = await api.auth.signup(name, email, password);
    setCurrentUser(normalizeUser(data.user));
    await api.workspace.bootstrap(companyName);
    setSessionExpired(false);
    return data.user;
  };

  const logout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setPermissions([]);
  };

  const triggerSessionExpired = () => setSessionExpired(true);
  const renewSession = () => setSessionExpired(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        permissions,
        setPermissions,
        hasPermission,
        login,
        signup,
        logout,
        sessionExpired,
        triggerSessionExpired,
        renewSession,
        rememberMe,
        setRememberMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
