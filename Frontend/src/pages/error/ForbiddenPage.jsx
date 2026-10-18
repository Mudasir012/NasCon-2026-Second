import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ForbiddenPage({ requiredPermission, onBack }) {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-[#e8e5de] rounded-xl p-8 text-center shadow-sm">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#faece8] text-[#c26751] flex items-center justify-center mb-5">
          <ShieldAlert size={32} />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#faece8] text-[#c26751] mb-3">
          403 Access Denied
        </span>

        <h2 className="text-xl font-bold text-[#1a1917] mb-2">Permission Restricted</h2>

        <p className="text-sm text-[#79756d] leading-relaxed mb-6">
          Your current active role ({currentUser?.role || 'User'}) does not have permission to access this resource
          {requiredPermission ? ` (requires '${requiredPermission}')` : ''}.
        </p>

        <div className="p-3.5 bg-[#faf9f6] border border-[#e8e5de] rounded-lg text-xs text-left mb-6">
          <div className="font-semibold text-[#1a1917] mb-1.5 flex items-center gap-1.5">
            <Lock size={12} className="text-[#4a6b82]" />
            Access is granted by your workspace membership
          </div>
          <p className="text-[#79756d] leading-relaxed">
            Ask a workspace owner or admin to grant your account the required permission.
          </p>
        </div>

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
