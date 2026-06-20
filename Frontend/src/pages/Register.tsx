import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, UserPlus, Sun, Moon, AlertCircle, Phone, MapPin, Loader2, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OAuthSignIn from '../components/OAuthSignIn';
import toast from 'react-hot-toast';

const Register = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: 'farmer' as 'farmer' | 'citizen' | 'admin',
    land_size: '',
    soil_type: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      setError(t('fillRequiredFields') || 'Please fill in all required fields');
      return;
    }

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
          location: formData.location,
          land_size: formData.land_size ? parseFloat(formData.land_size) : null,
          soil_type: formData.soil_type,
        }
      );
      
      toast.success(t('registerSuccess'));
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = typeof err === 'string' ? err : err.message || t('registerError');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-[#064e3b] to-[#047857]'}`}>
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-earth-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 z-10 flex flex-col lg:flex-row items-center gap-12 py-12">
        {/* Branding Side */}
        <div className="hidden lg:flex flex-col w-1/2 space-y-8 animate-fade-in">
          <div className="inline-block hover:scale-105 transition-transform cursor-pointer">
            <Link to="/">
              <Logo size="large" />
            </Link>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
            Begin Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-300">Precision Agriculture</span> Strategy
          </h1>
          <p className="text-xl text-emerald-100 max-w-lg leading-relaxed drop-shadow">
            Create your digital twin today and optimize every hectare with enterprise-grade agricultural intelligence.
          </p>
        </div>

        {/* Register Card Side */}
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
              <div className="lg:hidden mb-4 flex justify-center hover:scale-105 transition-transform cursor-pointer">
                <Link to="/">
                  <Logo size="default" variant="light" />
                </Link>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('createYourAccount')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('joinSystem')}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wide">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    {t('fullName')} *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      name="fullName"
                      type="text"
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm text-sm"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    {t('emailAddress')} *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      name="email"
                      type="email"
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm text-sm"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    {t('password')} *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-12 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    {t('phone')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm text-sm"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    {t('location')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                      <MapPin size={18} />
                    </div>
                    <input
                      name="location"
                      type="text"
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm text-sm"
                      placeholder="e.g. Nashik, Maharashtra"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    {t('role')}
                  </label>
                  <select
                    name="role"
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all appearance-none shadow-sm text-sm"
                    value={formData.role}
                  >
                    <option value="farmer">{t('farmer')}</option>
                    <option value="citizen">Citizen</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-primary-500/20 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transform hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <UserPlus size={24} className="group-hover:rotate-12 transition-transform" />}
                {t('registerButton')}
              </button>
            </form>

            <div className="mt-5 text-center">
              <div className="mb-4 flex justify-center">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t('orContinueEmail')}
                </span>
              </div>

              <OAuthSignIn />

              <p className="mt-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                {t('alreadyHaveAccount')}{' '}
                <Link to="/login" className="font-extrabold text-primary-600 dark:text-primary-400 hover:underline">
                  {t('signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

