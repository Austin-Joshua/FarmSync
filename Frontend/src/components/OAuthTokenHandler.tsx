// Handles ?token= from OAuth redirects (Google/Microsoft backend callback)
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthTokenHandler({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { applyTokenFromUrl } = useAuth();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token || processing) return;

    let cancelled = false;
    setProcessing(true);
    applyTokenFromUrl(token).then((ok) => {
      if (cancelled) return;
      setProcessing(false);
      const path = location.pathname || '/dashboard';
      const remainder = location.search.replace(/\btoken=[^&]*&?/g, '').replace(/&$/, '');
      navigate(path + (remainder ? '?' + remainder : ''), { replace: true });
    }).catch(() => {
      if (!cancelled) setProcessing(false);
    });
    return () => { cancelled = true; };
  }, [location.search, location.pathname, applyTokenFromUrl, navigate, processing]);

  const params = new URLSearchParams(location.search);
  const hasToken = params.has('token');

  if (hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Signing you in...</p>
      </div>
    );
  }

  return <>{children}</>;
}
