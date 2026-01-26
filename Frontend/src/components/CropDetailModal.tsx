// Crop Detail Modal - Shows detailed view when clicking on a crop card
import { X, Calendar as CalendarIcon, Droplet, Thermometer, CloudRain, Leaf, Ruler, TrendingUp } from 'lucide-react';
import { Crop } from '../types';
import { useTranslation } from 'react-i18next';
import { translateCrop, translateCategory, translateSeason } from '../utils/translations';
import { getCropIcon } from '../utils/cropIcons';
import i18n from '../i18n/config';

interface CropDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: Crop | null;
}

const CropDetailModal = ({ isOpen, onClose, crop }: CropDetailModalProps) => {
  const { t } = useTranslation();

  if (!isOpen || !crop) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'harvested':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleDateString(
      i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US',
      { month: 'long' }
    );
    const year = d.getFullYear();
    const weekday = d.toLocaleDateString(
      i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US',
      { weekday: 'long' }
    );
    return `${day} ${month} ${year}, ${weekday}`;
  };

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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{getCropIcon(crop.name)}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {translateCrop(crop.name)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {translateCategory(crop.category || '')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(crop.status)}`}>
              {crop.status === 'active' ? t('crops.active') : 
               crop.status === 'harvested' ? t('crops.harvested') : 
               t('crops.planned')}
            </span>
            <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
              {translateSeason(crop.season)}
            </span>
          </div>

          {/* Timeline Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon size={18} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('crops.sowingDate') || 'Sowing Date'}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{formatDate(crop.sowingDate)}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon size={18} className="text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('crops.harvestDate') || 'Harvest Date'}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{formatDate(crop.harvestDate)}</p>
            </div>
          </div>

          {/* Growth Period & Yield */}
          {(crop.growthPeriod || crop.averageYield) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crop.growthPeriod && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf size={18} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('crops.growthPeriod') || 'Growth Period'}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crop.growthPeriod} {t('crops.days') || 'days'}
                  </p>
                </div>
              )}

              {crop.averageYield && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-orange-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('crops.averageYield') || 'Average Yield'}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crop.averageYield.toLocaleString()} {t('common.kg')}/acre
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Soil Parameters */}
          {(crop.n || crop.p || crop.k || crop.ph) && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('crops.soilParameters') || 'Soil Parameters'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {crop.n && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Nitrogen (N)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{crop.n.toFixed(2)}</p>
                  </div>
                )}
                {crop.p && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Phosphorus (P)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{crop.p.toFixed(2)}</p>
                  </div>
                )}
                {crop.k && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Potassium (K)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{crop.k.toFixed(2)}</p>
                  </div>
                )}
                {crop.ph && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">pH Level</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{crop.ph.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Weather Parameters */}
          {(crop.temperature || crop.humidity || crop.rainfall) && (
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('crops.weatherParameters') || 'Weather Parameters'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {crop.temperature && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Thermometer size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('weather.temperature') || 'Temperature'}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {crop.temperature.toFixed(1)}°C
                      </p>
                    </div>
                  </div>
                )}
                {crop.humidity && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Droplet size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('weather.humidity') || 'Humidity'}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {crop.humidity.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
                {crop.rainfall && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      <CloudRain size={24} className="text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('weather.rainfall') || 'Rainfall'}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {crop.rainfall.toFixed(1)} mm
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Water Requirement */}
          {crop.waterRequirement && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-3">
                <Droplet size={24} className="text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('crops.waterRequirement') || 'Water Requirement'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {crop.waterRequirement === 'low' ? t('crops.low') : 
                     crop.waterRequirement === 'medium' ? t('crops.medium') : 
                     t('crops.high')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Farm ID */}
          <div className="text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <strong>{t('crops.farmId') || 'Farm ID'}:</strong> {crop.farmId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetailModal;
