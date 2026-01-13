// Simple Login page component
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setSuccess(t('auth.loginSuccess') + '! Redirecting...');
        // Check if user needs onboarding
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const needsOnboarding = userData.role === 'farmer' && !userData.is_onboarded;
        setTimeout(() => {
          if (userData.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            // Always redirect to dashboard (main page) after login
            navigate('/dashboard', { replace: true });
          }
        }, 1000);
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err: any) {
      let errorMessage = t('auth.loginError') || 'Login failed';
      
      if (err?.message) {
        // Check for actual connection errors
        if (err.message.includes('Failed to connect') || 
            err.message.includes('fetch') || 
            err.message.includes('NetworkError') ||
            err.message.includes('Network request failed') ||
            err.message.includes('timed out')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend server is running on http://localhost:5000';
        } 
        // Check for authentication errors
        else if (err.message.includes('Invalid email or password') ||
                 err.message.includes('Invalid') ||
                 err.message.includes('not found') ||
                 err.message.includes('incorrect')) {
          errorMessage = err.message;
        }
        // Check for HTTP errors
        else if (err.message.includes('401') || 
                 err.message.includes('403') || 
                 err.message.includes('Unauthorized')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
        // Other errors
        else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-earth-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="default" variant="light" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('auth.signInAccount')}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder={t('auth.enterPassword')}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
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
