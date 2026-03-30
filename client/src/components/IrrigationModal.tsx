import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Droplets, Save } from 'lucide-react';
import { Irrigation } from '../types';
import { mockCrops } from '../data/mockData';
import { useTranslation } from 'react-i18next';
import CalendarWidget from './CalendarWidget';

interface IrrigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (irrigation: Omit<Irrigation, 'id'> | Irrigation) => void;
  irrigation?: Irrigation | null;
  mode?: 'add' | 'edit';
}

const IrrigationModal = ({ isOpen, onClose, onSave, irrigation = null, mode = 'add' }: IrrigationModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    cropId: irrigation?.cropId || '',
    method: (irrigation?.method || 'drip') as 'drip' | 'sprinkler' | 'manual',
    date: irrigation?.date || new Date().toISOString().split('T')[0],
    duration: irrigation?.duration || 2,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(irrigation?.date ? new Date(irrigation.date) : new Date());

  useEffect(() => {
    if (irrigation) {
      // Editing existing irrigation - use its date
      setFormData({
        cropId: irrigation.cropId || '',
        method: irrigation.method || 'drip',
        date: irrigation.date || new Date().toISOString().split('T')[0],
        duration: irrigation.duration || 2,
      });
      if (irrigation.date) {
        setSelectedDate(new Date(irrigation.date));
      }
    } else {
      // Adding new irrigation - reset to current date
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString().split('T')[0];
      setFormData({
        cropId: '',
        method: 'drip',
        date: currentDateString,
        duration: 2,
      });
      setSelectedDate(currentDate);
    }
  }, [irrigation, isOpen]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cropId) {
      alert(t('irrigation.selectCrop') || 'Please select a crop');
      return;
    }

    const irrigationData: any = {
      cropId: formData.cropId,
      method: formData.method,
      date: selectedDate.toISOString().split('T')[0],
      duration: formData.duration,
    };

    if (mode === 'edit' && irrigation) {
      irrigationData.id = irrigation.id;
    }

    onSave(irrigationData);

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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Droplets size={24} className="text-primary-600" />
            {mode === 'edit' ? t('irrigation.editIrrigation') : t('irrigation.scheduleIrrigation')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t('common.close') || 'Close'}
            title={t('common.close') || 'Close'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Crop Selection */}
          <div>
            <label htmlFor="irrigation-crop-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('irrigation.selectCrop') || 'Select Crop'} *
            </label>
            <select
              id="irrigation-crop-select"
              value={formData.cropId}
              onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              aria-label={t('irrigation.selectCrop') || 'Select Crop'}
            >
              <option value="">-- {t('irrigation.selectCrop') || 'Select a crop'} --</option>
              {mockCrops.filter(crop => crop.status === 'active' || crop.status === 'planned').map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({crop.season})
                </option>
              ))}
            </select>
          </div>

          {/* Irrigation Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('irrigation.method')} *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'drip', label: t('irrigation.drip'), icon: '💧' },
                { value: 'sprinkler', label: t('irrigation.sprinkler'), icon: '🌧️' },
                { value: 'manual', label: t('irrigation.manual'), icon: '🚿' },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, method: method.value as any })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.method === method.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{method.icon}</div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection with Calendar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarIcon size={16} className="inline mr-2" />
              {t('irrigation.date')} *
            </label>
            <CalendarWidget
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setFormData({ ...formData, date: date.toISOString().split('T')[0] });
              }}
              maxDate={new Date()}
              className="w-full"
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="irrigation-duration-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('irrigation.duration')} ({t('irrigation.hours')}) *
            </label>
            <input
              id="irrigation-duration-input"
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              aria-label={t('irrigation.duration')}
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('irrigation.durationHint') || 'Enter duration in hours (e.g., 2.5 for 2 hours 30 minutes)'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 text-gray-900 dark:text-white"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {mode === 'edit' ? t('common.save') : t('irrigation.scheduleIrrigation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IrrigationModal;
