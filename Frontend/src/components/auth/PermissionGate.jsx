import React from 'react';

export default function PermissionGate({ permission, children, fallback = null }) {
  return <>{children}</>;
}
