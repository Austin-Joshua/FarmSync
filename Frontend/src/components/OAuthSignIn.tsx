import { useCallback, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL, BACKEND_ORIGIN } from '../config/api';

interface OAuthLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: 'light' | 'dark';
}

export const GoogleSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();

  const handleGoogleSuccess = useCallback(
    async (credentialResponse: any) => {
      try {
        const { credential } = credentialResponse;

        // Send token to backend
        const response = await axios.post(`${API_BASE_URL}/auth/google-verify`, {
          token: credential,
        });

        if (response.data.token) {
          login(response.data.token, response.data.user);
          onSuccess?.();
        }
      } catch (error: any) {
        console.error('Google sign-in error:', error);
        onError?.(error.response?.data?.message || 'Google sign-in failed');
      }
    },
    [login, onSuccess, onError]
  );

  const handleGoogleError = useCallback(() => {
    onError?.('Google sign-in failed. Please try again.');
  }, [onError]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="w-full">
        <div className="mx-auto w-full max-w-[420px] h-12 min-h-[48px] flex items-center justify-center overflow-hidden [&_iframe]:block [&_iframe]:mx-auto [&_iframe]:max-w-full [&_iframe]:w-full [&_iframe]:!min-h-[48px]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            theme="outline"
            size="large"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export const MicrosoftSignIn: React.FC<OAuthLoginProps> = () => {
  const handleMicrosoftLogin = useCallback(() => {
    // Use backend OAuth route: backend redirects to Microsoft then to backend callback, then to frontend with ?token=
    window.location.href = `${BACKEND_ORIGIN}/api/auth/oauth/microsoft`;
  }, []);

  return (
    <button
      onClick={handleMicrosoftLogin}
      type="button"
      className="h-12 min-h-[48px] min-w-0 w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-semibold text-sm"
    >
      <span className="w-full flex items-center justify-center gap-2 min-w-0 leading-none">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M2 2h6v6H2V2zm8 0h6v6h-6V2zM2 10h6v6H2v-6zm8 0h6v6h-6v-6z" />
        </svg>
        <span className="min-w-0 truncate text-center">Sign in with Microsoft</span>
      </span>
    </button>
  );
};

interface AppleSignInResponse {
  user?: {
    name?: {
      firstName?: string;
      lastName?: string;
    };
    email?: string;
  };
  authorization?: {
    id_token: string;
    code: string;
  };
}

export const AppleSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();

  useEffect(() => {
    // Initialize Apple Sign-in
    if ((window as any).AppleID) {
      (window as any).AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
        teamId: import.meta.env.VITE_APPLE_TEAM_ID,
        redirectURI: `${window.location.origin}/auth/apple/callback`,
        scope: 'name email',
        usePopup: true,
      });
    }
  }, []);

  const handleAppleSignIn = useCallback(async () => {
    try {
      const response: AppleSignInResponse = await (window as any).AppleID.auth.signIn();

      if (response.authorization) {
        const backendResponse = await axios.post(`${API_BASE_URL}/auth/oauth/apple`, {
          user: response.user,
          identityToken: response.authorization.id_token,
        });

        if (backendResponse.data.token) {
          login(backendResponse.data.token, backendResponse.data.user);
          onSuccess?.();
        }
      }
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      onError?.(error.response?.data?.message || 'Apple sign-in failed');
    }
  }, [login, onSuccess, onError]);

  return (
    <button
      type="button"
      onClick={handleAppleSignIn}
      className="h-12 min-h-[48px] min-w-0 w-full px-4 py-3 rounded-lg bg-black text-white hover:bg-gray-900 transition font-semibold text-sm"
    >
      <span className="w-full flex items-center justify-center gap-2 min-w-0 leading-none">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.05 13.5c-.91 0-1.82.55-2.25 1.74.5.92 1.3 1.84 2.25 1.84 1.02 0 1.84-.82 1.84-1.84 0-1.02-.82-1.74-1.84-1.74m-4.7-2.5c-1.97 0-3.6 1.63-3.6 3.6s1.63 3.6 3.6 3.6 3.6-1.63 3.6-3.6-1.63-3.6-3.6-3.6m9.01 6.31c-.37.52-.77.91-1.71.91-.94 0-1.34-.39-1.71-.91l-2.05-2.92c-.37-.52-.77-.91-1.71-.91s-1.34.39-1.71.91l-2.05 2.92c-.37.52-.77.91-1.71.91s-1.34-.39-1.71-.91l-2.05-2.92c-.37-.52-.77-.91-1.71-.91-.94 0-1.34.39-1.71.91\" />
        </svg>
        <span className="min-w-0 truncate text-center">Sign in with Apple</span>
      </span>
    </button>
  );
};

export const OAuthSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError, variant = 'light' }) => {
  const isDark = variant === 'dark';
  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-semibold mb-3 text-center ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Sign in with:</h3>
      <GoogleSignIn onSuccess={onSuccess} onError={onError} />
    </div>
  );
};

export default OAuthSignIn;
