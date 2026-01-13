import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SESSION_WARNING_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const CHECK_INTERVAL = 60 * 1000; // Check every minute

const SessionTimeoutWarning: React.FC = () => {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowWarning(false);
        return;
      }

      try {
        // Decode JWT token to get expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        if (timeUntilExpiration <= 0) {
          // Token already expired
          logout();
          return;
        }

        if (timeUntilExpiration <= SESSION_WARNING_TIME) {
          // Show warning if less than 15 minutes remaining
          setTimeRemaining(Math.floor(timeUntilExpiration / 1000)); // Convert to seconds
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
        setShowWarning(false);
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check periodically
    const interval = setInterval(checkTokenExpiration, CHECK_INTERVAL);

    // Update countdown every second when warning is shown
    const countdownInterval = setInterval(() => {
      if (showWarning) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            setTimeRemaining(Math.max(0, Math.floor(timeUntilExpiration / 1000)));
            
            if (timeUntilExpiration <= 0) {
              logout();
            }
          } catch (error) {
            console.error('Error updating countdown:', error);
          }
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [user, showWarning, logout]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      // Call refresh token endpoint if available, or just hide warning
      // For now, we'll just refresh the page to get a new token
      window.location.reload();
    } catch (error) {
      console.error('Error extending session:', error);
      setIsExtending(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border-2 border-amber-500">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="text-amber-600 dark:text-amber-400" size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Session Expiring Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your session will expire in{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {formatTime(timeRemaining)}
              </span>
              . Would you like to extend your session?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExtendSession}
                disabled={isExtending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} className={isExtending ? 'animate-spin' : ''} />
                {isExtending ? 'Extending...' : 'Extend Session'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
