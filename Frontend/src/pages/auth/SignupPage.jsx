import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff,
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function SignupPage({ onNavigate }) {
  const { signup } = useAuth();

  const [companyName, setCompanyName] = useState('Solaria Energy Systems');
  const [name, setName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex@solaria.io');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Password Rules Checklist
  const rules = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }, [password]);

  // Calculate Strength Score (0 to 100%)
  const strengthScore = useMemo(() => {
    let score = 0;
    if (rules.length) score += 25;
    if (rules.uppercase) score += 25;
    if (rules.number) score += 25;
    if (rules.special) score += 25;
    return score;
  }, [rules]);

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 25) return { text: 'Weak', color: 'bg-[#c26751]', textColor: 'text-[#c26751]' };
    if (strengthScore <= 50) return { text: 'Fair', color: 'bg-[#b08945]', textColor: 'text-[#b08945]' };
    if (strengthScore <= 75) return { text: 'Good', color: 'bg-[#4a6b82]', textColor: 'text-[#4a6b82]' };
    return { text: 'Strong', color: 'bg-[#52796f]', textColor: 'text-[#52796f]' };
  }, [strengthScore]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!companyName.trim()) {
      setErrorMessage('Company name is required.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMessage('A valid business email is required.');
      return;
    }
    if (strengthScore < 50) {
      setErrorMessage('Please create a stronger password according to the security checklist.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      signup({ companyName, name, email });
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] text-[#3c3933] flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 cursor-pointer font-bold text-lg text-[#1a1917] mb-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#4a6b82] text-white">
              <ShieldCheck size={18} />
            </div>
            <span>OmniFlow</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a1917] tracking-tight">Create your workspace</h1>
          <p className="text-xs text-[#79756d] mt-1">
            Setup in 60 seconds with full SLA escalation & CRM integration
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white border border-[#e8e5de] rounded-xl p-7 shadow-xs">
          {/* Owner Callout Banner */}
          <div className="mb-5 p-3.5 bg-[#eaf0ee] border border-[#52796f]/30 rounded-lg flex items-start gap-3">
            <Sparkles size={16} className="text-[#52796f] shrink-0 mt-0.5" />
            <div className="text-xs text-[#52796f]">
              <strong className="block font-bold mb-0.5">Workspace Primary Authority</strong>
              <span>You will become the Owner of this workspace with full authority to assign SLA rules and invite team members.</span>
            </div>
          </div>

          {errorMessage && (
            <ErrorBanner
              title="Signup Error"
              message={errorMessage}
              onDismiss={() => setErrorMessage('')}
            />
          )}

          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#eaf0ee] text-[#52796f] flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-bold text-[#1a1917]">Workspace Initialized!</h3>
              <p className="text-xs text-[#79756d]">
                Redirecting you to the Operational Dashboard as Workspace Owner...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Company / Organization Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Solaria Energy Systems"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
                    required
                  />
                  <Building2 size={14} className="absolute left-3 top-2.5 text-[#79756d]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Your Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
                    required
                  />
                  <User size={14} className="absolute left-3 top-2.5 text-[#79756d]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Work Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.io"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
                    required
                  />
                  <Mail size={14} className="absolute left-3 top-2.5 text-[#79756d]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
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

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#79756d]">Password Strength:</span>
                      <span className={`font-bold ${strengthLabel.textColor}`}>{strengthLabel.text}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#e8e5de] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthLabel.color}`}
                        style={{ width: `${strengthScore}%` }}
                      ></div>
                    </div>

                    {/* Rules Checklist */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[10px]">
                      <div className={`flex items-center gap-1 ${rules.length ? 'text-[#52796f]' : 'text-[#79756d]'}`}>
                        {rules.length ? <Check size={11} className="text-[#52796f]" /> : <X size={11} />}
                        8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${rules.uppercase ? 'text-[#52796f]' : 'text-[#79756d]'}`}>
                        {rules.uppercase ? <Check size={11} className="text-[#52796f]" /> : <X size={11} />}
                        1 uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${rules.number ? 'text-[#52796f]' : 'text-[#79756d]'}`}>
                        {rules.number ? <Check size={11} className="text-[#52796f]" /> : <X size={11} />}
                        1 number
                      </div>
                      <div className={`flex items-center gap-1 ${rules.special ? 'text-[#52796f]' : 'text-[#79756d]'}`}>
                        {rules.special ? <Check size={11} className="text-[#52796f]" /> : <X size={11} />}
                        1 special symbol
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1917] mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
                    required
                  />
                  <Lock size={14} className="absolute left-3 top-2.5 text-[#79756d]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a1917] hover:bg-[#33302a] text-white text-xs font-semibold rounded-md transition-all shadow-xs cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? 'Creating Workspace...' : 'Create Workspace & Launch Dashboard'}
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6 text-xs text-[#79756d]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-[#1a1917] hover:underline cursor-pointer"
          >
            Sign In
          </button>
          <span className="mx-2">•</span>
          <button
            onClick={() => onNavigate('landing')}
            className="text-[#79756d] hover:underline cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
