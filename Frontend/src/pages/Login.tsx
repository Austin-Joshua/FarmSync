import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Moon, Sun, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OAuthSignIn from '../components/OAuthSignIn';
import Button from '../components/ui/Button';
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

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-login-credentials' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
          ? 'Invalid email or password.'
          : err.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        {/* Branding Side (desktop only) */}
        <div className="hidden lg:flex flex-col w-1/2 space-y-8">
          <Link to="/">
            <Logo size="large" />
          </Link>
          <div>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-text mb-6 leading-tight">
              Farm Intelligence
            </h1>
            <p className="text-xl text-text-muted font-medium mb-8 max-w-lg">
              Data-driven decisions for healthier crops, better yields, and sustainable farming.
            </p>
          </div>
          <div className="space-y-4">
            {[
              'Disease detection with AI',
              'Weather & crop intelligence',
              'Expense & yield tracking',
              'Market price insights'
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-text-muted font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md">
          <div className="bg-surface-raised border border-border rounded-lg p-8 shadow-sm">
            {/* Header controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="lg:hidden">
                <Link to="/">
                  <Logo size="default" />
                </Link>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <LanguageSwitcher />
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-surface hover:bg-surface-sunken transition-colors text-text-muted hover:text-text"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-text mb-2">{t('auth.welcomeBack')}</h2>
              <p className="text-sm text-text-muted">{t('auth.signInAccount')}</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-danger-surface border border-danger rounded-md flex items-center gap-3">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <p className="text-sm text-danger font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div>
                <label className="text-sm font-medium text-text block mb-2">{t('auth.emailAddress')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                    placeholder="you@farm.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-text">{t('auth.password')}</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <></>}
                {t('auth.signIn')}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* OAuth */}
            <OAuthSignIn />

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-text-muted">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" className="font-medium text-accent hover:text-accent-hover transition-colors">
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
