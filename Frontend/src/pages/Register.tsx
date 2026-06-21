import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  User, Mail, Lock, UserPlus, Sun, Moon, AlertCircle,
  Phone, MapPin, Loader2, Eye, EyeOff, Globe, Building2, Home
} from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OAuthSignIn from '../components/OAuthSignIn';
import toast from 'react-hot-toast';

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
];

const Register = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Account, 2 = Farm & Location
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'farmer' as 'farmer' | 'citizen' | 'admin',
    state: '',
    district: '',
    village: '',
    land_size: '',
    soil_type: '',
    preferred_language: 'en',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.role as any,
        {
          phone: formData.phone,
          state: formData.state,
          district: formData.district,
          village: formData.village,
          location: [formData.village, formData.district, formData.state].filter(Boolean).join(', '),
          land_size: formData.land_size ? parseFloat(formData.land_size) : null,
          soil_type: formData.soil_type,
          preferred_language: formData.preferred_language,
        }
      );
      toast.success('Account created successfully! Welcome to FarmSync 🌾');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = typeof err === 'string' ? err : err.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-[#064e3b] to-[#047857]'}`}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-earth-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container max-w-7xl mx-auto px-4 z-10 flex flex-col lg:flex-row items-center gap-12 py-12">
        {/* Branding Side */}
        <div className="hidden lg:flex flex-col w-1/2 space-y-8 animate-fade-in">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <Logo size="large" />
          </Link>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
            Begin Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-300">
              Precision Agriculture
            </span>{' '}
            Journey
          </h1>
          <p className="text-xl text-emerald-100 max-w-lg leading-relaxed drop-shadow">
            Create your digital farm profile and unlock AI-powered crop planning, market intelligence, and yield predictions.
          </p>

          {/* Step indicators */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step >= 1 ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-white/5 text-white/50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-emerald-400 text-emerald-900' : 'bg-white/20'}`}>1</span>
              Account Setup
            </div>
            <div className="h-px w-8 bg-white/20" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step >= 2 ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-white/5 text-white/50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-emerald-400 text-emerald-900' : 'bg-white/20'}`}>2</span>
              Farm Profile
            </div>
          </div>
        </div>

        {/* Register Card */}
        <div className="w-[90%] max-w-[420px] lg:max-w-[500px] animate-fade-in-up mx-auto lg:mx-0">
          <div className="glass-card shadow-2xl relative !p-6">
            {/* Theme & Language Toggles */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>

            <div className="mb-4 pt-1">
              <div className="lg:hidden mb-4 flex justify-center hover:scale-105 transition-transform">
                <Link to="/"><Logo size="default" variant="light" /></Link>
              </div>
              {/* Mobile step indicators */}
              <div className="lg:hidden flex items-center gap-3 mb-4">
                {[1, 2].map(s => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                ))}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {step === 1 ? 'Create Account' : 'Farm Profile'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === 1 ? 'Step 1 of 2 — Basic Information' : 'Step 2 of 2 — Farm & Location'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wide">{error}</p>
              </div>
            )}

            {/* STEP 1: Account Info */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('fullName')} *</label>
                    <div className="relative group">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        name="fullName" type="text" value={formData.fullName} onChange={handleChange}
                        className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="Ravi Kumar" required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('emailAddress')} *</label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        name="email" type="email" value={formData.email} onChange={handleChange}
                        className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="ravi@example.com" required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('password')} *</label>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                        className="block w-full pl-9 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="••••••••" required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('phone')}</label>
                    <div className="relative group">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        name="phone" type="tel" value={formData.phone} onChange={handleChange}
                        className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('role')} *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'farmer', label: '🌾 Farmer', desc: 'Manage crops & farm' },
                      { value: 'citizen', label: '🏙️ Citizen', desc: 'Buy produce' },
                      { value: 'admin', label: '🛡️ Admin', desc: 'Platform access' },
                    ].map(opt => (
                      <button
                        type="button" key={opt.value}
                        onClick={() => setFormData(p => ({ ...p, role: opt.value as any }))}
                        className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl border-2 transition-all text-center ${
                          formData.role === opt.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                        }`}
                      >
                        <span className="text-base">{opt.label.split(' ')[0]}</span>
                        <span className="text-[10px] font-bold">{opt.label.split(' ')[1]}</span>
                        <span className="text-[9px] text-gray-400">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transform hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Continue to Farm Profile →
                </button>

                <div className="mt-4 text-center space-y-3">
                  <OAuthSignIn />
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-xs">
                    {t('alreadyHaveAccount')}{' '}
                    <Link to="/login" className="font-extrabold text-primary-600 dark:text-primary-400 hover:underline">{t('signIn')}</Link>
                  </p>
                </div>
              </form>
            )}

            {/* STEP 2: Farm & Location */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">State</label>
                    <div className="relative group">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <select
                        name="state" value={formData.state} onChange={handleChange}
                        className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm appearance-none"
                      >
                        <option value="">Select State</option>
                        {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">District</label>
                    <div className="relative group">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        name="district" type="text" value={formData.district} onChange={handleChange}
                        className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="e.g. Nashik"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">Village / Town</label>
                    <div className="relative group">
                      <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        name="village" type="text" value={formData.village} onChange={handleChange}
                        className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="e.g. Igatpuri"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">Farm Size (Acres)</label>
                    <input
                      name="land_size" type="number" step="0.1" min="0" value={formData.land_size} onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                      placeholder="e.g. 5.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">Soil Type</label>
                    <select
                      name="soil_type" value={formData.soil_type} onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                    >
                      <option value="">Select Soil Type</option>
                      {['Alluvial', 'Black (Regur)', 'Red & Yellow', 'Laterite', 'Arid & Desert', 'Saline', 'Peaty', 'Forest'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-1">
                      <Globe size={12} /> Preferred Language
                    </label>
                    <select
                      name="preferred_language" value={formData.preferred_language} onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm"
                    >
                      {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button" onClick={() => setStep(1)}
                    className="flex-1 py-2.5 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transform hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                    Create Account
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
