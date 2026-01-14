import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit, Trash2, Map, Navigation, TestTube } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Field {
  id: string;
  farm_id: string;
  name: string;
  area: number;
  boundary_coordinates?: any;
  latitude?: number;
  longitude?: number;
  soil_type_id?: string;
  soil_type_name?: string;
  soil_test_date?: string;
  soil_test_results?: any;
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
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formData, setFormData] = useState({
    farm_id: '',
    name: '',
    area: '',
    latitude: '',
    longitude: '',
    soil_type_id: '',
    soil_test_date: '',
  });

  useEffect(() => {
    loadFields();
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const response = await api.getFarms();
      setFarms(response.data || []);
      if (response.data && response.data.length > 0) {
        setFormData(prev => ({ ...prev, farm_id: response.data[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load farms:', err);
    }
  };

  const loadFields = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getFields();
      setFields(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.farm_id || !formData.name || !formData.area) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const fieldData: any = {
        farm_id: formData.farm_id,
        name: formData.name,
        area: parseFloat(formData.area),
      };

      if (formData.latitude && formData.longitude) {
        fieldData.latitude = parseFloat(formData.latitude);
        fieldData.longitude = parseFloat(formData.longitude);
      }

      if (formData.soil_type_id) {
        fieldData.soil_type_id = formData.soil_type_id;
      }

      if (formData.soil_test_date) {
        fieldData.soil_test_date = formData.soil_test_date;
      }

      if (editingField) {
        await api.updateField(editingField.id, fieldData);
      } else {
        await api.createField(fieldData);
      }

      setShowForm(false);
      setEditingField(null);
      resetForm();
      loadFields();
    } catch (err: any) {
      setError(err.message || 'Failed to save field');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      await api.deleteField(id);
      loadFields();
    } catch (err: any) {
      setError(err.message || 'Failed to delete field');
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
      soil_test_date: '',
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          setError('Failed to get current location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-earth-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('fields.title', 'Field Management')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('fields.subtitle', 'Manage your farm fields with GPS tracking')}
            </p>
          </div>
          <button onClick={() => { setShowForm(true); resetForm(); }} className="btn-primary flex items-center gap-2" title="Add a new field">
            <Plus size={20} />
            {t('fields.addField', 'Add Field')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {editingField ? t('fields.editField', 'Edit Field') : t('fields.addField', 'Add Field')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fields.farm', 'Farm')} *
                    </label>
                    <select
                      value={formData.farm_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, farm_id: e.target.value }))}
                      className="input-field"
                      title="Select a farm"
                      aria-label="Farm"
                      required
                    >
                      <option value="">{t('fields.selectFarm', 'Select Farm')}</option>
                      {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fields.fieldName', 'Field Name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      title="Enter field name"
                      aria-label="Field name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fields.area', 'Area (acres)')} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      className="input-field"
                      title="Enter area in acres"
                      aria-label="Area in acres"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('fields.latitude', 'Latitude')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.00000001"
                          value={formData.latitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                          className="input-field"
                          title="Enter latitude"
                          aria-label="Latitude"
                        />
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          className="btn-secondary flex items-center gap-2"
                          title="Get current location"
                        >
                          <Navigation size={18} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('fields.longitude', 'Longitude')}
                      </label>
                      <input
                        type="number"
                        step="0.00000001"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                        className="input-field"
                        title="Enter longitude"
                        aria-label="Longitude"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fields.soilTestDate', 'Soil Test Date')}
                    </label>
                    <input
                      type="date"
                      value={formData.soil_test_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, soil_test_date: e.target.value }))}
                      className="input-field"
                      title="Select soil test date"
                      aria-label="Soil test date"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1" title="Submit the form">
                      {editingField ? t('common.save', 'Save') : t('fields.addField', 'Add Field')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingField(null); resetForm(); }}
                      className="btn-secondary"
                      title="Cancel and close the form"
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading', 'Loading...')}</p>
          </div>
        )}

        {!loading && fields.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {t('fields.noFields', 'No fields added yet')}
            </p>
            <button onClick={() => { setShowForm(true); resetForm(); }} className="btn-primary" title="Add your first field">
              {t('fields.addFirstField', 'Add Your First Field')}
            </button>
          </div>
        )}

        {!loading && fields.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div key={field.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {field.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {farms.find(f => f.id === field.farm_id)?.name || 'Unknown Farm'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(field)}
                      className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                      title="Edit this field"
                      aria-label={`Edit ${field.name}`}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(field.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title="Delete this field"
                      aria-label={`Delete ${field.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Map size={18} />
                    <span>{field.area} {t('common.acres', 'acres')}</span>
                  </div>

                  {field.latitude && field.longitude && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Navigation size={18} />
                      <span className="text-xs">
                        {field.latitude.toFixed(6)}, {field.longitude.toFixed(6)}
                      </span>
                    </div>
                  )}

                  {field.soil_type_name && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <TestTube size={18} />
                      <span>{field.soil_type_name}</span>
                    </div>
                  )}

                  {field.soil_test_date && (
                    <div className="text-xs text-gray-500">
                      {t('fields.soilTestDate', 'Soil Test')}: {new Date(field.soil_test_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fields;
