// Crop Form Modal for Adding/Editing Crops
import { useState, useEffect } from 'react';
import { X, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Crop } from '../types';
import { mockCrops } from '../data/mockData';
import CalendarWidget from './CalendarWidget';
import { useTranslation } from 'react-i18next';
import { translateCrop, translateCategory, translateSeason } from '../utils/translations';

interface CropFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (crop: Omit<Crop, 'id'> | Crop) => void;
  crop?: Crop | null;
  mode?: 'add' | 'edit';
}

const CropFormModal = ({ isOpen, onClose, onSave, crop = null, mode = 'add' }: CropFormModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: crop?.name || '',
    season: crop?.season || 'Kharif',
    sowingDate: crop?.sowingDate || new Date().toISOString().split('T')[0],
    harvestDate: crop?.harvestDate || '',
    status: crop?.status || 'planned',
    farmId: crop?.farmId || '1',
    category: crop?.category || 'Grains',
    n: crop?.n || 0,
    p: crop?.p || 0,
    k: crop?.k || 0,
    temperature: crop?.temperature || 0,
    humidity: crop?.humidity || 0,
    ph: crop?.ph || 0,
    rainfall: crop?.rainfall || 0,
    growthPeriod: crop?.growthPeriod || 0,
    waterRequirement: crop?.waterRequirement || 'medium',
    averageYield: crop?.averageYield || 0,
  });

  const [selectedSowingDate, setSelectedSowingDate] = useState<Date>(crop?.sowingDate ? new Date(crop.sowingDate) : new Date());
  const [selectedHarvestDate, setSelectedHarvestDate] = useState<Date>(crop?.harvestDate ? new Date(crop.harvestDate) : new Date());

  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name || '',
        season: crop.season || 'Kharif',
        sowingDate: crop.sowingDate || new Date().toISOString().split('T')[0],
        harvestDate: crop.harvestDate || '',
        status: crop.status || 'planned',
        farmId: crop.farmId || '1',
        category: crop.category || 'Grains',
        n: crop.n || 0,
        p: crop.p || 0,
        k: crop.k || 0,
        temperature: crop.temperature || 0,
        humidity: crop.humidity || 0,
        ph: crop.ph || 0,
        rainfall: crop.rainfall || 0,
        growthPeriod: crop.growthPeriod || 0,
        waterRequirement: crop.waterRequirement || 'medium',
        averageYield: crop.averageYield || 0,
      });
      if (crop.sowingDate) setSelectedSowingDate(new Date(crop.sowingDate));
      if (crop.harvestDate) setSelectedHarvestDate(new Date(crop.harvestDate));
    }
  }, [crop]);

  const cropNames = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Banana', 'Mango', 'ChickPea', 'Blackgram', 'Coffee', 'Grapes', 
                     'Sugarcane', 'Potato', 'Onion', 'Tomato', 'Coconut', 'Groundnut', 'Soybean', 'Sunflower', 'Mustard', 'Turmeric'];
  
  const categories = ['Grains', 'Fiber', 'Fruits', 'Pulses', 'Beverages', 'Vegetables', 'Spices', 'Oilseeds'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sowingDate) {
      alert(t('crops.nameAndSowingDateRequired') || 'Crop name and sowing date are required');
      return;
    }

    const cropData: any = {
      ...formData,
      sowingDate: selectedSowingDate.toISOString().split('T')[0],
      harvestDate: selectedHarvestDate.toISOString().split('T')[0],
    };

    if (mode === 'edit' && crop) {
      cropData.id = crop.id;
    }

    onSave(cropData);
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? t('crops.editCrop') || 'Edit Crop' : t('crops.addNewCrop') || 'Add New Crop'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Crop Name */}
            <div>
              <label htmlFor="crop-name-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('crops.cropName') || 'Crop Name'} *
              </label>
              <select
                id="crop-name-select"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
                aria-label={t('crops.cropName') || 'Crop Name'}
              >
                <option value="">{t('crops.selectCrop') || 'Select Crop'}</option>
                {cropNames.map((name) => (
                  <option key={name} value={name}>{translateCrop(name)}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="crop-category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('crops.category') || 'Category'} *
              </label>
              <select
                id="crop-category-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                required
                aria-label={t('crops.category') || 'Category'}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{translateCategory(cat)}</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label htmlFor="crop-season-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('crops.season') || 'Season'} *
              </label>
              <select
                id="crop-season-select"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="input-field"
                required
                aria-label={t('crops.season') || 'Season'}
              >
                <option value="Kharif">{translateSeason('Kharif')}</option>
                <option value="Rabi">{translateSeason('Rabi')}</option>
                <option value="Year-round">{translateSeason('Year-round')}</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="crop-status-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('crops.status') || 'Status'} *
              </label>
              <select
                id="crop-status-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="input-field"
                required
                aria-label={t('crops.status') || 'Status'}
              >
                <option value="planned">{t('crops.planned')}</option>
                <option value="active">{t('crops.active')}</option>
                <option value="harvested">{t('crops.harvested')}</option>
              </select>
            </div>

            {/* Sowing Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CalendarIcon size={16} className="inline mr-2" />
                {t('crops.sowingDate') || 'Sowing Date'} *
              </label>
              <CalendarWidget
                selectedDate={selectedSowingDate}
                onDateSelect={(date) => {
                  setSelectedSowingDate(date);
                  setFormData({ ...formData, sowingDate: date.toISOString().split('T')[0] });
                }}
                maxDate={new Date()}
                className="w-full"
              />
            </div>

            {/* Harvest Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CalendarIcon size={16} className="inline mr-2" />
                {t('crops.harvestDate') || 'Harvest Date'} *
              </label>
              <CalendarWidget
                selectedDate={selectedHarvestDate}
                onDateSelect={(date) => {
                  setSelectedHarvestDate(date);
                  setFormData({ ...formData, harvestDate: date.toISOString().split('T')[0] });
                }}
                minDate={selectedSowingDate}
                maxDate={new Date()}
                className="w-full"
              />
            </div>

            {/* Growth Period (days) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('crops.growthPeriod') || 'Growth Period (days)'}
              </label>
              <input
                type="number"
                value={formData.growthPeriod || ''}
                onChange={(e) => setFormData({ ...formData, growthPeriod: parseInt(e.target.value) || 0 })}
                className="input-field"
                placeholder="120"
              />
            </div>

            {/* Average Yield (kg) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('crops.averageYield') || 'Average Yield (kg)'}
              </label>
              <input
                type="number"
                value={formData.averageYield || ''}
                onChange={(e) => setFormData({ ...formData, averageYield: parseInt(e.target.value) || 0 })}
                className="input-field"
                placeholder="2500"
              />
            </div>

            {/* Water Requirement */}
            <div>
              <label htmlFor="crop-water-requirement-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('crops.waterRequirement') || 'Water Requirement'}
              </label>
              <select
                id="crop-water-requirement-select"
                value={formData.waterRequirement}
                onChange={(e) => setFormData({ ...formData, waterRequirement: e.target.value as any })}
                className="input-field"
                aria-label={t('crops.waterRequirement') || 'Water Requirement'}
              >
                <option value="low">{t('crops.low') || 'Low'}</option>
                <option value="medium">{t('crops.medium') || 'Medium'}</option>
                <option value="high">{t('crops.high') || 'High'}</option>
              </select>
            </div>
          </div>

          {/* Soil Parameters Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('crops.soilParameters') || 'Soil Parameters'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">N (Nitrogen)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.n || ''}
                  onChange={(e) => setFormData({ ...formData, n: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">P (Phosphorus)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.p || ''}
                  onChange={(e) => setFormData({ ...formData, p: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">K (Potassium)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.k || ''}
                  onChange={(e) => setFormData({ ...formData, k: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">pH</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ph || ''}
                  onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="6.5"
                />
              </div>
            </div>
          </div>

          {/* Weather Parameters */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('crops.weatherParameters') || 'Weather Parameters'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('weather.temperature') || 'Temperature'} (°C)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.temperature || ''}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('weather.humidity') || 'Humidity'} (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.humidity || ''}
                  onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('weather.rainfall') || 'Rainfall'} (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rainfall || ''}
                  onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {mode === 'edit' ? t('common.save') || 'Save Changes' : t('crops.addCrop') || 'Add Crop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropFormModal;
