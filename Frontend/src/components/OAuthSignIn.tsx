import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, User as UserIcon, Shield, Globe } from 'lucide-react';
import { UserRole } from '../types';

interface OAuthLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: 'light' | 'dark';
}

// Check if a real Firebase configuration is available
const isRealFirebaseConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return !!apiKey && !apiKey.includes('placeholder') && apiKey !== '';
};

interface MockOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google' | 'microsoft';
  onSelectAccount: (email: string, name: string, role: UserRole) => Promise<void>;
}

const MockOAuthModal: React.FC<MockOAuthModalProps> = ({ isOpen, onClose, provider, onSelectAccount }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('farmer');

  if (!isOpen) return null;

  const accounts = [
    {
      name: 'Ravi Kumar',
      email: 'farmer@farmsync.com',
      role: 'farmer' as UserRole,
      desc: 'Salem, Tamil Nadu',
      icon: '🌾',
      badge: 'Farmer Portal',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    },
    {
      name: 'Priya Sharma',
      email: 'citizen@farmsync.com',
      role: 'citizen' as UserRole,
      desc: 'Chennai, Tamil Nadu',
      icon: '🏙️',
      badge: 'Citizen Hub',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      name: 'Admin User',
      email: 'admin@farmsync.com',
      role: 'admin' as UserRole,
      desc: 'Coimbatore, Tamil Nadu',
      icon: '🛡️',
      badge: 'Admin Console',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    }
  ];

  const handleSelect = async (email: string, name: string, role: UserRole) => {
    setLoading(email);
    try {
      await onSelectAccount(email, name, role);
    } catch (err: any) {
      toast.error(err.message || 'Mock login failed');
    } finally {
      setLoading(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      toast.error('Name and Email are required');
      return;
    }
    setLoading('custom');
    try {
      await onSelectAccount(customEmail, customName, customRole);
    } catch (err: any) {
      toast.error(err.message || 'Mock login failed');
    } finally {
      setLoading(null);
    }
  };

  const isGoogle = provider === 'google';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
        
        {/* Google / Microsoft styled header */}
        <div className={`p-6 ${isGoogle ? 'bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-700' : 'bg-[#2F2F2F] text-white'} flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            {isGoogle ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
            )}
            <h3 className={`text-md font-bold ${isGoogle ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
              {isGoogle ? 'Sign in with Google' : 'Microsoft Account'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded-lg transition-colors ${
              isGoogle 
                ? 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500' 
                : 'hover:bg-white/10 text-white'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {!showCustom ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isGoogle 
                    ? 'Choose an account to continue to FarmSync' 
                    : 'Select a profile to sign in to your Microsoft workspace'}
                </p>
              </div>

              {/* Profiles list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {accounts.map((acc) => (
                  <button
                    key={acc.email}
                    disabled={loading !== null}
                    onClick={() => handleSelect(acc.email, acc.name, acc.role)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-lg border border-gray-100 dark:border-gray-700">
                        {acc.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {acc.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{acc.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${acc.badgeColor}`}>
                        {acc.badge}
                      </span>
                      {loading === acc.email && (
                        <Loader2 className="animate-spin text-primary-500 w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowCustom(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-xs font-bold text-gray-500 transition-all text-center"
                >
                  + Use another mock account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Custom Mock Credentials</h4>
                <p className="text-xs text-gray-500">Create a temporary session with custom name and role</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Display Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="john@farmsync.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Target Role Dashboard</label>
                <select
                  value={customRole}
                  onChange={e => setCustomRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="farmer">🧑‍🌾 Farmer Dashboard</option>
                  <option value="citizen">🏡 Citizen Hub</option>
                  <option value="admin">🛡️ Administrator Console</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading !== null}
                  className="w-1/2 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-primary-500/10"
                >
                  {loading === 'custom' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    'Authenticate'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export const GoogleSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    // If real Firebase environment isn't set up, jump straight to mock selection modal
    if (!isRealFirebaseConfigured()) {
      setModalOpen(true);
      return;
    }

    try {
      toast.loading('Connecting to Google...', { id: 'google-login' });
      await loginWithGoogle();
      toast.success('Successfully signed in with Google!', { id: 'google-login' });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Firebase Login failed:', err);
      toast.dismiss('google-login');
      // If Firebase API key is rejected/fails, gracefully open the mock selection modal
      setModalOpen(true);
    }
  }, [loginWithGoogle, navigate, onSuccess]);

  const handleSelectMock = async (email: string, name: string, role: UserRole) => {
    try {
      toast.loading('Simulating Google handshake...', { id: 'google-mock-login' });
      await loginWithGoogle(email, name, role);
      toast.success(`Google profile verified: Welcoming ${name}!`, { id: 'google-mock-login' });
      setModalOpen(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error('Mock authentication failed', { id: 'google-mock-login' });
    }
  };

  return (
    <>
      <button
        onClick={handleGoogleLogin}
        type="button"
        className="h-12 w-full px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center justify-center gap-3 shadow-sm group"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="font-bold text-gray-700 dark:text-gray-200">Sign in with Google</span>
      </button>

      <MockOAuthModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        provider="google"
        onSelectAccount={handleSelectMock}
      />
    </>
  );
};

export const MicrosoftSignIn: React.FC<OAuthLoginProps> = ({ onSuccess }) => {
  const { loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleMicrosoftLogin = useCallback(() => {
    // Open the mock selection modal immediately for local testing
    setModalOpen(true);
  }, []);

  const handleSelectMock = async (email: string, name: string, role: UserRole) => {
    try {
      toast.loading('Simulating Microsoft OAuth...', { id: 'ms-mock-login' });
      await loginWithMicrosoft(email, name, role);
      toast.success(`Microsoft profile loaded: Welcoming ${name}!`, { id: 'ms-mock-login' });
      setModalOpen(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error('Mock authentication failed', { id: 'ms-mock-login' });
    }
  };

  return (
    <>
      <button
        onClick={handleMicrosoftLogin}
        type="button"
        className="h-12 w-full px-4 rounded-xl bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white transition-all font-bold flex items-center justify-center gap-3 shadow-lg shadow-black/10 group"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
        <span>Sign in with Microsoft</span>
      </button>

      <MockOAuthModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        provider="microsoft"
        onSelectAccount={handleSelectMock}
      />
    </>
  );
};

export const OAuthSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex justify-center">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Enterprise Access
        </span>
      </div>
      <GoogleSignIn onSuccess={onSuccess} onError={onError} />
      <MicrosoftSignIn onSuccess={onSuccess} onError={onError} />
    </div>
  );
};

export default OAuthSignIn;
