// Fertilizer & Pesticide Tracking page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockFertilizers, mockPesticides, getCropName } from '../data/mockData';
import { translateFertilizer } from '../utils/translations';
import { Plus, Droplets, Bug } from 'lucide-react';

const FertilizerPesticide = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'fertilizer' | 'pesticide'>('fertilizer');

  const handleAdd = () => {
    alert(activeTab === 'fertilizer' ? t('fertilizers.addFertilizer') : t('fertilizers.addPesticide'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('fertilizers.title')}</h1>
          <p className="text-gray-600 mt-1">{t('fertilizers.subtitle')}</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {activeTab === 'fertilizer' ? t('fertilizers.addFertilizer') : t('fertilizers.addPesticide')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('fertilizer')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'fertilizer'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Droplets size={20} className="inline mr-2" />
          {t('fertilizers.fertilizers')}
        </button>
        <button
          onClick={() => setActiveTab('pesticide')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'pesticide'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bug size={20} className="inline mr-2" />
          {t('fertilizers.pesticides')}
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('fertilizers.type')}</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('fertilizers.quantity')}</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('fertilizers.dateOfUsage')}</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('fertilizers.crop')}</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'fertilizer' ? (
              mockFertilizers.length > 0 ? (
                mockFertilizers.map((fertilizer) => (
                  <tr key={fertilizer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{translateFertilizer(fertilizer.type)}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{fertilizer.quantity} {t('common.kg')}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(fertilizer.dateOfUsage).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{getCropName(fertilizer.cropId)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    {t('fertilizers.noFertilizers')}
                  </td>
                </tr>
              )
            ) : mockPesticides.length > 0 ? (
              mockPesticides.map((pesticide) => (
                <tr key={pesticide.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{translateFertilizer(pesticide.type)}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{pesticide.quantity} {t('common.l')}</td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(pesticide.dateOfUsage).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{getCropName(pesticide.cropId)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500">
                  {t('fertilizers.noPesticides')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('fertilizers.totalFertilizersUsed')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {mockFertilizers.reduce((sum, f) => sum + f.quantity, 0)} {t('common.kg')}
              </p>
            </div>
            <Droplets className="text-blue-600" size={48} />
          </div>
        </div>
        <div className="card bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('fertilizers.totalPesticidesUsed')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {mockPesticides.reduce((sum, p) => sum + p.quantity, 0)} {t('common.l')}
              </p>
            </div>
            <Bug className="text-red-600" size={48} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerPesticide;

