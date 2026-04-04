import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit, Trash2, Map, Navigation, TestTube, Loader, X, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DataCache } from '../utils/dataCache';
import { formatDateDisplay } from '../utils/dateFormatter';
import toast from 'react-hot-toast';

interface Field {
  id: string;
  farm_id: string;
  name: string;
  area: number;
  latitude?: number;
  longitude?: number;
  soil_type_id?: string;
  soil_type_name?: string;
  soil_test_date?: string;
  created_at?: string;
}

interface Farm {
  id: string;
  name: string;
}

const Fields = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  
  const [formData, setFormData] = useState({
    farm_id: '',
    name: '',
    area: '',
    latitude: '',
    longitude: '',
    soil_type_id: '',
    soil_test_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) {
      loadFields();
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    const cacheKey = 'farms';
    const cachedData = DataCache.get<Farm[]>(cacheKey);
    if (cachedData) {
      setFarms(cachedData);
      return;
    }

    try {
      const response = await api.getFarms();
      const farmsData = response.data || [];
      setFarms(farmsData);
      DataCache.set(cacheKey, farmsData);
    } catch (err: any) {
      console.error('Failed to load farms:', err);
    }
  };

  const loadFields = async () => {
    const cacheKey = 'fields';
    const cachedData = DataCache.get<Field[]>(cacheKey);
    if (cachedData) {
      setFields(cachedData);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getFields();
      const fieldsData = response.data || [];
      setFields(fieldsData);
      DataCache.set(cacheKey, fieldsData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farm_id || !formData.name || !formData.area) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const fieldData = {
        farm_id: formData.farm_id,
        name: formData.name,
        area: parseFloat(formData.area),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        soil_type_id: formData.soil_type_id || undefined,
        soil_test_date: formData.soil_test_date || undefined,
      };

      if (editingField) {
        await api.updateField(editingField.id, fieldData);
        toast.success('Field updated successfully');
      } else {
        await api.createField(fieldData);
        toast.success('Field created successfully');
      }

      setShowForm(false);
      setEditingField(null);
      resetForm();
      DataCache.clear('fields');
      loadFields();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save field');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (field: Field) => {
    setEditingField(field);
    setFormData({
      farm_id: field.farm_id,
      name: field.name,
      area: field.area.toString(),
      latitude: field.latitude?.toString() || '',
      longitude: field.longitude?.toString() || '',
      soil_type_id: field.soil_type_id || '',
      soil_test_date: field.soil_test_date || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete field "${name}"?`)) return;

    try {
      await api.deleteField(id);
      toast.success('Field deleted');
      DataCache.clear('fields');
      loadFields();
    } catch (err: any) {
      toast.error('Failed to delete field');
    }
  };

  const resetForm = () => {
    setFormData({
      farm_id: farms.length > 0 ? farms[0].id : '',
      name: '',
      area: '',
      latitude: '',
      longitude: '',
      soil_type_id: '',
      soil_test_date: new Date().toISOString().split('T')[0],
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev: any) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          toast.success('Location updated');
        },
        () => toast.error('Failed to get location')
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('fields.title') || 'Fields'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('fields.subtitle') || 'Manage and track your farm fields'}</p>
        </div>
        <button onClick={() => { setShowForm(true); resetForm(); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {t('fields.addField') === 'fields.addField' ? 'Add Field' : t('fields.addField')}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingField ? (t('fields.editField') === 'fields.editField' ? 'Edit Field' : t('fields.editField')) : (t('fields.addField') === 'fields.addField' ? 'Add Field' : t('fields.addField'))}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="label">{t('fields.farm') || 'Farm'}</label>
                <select 
                  className="input" 
                  value={formData.farm_id} 
                  onChange={e => setFormData({...formData, farm_id: e.target.value})}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="label">{t('fields.fieldName')}</label>
                <input 
                  className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">{t('fields.area')}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input" 
                    value={formData.area} 
                    onChange={e => setFormData({...formData, area: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="label">Soil Test Date</label>
                  <input 
                    type="date"
                    className="input" 
                    value={formData.soil_test_date} 
                    onChange={e => setFormData({...formData, soil_test_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">Latitude</label>
                  <div className="relative">
                    <input className="input pr-10" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
                    <button type="button" onClick={getCurrentLocation} className="absolute right-2 top-2 text-primary-600 hover:text-primary-700">
                      <Navigation size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">Longitude</label>
                  <input className="input" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                  {editingField ? t('common.save') : t('common.add')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader className="animate-spin h-12 w-12 text-primary-600 mb-4" />
          <p className="text-gray-500 font-medium">Scoping out your fields...</p>
        </div>
      ) : fields.length === 0 ? (
        <div className="card text-center py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-dashed border-2 border-gray-200 dark:border-gray-700">
          <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No fields mapped yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start by adding your first field to track growth and soil health across your farm.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">{t('fields.addField') === 'fields.addField' ? 'Add Field' : t('fields.addField')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => (
            <div key={field.id} className="card group hover:shadow-2xl transition-all duration-300 border-l-4 border-primary-600">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{field.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {farms.find(f => f.id === field.farm_id)?.name || 'Private Farm'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(field)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(field.id, field.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 rounded bg-earth-100 dark:bg-earth-900/30 flex items-center justify-center text-earth-600">
                    <Map size={16} />
                  </div>
                  <span className="font-semibold">{field.area} {t('common.acres')}</span>
                </div>

                {field.latitude && (
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <Navigation size={16} />
                    </div>
                    <span className="text-xs font-mono">{field.latitude.toFixed(4)}, {field.longitude?.toFixed(4)}</span>
                  </div>
                )}

                {field.soil_test_date && (
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                      <TestTube size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Soil Tested</p>
                      <p className="text-sm">{formatDateDisplay(field.soil_test_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Fields;
