// Handles ?token= from OAuth redirects (Google/Microsoft backend callback)
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OAuthTokenHandler({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token || processing) return;

    setProcessing(true);
    const handleAuth = async () => {
      try {
        await loginWithToken(token);
        toast.success('Successfully signed in with OAuth');
        const path = location.pathname !== '/login' ? location.pathname : '/dashboard';
        navigate(path, { replace: true });
      } catch (error) {
        console.error('OAuth token processing failed', error);
        toast.error('Identity verification failed');
      } finally {
        setProcessing(false);
      }
    };

    handleAuth();
  }, [location.search, location.pathname, loginWithToken, navigate, processing]);

  const params = new URLSearchParams(location.search);
  const hasToken = params.has('token');

  if (hasToken || processing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="animate-spin h-12 w-12 text-primary-600 mb-6" />
        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Securing Neural Link</h2>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Authorizing OAuth Handshake...</p>
      </div>
    );
  }

  return <>{children}</>;
}
