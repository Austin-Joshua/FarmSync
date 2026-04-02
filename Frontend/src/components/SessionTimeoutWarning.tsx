import { useState, useEffect } from 'react';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SESSION_WARNING_TIME = 15 * 60 * 1000; // 15 minutes
const CHECK_INTERVAL = 60 * 1000; // 1 minute

const SessionTimeoutWarning: React.FC = () => {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        const timeLeft = exp - Date.now();

        if (timeLeft <= 0) {
          logout();
          toast.error('Session expired. Please log in again.');
        } else if (timeLeft <= SESSION_WARNING_TIME) {
          setTimeRemaining(Math.floor(timeLeft / 1000));
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } catch (e) {
        console.error('Token parity check failed', e);
      }
    };

    checkToken();
    const interval = setInterval(checkToken, CHECK_INTERVAL);
    
    let countdown: NodeJS.Timeout;
    if (showWarning) {
      countdown = setInterval(() => {
        setTimeRemaining((prev: number) => {
          if (prev <= 1) {
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      if (countdown) clearInterval(countdown);
    };
  }, [user, showWarning, logout]);

  if (!showWarning || !user) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 border-t-8 border-amber-500 text-center transform scale-up-center">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-8 animate-pulse">
           <Clock size={40} />
        </div>
        
        <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 italic">Security Alert</h3>
        <p className="text-gray-500 font-medium mb-8">
          Your encryption key is rotating soon. Current session will terminate in {' '}
          <span className="text-amber-600 font-black font-mono text-xl">{formatTime(timeRemaining)}</span>
        </p>

        <div className="flex flex-col gap-3">
           <button 
             onClick={() => window.location.reload()} 
             className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all"
           >
             <RefreshCw size={20} />
             Renew Handshake
           </button>
           <button 
             onClick={() => { logout(); window.location.href = '/login'; }} 
             className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-800"
           >
             <LogOut size={20} />
             Terminate Session
           </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
