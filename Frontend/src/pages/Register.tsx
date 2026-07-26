import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Lock, Sun, Moon, AlertCircle, Phone, MapPin, Loader2, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OAuthSignIn from '../components/OAuthSignIn';
import Button from '../components/ui/Button';
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
  const { theme, toggleTheme } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
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
    const { name, value } = e.target;
    const mappedName = name === 'fs_email_addr' ? 'email' : name === 'fs_password' ? 'password' : name;
    setFormData(prev => ({ ...prev, [mappedName]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
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
      toast.success('Account created successfully!');
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
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        {/* Branding Side (desktop only) */}
        <div className="hidden lg:flex flex-col w-1/2 space-y-8">
          <Link to="/">
            <Logo size="large" />
          </Link>
          <div>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-text mb-6 leading-tight">
              Create Your Farm Profile
            </h1>
            <p className="text-xl text-text-muted font-medium mb-8 max-w-lg">
              Join thousands of farmers using FarmSync to optimize yields, track expenses, and make data-driven decisions.
            </p>
          </div>
          <div className="space-y-4">
            {[
              'Real-time crop and field tracking',
              'AI-powered disease detection',
              'Market price intelligence',
              'Multi-language support (8 languages)'
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-text-muted font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="w-full max-w-md">
          <div className="bg-surface-raised border border-border rounded-lg p-8 shadow-sm">
            {/* Header controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="lg:hidden">
                <Link to="/">
                  <Logo size="default" />
                </Link>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <LanguageSwitcher />
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-surface hover:bg-surface-sunken transition-colors text-text-muted hover:text-text"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-text mb-2">
                {step === 1 ? 'Create Account' : 'Farm Details'}
              </h2>
              <p className="text-sm text-text-muted">
                {step === 1 ? 'Step 1 of 2 — Basic Information' : 'Step 2 of 2 — Farm & Location'}
              </p>

              {/* Step indicator */}
              <div className="flex gap-2 mt-6">
                <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-border'}`} />
                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-border'}`} />
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-danger-surface border border-danger rounded-md flex items-center gap-3">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <p className="text-sm text-danger font-medium">{error}</p>
              </div>
            )}

            {/* STEP 1: Account Info */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text block mb-2">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text block mb-2">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                    >
                      <option value="farmer">Farmer (Primary)</option>
                      <option value="citizen">Citizen (Buyer)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text block mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      name="fs_email_addr"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                      placeholder="you@farm.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text block mb-2">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="fs_password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-1">At least 8 characters</p>
                </div>

                <Button variant="primary" size="md" type="submit" className="w-full">
                  Next: Farm Details
                </Button>
              </form>
            )}

            {/* STEP 2: Farm & Location */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text block mb-2">Phone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                        placeholder="+91 9876 543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text block mb-2">Language</label>
                    <select
                      name="preferred_language"
                      value={formData.preferred_language}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text block mb-2">State *</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                    >
                      <option value="">Select state</option>
                      {INDIA_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text block mb-2">District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                      placeholder="e.g. Pune"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text block mb-2">Village</label>
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                      placeholder="e.g. Lavasa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text block mb-2">Land Size (hectares)</label>
                    <input
                      type="number"
                      name="land_size"
                      value={formData.land_size}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                      placeholder="e.g. 2.5"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text block mb-2">Soil Type</label>
                    <input
                      type="text"
                      name="soil_type"
                      value={formData.soil_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all text-sm"
                      placeholder="e.g. Loamy"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" size="md" type="button" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button variant="primary" size="md" type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <></>}
                    Create Account
                  </Button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* OAuth */}
            <OAuthSignIn />

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
