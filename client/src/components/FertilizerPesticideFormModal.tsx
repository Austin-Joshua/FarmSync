// Fertilizer/Pesticide Form Modal for Adding/Editing
import { useState, useEffect } from 'react';
import { X, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Fertilizer, Pesticide } from '../types';
import CalendarWidget from './CalendarWidget';
import { useTranslation } from 'react-i18next';
import { mockCrops } from '../data/mockData';
import { translateFertilizer, translateCrop } from '../utils/translations';

interface FertilizerPesticideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Fertilizer, 'id'> | Fertilizer | Omit<Pesticide, 'id'> | Pesticide) => void;
  item?: Fertilizer | Pesticide | null;
  type: 'fertilizer' | 'pesticide';
  mode?: 'add' | 'edit';
}

const FertilizerPesticideFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  item = null, 
  type, 
  mode = 'add' 
}: FertilizerPesticideFormModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: item?.type || '',
    quantity: item?.quantity || 0,
    dateOfUsage: item?.dateOfUsage || new Date().toISOString().split('T')[0],
    cropId: (item as any)?.cropId || '',
  });

  const [selectedDate, setSelectedDate] = useState<Date>(item?.dateOfUsage ? new Date(item.dateOfUsage) : new Date());

  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type || '',
        quantity: item.quantity || 0,
        dateOfUsage: item.dateOfUsage || new Date().toISOString().split('T')[0],
        cropId: (item as any)?.cropId || '',
      });
      if (item.dateOfUsage) {
        setSelectedDate(new Date(item.dateOfUsage));
      }
    }
  }, [item]);

  const fertilizerTypes = [
    'Urea',
    'NPK (19:19:19)',
    'NPK (12:32:16)',
    'DAP',
    'MOP (Muriate of Potash)',
    'SSP (Single Super Phosphate)',
    'Zinc Sulphate',
    'Organic Compost',
    'Vermicompost',
    'Bone Meal',
  ];

  const pesticideTypes = [
    'Insecticide - Imidacloprid',
    'Insecticide - Chlorpyriphos',
    'Insecticide - Cypermethrin',
    'Fungicide - Mancozeb',
    'Fungicide - Copper Oxychloride',
    'Fungicide - Carbendazim',
    'Herbicide - Glyphosate',
    'Herbicide - 2,4-D',
    'Herbicide - Atrazine',
    'Neem Oil (Organic)',
    'Biological - Bacillus Thuringiensis',
    'Organic - Garlic Extract',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || formData.quantity <= 0 || !formData.cropId) {
      alert(t('fertilizers.fillRequiredFields') || 'Please fill in all required fields');
      return;
    }

    const itemData: any = {
      type: formData.type,
      quantity: formData.quantity,
      dateOfUsage: selectedDate.toISOString().split('T')[0],
      cropId: formData.cropId,
    };

    if (mode === 'edit' && item) {
      itemData.id = item.id;
    }

    onSave(itemData);
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl" title={type === 'fertilizer' ? t('fertilizers.fertilizer') : t('fertilizers.pesticide')}>
              {type === 'fertilizer' ? '🧪' : '☠️'}
            </span>
            {mode === 'edit' 
              ? (type === 'fertilizer' ? t('fertilizers.editFertilizer') : t('fertilizers.editPesticide'))
              : (type === 'fertilizer' ? t('fertilizers.addFertilizer') : t('fertilizers.addPesticide'))}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label htmlFor="fertilizer-type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('fertilizers.type')} *
            </label>
            <select
              id="fertilizer-type-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
              required
              aria-label={t('fertilizers.type')}
            >
              <option value="">{t('fertilizers.selectType') || 'Select type'}</option>
              {(type === 'fertilizer' ? fertilizerTypes : pesticideTypes).map((typeName) => (
                <option key={typeName} value={typeName}>
                  {translateFertilizer(typeName)}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('fertilizers.quantity')} ({type === 'fertilizer' ? t('common.kg') : t('common.l')}) *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.quantity || ''}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="input-field"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarIcon size={16} className="inline mr-2" />
              {t('fertilizers.dateOfUsage')} *
            </label>
            <CalendarWidget
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setFormData({ ...formData, dateOfUsage: date.toISOString().split('T')[0] });
              }}
              maxDate={new Date()}
              className="w-full"
            />
          </div>

          {/* Crop Selection */}
          <div>
            <label htmlFor="fertilizer-crop-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('fertilizers.crop')} *
            </label>
            <select
              id="fertilizer-crop-select"
              value={formData.cropId}
              onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              className="input-field"
              required
              aria-label={t('fertilizers.crop')}
            >
              <option value="">-- {t('fertilizers.selectCrop') || 'Select crop'} --</option>
              {mockCrops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {translateCrop(crop.name)} ({crop.season})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {mode === 'edit' ? t('common.save') : (type === 'fertilizer' ? t('fertilizers.addFertilizer') : t('fertilizers.addPesticide'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FertilizerPesticideFormModal;
