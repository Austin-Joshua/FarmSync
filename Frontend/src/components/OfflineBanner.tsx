import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || !isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-top duration-500">
      <div className="bg-amber-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <WifiOff size={20} />
          </div>
          <div>
            <p className="font-black uppercase tracking-tighter text-sm italic">Neural Link Severed</p>
            <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest leading-tight">Operating in Offline Mode. Data will sync upon reconnection.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;
