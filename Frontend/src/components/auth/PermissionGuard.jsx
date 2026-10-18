import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ForbiddenPage from '../../pages/error/ForbiddenPage';

export default function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  showForbiddenPage = false,
  children
}) {
  const { hasPermission } = useAuth();

  const permsToCheck = permission ? [permission] : permissions;

  if (permsToCheck.length === 0) {
    return <>{children}</>;
  }

  const isAllowed = requireAll
    ? permsToCheck.every((p) => hasPermission(p))
    : permsToCheck.some((p) => hasPermission(p));

  if (!isAllowed) {
    if (showForbiddenPage) {
      return <ForbiddenPage requiredPermission={permsToCheck.join(', ')} />;
    }
    return fallback;
  }

  return <>{children}</>;
}
