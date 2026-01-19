// Irrigation Management page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { mockIrrigations, getCropName } from '../data/mockData';
import { translateCrop } from '../utils/translations';
import IrrigationModal from '../components/IrrigationModal';
import { Irrigation as IrrigationType } from '../types';
import { Plus, Droplets, Calendar, Edit2, Trash2, Eye } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import { formatDateDisplay, formatDateWithWeekday } from '../utils/dateFormatter';

const Irrigation = () => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIrrigation, setEditingIrrigation] = useState<IrrigationType | null>(null);
  const [methodDetailModal, setMethodDetailModal] = useState<{
    type: 'drip' | 'sprinkler' | 'manual' | null;
    data?: IrrigationType[];
  }>({ type: null });
  // LIFO: Initialize with sorted data (newest first)
  const [irrigations, setIrrigations] = useState<IrrigationType[]>(() => {
    return [...mockIrrigations].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  });

  // LIFO: Keep sorted (newest first) when filtering
  const filteredIrrigations = irrigations
    .filter((irrigation) => selectedMethod === 'all' || irrigation.method === selectedMethod)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

  const handleAddIrrigation = () => {
    setEditingIrrigation(null);
    setIsModalOpen(true);
  };

  const handleEditIrrigation = (irrigation: IrrigationType) => {
    setEditingIrrigation(irrigation);
    setIsModalOpen(true);
  };

  const handleDeleteIrrigation = (irrigationId: string) => {
    if (confirm(t('irrigation.confirmDelete') || 'Are you sure you want to delete this irrigation schedule?')) {
      setIrrigations(irrigations.filter(i => i.id !== irrigationId));
      alert(t('irrigation.irrigationDeleted') || 'Irrigation schedule deleted successfully!');
    }
  };

  const handleSaveIrrigation = (irrigationData: Omit<IrrigationType, 'id'> | IrrigationType) => {
    if ('id' in irrigationData && irrigationData.id && editingIrrigation) {
      // Editing existing irrigation - maintain LIFO order
      const updated = irrigations.map(i => i.id === irrigationData.id ? irrigationData as IrrigationType : i);
      setIrrigations(updated.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order (newest first)
      }));
      alert(t('irrigation.irrigationUpdated') || 'Irrigation schedule updated successfully!');
    } else {
      // Adding new irrigation (will be first due to LIFO - newest dates first)
      const newIrrigation: IrrigationType = {
        ...irrigationData as Omit<IrrigationType, 'id'>,
        id: Date.now().toString(),
      };
      // Insert at beginning to maintain LIFO, then sort to ensure proper order
      const updated = [newIrrigation, ...irrigations].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
      setIrrigations(updated);
      alert(t('irrigation.irrigationAdded') || 'Irrigation schedule added successfully!');
    }
    setEditingIrrigation(null);
    setIsModalOpen(false);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'drip':
        return '💧';
      case 'sprinkler':
        return '🌧️';
      case 'manual':
        return '🚿';
      default:
        return '💦';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'drip':
        return 'bg-blue-100 text-blue-800';
      case 'sprinkler':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('irrigation.title')}</h1>
          <p className="text-gray-600 mt-1">{t('irrigation.subtitle')}</p>
        </div>
        <button onClick={handleAddIrrigation} className="btn-primary flex items-center gap-2 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95">
          <Plus size={20} />
          {t('irrigation.scheduleIrrigation')}
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label htmlFor="irrigation-method-filter" className="font-medium text-gray-700">{t('irrigation.filterByMethod')}</label>
          <select
            id="irrigation-method-filter"
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="input-field"
            aria-label={t('irrigation.filterByMethod')}
          >
            <option value="all">{t('irrigation.allMethods')}</option>
            <option value="drip">{t('irrigation.drip')}</option>
            <option value="sprinkler">{t('irrigation.sprinkler')}</option>
            <option value="manual">{t('irrigation.manual')}</option>
          </select>
        </div>
      </div>

      {/* Irrigation Schedule - Calendar View */}
      <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={24} className="text-primary-600" />
            {t('irrigation.irrigationSchedule')}
          </h2>
        <div className="space-y-4">
          {filteredIrrigations.length > 0 ? (
            filteredIrrigations.map((irrigation, index) => {
              // Map index to delay class (0-350ms in 40ms increments)
              const getDelayClass = (idx: number) => {
                const delay = Math.min(idx * 40, 350);
                if (delay <= 0) return 'delay-0';
                if (delay <= 25) return 'delay-25';
                if (delay <= 40) return 'delay-40';
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
              <div
                key={irrigation.id}
                className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-200 ease-out group cursor-pointer bg-white dark:bg-gray-800 animate-in fade-in slide-in-from-right-4 ${getDelayClass(index)}`}
                onClick={() => handleEditIrrigation(irrigation)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{getMethodIcon(irrigation.method)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 capitalize">
                          {irrigation.method === 'drip' ? t('irrigation.drip') : 
                           irrigation.method === 'sprinkler' ? t('irrigation.sprinkler') : 
                           t('irrigation.manual')} {t('navigation.irrigation')}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(irrigation.method)}`}>
                          {irrigation.method === 'drip' ? t('irrigation.drip') : 
                           irrigation.method === 'sprinkler' ? t('irrigation.sprinkler') : 
                           t('irrigation.manual')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{getCropName(irrigation.cropId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col md:items-end gap-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span className="font-medium">
                          {formatDateWithWeekday(irrigation.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Droplets size={16} />
                        <span>{t('irrigation.duration')}: {irrigation.duration} {t('irrigation.hours')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditIrrigation(irrigation);
                        }}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-lg"
                        title={t('common.edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteIrrigation(irrigation.id);
                        }}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-lg"
                        title={t('common.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Droplets size={48} className="mx-auto mb-4 text-gray-400" />
              <p>{t('irrigation.noIrrigation')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Method Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="card bg-blue-50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setMethodDetailModal({ type: 'drip', data: irrigations.filter((i) => i.method === 'drip') })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('irrigation.drip')} {t('navigation.irrigation')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {irrigations.filter((i) => i.method === 'drip').length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-4xl">💧</div>
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div 
          className="card bg-green-50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setMethodDetailModal({ type: 'sprinkler', data: irrigations.filter((i) => i.method === 'sprinkler') })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('irrigation.sprinkler')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {irrigations.filter((i) => i.method === 'sprinkler').length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-4xl">🌧️</div>
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div 
          className="card bg-orange-50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setMethodDetailModal({ type: 'manual', data: irrigations.filter((i) => i.method === 'manual') })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('irrigation.manual')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {irrigations.filter((i) => i.method === 'manual').length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-4xl">🚿</div>
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Irrigation Method Detail Modals */}
      {methodDetailModal.type === 'drip' && methodDetailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setMethodDetailModal({ type: null })}
          title={`${t('irrigation.drip')} ${t('navigation.irrigation')}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-blue-600">{methodDetailModal.data.length} {t('irrigation.drip')} {t('navigation.irrigation')}</p>
            </div>
            <div className="space-y-3">
              {methodDetailModal.data.map((irrigation) => (
                <div
                  key={irrigation.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">💧</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          {translateCrop(getCropName(irrigation.cropId))}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('irrigation.date')}: {formatDateDisplay(irrigation.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('irrigation.duration')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{irrigation.duration} {t('irrigation.hours')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('irrigation.method')}</p>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {t('irrigation.drip')}
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

      {methodDetailModal.type === 'sprinkler' && methodDetailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setMethodDetailModal({ type: null })}
          title={t('irrigation.sprinkler')}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-green-600">{methodDetailModal.data.length} {t('irrigation.sprinkler')}</p>
            </div>
            <div className="space-y-3">
              {methodDetailModal.data.map((irrigation) => (
                <div
                  key={irrigation.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🌧️</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          {translateCrop(getCropName(irrigation.cropId))}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('irrigation.date')}: {formatDateDisplay(irrigation.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('irrigation.duration')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{irrigation.duration} {t('irrigation.hours')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('irrigation.method')}</p>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          {t('irrigation.sprinkler')}
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

      {methodDetailModal.type === 'manual' && methodDetailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setMethodDetailModal({ type: null })}
          title={t('irrigation.manual')}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-orange-600">{methodDetailModal.data.length} {t('irrigation.manual')}</p>
            </div>
            <div className="space-y-3">
              {methodDetailModal.data.map((irrigation) => (
                <div
                  key={irrigation.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🚿</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          {translateCrop(getCropName(irrigation.cropId))}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('irrigation.date')}: {formatDateDisplay(irrigation.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('irrigation.duration')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{irrigation.duration} {t('irrigation.hours')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('irrigation.method')}</p>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                          {t('irrigation.manual')}
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

      {/* Irrigation Modal */}
      <IrrigationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIrrigation(null);
        }}
        onSave={handleSaveIrrigation}
        irrigation={editingIrrigation}
        mode={editingIrrigation ? 'edit' : 'add'}
      />
    </div>
  );
};

export default Irrigation;

