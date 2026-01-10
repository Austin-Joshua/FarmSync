// Crop card component for displaying crop information
import { useTranslation } from 'react-i18next';
import { Crop } from '../types';
import { Calendar, Droplet, Thermometer, CloudRain, Leaf } from 'lucide-react';
import { translateCrop, translateCategory, translateSeason } from '../utils/translations';

interface CropCardProps {
  crop: Crop;
  onView?: (crop: Crop) => void;
}

const CropCard = ({ crop, onView }: CropCardProps) => {
  const { t } = useTranslation();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'harvested':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWaterRequirementColor = (requirement?: string) => {
    switch (requirement) {
      case 'low':
        return 'text-blue-600';
      case 'medium':
        return 'text-green-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="card hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-900">{translateCrop(crop.name)}</h3>
            {crop.category && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                {translateCategory(crop.category)}
              </span>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
            {crop.status === 'active' ? t('crops.active') : crop.status === 'harvested' ? t('crops.harvested') : t('crops.planned')}
          </span>
        </div>
        <div className="text-4xl">🌾</div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-600" />
          <span>
            <strong>{t('crops.season')}:</strong> {translateSeason(crop.season)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-600" />
          <span>
            <strong>{t('crops.sowing')}:</strong> {new Date(crop.sowingDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-600" />
          <span>
            <strong>{t('crops.harvest')}:</strong> {new Date(crop.harvestDate).toLocaleDateString()}
          </span>
        </div>
        {crop.growthPeriod && (
          <div className="flex items-center gap-2">
            <Leaf size={16} className="text-primary-600" />
            <span>
              <strong>{t('crops.growthPeriod')}:</strong> {crop.growthPeriod} {t('crops.days')}
            </span>
          </div>
        )}
      </div>

      {/* Dataset Information */}
      {(crop.temperature || crop.humidity || crop.ph || crop.rainfall || crop.n || crop.p || crop.k) && (
        <div className="border-t pt-3 mt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">{t('crops.optimalConditions')} ({t('crops.note').toLowerCase()}):</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {crop.temperature && (
              <div className="flex items-center gap-1">
                <Thermometer size={12} className="text-orange-500" />
                <span className="text-gray-600">
                  <strong>{t('crops.temp')}:</strong> {crop.temperature}°C
                </span>
              </div>
            )}
            {crop.humidity && (
              <div className="flex items-center gap-1">
                <Droplet size={12} className="text-blue-500" />
                <span className="text-gray-600">
                  <strong>{t('crops.humidity')}:</strong> {crop.humidity}%
                </span>
              </div>
            )}
            {crop.ph && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600">
                  <strong>{t('crops.ph')}:</strong> {crop.ph}
                </span>
              </div>
            )}
            {crop.rainfall && (
              <div className="flex items-center gap-1">
                <CloudRain size={12} className="text-blue-600" />
                <span className="text-gray-600">
                  <strong>{t('crops.rainfall')}:</strong> {crop.rainfall}mm
                </span>
              </div>
            )}
            {crop.n && crop.p && crop.k && (
              <>
                <div className="text-gray-600">
                  <strong>N:</strong> {crop.n}
                </div>
                <div className="text-gray-600">
                  <strong>P:</strong> {crop.p}
                </div>
                <div className="text-gray-600">
                  <strong>K:</strong> {crop.k}
                </div>
              </>
            )}
          </div>
          {crop.waterRequirement && (
            <div className="mt-2 flex items-center gap-1">
              <Droplet size={12} className={getWaterRequirementColor(crop.waterRequirement)} />
              <span className={`text-xs font-medium ${getWaterRequirementColor(crop.waterRequirement)}`}>
                {t('crops.waterRequirement')}: <span className="capitalize">
                  {crop.waterRequirement === 'low' ? t('crops.low') : crop.waterRequirement === 'medium' ? t('crops.medium') : t('crops.high')}
                </span>
              </span>
            </div>
          )}
          {crop.averageYield && (
            <div className="mt-2 text-xs text-gray-600">
              <strong>{t('crops.avgYield')}:</strong> {crop.averageYield.toLocaleString()} {t('common.kg')}/acre
            </div>
          )}
        </div>
      )}

      {onView && (
        <button
          onClick={() => onView(crop)}
          className="mt-4 w-full btn-primary"
        >
          {t('common.viewDetails') || 'View Details'}
        </button>
      )}
    </div>
  );
};

export default CropCard;

