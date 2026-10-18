import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, fallback = null, onRedirectToLogin }) {
  const { currentUser, sessionExpired } = useAuth();

  if (!currentUser) {
    if (onRedirectToLogin) {
      onRedirectToLogin();
      return null;
    }
    return fallback;
  }

  if (sessionExpired) {
    return null;
  }

  return <>{children}</>;
}
