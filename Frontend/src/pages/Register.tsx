// Register page — green + gold FarmSync UI
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, UserPlus, Sun, Moon, AlertCircle, Phone, MapPin, Landmark, Loader2, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OAuthSignIn from '../components/OAuthSignIn';
import toast from 'react-hot-toast';

const Register = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const { register: registerAction } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: 'farmer' as 'farmer' | 'expert' | 'admin',
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
      setError(t('register.fillRequiredFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerAction(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role,
        {
          phone: formData.phone,
          location: formData.location,
          land_size: formData.land_size ? parseFloat(formData.land_size) : undefined,
          soil_type: formData.soil_type,
        }
      );
      toast.success(t('register.successMessage') || 'Account created successfully! Welcome to FarmSync.');
      navigate('/onboarding');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || t('register.errorOccurred'));
      toast.error(err.response?.data?.message || t('register.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/3 bg-primary-600 dark:bg-primary-900 items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400 opacity-20 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500 opacity-20 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10 max-w-md">
          <div className="mb-8">
            <Logo size="lg" variant="white" />
          </div>
          <h1 className="text-3xl font-bold mb-6">{t('register.joinTitle') || 'Join our smart farming revolution'}</h1>
          <p className="text-lg text-primary-100 mb-8">
            {t('register.joinSubtitle') || 'Access advanced statistics and AI-powered insights to grow your farm.'}
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Landmark size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('register.featureFinancial') || 'Financial Insights'}</h3>
                <p className="text-primary-100 opacity-80">{t('register.featureFinancialDesc') || 'Track every expense and income to maximize your profit margins.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="md:hidden">
              <Logo size="md" />
            </div>
            <div className="ml-auto flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('register.createAccount')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('register.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.fullName')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.email')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.password')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.phone')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.location')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    name="location"
                    type="text"
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="e.g. Nashik, Maharashtra"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.role')}
                </label>
                <select
                  name="role"
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                  value={formData.role}
                >
                  <option value="farmer">{t('register.farmer')}</option>
                  <option value="expert">{t('register.expert')}</option>
                  <option value="admin">{t('register.admin')}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <UserPlus size={24} />}
              {t('register.signUp')}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  {t('register.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <OAuthSignIn />
            </div>
          </div>

          <p className="mt-10 text-center text-gray-600 dark:text-gray-400">
            {t('register.haveAccount')}{' '}
            <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
              {t('register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
