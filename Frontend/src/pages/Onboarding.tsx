import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, MapPin, Ruler, Droplets, Wheat, Clock, DollarSign } from 'lucide-react';
import api from '../services/api';

interface OnboardingData {
  location: string;
  land_size: number;
  soil_type: string;
  crops: Array<{
    name: string;
    area: number;
    sowing_date: string;
    expected_harvest_date: string;
  }>;
  fertilizers: Array<{
    type: string;
    quantity: number;
    date: string;
  }>;
  pesticides: Array<{
    type: string;
    quantity: number;
    date: string;
  }>;
  total_revenue: number;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState<OnboardingData>({
    location: '',
    land_size: 0,
    soil_type: '',
    crops: [{ name: '', area: 0, sowing_date: '', expected_harvest_date: '' }],
    fertilizers: [{ type: '', quantity: 0, date: '' }],
    pesticides: [{ type: '', quantity: 0, date: '' }],
    total_revenue: 0,
  });

  const soilTypes = [
    'Alluvial',
    'Black (Regur)',
    'Red',
    'Laterite',
    'Arid',
    'Saline',
    'Peaty',
    'Forest',
    'Other',
  ];

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addCrop = () => {
    setFormData((prev) => ({
      ...prev,
      crops: [...prev.crops, { name: '', area: 0, sowing_date: '', expected_harvest_date: '' }],
    }));
  };

