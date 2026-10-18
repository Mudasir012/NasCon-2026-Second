import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No Data Available',
  description = 'There are no items to display right now.',
  actionLabel,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-[#f4f2ee] text-[#79756d] flex items-center justify-center mb-3">
        <Icon size={24} />
      </div>
      <h4 className="text-sm font-bold text-[#1a1917] mb-1">{title}</h4>
      <p className="text-xs text-[#79756d] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 bg-[#1a1917] text-white rounded text-xs font-semibold hover:bg-[#33302a] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
