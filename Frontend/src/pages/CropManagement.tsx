// Crop Management page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CropCard from '../components/CropCard';
import { mockCrops } from '../data/mockData';
import { Crop } from '../types';
import { Plus, Search, Filter } from 'lucide-react';

const CropManagement = () => {
  const { t } = useTranslation();
  const [crops] = useState<Crop[]>(mockCrops);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredCrops = crops.filter((crop) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      crop.name.toLowerCase().includes(searchLower) ||
      crop.category?.toLowerCase().includes(searchLower) ||
      crop.season.toLowerCase().includes(searchLower);
    const matchesFilter = filterStatus === 'all' || crop.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddCrop = () => {
    alert(t('crops.addNewCrop') + ' - Form would open here.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('crops.title')}</h1>
          <p className="text-gray-600 mt-1">{t('crops.subtitle')}</p>
        </div>
        <button onClick={handleAddCrop} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {t('crops.addNewCrop')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('crops.searchCrops')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">{t('crops.allStatus')}</option>
              <option value="active">{t('crops.active')}</option>
              <option value="harvested">{t('crops.harvested')}</option>
              <option value="planned">{t('crops.planned')}</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <strong>{t('crops.note')}</strong> {t('crops.cropDataNote')}
        </div>
      </div>

      {/* Crops Grid */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onView={(crop) => {
                alert(`${t('crops.viewingDetails')} ${crop.name}`);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('crops.noCropsFound')}</h3>
          <p className="text-gray-600 mb-4">{t('crops.adjustSearch')}</p>
          <button onClick={handleAddCrop} className="btn-primary">
            {t('crops.addFirstCrop')}
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('crops.activeCrops')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {crops.filter((c) => c.status === 'active').length}
              </p>
            </div>
            <div className="text-4xl">🌱</div>
          </div>
        </div>
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('crops.harvested')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {crops.filter((c) => c.status === 'harvested').length}
              </p>
            </div>
            <div className="text-4xl">🌾</div>
          </div>
        </div>
        <div className="card bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('crops.totalCrops')}</p>
              <p className="text-3xl font-bold text-gray-900">{crops.length}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropManagement;

