// Login page — green + gold FarmSync UI
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import Logo from '../components/Logo';
import OAuthSignIn from '../components/OAuthSignIn';
import api from '../services/api';

const Login = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const checkConnection = async () => {
    try {
      setCheckingConnection(true);
      const res = await api.getConnectionStatus();
      // If request didn't throw, we consider connection OK
      setConnectionOk(true);
      return res;
    } catch (e) {
      setConnectionOk(false);
      return null;
    } finally {
      setCheckingConnection(false);
    }
  };

  useEffect(() => {
    // Check connection when login page loads
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        setSuccess(t('auth.loginSuccess') + '! Redirecting...');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setTimeout(() => {
          navigate(userData.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }, 1000);
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err: any) {
      let msg = t('auth.loginError') || 'Login failed';
      if (err?.message?.includes('Failed to connect') || err?.message?.includes('fetch') || err?.message?.includes('Network')) {
        msg = `Cannot connect to server. Start the backend (cd Backend && npm run dev).`;
      } else if (err?.message?.includes('Invalid') || err?.message?.includes('401')) {
        msg = 'Invalid email or password.';
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

      {/* Main — centered card */}
      <div className="flex justify-center px-4 py-8 sm:py-10">
        <div className={`w-full max-w-md rounded-xl shadow-lg border transition-colors duration-300 ${cardBg} p-6 sm:p-8`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">Institutional Access</h2>
            <button
              type="button"
              onClick={checkConnection}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 border ${
                connectionOk === null
                  ? 'bg-gray-200 text-gray-700 border-gray-300'
                  : connectionOk
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-red-500 text-white border-red-600'
              }`}
              title={checkingConnection ? 'Checking connection…' : 'Click to re-check connection'}
            >
              {checkingConnection
                ? 'CHECKING…'
                : connectionOk === null
                ? 'UNKNOWN'
                : connectionOk
                ? 'ONLINE'
                : 'OFFLINE'}
            </button>
          </div>
          <p className={`text-sm mb-6 ${mutedText}`}>
            Authenticate to access the Smart Farm platform.
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
                Email or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@farmsync.com"
                required
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputBase}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputBase}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-[#D4AF37] hover:text-[#e6b83d]">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              {loading ? t('auth.signingIn') : 'Sign In'}
              <ArrowRight size={20} className="flex-shrink-0" />
            </button>
          </form>

          <div className="relative my-6">
            <span className={`absolute inset-0 flex items-center ${isDark ? 'text-slate-600' : 'text-gray-300'}`}>
              <span className="w-full border-t border-current" />
            </span>
            <span className={`relative flex justify-center text-sm uppercase tracking-wider px-2 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-gray-500'}`}>Or</span>
          </div>

          <OAuthSignIn
            onSuccess={() => navigate('/dashboard', { replace: true })}
            onError={(msg) => setError(msg)}
            variant={isDark ? 'dark' : 'light'}
          />

          <p className={`mt-6 text-center text-sm ${mutedText}`}>
            New to the platform?{' '}
            <Link to="/register" className="font-medium text-[#D4AF37] hover:text-[#e6b83d]">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
