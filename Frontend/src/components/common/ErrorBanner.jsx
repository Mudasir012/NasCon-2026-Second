import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ErrorBanner({ title, message, onDismiss, action }) {
  if (!message && !title) return null;

  return (
    <div className="flex items-start justify-between gap-3 p-3.5 bg-[#faece8] border border-[#c26751]/30 rounded-lg text-xs text-[#c26751] mb-4">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[#c26751]" />
        <div>
          {title && <div className="font-bold mb-0.5">{title}</div>}
          <div className="leading-relaxed">{message}</div>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[#c26751]/70 hover:text-[#c26751] p-1 rounded transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
