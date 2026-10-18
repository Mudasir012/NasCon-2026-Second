import React from 'react';

export default function StatMetricCard({ title, value, icon, onClick }) {
  return <div className="stat-card" onClick={onClick}>{title}: {value}</div>;
}
