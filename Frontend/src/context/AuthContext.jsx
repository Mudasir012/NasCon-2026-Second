import React, { createContext, useContext, useState, useEffect } from 'react';

// Predefined roles and permission matrix
export const ROLE_PERMISSIONS = {
  Owner: [
    'crm.view',
    'crm.create',
    'crm.edit',
    'crm.delete',
    'crm.export',
    'crm.values',
    'rules.manage',
    'integrations.manage',
    'audit.view',
    'users.manage',
    'roles.manage',
    'settings.manage'
  ],
  Admin: [
    'crm.view',
    'crm.create',
    'crm.edit',
    'crm.delete',
    'crm.export',
    'crm.values',
    'rules.manage',
    'integrations.manage',
    'audit.view',
    'users.manage',
    'settings.manage'
  ],
  Manager: [
    'crm.view',
    'crm.create',
    'crm.edit',
    'crm.export',
    'crm.values',
    'rules.manage',
    'audit.view'
  ],
  User: [
    'crm.view',
    'crm.create',
    'crm.edit'
  ]
};

export const DEMO_USERS = {
  Owner: {
    id: 'usr-1',
    name: 'Alex Mercer',
    email: 'alex@solaria.io',
    role: 'Owner',
    level: 'Owner',
    avatar: 'AM',
    tenant: 'Solaria Energy Systems (Tenant #WS-104)'
  },
  Admin: {
    id: 'usr-2',
    name: 'Sara Chen',
    email: 'sara@solaria.io',
    role: 'Admin',
    level: 'Admin',
    avatar: 'SC',
    tenant: 'Solaria Energy Systems (Tenant #WS-104)'
  },
  Manager: {
    id: 'usr-3',
    name: 'Marcus Vance',
    email: 'marcus@solaria.io',
    role: 'Manager',
    level: 'User',
    avatar: 'MV',
    tenant: 'Solaria Energy Systems (Tenant #WS-104)'
  },
  User: {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena@solaria.io',
    role: 'User',
    level: 'User',
    avatar: 'ER',
    tenant: 'Solaria Energy Systems (Tenant #WS-104)'
  }
};

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omniflow_user');
      return saved ? JSON.parse(saved) : DEMO_USERS.Owner;
    } catch {
      return DEMO_USERS.Owner;
    }
  });

  const [sessionExpired, setSessionExpired] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('omniflow_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('omniflow_user');
    }
  }, [currentUser]);

  // Check if current user has a specific permission
  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.role) return false;
    const permissions = ROLE_PERMISSIONS[currentUser.role] || [];
    return permissions.includes(permission);
  };

  // Switch demo role instantly
  const switchRole = (roleName) => {
    if (DEMO_USERS[roleName]) {
      setCurrentUser(DEMO_USERS[roleName]);
    } else {
      setCurrentUser((prev) => ({
        ...prev,
        role: roleName,
        level: roleName === 'Owner' ? 'Owner' : roleName === 'Admin' ? 'Admin' : 'User'
      }));
    }
  };

  // Login handler
  const login = (email, password, isRemember = true, role = 'Owner') => {
    const user = DEMO_USERS[role] || {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      level: role === 'Owner' ? 'Owner' : role === 'Admin' ? 'Admin' : 'User',
      avatar: email.substring(0, 2).toUpperCase(),
      tenant: 'Solaria Energy Systems (Tenant #WS-104)'
    };
    setCurrentUser(user);
    setRememberMe(isRemember);
    setSessionExpired(false);
    return true;
  };

  // Signup handler (User becomes Owner)
  const signup = ({ companyName, name, email }) => {
    const newOwner = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'Owner',
      level: 'Owner',
      avatar: name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase() || 'OW',
      tenant: `${companyName} (Tenant #WS-${Math.floor(100 + Math.random() * 900)})`
    };
    setCurrentUser(newOwner);
    setSessionExpired(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('omniflow_user');
  };

  const triggerSessionExpired = () => {
    setSessionExpired(true);
  };

  const renewSession = () => {
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        hasPermission,
        switchRole,
        login,
        signup,
        logout,
        sessionExpired,
        triggerSessionExpired,
        renewSession,
        rememberMe,
        setRememberMe,
        ROLE_PERMISSIONS
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
