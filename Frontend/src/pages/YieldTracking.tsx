// Yield Tracking page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockYields, getCropName } from '../data/mockData';
import { translateCrop } from '../utils/translations';
import { getCropIcon } from '../utils/cropIcons';
import { Plus, TrendingUp, Award, ExternalLink, Eye } from 'lucide-react';
import { Yield } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DetailModal from '../components/DetailModal';
import { formatDateDisplay } from '../utils/dateFormatter';

const YieldTracking = () => {
  const { t } = useTranslation();
  const [yields] = useState<Yield[]>(mockYields);
  const [detailModal, setDetailModal] = useState<{
    type: 'chart' | 'records' | null;
    data?: any;
  }>({ type: null });

  const handleAddYield = () => {
    alert(t('yield.addYield') + ' - Form would open here.');
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'average':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return '⭐';
      case 'good':
        return '👍';
      case 'average':
        return '✓';
      default:
        return '📊';
    }
  };

  // Chart data
  const chartData = yields.map((yield_) => ({
    name: translateCrop(getCropName(yield_.cropId)),
    yield: yield_.quantity,
    quality: yield_.quality,
  }));

  const totalYield = yields.reduce((sum, y) => sum + y.quantity, 0);
  const averageYield = yields.length > 0 ? totalYield / yields.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('yield.title')}</h1>
          <p className="text-gray-600 mt-1">{t('yield.subtitle')}</p>
        </div>
        <button onClick={handleAddYield} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {t('yield.addYield')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('yield.totalYield')}</p>
              <p className="text-3xl font-bold text-gray-900">{totalYield.toLocaleString()} {t('common.kg')}</p>
            </div>
            <TrendingUp className="text-green-600" size={48} />
          </div>
        </div>
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('yield.averageYield')}</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(averageYield).toLocaleString()} {t('common.kg')}</p>
            </div>
            <Award className="text-blue-600" size={48} />
          </div>
        </div>
        <div className="card bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('common.total')} {t('common.records')}</p>
              <p className="text-3xl font-bold text-gray-900">{yields.length}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setDetailModal({ type: 'chart', data: chartData })}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('yield.yieldTrackingByCrop')}</h2>
          <Eye size={18} className="text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="yield" fill="#16a34a" name={`${t('yield.totalYield')} (${t('common.kg')})`} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yield Records */}
      <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setDetailModal({ type: 'records', data: yields })}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('yield.yieldTrackingRecords')}</h2>
          <Eye size={18} className="text-gray-400" />
        </div>
        <div className="space-y-4">
          {yields.length > 0 ? (
            yields.map((yield_) => (
              <div
                key={yield_.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                    <div className="text-4xl" title={translateCrop(getCropName(yield_.cropId))}>{getCropIcon(getCropName(yield_.cropId))}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                        {translateCrop(getCropName(yield_.cropId))}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('yield.harvestDate')}: {formatDateDisplay(yield_.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">{t('yield.quantity')}</p>
                      <p className="text-2xl font-bold text-gray-900">{yield_.quantity.toLocaleString()} {t('common.kg')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">{t('yield.quality')}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(yield_.quality)}`}
                      >
                        {getQualityIcon(yield_.quality)} {yield_.quality === 'excellent' ? t('yield.excellent') : yield_.quality === 'good' ? t('yield.good') : t('yield.average')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
              <p>{t('yield.noYields')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modals */}
      {detailModal.type === 'chart' && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('yield.yieldTrackingByCrop')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('yield.totalYield')}: {totalYield.toLocaleString()} {t('common.kg')}</h3>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('yield.averageYield')}: {Math.round(averageYield).toLocaleString()} {t('common.kg')}</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={detailModal.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="yield" fill="#16a34a" name={`${t('yield.totalYield')} (${t('common.kg')})`} />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {detailModal.data?.map((item: any, index: number) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</h4>
                  <p className="text-2xl font-bold text-green-600">{item.yield.toLocaleString()} {t('common.kg')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('yield.quality')}: {item.quality || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}

      {detailModal.type === 'records' && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('yield.yieldTrackingRecords')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('yield.totalYield')}</p>
                <p className="text-2xl font-bold text-green-600">{totalYield.toLocaleString()} {t('common.kg')}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('yield.averageYield')}</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(averageYield).toLocaleString()} {t('common.kg')}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')} {t('common.records')}</p>
                <p className="text-2xl font-bold text-purple-600">{detailModal.data?.length || 0}</p>
              </div>
            </div>
            <div className="space-y-3">
              {detailModal.data?.map((yield_: Yield) => (
                <div
                  key={yield_.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl" title={translateCrop(getCropName(yield_.cropId))}>{getCropIcon(getCropName(yield_.cropId))}</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          {translateCrop(getCropName(yield_.cropId))}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('yield.harvestDate')}: {formatDateDisplay(yield_.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('yield.quantity')}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{yield_.quantity.toLocaleString()} {t('common.kg')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('yield.quality')}</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(yield_.quality)}`}
                        >
                          {getQualityIcon(yield_.quality)} {yield_.quality === 'excellent' ? t('yield.excellent') : yield_.quality === 'good' ? t('yield.good') : t('yield.average')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
};

export default YieldTracking;

