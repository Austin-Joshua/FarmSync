// Register page — green + gold FarmSync UI
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Moon, Sun } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState<'farmer' | 'admin'>('farmer');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setLoading(true);
    try {
      const ok = await register(name, email, password, role, location);
      if (ok) {
        setSuccess(t('auth.registerSuccess') || 'Registration successful! Redirecting...');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setTimeout(() => {
          navigate(userData.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }, 1000);
      } else {
        setError(t('auth.registerError') || 'Registration failed.');
      }
    } catch (err: any) {
      let msg = t('auth.registerError') || 'Registration failed';
      if (err?.message?.includes('Failed to connect') || err?.message?.includes('fetch') || err?.message?.includes('Network')) {
        msg = `Cannot connect to server. Start the backend (cd Backend && npm run dev).`;
      } else if (err?.message?.includes('already exists') || err?.message?.includes('duplicate')) {
        msg = 'An account with this email already exists. Please sign in or use a different email.';
      } else if (err?.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  const inputBase = isDark
    ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 focus:ring-primary-400 focus:border-primary-400'
    : 'border-gray-200 bg-emerald-50/80 text-gray-900 placeholder-gray-500 focus:ring-primary-500/30 focus:border-primary-500';
  const labelClass = isDark ? 'text-slate-300' : 'text-gray-600';
  const cardBg = isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-100';
  const pageBg = isDark ? 'bg-slate-900' : 'bg-gray-50';
  const mutedText = isDark ? 'text-slate-400' : 'text-gray-600';
  const iconClass = isDark ? 'text-slate-400' : 'text-gray-400';
  const iconHover = isDark ? 'hover:text-slate-200' : 'hover:text-gray-600';
  const roleInactive = isDark
    ? 'border-slate-600 text-slate-400 hover:border-primary-400 bg-slate-700/50'
    : 'border-gray-300 text-gray-600 hover:border-primary-400 bg-white';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg} ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {/* Header — green FarmSync + theme toggle top right */}
      <div className="bg-primary-700 text-white px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Logo size="default" variant="light" />
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#D4AF37] transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      {/* Central form card */}
      <div className="flex justify-center px-4 py-8 sm:py-10">
        <div className={`w-full max-w-md rounded-xl shadow-lg border transition-colors duration-300 ${cardBg} p-6 sm:p-8`}>
          <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37] mb-1">Create Account</h2>
          <p className={`text-sm mb-6 ${mutedText}`}>
            Register for access to the FarmSync platform.
          </p>

          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}
          {success && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${isDark ? 'bg-green-900/30 border-green-700 text-green-200' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}>
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconClass}`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Preferred username"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputBase}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconClass}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., name@example.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputBase}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconClass}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Secure password"
                  required
                  minLength={8}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputBase}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${iconClass} ${iconHover}`}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconClass}`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  minLength={8}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputBase}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${iconClass} ${iconHover}`}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}>
                Invite Code <span className="font-normal normal-case opacity-75">(Optional)</span>
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Invitation code"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputBase}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelClass}`}>
                Account Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`flex-1 py-2.5 rounded-lg border-2 font-medium transition-colors ${
                    role === 'farmer'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                      : roleInactive
                  }`}
                >
                  Farmer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 py-2.5 rounded-lg border-2 font-medium transition-colors ${
                    role === 'admin'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                      : roleInactive
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
            {role === 'farmer' && (
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}>
                  Location <span className="font-normal normal-case opacity-75">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Chennai"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputBase}`}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <UserPlus size={20} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className={`mt-6 text-center text-sm ${mutedText}`}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#D4AF37] hover:text-[#e6b83d]">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
