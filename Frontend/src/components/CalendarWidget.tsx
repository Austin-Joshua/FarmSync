// Calendar Widget Component - Can be used across the application
import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';

interface CalendarWidgetProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  showToday?: boolean;
  className?: string;
}

const CalendarWidget = ({ 
  selectedDate, 
  onDateSelect, 
  minDate, 
  maxDate, 
  showToday = true,
  className = '' 
}: CalendarWidgetProps) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Always restrict to current date maximum
    const effectiveMaxDate = maxDate ? (maxDate < today ? maxDate : today) : today;
    const effectiveMinDate = minDate || new Date(1900, 0, 1); // Allow dates from 1900 to today
    
    if (date > effectiveMaxDate || date < effectiveMinDate) return;
    if (minDate && date < minDate) return;

    setCurrentDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Don't allow navigation beyond current month/year
    if (nextMonth.getFullYear() > today.getFullYear() || 
        (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() > today.getMonth())) {
      return;
    }
    setCurrentDate(nextMonth);
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
      month: 'long'
    });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
      weekday: 'long'
    });
    return `${day} ${month} ${year}, ${weekday}`;
  };

  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ta: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
    hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
  };

  const weekDays = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ta: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
    hi: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श']
  };

  const lang = (i18n.language || 'en') as 'en' | 'ta' | 'hi';
  const monthDays = getMonthDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <span className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-gray-500 dark:text-gray-400" />
          {(() => {
            const day = currentDate.getDate();
            const month = currentDate.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
              month: 'long'
            });
            const year = currentDate.getFullYear();
            return `${day} ${month} ${year}`;
          })()}
        </span>
        <CalendarIcon size={18} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4 w-full max-w-sm animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-150 ease-in-out hover:scale-110 active:scale-95"
                aria-label="Previous month"
                title="Previous month"
              >
                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <h3 className="font-bold text-gray-900 dark:text-white transition-all duration-200">
                {monthNames[lang][currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={handleNextMonth}
                disabled={(() => {
                  const today = new Date();
                  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                  return nextMonth.getFullYear() > today.getFullYear() || 
                         (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() > today.getMonth());
                })()}
                className={`p-1 rounded transition-all duration-150 ease-in-out hover:scale-110 active:scale-95 ${
                  (() => {
                    const today = new Date();
                    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                    return nextMonth.getFullYear() > today.getFullYear() || 
                           (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() > today.getMonth());
                  })()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label="Next month"
                title="Next month"
              >
                <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays[lang].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

                      const dateStr = date.toISOString().split('T')[0];
                      const selectedStr = currentDate.toISOString().split('T')[0];
                      const isSelected = dateStr === selectedStr;
                      const isToday = date.getTime() === today.getTime();
                      
                      // Always restrict to current date maximum
                      const effectiveMaxDate = maxDate ? (maxDate < today ? maxDate : today) : today;
                      const effectiveMinDate = minDate || new Date(1900, 0, 1);
                      const isDisabled = date > effectiveMaxDate || date < effectiveMinDate;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                          className={`aspect-square text-sm rounded transition-all duration-150 ease-in-out transform ${
                            isSelected
                              ? 'bg-primary-600 text-white font-bold scale-110 shadow-md'
                              : isDisabled
                              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
                              : isToday && showToday
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold hover:bg-primary-200 dark:hover:bg-primary-800 hover:scale-105 active:scale-95'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 active:scale-95'
                          }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Selected Date Display */}
          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('common.selected') || 'Selected'}</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatDate(currentDate)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
