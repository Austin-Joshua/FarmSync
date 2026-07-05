import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Eye, EyeOff, Moon, Sun, Mail, Lock, LogIn,
  AlertCircle, Loader2, Zap
} from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OAuthSignIn from '../components/OAuthSignIn';
import api from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isApiOnline, setIsApiOnline] = useState(true);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    api.getHealth().then(() => setIsApiOnline(true)).catch(() => setIsApiOnline(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError(t('fillAllFields')); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-login-credentials' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
        ? 'Invalid email or password.'
        : err.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-[#064e3b] to-[#047857]'
    }`}>
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-8">
        {/* Branding Side (desktop only) */}
        <div className="hidden lg:flex flex-col w-1/2 space-y-6 animate-fade-in">
          <Link to="/"><Logo size="large" /></Link>
          <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
            Revolutionizing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-300">
              Precision Farming
            </span>{' '}
            with AI
          </h1>
          <p className="text-lg text-emerald-100 max-w-lg leading-relaxed">
            Harness the power of hyper-local data and predictive analytics to secure your farm's future.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 pt-2">
            {['AI Disease Detection', 'Market Prices', 'Weather Alerts', 'IoT Sensors'].map(f => (
              <span key={f} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <Zap size={10} className="text-yellow-300" /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md mx-auto lg:w-1/2">
          <div className="glass-card shadow-2xl !p-5 sm:!p-7">
            {/* Header controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <LanguageSwitcher />
              <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform">
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>

            {/* Mobile logo */}
            <div className="lg:hidden mb-5 flex justify-center">
              <Link to="/"><Logo size="default" variant="light" /></Link>
            </div>

            <div className="mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{t('welcomeBack')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('signInAccount')}</p>
            </div>

            {/* Status banners */}
            {!isApiOnline && (
              <div className="mb-3 p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={14} className="shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wide">Server offline — system running in offline fallback mode</p>
              </div>
            )}
            {error && (
              <div className="mb-3 p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={14} className="shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wide">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1 block mb-1">{t('emailAddress')}</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    id="fs-email-input"
                    name="fs_email_addr"
                    autoComplete="off"
                    data-lpignore="true"
                    className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                    placeholder="name@farm.com" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('password')}</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500">{t('forgotPassword')}</Link>
                </div>
                <div className="relative group">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    id="fs-password-input"
                    name="fs_password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    className="block w-full pl-9 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                {t('signIn')}
              </button>
            </form>

            <div className="mt-4 text-center space-y-3">
              <OAuthSignIn />
              <p className="font-semibold text-gray-700 dark:text-gray-300 text-xs">
                {t('dontHaveAccount')}{' '}
                <Link to="/register" className="font-extrabold text-primary-600 dark:text-primary-400 hover:underline">{t('createAccount')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
