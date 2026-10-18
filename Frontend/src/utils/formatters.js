// Currency, date, and countdown timer formatters
export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatSeconds(secs) {
  const total = Math.max(0, Math.round(Number(secs) || 0));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
