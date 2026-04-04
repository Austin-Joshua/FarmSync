import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Moon, Sun, Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
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
  
  const [email, setEmail] = useState('admin@farmsync.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isApiOnline, setIsApiOnline] = useState(true);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check API health on load
  useEffect(() => {
    const checkApi = async () => {
      try {
        await api.getHealth();
        setIsApiOnline(true);
      } catch (err) {
        setIsApiOnline(false);
      }
    };
    checkApi();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('fillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      toast.success(t('loginSuccess') || 'Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = typeof err === 'string' ? err : err.message || t('loginError') || 'Login failed';
      
      if (err.message?.includes('FIREBASE_SETUP_REQUIRED')) {
        errorMessage = "Identity Services Required: Please enable 'Email/Password' in your Firebase console to activate your account database.";
      } else if (err.code === 'auth/invalid-login-credentials' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMessage = "Invalid email or password.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-[#064e3b] to-[#047857]'}`}>
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-earth-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 z-10 flex flex-col md:flex-row items-center gap-12">
        {/* Branding Side */}
        <div className="hidden md:flex flex-col w-1/2 space-y-8 animate-fade-in">
          <div className="inline-block hover:scale-105 transition-transform cursor-pointer">
            <Link to="/">
              <Logo size="large" />
            </Link>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
            Revolutionizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-300">Precision Management</span> with AI Intelligence
          </h1>
          <p className="text-xl text-emerald-100 max-w-lg leading-relaxed drop-shadow">
            Harness the power of hyper-local data and predictive analytics to secure your farm's future and optimize every hectare.
          </p>
        </div>

        {/* Login Card Side - reduced width */}
        <div className="w-[85%] max-w-[320px] md:max-w-[340px] animate-fade-in-up mx-auto md:mx-0">
          <div className="glass-card shadow-2xl relative !p-6">
            {/* Theme & Language Toggles */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <LanguageSwitcher />
              <button 
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>

            <div className="mb-4 pt-1">
              <div className="md:hidden mb-6 flex justify-center hover:scale-105 transition-transform cursor-pointer">
                <Link to="/">
                  <Logo size="default" variant="light" />
                </Link>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('welcomeBack')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('signInAccount')}
              </p>
            </div>

            {!isApiOnline && (
              <div className="mb-4 p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 backdrop-blur-sm">
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wide">{t('serverOfflineDemo')}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wide">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  {t('emailAddress')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all placeholder-gray-400 shadow-sm text-sm"
                    placeholder="name@farm.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between ml-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('password')}
                  </label>
                  <Link 
                    to="/forgot-password"
                    className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all placeholder-gray-400 shadow-sm text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-primary-500/20 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? <Loader2 size={22} className="animate-spin" /> : <LogIn size={22} className="group-hover:translate-x-1 transition-transform" />}
                {t('signIn')}
              </button>
            </form>

            <div className="mt-5 text-center">
              <div className="mb-4 flex justify-center">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t('orContinueEmail')}
                </span>
              </div>

              <OAuthSignIn />

              <p className="mt-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                {t('dontHaveAccount')}{' '}
                <Link to="/register" className="font-extrabold text-primary-600 dark:text-primary-400 hover:underline">
                  {t('createAccount')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

