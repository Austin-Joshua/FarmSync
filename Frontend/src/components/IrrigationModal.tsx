import { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, Droplets, Save } from 'lucide-react';
import { Irrigation } from '../types';
import { mockCrops } from '../data/mockData';

interface IrrigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (irrigation: Omit<Irrigation, 'id'>) => void;
}

const IrrigationModal = ({ isOpen, onClose, onSave }: IrrigationModalProps) => {
  const [formData, setFormData] = useState({
    cropId: '',
    method: 'drip' as 'drip' | 'sprinkler' | 'manual',
    date: new Date().toISOString().split('T')[0],
    duration: 2,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCalendar &&
        calendarRef.current &&
        dateInputRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !dateInputRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Get current month dates
  const getMonthDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const monthDays = getMonthDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, date: date.toISOString().split('T')[0] });
      setShowCalendar(false);
    }
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cropId) {
      alert('Please select a crop');
      return;
    }

    onSave({
      cropId: formData.cropId,
      method: formData.method,
      date: formData.date,
      duration: formData.duration,
    });

    // Reset form
    setFormData({
      cropId: '',
      method: 'drip',
      date: new Date().toISOString().split('T')[0],
      duration: 2,
    });
    setSelectedDate(new Date());
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Droplets size={24} className="text-primary-600" />
            Schedule Irrigation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Crop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Crop *
            </label>
            <select
              value={formData.cropId}
              onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">-- Select a crop --</option>
              {mockCrops.filter(crop => crop.status === 'active').map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({crop.season})
                </option>
              ))}
            </select>
          </div>

          {/* Irrigation Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Irrigation Method *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'drip', label: 'Drip', icon: '💧' },
                { value: 'sprinkler', label: 'Sprinkler', icon: '🌧️' },
                { value: 'manual', label: 'Manual', icon: '🚿' },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, method: method.value as any })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.method === method.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{method.icon}</div>
                  <div className="font-medium text-gray-900 capitalize">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection with Calendar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Irrigation Date *
            </label>
            <div className="relative" ref={dateInputRef}>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-gray-500" />
                  {formatDate(formData.date)}
                </span>
                <CalendarIcon size={18} className="text-gray-400" />
              </button>

              {showCalendar && (
                <div ref={calendarRef} className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 w-full max-w-sm">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      ←
                    </button>
                    <h3 className="font-bold text-gray-900">
                      {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h3>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      →
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
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
                      const isSelected = dateStr === formData.date;
                      const isToday = date.getTime() === today.getTime();
                      const isPast = date < today;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => !isPast && handleDateSelect(date)}
                          disabled={isPast}
                          className={`aspect-square text-sm rounded transition-colors ${
                            isSelected
                              ? 'bg-primary-600 text-white font-bold'
                              : isPast
                              ? 'text-gray-300 cursor-not-allowed'
                              : isToday
                              ? 'bg-primary-100 text-primary-700 font-semibold hover:bg-primary-200'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Date Display */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">Selected:</p>
                    <p className="font-semibold text-gray-900">{formatDate(formData.date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours) *
            </label>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter duration in hours (e.g., 2.5 for 2 hours 30 minutes)</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Schedule Irrigation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IrrigationModal;
