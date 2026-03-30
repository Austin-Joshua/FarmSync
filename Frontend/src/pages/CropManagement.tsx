// Crop Management page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CropCard from '../components/CropCard';
import CropFormModal from '../components/CropFormModal';
import CropDetailModal from '../components/CropDetailModal';
import { mockCrops } from '../data/mockData';
import { Crop } from '../types';
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react';
import { getCropIcon } from '../utils/cropIcons';
import { translateCrop } from '../utils/translations';
import DetailModal from '../components/DetailModal';
import { formatDateDisplay } from '../utils/dateFormatter';

const CropManagement = () => {
  const { t } = useTranslation();
  const [crops, setCrops] = useState<Crop[]>(mockCrops);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [statDetailModal, setStatDetailModal] = useState<{
    type: 'active' | 'harvested' | 'total' | null;
    data?: Crop[];
  }>({ type: null });

  // LIFO: Sort by date (newest first) - using sowingDate as reference
  const sortedCrops = [...crops].sort((a, b) => {
    const dateA = new Date(a.sowingDate).getTime();
    const dateB = new Date(b.sowingDate).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const filteredCrops = sortedCrops.filter((crop) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      crop.name.toLowerCase().includes(searchLower) ||
      crop.category?.toLowerCase().includes(searchLower) ||
      crop.season.toLowerCase().includes(searchLower);
    const matchesFilter = filterStatus === 'all' || crop.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddCrop = () => {
    setEditingCrop(null);
    setIsFormModalOpen(true);
  };

  const handleEditCrop = (crop: Crop, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCrop(crop);
    setIsFormModalOpen(true);
  };

  const handleDeleteCrop = (cropId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('crops.confirmDelete') || 'Are you sure you want to delete this crop?')) {
      setCrops(crops.filter(c => c.id !== cropId));
      alert(t('crops.cropDeleted') || 'Crop deleted successfully!');
    }
  };

  const handleViewCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsDetailModalOpen(true);
  };

  const handleSaveCrop = (cropData: Crop | Omit<Crop, 'id'>) => {
    if ('id' in cropData && cropData.id) {
      // Editing existing crop - maintain LIFO order
      const updated = crops.map(c => c.id === cropData.id ? cropData as Crop : c);
      const sorted = updated.sort((a, b) => {
        const dateA = new Date(a.sowingDate).getTime();
        const dateB = new Date(b.sowingDate).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      setCrops(sorted);
      alert(t('crops.cropUpdated') || 'Crop updated successfully!');
    } else {
      // Adding new crop (will be first due to LIFO - newest dates first)
      const newCrop: Crop = {
        ...cropData as Omit<Crop, 'id'>,
        id: Date.now().toString(),
      };
      // Insert at beginning, then sort to ensure proper LIFO order
      const updated = [newCrop, ...crops].sort((a, b) => {
        const dateA = new Date(a.sowingDate).getTime();
        const dateB = new Date(b.sowingDate).getTime();
        return dateB - dateA;
      });
      setCrops(updated);
      alert(t('crops.cropAdded') || 'Crop added successfully!');
    }
    setEditingCrop(null);
    setIsFormModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('crops.title')}</h1>
          <p className="text-gray-600 mt-1">{t('crops.subtitle')}</p>
        </div>
        <button onClick={handleAddCrop} className="btn-primary flex items-center gap-2 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95">
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
            <label htmlFor="status-filter" className="sr-only">{t('crops.status')}</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
              aria-label={t('crops.status')}
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
          {filteredCrops.map((crop, index) => {
            // Map index to delay class (0-350ms in 50ms increments)
            const getDelayClass = (idx: number) => {
              const delay = Math.min(idx * 50, 350);
              if (delay <= 0) return 'delay-0';
              if (delay <= 50) return 'delay-50';
              if (delay <= 100) return 'delay-100';
              if (delay <= 150) return 'delay-150';
              if (delay <= 200) return 'delay-200';
              if (delay <= 250) return 'delay-250';
              if (delay <= 300) return 'delay-300';
              return 'delay-350';
            };
            return (
            <div 
              key={crop.id} 
              className={`relative group animate-in fade-in slide-in-from-bottom-4 ${getDelayClass(index)}`}
            >
              <CropCard
                crop={crop}
                onView={() => handleViewCrop(crop)}
              />
              {/* Edit/Delete buttons on hover */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out">
                <button
                  onClick={(e) => handleEditCrop(crop, e)}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-150 shadow-lg hover:scale-110 active:scale-95"
                  title={t('common.edit')}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => handleDeleteCrop(crop.id, e)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-150 shadow-lg hover:scale-110 active:scale-95"
                  title={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            );
          })}
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

      {/* Crop Form Modal */}
      <CropFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCrop(null);
        }}
        onSave={handleSaveCrop}
        crop={editingCrop}
        mode={editingCrop ? 'edit' : 'add'}
      />

      {/* Crop Detail Modal */}
      <CropDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCrop(null);
        }}
        crop={selectedCrop}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="card bg-green-50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setStatDetailModal({ type: 'active', data: crops.filter((c) => c.status === 'active') })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('crops.activeCrops')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {crops.filter((c) => c.status === 'active').length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-4xl">🌱</div>
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div 
          className="card bg-blue-50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setStatDetailModal({ type: 'harvested', data: crops.filter((c) => c.status === 'harvested') })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('crops.harvested')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {crops.filter((c) => c.status === 'harvested').length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-4xl">🌾</div>
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div 
          className="card bg-yellow-50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setStatDetailModal({ type: 'total', data: crops })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('crops.totalCrops')}</p>
              <p className="text-3xl font-bold text-gray-900">{crops.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-4xl">📊</div>
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Detail Modals */}
      {statDetailModal.type === 'active' && statDetailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setStatDetailModal({ type: null })}
          title={t('crops.activeCrops')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-green-600">{statDetailModal.data.length} {t('crops.activeCrops')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statDetailModal.data.map((crop) => (
                  <div
                    key={crop.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedCrop(crop);
                      setIsDetailModalOpen(true);
                      setStatDetailModal({ type: null });
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl" title={translateCrop(crop.name)}>{getCropIcon(crop.name)}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{translateCrop(crop.name)}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.category')}: {crop.category}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.season')}: {crop.season}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.sowingDate')}: {formatDateDisplay(crop.sowingDate)}</p>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}
      {statDetailModal.type === 'harvested' && statDetailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setStatDetailModal({ type: null })}
          title={t('crops.harvested')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-blue-600">{statDetailModal.data.length} {t('crops.harvested')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statDetailModal.data.map((crop) => (
                <div
                  key={crop.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedCrop(crop);
                    setIsDetailModalOpen(true);
                    setStatDetailModal({ type: null });
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl" title={translateCrop(crop.name)}>{getCropIcon(crop.name)}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{translateCrop(crop.name)}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.category')}: {crop.category}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.season')}: {crop.season}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.harvestDate')}: {formatDateDisplay(crop.harvestDate)}</p>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}
      {statDetailModal.type === 'total' && statDetailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setStatDetailModal({ type: null })}
          title={t('crops.totalCrops')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-yellow-600">{statDetailModal.data.length} {t('crops.totalCrops')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statDetailModal.data.map((crop) => (
                  <div
                    key={crop.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedCrop(crop);
                      setIsDetailModalOpen(true);
                      setStatDetailModal({ type: null });
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl" title={translateCrop(crop.name)}>{getCropIcon(crop.name)}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{translateCrop(crop.name)}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.category')}: {crop.category}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.season')}: {crop.season}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('crops.status')}: {t(`crops.${crop.status}`)}</p>
                  </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
};

export default CropManagement;

