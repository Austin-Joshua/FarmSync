// Fertilizer & Pesticide Tracking page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockFertilizers, mockPesticides, getCropName } from '../data/mockData';
import { translateFertilizer } from '../utils/translations';
import { Plus, Droplets, Bug, Edit2, Trash2, Eye } from 'lucide-react';
import { Fertilizer, Pesticide } from '../types';
import FertilizerPesticideFormModal from '../components/FertilizerPesticideFormModal';
import DetailModal from '../components/DetailModal';

const FertilizerPesticide = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'fertilizer' | 'pesticide'>('fertilizer');
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>(mockFertilizers);
  const [pesticides, setPesticides] = useState<Pesticide[]>(mockPesticides);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Fertilizer | Pesticide | null>(null);
  const [statDetailModal, setStatDetailModal] = useState<{
    type: 'fertilizers' | 'pesticides' | null;
    data?: Fertilizer[] | Pesticide[];
  }>({ type: null });

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: Fertilizer | Pesticide) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDelete = (itemId: string) => {
    if (confirm(t('fertilizers.confirmDelete') || 'Are you sure you want to delete this record?')) {
      if (activeTab === 'fertilizer') {
        setFertilizers(fertilizers.filter(f => f.id !== itemId));
      } else {
        setPesticides(pesticides.filter(p => p.id !== itemId));
      }
      alert(t('fertilizers.recordDeleted') || 'Record deleted successfully!');
    }
  };

  // LIFO: Sort fertilizers and pesticides by date (newest first)
  const sortedFertilizers = [...fertilizers].sort((a, b) => {
    const dateA = new Date(a.dateOfUsage).getTime();
    const dateB = new Date(b.dateOfUsage).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const sortedPesticides = [...pesticides].sort((a, b) => {
    const dateA = new Date(a.dateOfUsage).getTime();
    const dateB = new Date(b.dateOfUsage).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const handleSave = (itemData: Fertilizer | Pesticide | Omit<Fertilizer, 'id'> | Omit<Pesticide, 'id'>) => {
    if ('id' in itemData && itemData.id && editingItem) {
      // Editing existing item
      if (activeTab === 'fertilizer') {
        const updated = fertilizers.map(f => f.id === itemData.id ? itemData as Fertilizer : f);
        setFertilizers(updated.sort((a, b) => new Date(b.dateOfUsage).getTime() - new Date(a.dateOfUsage).getTime()));
      } else {
        const updated = pesticides.map(p => p.id === itemData.id ? itemData as Pesticide : p);
        setPesticides(updated.sort((a, b) => new Date(b.dateOfUsage).getTime() - new Date(a.dateOfUsage).getTime()));
      }
      alert(t('fertilizers.recordUpdated') || 'Record updated successfully!');
    } else {
      // Adding new item (will be first due to LIFO)
      const newItem = {
        ...itemData as Omit<Fertilizer, 'id'> | Omit<Pesticide, 'id'>,
        id: Date.now().toString(),
      };
      if (activeTab === 'fertilizer') {
        setFertilizers([newItem as Fertilizer, ...fertilizers]);
      } else {
        setPesticides([newItem as Pesticide, ...pesticides]);
      }
      alert(t('fertilizers.recordAdded') || 'Record added successfully!');
    }
    setEditingItem(null);
    setIsFormModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('fertilizers.title')}</h1>
          <p className="text-gray-600 mt-1">{t('fertilizers.subtitle')}</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95">
          <Plus size={20} />
          {activeTab === 'fertilizer' ? t('fertilizers.addFertilizer') : t('fertilizers.addPesticide')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('fertilizer')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'fertilizer'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <span className="text-xl">💧</span>
          {t('fertilizers.fertilizers')}
        </button>
        <button
          onClick={() => setActiveTab('pesticide')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'pesticide'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <span className="text-xl">🦠</span>
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
              <th className="text-left py-3 px-4 font-semibold text-gray-900 w-24">{t('common.actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'fertilizer' ? (
              sortedFertilizers.length > 0 ? (
                sortedFertilizers.map((fertilizer, index) => {
                  // Map index to delay class (0-350ms in 25ms increments)
                  const getDelayClass = (idx: number, multiplier: number = 25) => {
                    const delay = Math.min(idx * multiplier, 350);
                    if (delay <= 0) return 'delay-0';
                    if (delay <= 25) return 'delay-25';
                    if (delay <= 50) return 'delay-50';
                    if (delay <= 75) return 'delay-75';
                    if (delay <= 100) return 'delay-100';
                    if (delay <= 150) return 'delay-150';
                    if (delay <= 200) return 'delay-200';
                    if (delay <= 250) return 'delay-250';
                    if (delay <= 300) return 'delay-300';
                    return 'delay-350';
                  };
                  return (
                  <tr 
                    key={fertilizer.id} 
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150 ease-out group animate-in fade-in slide-in-from-left-2 ${getDelayClass(index, 25)}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" title={t('fertilizers.fertilizer')}>💧</span>
                        <span className="font-medium text-gray-900 dark:text-white">{translateFertilizer(fertilizer.type)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{fertilizer.quantity} {t('common.kg')}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(fertilizer.dateOfUsage).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{getCropName(fertilizer.cropId)}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out">
                        <button
                          onClick={() => handleEdit(fertilizer)}
                          className="p-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition-all duration-150 hover:scale-110 active:scale-95"
                          title={t('common.edit')}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(fertilizer.id)}
                          className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-150 hover:scale-110 active:scale-95"
                          title={t('common.delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('fertilizers.noFertilizers')}
                  </td>
                </tr>
              )
            ) : sortedPesticides.length > 0 ? (
              sortedPesticides.map((pesticide, index) => {
                // Map index to delay class (0-350ms in 25ms increments)
                const getDelayClass = (idx: number, multiplier: number = 25) => {
                  const delay = Math.min(idx * multiplier, 350);
                  if (delay <= 0) return 'delay-0';
                  if (delay <= 25) return 'delay-25';
                  if (delay <= 50) return 'delay-50';
                  if (delay <= 75) return 'delay-75';
                  if (delay <= 100) return 'delay-100';
                  if (delay <= 150) return 'delay-150';
                  if (delay <= 200) return 'delay-200';
                  if (delay <= 250) return 'delay-250';
                  if (delay <= 300) return 'delay-300';
                  return 'delay-350';
                };
                return (
                <tr 
                  key={pesticide.id} 
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150 ease-out group animate-in fade-in slide-in-from-left-2 ${getDelayClass(index, 25)}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" title={t('fertilizers.pesticide')}>🦠</span>
                      <span className="font-medium text-gray-900 dark:text-white">{translateFertilizer(pesticide.type)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{pesticide.quantity} {t('common.l')}</td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(pesticide.dateOfUsage).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{getCropName(pesticide.cropId)}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out">
                      <button
                        onClick={() => handleEdit(pesticide)}
                        className="p-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition-all duration-150 hover:scale-110 active:scale-95"
                        title={t('common.edit')}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(pesticide.id)}
                        className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-150 hover:scale-110 active:scale-95"
                        title={t('common.delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                  {t('fertilizers.noPesticides')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="card bg-blue-50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setStatDetailModal({ type: 'fertilizers', data: fertilizers })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('fertilizers.totalFertilizersUsed')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {fertilizers.reduce((sum, f) => sum + f.quantity, 0)} {t('common.kg')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-5xl">💧</span>
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div 
          className="card bg-red-50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setStatDetailModal({ type: 'pesticides', data: pesticides })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('fertilizers.totalPesticidesUsed')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {pesticides.reduce((sum, p) => sum + p.quantity, 0)} {t('common.l')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-5xl">🦠</span>
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Detail Modals */}
      {statDetailModal.type === 'fertilizers' && statDetailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setStatDetailModal({ type: null })}
          title={t('fertilizers.totalFertilizersUsed')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {(statDetailModal.data as Fertilizer[]).reduce((sum, f) => sum + f.quantity, 0)} {t('common.kg')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('common.total')} {(statDetailModal.data as Fertilizer[]).length} {t('fertilizers.fertilizers')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(statDetailModal.data as Fertilizer[]).map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💧</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{translateFertilizer(item.type)}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('fertilizers.quantity')}: {item.quantity} {item.unit}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('fertilizers.dateOfUsage')}: {new Date(item.dateOfUsage).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('fertilizers.crop')}: {getCropName(item.cropId)}</p>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}
      {statDetailModal.type === 'pesticides' && statDetailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setStatDetailModal({ type: null })}
          title={t('fertilizers.totalPesticidesUsed')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-red-600">
                {(statDetailModal.data as Pesticide[]).reduce((sum, p) => sum + p.quantity, 0)} {t('common.l')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('common.total')} {(statDetailModal.data as Pesticide[]).length} {t('fertilizers.pesticides')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(statDetailModal.data as Pesticide[]).map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🦠</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{translateFertilizer(item.type)}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('fertilizers.quantity')}: {item.quantity} {item.unit}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('fertilizers.dateOfUsage')}: {new Date(item.dateOfUsage).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('fertilizers.crop')}: {getCropName(item.cropId)}</p>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}

      {/* Fertilizer/Pesticide Form Modal */}
      <FertilizerPesticideFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        item={editingItem}
        type={activeTab}
        mode={editingItem ? 'edit' : 'add'}
      />
    </div>
  );
};

export default FertilizerPesticide;

