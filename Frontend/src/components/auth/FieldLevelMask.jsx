import React from 'react';

export default function FieldLevelMask({ isAllowed, value, maskedValue = '••••••••' }) {
  return <span>{isAllowed ? value : maskedValue}</span>;
}
