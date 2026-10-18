import React from 'react';
import PermissionGuard from './PermissionGuard';

export default function PermissionGate(props) {
  return <PermissionGuard {...props} />;
}
