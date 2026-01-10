// Login page component with Google OAuth
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';
import Logo from '../components/Logo';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (notification: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize Google Identity Services when script loads
      if (window.google) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        if (clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setError('');
    setSuccess('');
    setGoogleLoading(true);

    try {
      const success = await googleLogin(response.credential);
      if (success) {
        setSuccess(t('auth.loginSuccess') + '! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: Show error if popup blocked
          setError('Google Sign-In popup was blocked. Please allow popups and try again.');
        }
      });
    } else {
      setError('Google Sign-In is not available. Please check configuration.');
    }
  };

  const handleAppleLogin = async () => {
    setError('');
    setSuccess('');
    setAppleLoading(true);

    try {
      // Apple Sign-In requires Apple Developer account and proper configuration
      // This is a placeholder - show informative message to users
      setTimeout(() => {
        setError(t('auth.appleSignInUnavailable') || 'Apple Sign-In requires additional configuration. Please use email login or Google Sign-In for now.');
        setAppleLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Apple authentication failed. Please try again.');
      setAppleLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    setSuccess('');
    setMicrosoftLoading(true);

    try {
      // Microsoft Sign-In requires Azure AD app registration
      // This is a placeholder - show informative message to users
      const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
      if (!clientId) {
        setError(t('auth.microsoftSignInUnavailable') || 'Microsoft Sign-In requires VITE_MICROSOFT_CLIENT_ID in .env file. Please use email login or Google Sign-In for now.');
        setMicrosoftLoading(false);
        return;
      }
      
      // If client ID exists, redirect to Microsoft OAuth (requires proper callback handling)
      const redirectUri = encodeURIComponent(window.location.origin + '/login');
      const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=openid%20profile%20email&state=microsoft_login`;
      window.location.href = microsoftAuthUrl;
    } catch (err: any) {
      setError(err.message || 'Microsoft authentication failed. Please try again.');
      setMicrosoftLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setSuccess(t('auth.loginSuccess') + '! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || t('auth.loginError');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-earth-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="default" variant="light" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-gray-600">{t('auth.signInAccount')}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            {/* Google Login Button */}
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading || appleLoading || microsoftLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md"
              >
                <Chrome size={20} className="text-red-500" />
                <span className="font-medium">
                  {googleLoading ? t('auth.connecting') : t('auth.continueGoogle')}
                </span>
              </button>
            ) : null}

            {/* Apple Login Button */}
            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={appleLoading || loading || googleLoading || microsoftLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white bg-black hover:bg-gray-900 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="font-medium">
                {appleLoading ? t('auth.connecting') : t('auth.signInApple') || 'Sign in with Apple'}
              </span>
            </button>

            {/* Microsoft Login Button */}
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={microsoftLoading || loading || googleLoading || appleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                <path fill="#F25022" d="M0 0h11v11H0z"/>
                <path fill="#7FBA00" d="M12 0h11v11H12z"/>
                <path fill="#00A4EF" d="M0 12h11v11H0z"/>
                <path fill="#FFB900" d="M12 12h11v11H12z"/>
              </svg>
              <span className="font-medium">
                {microsoftLoading ? t('auth.connecting') : t('auth.signInMicrosoft') || 'Sign in with Microsoft'}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('auth.orContinueEmail')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter any email or username"
                  required
                  disabled={loading || googleLoading || appleLoading || microsoftLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder={t('auth.enterPassword')}
                  required
                  disabled={loading || googleLoading || appleLoading || microsoftLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || appleLoading || microsoftLoading}
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

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              💡 {t('auth.demoHint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

