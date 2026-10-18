import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('alex@solaria.io');
  const [password, setPassword] = useState('Passw0rd!2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Brute-force protection states (F1.1, Q1)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Live countdown timer for brute force lockout
  useEffect(() => {
    let interval;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setFailedAttempts(0); // Reset attempts after timer expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // If currently locked out, prevent submission
    if (lockoutTimer > 0) {
      return;
    }

    // Inline validation
    if (!email.trim()) {
      setErrorMessage('Please enter a valid business email address.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMessage('Invalid email format. E.g. name@company.com');
      return;
    }
    if (!password) {
      setErrorMessage('Password cannot be empty.');
      return;
    }

    setLoading(true);

    // Simulate login verification
    setTimeout(() => {
      setLoading(false);

      // Simulate failed attempt check
      if (password === 'wrong' || password.length < 6) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          setLockoutTimer(30); // 30 second brute force lockout
          setErrorMessage('Account locked! 5 consecutive failed login attempts detected.');
        } else {
          setErrorMessage(`Invalid credentials. Attempt ${nextAttempts} of 5 before temporary lockout.`);
        }
        return;
      }

      // Successful login
      let matchedRole = 'Owner';
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('sara')) {
        matchedRole = 'Admin';
      } else if (email.toLowerCase().includes('manager') || email.toLowerCase().includes('marcus')) {
        matchedRole = 'Manager';
      } else if (email.toLowerCase().includes('user') || email.toLowerCase().includes('elena')) {
        matchedRole = 'User';
      }

      login(email, password, rememberMe, matchedRole);
      onNavigate('dashboard');
    }, 600);
  };

  const handleDemoLogin = (role) => {
    const demoUser = DEMO_USERS[role];
    if (demoUser) {
      login(demoUser.email, 'demo-secure-pass', true, role);
      onNavigate('dashboard');
    }
  };

  const simulateFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= 5) {
      setLockoutTimer(30);
      setErrorMessage('Account locked! 5 consecutive failed login attempts detected.');
    } else {
      setErrorMessage(`Simulated failed password. Attempt ${nextAttempts} of 5.`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] text-[#3c3933] flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 cursor-pointer font-bold text-lg text-[#1a1917] mb-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#4a6b82] text-white">
              <ShieldCheck size={18} />
            </div>
            <span>OmniFlow</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a1917] tracking-tight">Sign in to your workspace</h1>
          <p className="text-xs text-[#79756d] mt-1">Enter your credentials or pick a demo role below</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#e8e5de] rounded-xl p-7 shadow-xs">
          {/* Brute-force Lockout Alert Banner */}
          {lockoutTimer > 0 && (
            <div className="p-4 mb-5 bg-[#faece8] border border-[#c26751]/40 rounded-lg text-xs text-[#c26751]">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Clock size={16} />
                Brute-Force Lockout Activated (Q1, F1.1)
              </div>
              <p className="leading-relaxed mb-2">
                Too many failed login attempts (5/5). Authentication has been suspended to protect the tenant.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#c26751]/30 rounded font-mono font-bold text-xs">
                Unlock in: <span className="text-sm font-extrabold">{lockoutTimer}s</span>
              </div>
            </div>
          )}

          {/* Standard Error Banner */}
          {errorMessage && lockoutTimer === 0 && (
            <ErrorBanner
              title="Authentication Issue"
              message={errorMessage}
              onDismiss={() => setErrorMessage('')}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1917] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled={lockoutTimer > 0}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@solaria.io"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917] disabled:bg-[#f4f2ee] disabled:text-[#a8a49c]"
                  required
                />
                <Mail size={14} className="absolute left-3 top-2.5 text-[#79756d]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#1a1917]">Password</label>
                <button
                  type="button"
                  onClick={simulateFailedAttempt}
                  className="text-[11px] text-[#c26751] hover:underline"
                >
                  Test Fail ({failedAttempts}/5)
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={lockoutTimer > 0}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917] disabled:bg-[#f4f2ee] disabled:text-[#a8a49c]"
                  required
                />
                <Lock size={14} className="absolute left-3 top-2.5 text-[#79756d]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#79756d] hover:text-[#1a1917]"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#79756d]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#d3cfc7] text-[#1a1917] focus:ring-0"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutTimer > 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a1917] hover:bg-[#33302a] text-white text-xs font-semibold rounded-md transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Verifying Credentials...
                </>
              ) : lockoutTimer > 0 ? (
                `Locked Out (${lockoutTimer}s)`
              ) : (
                <>
                  Sign In to Workspace <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Picker (F1.1) */}
          <div className="mt-6 pt-5 border-t border-[#e8e5de]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#79756d] mb-2.5">
              1-Click Instant Demo Login:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('Owner')}
                className="flex items-center gap-1.5 p-2 bg-[#f4f2ee] hover:bg-[#e8e5de] border border-[#e8e5de] rounded text-left transition-colors cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-[#4a6b82] text-white flex items-center justify-center font-bold text-[10px]">
                  OW
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a1917]">Owner (Alex)</div>
                  <div className="text-[10px] text-[#79756d]">Full root access</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Admin')}
                className="flex items-center gap-1.5 p-2 bg-[#f4f2ee] hover:bg-[#e8e5de] border border-[#e8e5de] rounded text-left transition-colors cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-[#52796f] text-white flex items-center justify-center font-bold text-[10px]">
                  AD
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a1917]">Admin (Sara)</div>
                  <div className="text-[10px] text-[#79756d]">Manage all ops</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Manager')}
                className="flex items-center gap-1.5 p-2 bg-[#f4f2ee] hover:bg-[#e8e5de] border border-[#e8e5de] rounded text-left transition-colors cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-[#b08945] text-white flex items-center justify-center font-bold text-[10px]">
                  MG
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a1917]">Manager (Marcus)</div>
                  <div className="text-[10px] text-[#79756d]">SLA & Pipeline</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('User')}
                className="flex items-center gap-1.5 p-2 bg-[#f4f2ee] hover:bg-[#e8e5de] border border-[#e8e5de] rounded text-left transition-colors cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-[#c26751] text-white flex items-center justify-center font-bold text-[10px]">
                  US
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a1917]">Agent / User (Elena)</div>
                  <div className="text-[10px] text-[#79756d]">Standard rep</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer link to Signup */}
        <div className="text-center mt-6 text-xs text-[#79756d]">
          Don't have a workspace yet?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-bold text-[#1a1917] hover:underline cursor-pointer"
          >
            Create Workspace (Owner)
          </button>
          <span className="mx-2">•</span>
          <button
            onClick={() => onNavigate('landing')}
            className="text-[#79756d] hover:underline cursor-pointer"
          >
            Return to Landing
          </button>
        </div>
      </div>
    </div>
  );
}
