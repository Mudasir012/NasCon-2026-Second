import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-[#e8e5de] rounded-xl max-w-sm w-full p-6 shadow-xl animate-in fade-in duration-150">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                isDanger ? 'bg-[#faece8] text-[#c26751]' : 'bg-[#eaf0ee] text-[#52796f]'
              }`}
            >
              <AlertCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#1a1917]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#79756d] hover:text-[#1a1917] p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-[#79756d] leading-relaxed mb-6 pl-11">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#1a1917] bg-white border border-[#d3cfc7] rounded-md hover:bg-[#f4f2ee] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-md transition-all shadow-xs ${
              isDanger
                ? 'bg-[#c26751] hover:bg-[#a8533e]'
                : 'bg-[#1a1917] hover:bg-[#33302a]'
            } disabled:opacity-50`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
