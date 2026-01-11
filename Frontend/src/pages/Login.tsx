// Login page component with Google OAuth
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { PublicClientApplication } from '@azure/msal-browser';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (notification: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
      oauth2?: {
        initTokenClient: (config: any) => any;
      };
    };
    AppleID?: {
      auth: {
        init: (config: any) => void;
        signIn: (config: any, callback: (response: any) => void) => void;
      };
    };
  }
}

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const { login, googleLogin, appleLogin, microsoftLogin } = useAuth();
  const navigate = useNavigate();
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  // OAuth Configuration - DISABLED for now (available for future installation)
  // To enable OAuth in the future:
  // 1. Add VITE_GOOGLE_CLIENT_ID, VITE_MICROSOFT_CLIENT_ID, or VITE_APPLE_CLIENT_ID to .env
  // 2. Set enableOAuth to true
  // 3. Uncomment the OAuth buttons section below
  const enableOAuth = false; // Set to true to enable OAuth buttons
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID || '';
  const hasOAuth = enableOAuth && !!(googleClientId || microsoftClientId || appleClientId);

  // Handle Google credential response
  const handleGoogleCredentialResponse = useCallback(async (response: { credential: string }) => {
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
  }, [googleLogin, navigate, t]);

  // Load Google Identity Services script and render button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize Google Identity Services when script loads
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        });

        // Render Google button into hidden div after a short delay to ensure ref is set
        setTimeout(() => {
          if (googleButtonRef.current && window.google.accounts.id.renderButton) {
            try {
              window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                width: 300,
                locale: 'en',
              });
            } catch (err) {
              console.warn('Failed to render Google button:', err);
            }
          }
        }, 100);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [handleGoogleCredentialResponse]);

  // Initialize MSAL for Microsoft authentication
  useEffect(() => {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
    if (clientId) {
      const msalConfig = {
        auth: {
          clientId: clientId,
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: window.location.origin + '/auth/microsoft/callback',
        },
        cache: {
          cacheLocation: 'sessionStorage',
          storeAuthStateInCookie: false,
        },
      };
      const msal = new PublicClientApplication(msalConfig);
      msal.initialize().then(() => {
        setMsalInstance(msal);
      });
    }
  }, []);

  const handleGoogleLogin = () => {
    setError('');
    setSuccess('');
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      // Silently return - button should not be visible if not configured
      return;
    }

    setGoogleLoading(true);

    if (googleButtonRef.current) {
      // Find and click the rendered Google button
      const googleButton = googleButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
      } else {
        // Fallback: Try to trigger One Tap prompt
        if (window.google && window.google.accounts) {
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              setError('Google Sign-In popup was blocked. Please allow popups and try again.');
              setGoogleLoading(false);
            }
          });
        } else {
          setError('Google Sign-In is loading. Please wait a moment and try again.');
          setGoogleLoading(false);
        }
      }
    } else {
      setError('Google Sign-In is loading. Please wait a moment and try again.');
      setGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setError('');
    setSuccess('');
    
    const clientId = import.meta.env.VITE_APPLE_CLIENT_ID || '';
    if (!clientId) {
      // Silently return - button should not be visible if not configured
      return;
    }

    setAppleLoading(true);

    try {
      // Load Apple Sign-In script if not already loaded
      if (!window.AppleID) {
        const script = document.createElement('script');
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        script.onload = () => {
          // Initialize Apple Sign-In
          if (window.AppleID && clientId) {
            window.AppleID.auth.init({
              clientId: clientId,
              scope: 'name email',
              redirectURI: window.location.origin + '/auth/apple/callback',
              usePopup: true,
            });

            // Trigger Apple Sign-In
            window.AppleID.auth.signIn({}, async (response: any) => {
              try {
                if (response.authorization && response.authorization.id_token) {
                  const userData = response.user || {};
                  const success = await appleLogin(response.authorization.id_token, {
                    name: userData.name ? `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim() : undefined,
                    email: userData.email,
                  });
                  if (success) {
                    setSuccess(t('auth.loginSuccess') + '! Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 1000);
                  } else {
                    setError(t('auth.loginError'));
                  }
                } else {
                  setError('Apple authentication failed. Please try again.');
                }
              } catch (err: any) {
                setError(err.message || 'Apple authentication failed. Please try again.');
              } finally {
                setAppleLoading(false);
              }
            });
          } else {
            setError('Apple Sign-In initialization failed. Please check configuration.');
            setAppleLoading(false);
          }
        };
        script.onerror = () => {
          setError('Failed to load Apple Sign-In. Please check your internet connection and try again.');
          setAppleLoading(false);
        };
        document.head.appendChild(script);
      } else {
        // Apple Sign-In already loaded, trigger sign-in
        if (window.AppleID && window.AppleID.auth) {
          window.AppleID.auth.signIn({}, async (response: any) => {
            try {
              if (response.authorization && response.authorization.id_token) {
                const userData = response.user || {};
                const success = await appleLogin(response.authorization.id_token, {
                  name: userData.name ? `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim() : undefined,
                  email: userData.email,
                });
                if (success) {
                  setSuccess(t('auth.loginSuccess') + '! Redirecting...');
                  setTimeout(() => navigate('/dashboard'), 1000);
                } else {
                  setError(t('auth.loginError'));
                }
              } else {
                setError('Apple authentication failed. Please try again.');
              }
            } catch (err: any) {
              setError(err.message || 'Apple authentication failed. Please try again.');
            } finally {
              setAppleLoading(false);
            }
          });
        } else {
          setError('Apple Sign-In is not available. Please check configuration.');
          setAppleLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Apple authentication failed. Please try again.');
      setAppleLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    setSuccess('');
    
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
    if (!clientId) {
      // Silently return - button should not be visible if not configured
      return;
    }

    if (!msalInstance) {
      setError('Microsoft Sign-In is initializing. Please wait a moment and try again.');
      return;
    }

    setMicrosoftLoading(true);

    try {
      // Use MSAL popup for Microsoft OAuth
      const loginRequest = {
        scopes: ['User.Read'],
      };

      try {
        const response = await msalInstance.loginPopup(loginRequest);
        if (response.accessToken) {
          // Send access token to backend
          const success = await microsoftLogin(response.accessToken);
          if (success) {
            setSuccess(t('auth.loginSuccess') + '! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1000);
          } else {
            setError(t('auth.loginError'));
          }
        }
      } catch (popupError: any) {
        if (popupError.errorCode === 'user_cancelled') {
          setError('Microsoft sign-in was cancelled.');
        } else {
          setError(popupError.message || 'Microsoft authentication failed. Please try again.');
        }
      } finally {
        setMicrosoftLoading(false);
      }
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
      let errorMessage = t('auth.loginError') || 'Login failed';
      
      if (err?.message) {
        // Check for actual connection errors (network/fetch errors)
        if (err.message.includes('Failed to connect') || 
            err.message.includes('fetch') || 
            err.message.includes('NetworkError') ||
            err.message.includes('Network request failed') ||
            err.message.includes('timed out')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend server is running on http://localhost:5000';
        } 
        // Check for authentication errors (these are NOT connection errors)
        else if (err.message.includes('Invalid email or password') ||
                 err.message.includes('Invalid') ||
                 err.message.includes('not found') ||
                 err.message.includes('incorrect')) {
          errorMessage = err.message; // Show the actual auth error
        }
        // Check for HTTP errors (401, 403, etc. - these are NOT connection errors)
        else if (err.message.includes('401') || 
                 err.message.includes('403') || 
                 err.message.includes('Unauthorized')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
        // Other errors (show the actual error message)
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
          {/* OAuth Buttons - Only show if configured */}
          {hasOAuth && (
            <div className="space-y-3 mb-6">
              {/* Google Login Button */}
              {googleClientId && (
                <>
                  {/* Hidden Google button for rendering */}
                  <div ref={googleButtonRef} className="hidden"></div>
                  <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading || appleLoading || microsoftLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">
                  {googleLoading ? t('auth.connecting') : t('auth.continueGoogle') || 'Sign in with Google'}
                </span>
              </button>
                </>
              )}

              {/* Microsoft Login Button */}
              {microsoftClientId && (
                <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={microsoftLoading || loading || googleLoading || appleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 font-medium shadow-sm hover:shadow-md"
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
              )}

              {/* Apple Login Button */}
              {appleClientId && (
                <button
              type="button"
              onClick={handleAppleLogin}
              disabled={appleLoading || loading || googleLoading || microsoftLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black dark:bg-gray-900 border-2 border-black dark:border-gray-700 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-800 hover:border-gray-800 dark:hover:border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="font-medium">
                {appleLoading ? t('auth.connecting') : t('auth.signInApple') || 'Sign in with Apple'}
              </span>
            </button>
              )}
            </div>
          )}

          {/* Divider - Only show if OAuth buttons are visible */}
          {hasOAuth && (
            <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('auth.orContinueEmail')}</span>
            </div>
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder={t('auth.enterPassword')}
                  required
                  disabled={loading || googleLoading || appleLoading || microsoftLoading}
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