  const removeCrop = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      crops: prev.crops.filter((_, i) => i !== index),
    }));
  };

  const updateCrop = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      crops: prev.crops.map((crop, i) => (i === index ? { ...crop, [field]: value } : crop)),
    }));
  };

  const addFertilizer = () => {
    setFormData((prev) => ({
      ...prev,
      fertilizers: [...prev.fertilizers, { type: '', quantity: 0, date: '' }],
    }));
  };

  const removeFertilizer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fertilizers: prev.fertilizers.filter((_, i) => i !== index),
    }));
  };

  const updateFertilizer = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      fertilizers: prev.fertilizers.map((fert, i) => (i === index ? { ...fert, [field]: value } : fert)),
    }));
  };

  const addPesticide = () => {
    setFormData((prev) => ({
      ...prev,
      pesticides: [...prev.pesticides, { type: '', quantity: 0, date: '' }],
    }));
  };

  const removePesticide = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pesticides: prev.pesticides.filter((_, i) => i !== index),
    }));
  };

  const updatePesticide = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pesticides: prev.pesticides.map((pest, i) => (i === index ? { ...pest, [field]: value } : pest)),
    }));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.location || !formData.land_size || !formData.soil_type) {
          setError('Please fill in all fields in this step.');
          return false;
        }
        return true;
      case 2:
        if (formData.crops.length === 0 || formData.crops.some(c => !c.name || !c.area || !c.sowing_date)) {
          setError('Please fill in all crop information.');
          return false;
        }
        return true;
      case 3:
        // Fertilizers are optional, but if added, must be complete
        if (formData.fertilizers.some(f => f.type && (!f.quantity || !f.date))) {
          setError('Please complete all fertilizer entries or remove empty ones.');
          return false;
        }
        return true;
      case 4:
        // Pesticides are optional, but if added, must be complete
        if (formData.pesticides.some(p => p.type && (!p.quantity || !p.date))) {
          setError('Please complete all pesticide entries or remove empty ones.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setError('');
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      // Update user profile with basic info
      await updateUser({
        location: formData.location,
        land_size: formData.land_size,
        soil_type: formData.soil_type,
      });

      // Create farm
      const farmResponse = await api.createFarm({
        name: `${user?.name}'s Farm`,
        location: formData.location,
        land_size: formData.land_size,
        soil_type: formData.soil_type,
      });

      const farmId = farmResponse.data?.farm?.id || farmResponse.farm?.id;

      if (farmId) {
        // Create crops
        for (const crop of formData.crops.filter(c => c.name && c.area)) {
          await api.createCrop({
            name: crop.name,
            sowing_date: crop.sowing_date,
            harvest_date: crop.expected_harvest_date || null,
            status: 'active',
            farm_id: farmId,
          });
        }

        // Get crops once for reuse
        const cropsResponse = await api.getCrops(farmId);
        const crops = cropsResponse.data?.crops || cropsResponse.crops || [];

        // Create fertilizers
        if (crops.length > 0) {
          for (const fert of formData.fertilizers.filter(f => f.type && f.quantity)) {
            await api.createFertilizer({
              type: fert.type,
              quantity: fert.quantity,
              date_of_usage: fert.date,
              crop_id: crops[0].id,
            });
          }

          // Create pesticides
          for (const pest of formData.pesticides.filter(p => p.type && p.quantity)) {
            await api.createPesticide({
              type: pest.type,
              quantity: pest.quantity,
              date_of_usage: pest.date,
              crop_id: crops[0].id,
            });
          }

          // Create yield/revenue entry
          if (formData.total_revenue > 0) {
            await api.createYield({
              crop_id: crops[0].id,
              quantity: formData.total_revenue,
              date: new Date().toISOString().split('T')[0],
              quality: 'good',
            });
          }
        }

      }

      // Mark onboarding as complete
      localStorage.setItem('onboarding_complete', 'true');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to save onboarding data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline mr-2" size={18} />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="input-field"
                placeholder="Enter your farm location (e.g., Coimbatore, Tamil Nadu)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Ruler className="inline mr-2" size={18} />
                Land Area (acres)
              </label>
              <input
                type="number"
                value={formData.land_size || ''}
                onChange={(e) => handleInputChange('land_size', parseFloat(e.target.value) || 0)}
                className="input-field"
                placeholder="Enter land area in acres"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Droplets className="inline mr-2" size={18} />
                Soil Type
              </label>
              <select
                value={formData.soil_type}
                onChange={(e) => handleInputChange('soil_type', e.target.value)}
                className="input-field"
                title="Select soil type"
                aria-label="Soil type"
                required
              >
                <option value="">Select soil type</option>
                {soilTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                <Wheat className="inline mr-2" size={20} />
                Crops Information
              </h3>
              <button
                type="button"
                onClick={addCrop}
                className="text-sm btn-secondary"
              >
                + Add Crop
              </button>
            </div>

            {formData.crops.map((crop, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Crop {index + 1}</span>
                  {formData.crops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCrop(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={crop.name}
                  onChange={(e) => updateCrop(index, 'name', e.target.value)}
                  className="input-field"
                  placeholder="Crop name (e.g., Rice, Wheat)"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={crop.area || ''}
                    onChange={(e) => updateCrop(index, 'area', parseFloat(e.target.value) || 0)}
                    className="input-field"
                    placeholder="Area (acres)"
                    min="0"
                    step="0.01"
                    required
                  />
                  <input
                    type="date"
                    value={crop.sowing_date}
                    onChange={(e) => updateCrop(index, 'sowing_date', e.target.value)}
                    className="input-field"
                    placeholder="Sowing date"
                    required
                  />
                </div>
                <input
                  type="date"
                  value={crop.expected_harvest_date}
                  onChange={(e) => updateCrop(index, 'expected_harvest_date', e.target.value)}
                  className="input-field"
                  placeholder="Expected harvest date"
                />
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Fertilizers Used</h3>
              <button
                type="button"
                onClick={addFertilizer}
                className="text-sm btn-secondary"
              >
                + Add Fertilizer
              </button>
            </div>

            {formData.fertilizers.map((fert, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Fertilizer {index + 1}</span>
                  {formData.fertilizers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFertilizer(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={fert.type}
                  onChange={(e) => updateFertilizer(index, 'type', e.target.value)}
                  className="input-field"
                  placeholder="Fertilizer type (e.g., Urea, NPK)"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={fert.quantity || ''}
                    onChange={(e) => updateFertilizer(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="input-field"
                    placeholder="Quantity (kg)"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="date"
                    value={fert.date}
                    onChange={(e) => updateFertilizer(index, 'date', e.target.value)}
                    className="input-field"
                    placeholder="Date used"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pesticides Used</h3>
              <button
                type="button"
                onClick={addPesticide}
                className="text-sm btn-secondary"
              >
                + Add Pesticide
              </button>
            </div>

            {formData.pesticides.map((pest, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Pesticide {index + 1}</span>
                  {formData.pesticides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePesticide(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={pest.type}
                  onChange={(e) => updatePesticide(index, 'type', e.target.value)}
                  className="input-field"
                  placeholder="Pesticide type (e.g., Insecticide, Herbicide)"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={pest.quantity || ''}
                    onChange={(e) => updatePesticide(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="input-field"
                    placeholder="Quantity (liters/kg)"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="date"
                    value={pest.date}
                    onChange={(e) => updatePesticide(index, 'date', e.target.value)}
                    className="input-field"
                    placeholder="Date used"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="inline mr-2" size={18} />
                Total Revenue Generated (₹)
              </label>
              <input
                type="number"
                value={formData.total_revenue || ''}
                onChange={(e) => handleInputChange('total_revenue', parseFloat(e.target.value) || 0)}
                className="input-field"
                placeholder="Enter total revenue (optional)"
                min="0"
                step="0.01"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter your total revenue from previous harvests (if any)
              </p>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Summary</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Location: {formData.location}</p>
                <p>Land Area: {formData.land_size} acres</p>
                <p>Soil Type: {formData.soil_type}</p>
                <p>Crops: {formData.crops.filter(c => c.name).length}</p>
                <p>Fertilizers: {formData.fertilizers.filter(f => f.type).length}</p>
                <p>Pesticides: {formData.pesticides.filter(p => p.type).length}</p>
                {formData.total_revenue > 0 && <p>Total Revenue: ₹{formData.total_revenue.toLocaleString()}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-earth-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to FarmSync, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Let's set up your farm profile to get started
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 progress-bar">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300 progress-fill"
                style={{ width: `${(step / totalSteps) * 100}%` } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="mb-6 min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
