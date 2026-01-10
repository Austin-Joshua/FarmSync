// Irrigation Management page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { mockIrrigations, getCropName } from '../data/mockData';
import IrrigationModal from '../components/IrrigationModal';
import { Irrigation as IrrigationType } from '../types';
import { Plus, Droplets, Calendar } from 'lucide-react';

const Irrigation = () => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [irrigations, setIrrigations] = useState<IrrigationType[]>(mockIrrigations);

  const filteredIrrigations = irrigations.filter(
    (irrigation) => selectedMethod === 'all' || irrigation.method === selectedMethod
  );

  const handleAddIrrigation = () => {
    setIsModalOpen(true);
  };

  const handleSaveIrrigation = (irrigationData: Omit<IrrigationType, 'id'>) => {
    // Create new irrigation with ID
    const newIrrigation: IrrigationType = {
      ...irrigationData,
      id: Date.now().toString(), // Simple ID generation
    };

    // Add to list (in real app, this would be an API call)
    setIrrigations([...irrigations, newIrrigation]);
    console.log('Irrigation scheduled:', newIrrigation);
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
        <button onClick={handleAddIrrigation} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {t('irrigation.scheduleIrrigation')}
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">{t('irrigation.filterByMethod')}</label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="input-field"
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
            filteredIrrigations.map((irrigation) => (
              <div
                key={irrigation.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getMethodIcon(irrigation.method)}</div>
                    <div>
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
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span className="font-medium">
                        {new Date(irrigation.date).toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Droplets size={16} />
                      <span>{t('irrigation.duration')}: {irrigation.duration} {t('irrigation.hours')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
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
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('irrigation.drip')} {t('navigation.irrigation')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {irrigations.filter((i) => i.method === 'drip').length}
              </p>
            </div>
            <div className="text-4xl">💧</div>
          </div>
        </div>
        <div className="card bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('irrigation.sprinkler')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {irrigations.filter((i) => i.method === 'sprinkler').length}
              </p>
            </div>
            <div className="text-4xl">🌧️</div>
          </div>
        </div>
        <div className="card bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('irrigation.manual')}</p>
              <p className="text-3xl font-bold text-gray-900">
                {irrigations.filter((i) => i.method === 'manual').length}
              </p>
            </div>
            <div className="text-4xl">🚿</div>
          </div>
        </div>
      </div>

      {/* Irrigation Modal */}
      <IrrigationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveIrrigation}
      />
    </div>
  );
};

export default Irrigation;

