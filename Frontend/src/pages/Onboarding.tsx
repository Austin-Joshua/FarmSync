import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Save, MapPin, Ruler, Droplets, Wheat, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

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
  total_revenue: number;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState<OnboardingData>({
    location: '',
    land_size: 0,
    soil_type: '',
    crops: [{ name: '', area: 0, sowing_date: '', expected_harvest_date: '' }],
    total_revenue: 0,
  });

  const soilTypes = ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Arid', 'Saline', 'Peaty', 'Forest', 'Other'];

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addCrop = () => {
    setFormData((prev) => ({
      ...prev,
      crops: [...prev.crops, { name: '', area: 0, sowing_date: '', expected_harvest_date: '' }],
    }));
  };

  const updateCrop = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      crops: prev.crops.map((crop, i) => (i === index ? { ...crop, [field]: value } : crop)),
    }));
  };

  const validateStep = (): boolean => {
    if (step === 1 && (!formData.location || !formData.land_size || !formData.soil_type)) {
      toast.error('Please fill in all farm details');
      return false;
    }
    if (step === 2 && (formData.crops.some(c => !c.name || !c.area || !c.sowing_date))) {
      toast.error('Please complete all crop entries');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Update profile in Firebase Client State
      await updateUser({
        location: formData.location,
        land_size: formData.land_size,
        soil_type: formData.soil_type,
        is_onboarded: true
      });

      // Update profile in Java Backend Database
      try {
        await api.updateProfile({
          name: user?.name,
          location: formData.location,
          land_size: formData.land_size,
          soil_type: formData.soil_type,
        });
      } catch (e) {
        console.warn('Backend profile sync failed, continuing...', e);
      }

      // Create farm
      const farmResponse = await api.createFarm({
        name: `${user?.name}'s Primary Estate`,
        location: formData.location,
        land_size: formData.land_size,
        soil_type: formData.soil_type,
      });

      const farmId = farmResponse.data?.id;

      if (farmId) {
        // Create crops
        for (const crop of formData.crops) {
          await api.createCrop({
            name: crop.name,
            sowing_date: crop.sowing_date,
            harvest_date: crop.expected_harvest_date || null,
            status: 'active',
            farm_id: farmId,
          });
        }
      }

      toast.success('Your farm is now synced!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-surface rounded-[2rem] shadow-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-bl-full flex items-center justify-center">
            <Wheat className="text-accent opacity-20" size={48} />
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-text uppercase tracking-tighter mb-2 italic">Welcome to FarmSync</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Step {step} of {totalSteps} • Profile Calibration</p>
        </div>

        <div className="mb-10 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-1">
                <label className="label">{t('profile.location') || 'Farm Location'}</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input className="w-full bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pl-10 text-text placeholder:text-gray-400 focus:ring-2 focus:ring-accent outline-none" value={formData.location} onChange={e => handleInputChange('location', e.target.value)} placeholder="e.g. Coimbatore, Tamil Nadu" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">Land Size (Acres)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <input type="number" className="w-full bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pl-10 text-text placeholder:text-gray-400 focus:ring-2 focus:ring-accent outline-none" value={formData.land_size || ''} onChange={e => handleInputChange('land_size', parseFloat(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">Soil Architecture</label>
                  <div className="relative">
                    <Droplets className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <select className="w-full bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pl-10 text-text placeholder:text-gray-400 focus:ring-2 focus:ring-accent outline-none appearance-none" value={formData.soil_type} onChange={e => handleInputChange('soil_type', e.target.value)}>
                      <option value="" disabled>Select Type</option>
                      {soilTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <h3 className="text-xl font-black text-text uppercase tracking-tight mb-4">Initial Crop Inventory</h3>
               {formData.crops.map((crop, i) => (
                 <div key={i} className="p-4 bg-surface-sunken/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                   <input className="w-full bg-surface border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-text placeholder:text-gray-400 focus:ring-2 focus:ring-accent outline-none" placeholder="Crop Name (e.g. IR-20 Rice)" value={crop.name} onChange={e => updateCrop(i, 'name', e.target.value)} />
                   <div className="grid grid-cols-2 gap-3">
                     <input type="number" className="w-full bg-surface border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-text placeholder:text-gray-400 focus:ring-2 focus:ring-accent outline-none" placeholder="Area" value={crop.area || ''} onChange={e => updateCrop(i, 'area', parseFloat(e.target.value))} />
                     <input type="date" className="w-full bg-surface border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-text placeholder:text-gray-400 focus:ring-2 focus:ring-accent outline-none" value={crop.sowing_date} onChange={e => updateCrop(i, 'sowing_date', e.target.value)} />
                   </div>
                 </div>
               ))}
               <button onClick={addCrop} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-gray-500 font-bold text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors">+ Add Another Crop</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300 text-center">
               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                 <Save size={40} />
               </div>
               <h3 className="text-2xl font-black text-text uppercase tracking-tight">System Ready</h3>
               <p className="text-gray-500 font-medium">All telemetry and farm parameters have been logged. Ready to initialize your FarmSync dashboard.</p>
               <div className="p-4 bg-surface-sunken rounded-2xl text-left space-y-2 mt-8">
                 <p className="text-[10px] font-black text-gray-400 uppercase">Initialization Summary</p>
                 <p className="text-sm font-bold text-gray-700 dark:text-white">{formData.location} • {formData.land_size} Acres • {formData.crops.length} Crops</p>
               </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors">
              <ChevronLeft size={24} />
            </button>
          )}
          {step < totalSteps ? (
            <button onClick={handleNext} className="flex-1 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-accent/30 hover:scale-100 active:scale-100 transition-all">
              Initialize Next Stage <ChevronRight size={20} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-accent/30 hover:scale-100 active:scale-100 transition-all">
              {loading ? <Loader className="animate-spin" size={24} /> : <><Save size={20} /> Complete Sync</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
