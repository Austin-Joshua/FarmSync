import React, { useCallback, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface OAuthLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GoogleSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();

  const handleGoogleSuccess = useCallback(
    async (credentialResponse: any) => {
      try {
        const { credential } = credentialResponse;

        // Send token to backend
        const response = await axios.post('/api/auth/google-verify', {
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
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text="signin_with"
          theme="outline"
          size="large"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export const MicrosoftSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();

  const handleMicrosoftLogin = useCallback(() => {
    // Redirect to Microsoft OAuth endpoint
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/microsoft/callback`;
    const scopes = 'openid profile email';
    
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;
    
    window.location.href = authUrl;
  }, []);

  return (
    <button
      onClick={handleMicrosoftLogin}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium w-full"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 2h6v6H2V2zm8 0h6v6h-6V2zM2 10h6v6H2v-6zm8 0h6v6h-6v-6z" />
      </svg>
      Sign in with Microsoft
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
        const backendResponse = await axios.post('/api/auth/apple', {
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
      onClick={handleAppleSignIn}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition font-medium w-full"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.05 13.5c-.91 0-1.82.55-2.25 1.74.5.92 1.3 1.84 2.25 1.84 1.02 0 1.84-.82 1.84-1.84 0-1.02-.82-1.74-1.84-1.74m-4.7-2.5c-1.97 0-3.6 1.63-3.6 3.6s1.63 3.6 3.6 3.6 3.6-1.63 3.6-3.6-1.63-3.6-3.6-3.6m9.01 6.31c-.37.52-.77.91-1.71.91-.94 0-1.34-.39-1.71-.91l-2.05-2.92c-.37-.52-.77-.91-1.71-.91s-1.34.39-1.71.91l-2.05 2.92c-.37.52-.77.91-1.71.91s-1.34-.39-1.71-.91l-2.05-2.92c-.37-.52-.77-.91-1.71-.91-.94 0-1.34.39-1.71.91" />
      </svg>
      Sign in with Apple
    </button>
  );
};

export const OAuthSignIn: React.FC<OAuthLoginProps> = ({ onSuccess, onError }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Sign in with:</h3>
      <GoogleSignIn onSuccess={onSuccess} onError={onError} />
      <MicrosoftSignIn onSuccess={onSuccess} onError={onError} />
      <AppleSignIn onSuccess={onSuccess} onError={onError} />
    </div>
  );
};

export default OAuthSignIn;
