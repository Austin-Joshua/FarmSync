import { useCallback } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../context/useAuthStore';
import axios from 'axios';
import { API_BASE_URL, BACKEND_ORIGIN } from '../config/api';
import toast from 'react-hot-toast';

interface OAuthLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: 'light' | 'dark';
}

export const GoogleSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  const { login } = useAuthStore();

  const handleGoogleSuccess = useCallback(
    async (credentialResponse: { credential?: string }) => {
      try {
        const { credential } = credentialResponse;
        const response = await axios.post(`${API_BASE_URL}/auth/google-verify`, {
          token: credential,
        });

        if (response.data.token) {
          login(response.data.token, response.data.user);
          toast.success('Google authentication successful');
          onSuccess?.();
        }
      } catch (error: any) {
        console.error('Google sign-in error:', error);
        const msg = error.response?.data?.message || 'Google sign-in failed';
        toast.error(msg);
        onError?.(msg);
      }
    },
    [login, onSuccess, onError]
  );

  const handleGoogleError = useCallback(() => {
    const msg = 'Google sign-in failed. Please try again.';
    toast.error(msg);
    onError?.(msg);
  }, [onError]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="w-full">
        <div className="mx-auto w-full max-w-[420px] h-12 min-h-[48px] flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            theme="outline"
            size="large"
            shape="rectangular"
            width="420"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export const MicrosoftSignIn: React.FC<OAuthLoginProps> = () => {
  const handleMicrosoftLogin = useCallback(() => {
    toast.loading('Redirecting to Microsoft identity gateway...');
    window.location.href = `${BACKEND_ORIGIN}/api/auth/oauth/microsoft`;
  }, []);

  return (
    <button
      onClick={handleMicrosoftLogin}
      type="button"
      className="h-12 min-h-[48px] w-full px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 2h6v6H2V2zm8 0h6v6h-6V2zM2 10h6v6H2v-6zm8 0h6v6h-6v-6z" />
      </svg>
      Sign in with Microsoft
    </button>
  );
};

export const OAuthSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  return (
    <div className="space-y-4">
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
        <span className="flex-shrink mx-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Enterprise Access</span>
        <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
      </div>
      <GoogleSignIn onSuccess={onSuccess} onError={onError} />
      <MicrosoftSignIn onSuccess={onSuccess} onError={onError} />
    </div>
  );
};

export default OAuthSignIn;
