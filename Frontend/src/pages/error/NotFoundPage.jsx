import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage({ onBack }) {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-[#e8e5de] rounded-xl p-8 text-center shadow-sm">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#f4f2ee] text-[#79756d] flex items-center justify-center mb-5">
          <Compass size={32} />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#f4f2ee] text-[#79756d] mb-3">
          404 Not Found
        </span>

        <h2 className="text-xl font-bold text-[#1a1917] mb-2">Page Does Not Exist</h2>

        <p className="text-sm text-[#79756d] leading-relaxed mb-6">
          The view or route you requested could not be located in this OmniFlow workspace.
        </p>

        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1917] text-white text-xs font-semibold rounded-md hover:bg-[#33302a] transition-all"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
