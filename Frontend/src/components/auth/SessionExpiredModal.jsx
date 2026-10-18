import React, { useState } from 'react';
import { Clock, Lock, LogIn, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SessionExpiredModal({ onReauthenticated }) {
  const { sessionExpired, renewSession, currentUser } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!sessionExpired) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password to renew session.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      renewSession();
      if (onReauthenticated) onReauthenticated();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-[#e8e5de] rounded-xl max-w-sm w-full p-6 shadow-xl text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-[#faece8] text-[#c26751] flex items-center justify-center mb-4">
          <Clock size={24} />
        </div>

        <h3 className="text-lg font-bold text-[#1a1917] mb-1">Session Expired</h3>
        <p className="text-xs text-[#79756d] mb-4">
          For your security, your session has timed out. Re-enter your password for {currentUser?.email} to continue working.
        </p>

        {error && (
          <div className="p-2 mb-3 bg-[#faece8] text-[#c26751] rounded text-xs text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="block text-[11px] font-semibold text-[#1a1917] mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-3 py-2 text-xs border border-[#d3cfc7] rounded-md focus:border-[#1a1917] outline-none"
                autoFocus
              />
              <Lock size={14} className="absolute right-3 top-2.5 text-[#a8a49c]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1a1917] hover:bg-[#33302a] text-white text-xs font-semibold rounded-md transition-all disabled:opacity-60"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <LogIn size={13} />}
            Resume Session
          </button>
        </form>
      </div>
    </div>
  );
}
