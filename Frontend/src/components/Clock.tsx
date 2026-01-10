// Clock component to display current time and date
import { useState, useEffect } from 'react';
import { Clock as ClockIcon, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';

const Clock = () => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shortDate = currentTime.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="relative">
      <button
        onClick={() => setShowDate(!showDate)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out text-gray-700 dark:text-gray-300 hover:scale-105 active:scale-95"
        title={formatDate(currentTime)}
      >
        <ClockIcon size={16} className="flex-shrink-0 animate-pulse" />
        <span className="font-mono text-sm font-medium">{formatTime(currentTime)}</span>
        <CalendarIcon size={14} className="flex-shrink-0 opacity-70" />
        <span className="text-xs opacity-70 hidden sm:inline">{shortDate}</span>
      </button>

      {showDate && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 z-50 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <CalendarIcon size={18} className="text-primary-600" />
            <span className="font-semibold text-gray-900 dark:text-white">{t('common.date') || 'Date'}</span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div className="font-medium">{formatDate(currentTime)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
              {t('common.time') || 'Time'}: {formatTime(currentTime)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clock;
