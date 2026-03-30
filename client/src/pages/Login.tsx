// Login page — green + gold FarmSync UI
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Moon, Sun, Mail, Lock, LogIn, Sprout, Shield, Info, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OAuthSignIn from '../components/OAuthSignIn';
import api from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isApiOnline, setIsApiOnline] = useState(true);

  // Check API health on load
  useEffect(() => {
    const checkApi = async () => {
      try {
        await api.getHealth();
        setIsApiOnline(true);
      } catch (err) {
        setIsApiOnline(false);
        toast.error('Server is currently offline. Please try again later.');
      }
    };
    checkApi();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('login.fillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      toast.success('Welcome back to FarmSync!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || t('login.invalidCredentials'));
      toast.error(err.response?.data?.message || t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 dark:bg-primary-900 items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400 opacity-20 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500 opacity-20 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <Logo size="lg" variant="white" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Revolutionizing Farm Management with AI</h1>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of farmers optimizing their yields and managing expenses with our smart ecosystem.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sprout size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Crop Intelligence</h3>
                <p className="text-primary-100 opacity-80">Real-time monitoring and growth insights for every field.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Private</h3>
                <p className="text-primary-100 opacity-80">Your farm data is encrypted and completely under your control.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="md:hidden">
              <Logo size="md" />
            </div>
            <div className="ml-auto flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('login.welcomeBack')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('login.subtitle')}
            </p>
          </div>

          {!isApiOnline && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <p className="text-sm">The server appears to be offline. Login may not work.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="name@farm.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('login.password')}
                </label>
                <Link 
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isApiOnline}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
              {t('login.signIn')}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  {t('login.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <OAuthSignIn />
            </div>
          </div>

          <p className="mt-10 text-center text-gray-600 dark:text-gray-400">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
              {t('login.createAccount')}
            </Link>
          </p>

          <div className="mt-12 flex items-center justify-center gap-6 text-gray-400 dark:text-gray-600">
            <div className="flex items-center gap-1 text-xs">
              <Shield size={14} />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Info size={14} />
              <span>Contact Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
