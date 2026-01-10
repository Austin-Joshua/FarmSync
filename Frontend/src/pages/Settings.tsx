// Settings Page - User preferences, profile management, and configuration
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserSettings } from '../types';
import { useLocation } from '../hooks/useLocation';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import {
  Settings as SettingsIcon,
  Save,
  History,
  Database,
  Bell,
  Moon,
  Sun,
  Check,
  User,
  MapPin,
  Ruler,
  Droplets,
  Edit2,
  X,
  Navigation,
  Loader,
  Plus,
} from 'lucide-react';
import { mockFarms } from '../data/mockData';
import type { Farm } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PushNotificationSetup from '../components/PushNotificationSetup';
import { translateSoilType } from '../utils/translations';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { location: gpsLocation, requestLocation } = useLocation();
  const { t, i18n: i18nInstance } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [farms, setFarms] = useState([...mockFarms]);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [farmEditData, setFarmEditData] = useState<{ name: string; location: string; landSize: number; soilType: string } | null>(null);
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Initialize from localStorage or use current i18n language
    const savedSettings = localStorage.getItem('userSettings');
    const currentLang = i18n.language || 'en';
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return { ...parsed, language: currentLang };
    }
    return {
      theme: 'light',
      notifications: true,
      language: currentLang,
      currency: 'INR',
      dataRetention: 365,
    };
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    landSize: user?.land_size || 0,
    soilType: user?.soil_type || '',
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        landSize: user.land_size || 0,
        soilType: user.soil_type || '',
      });
    }
  }, [user]);

  // Update location when GPS data is available
  useEffect(() => {
    if (gpsLocation.address && isEditing) {
      setProfileData((prev) => ({
        ...prev,
        location: gpsLocation.address || prev.location,
      }));
    }
  }, [gpsLocation.address, isEditing]);

  // Sync language changes from LanguageSwitcher and update settings state
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    if (settings.language !== currentLang) {
      setSettings((prev) => ({ ...prev, language: currentLang }));
      localStorage.setItem('userSettings', JSON.stringify({ ...settings, language: currentLang }));
    }
  }, [i18n.language]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...parsed, language: parsed.language || i18n.language || 'en' }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Apply language (should already be set by LanguageSwitcher, but ensure sync)
    if (settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language);
    }
    alert(t('settings.preferencesSaved'));
  };

  const handleUseMyLocation = async () => {
    if (!gpsLocation.latitude || !gpsLocation.longitude) {
      requestLocation();
      return;
    }

    try {
      // Fetch location name from API
      const response = await api.getCurrentLocation(
        gpsLocation.latitude,
        gpsLocation.longitude
      );
      if (response.data?.address) {
        setProfileData((prev) => ({
          ...prev,
          location: response.data.address,
        }));
      }
    } catch (error) {
      console.error('Failed to get location name:', error);
      // Still use coordinates if API fails
      if (gpsLocation.latitude && gpsLocation.longitude) {
        setProfileData((prev) => ({
          ...prev,
          location: `${gpsLocation.latitude.toFixed(4)}, ${gpsLocation.longitude.toFixed(4)}`,
        }));
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUser({
        name: profileData.name,
        location: profileData.location || null,
        land_size: profileData.landSize || 0,
        soil_type: profileData.soilType || null,
      });
      setIsEditing(false);
      alert(t('settings.profileUpdated'));
    } catch (error: any) {
      alert(`${t('settings.profileUpdateError')}: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProfile = () => {
    setIsEditing(false);
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      landSize: user?.land_size || 0,
      soilType: user?.soil_type || '',
    });
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('settings.profile')}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('settings.preferences')}
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center text-white text-5xl">
                  {user?.name?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')}
                </div>
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {user?.role === 'admin' ? '👨‍💼 Admin' : '👨‍🌾 Farmer'}
                  </span>
                </div>
              </div>

              {/* Profile Information */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{t('settings.profile')}</h2>
                    {!isEditing && (!profileData.name || !profileData.location) && (
                      <p className="text-sm text-yellow-600 mt-1">
                        {t('settings.profileIncomplete')}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Edit2 size={16} />
                      {profileData.name || profileData.location ? t('settings.editProfile') : t('settings.addDetails')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      {t('settings.fullName')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.name || t('common.notSet')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.email || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      {t('settings.location')}
                    </label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          placeholder={t('settings.location')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleUseMyLocation}
                          disabled={gpsLocation.loading}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          title="Use current GPS location"
                        >
                          {gpsLocation.loading ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Navigation size={16} />
                          )}
                          {t('settings.useMyLocation')}
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profileData.location || t('common.notSet')}
                      </p>
                    )}
                    {isEditing && gpsLocation.error && (
                      <p className="text-red-600 text-xs mt-1">{gpsLocation.error}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Ruler size={16} className="inline mr-2" />
                      {t('settings.landSize')}
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={profileData.landSize || ''}
                        onChange={(e) => setProfileData({ ...profileData, landSize: parseFloat(e.target.value) || 0 })}
                        placeholder={t('settings.landSize')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.landSize > 0 ? `${profileData.landSize} ${t('settings.landSize').split('(')[1]?.replace(')', '') || 'acres'}` : t('common.notSet')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="settings-soil-type" className="block text-sm font-medium text-gray-700 mb-2">
                      <Droplets size={16} className="inline mr-2" />
                      {t('settings.soilType')}
                    </label>
                    {isEditing ? (
                      <select
                        id="settings-soil-type"
                        value={profileData.soilType}
                        onChange={(e) => setProfileData({ ...profileData, soilType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        aria-label={t('settings.soilType')}
                      >
                        <option value="">{t('settings.selectSoilType')}</option>
                        <option value="Alluvial">{translateSoilType('Alluvial')}</option>
                        <option value="Red Soil">{translateSoilType('Red Soil')}</option>
                        <option value="Black Soil">{translateSoilType('Black Soil')}</option>
                        <option value="Sandy">{translateSoilType('Sandy')}</option>
                        <option value="Clay">{translateSoilType('Clay')}</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.soilType ? translateSoilType(profileData.soilType) : t('common.notSet')}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || !profileData.name?.trim()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!profileData.name?.trim() ? t('profile.nameRequired') : ''}
                    >
                      {saving ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          {t('settings.saving')}
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          {t('settings.saveChanges')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelProfile}
                      disabled={saving}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <X size={20} />
                      {t('common.cancel')}
                    </button>
                  </div>
                )}
                {!isEditing && (!profileData.name || !profileData.location) && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{t('common.success')}:</strong> {t('settings.profileTip')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('settings.farmInformation')}</h2>
              <button
                onClick={() => {
                  const newFarm = {
                    id: Date.now().toString(),
                    name: t('settings.newFarm'),
                    location: '',
                    landSize: 0,
                    soilType: 'Alluvial',
                    farmerId: user?.id || '',
                  };
                  setFarms([...farms, newFarm]);
                  setEditingFarmId(newFarm.id);
                  setFarmEditData({ name: newFarm.name, location: newFarm.location, landSize: newFarm.landSize, soilType: newFarm.soilType });
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={16} />
                {t('settings.addFarm')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farms.map((farm) => {
                const isEditingFarm = editingFarmId === farm.id;
                const farmData = isEditingFarm && farmEditData ? farmEditData : { name: farm.name, location: farm.location, landSize: farm.landSize, soilType: farm.soilType };
                return (
                  <div key={farm.id} className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                    {isEditingFarm ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={farmData.name}
                          onChange={(e) => setFarmEditData({ ...farmData, name: e.target.value })}
                          placeholder={t('settings.enterFarmName')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          value={farmData.location}
                          onChange={(e) => setFarmEditData({ ...farmData, location: e.target.value })}
                          placeholder={t('settings.enterLocation')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex gap-2">
                          <label htmlFor="farm-land-size" className="sr-only">{t('settings.landSize')}</label>
                          <input
                            id="farm-land-size"
                            type="number"
                            step="0.1"
                            value={farmData.landSize}
                            onChange={(e) => setFarmEditData({ ...farmData, landSize: parseFloat(e.target.value) || 0 })}
                            placeholder={t('settings.enterLandSize')}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            aria-label={t('settings.landSize')}
                          />
                          <span className="px-3 py-2 text-sm text-gray-600 flex items-center">{t('common.acres')}</span>
                        </div>
                        <label htmlFor="farm-soil-type" className="sr-only">{t('settings.soilType')}</label>
                        <select
                          id="farm-soil-type"
                          value={farmData.soilType}
                          onChange={(e) => setFarmEditData({ ...farmData, soilType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          aria-label={t('settings.soilType')}
                        >
                          <option value="">{t('settings.selectSoilType')}</option>
                          <option value="Alluvial">{translateSoilType('Alluvial')}</option>
                          <option value="Red Soil">{translateSoilType('Red Soil')}</option>
                          <option value="Black Soil">{translateSoilType('Black Soil')}</option>
                          <option value="Sandy">{translateSoilType('Sandy')}</option>
                          <option value="Clay">{translateSoilType('Clay')}</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const updatedFarms = farms.map(f => f.id === farm.id ? { ...f, ...farmData } : f);
                              setFarms(updatedFarms);
                              setEditingFarmId(null);
                              setFarmEditData(null);
                              alert(t('settings.farmUpdated'));
                            }}
                            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1"
                          >
                            <Save size={14} />
                            {t('common.save')}
                          </button>
                          <button
                            onClick={() => {
                              setEditingFarmId(null);
                              setFarmEditData(null);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
                          >
                            <X size={14} />
                            {t('common.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{farm.name}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingFarmId(farm.id);
                                setFarmEditData({ name: farm.name, location: farm.location, landSize: farm.landSize, soilType: farm.soilType });
                              }}
                              className="p-1 text-primary-600 hover:bg-primary-100 rounded transition-colors"
                              title={t('settings.editFarm')}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t('settings.confirmDeleteFarm'))) {
                                  setFarms(farms.filter(f => f.id !== farm.id));
                                  alert(t('settings.farmDeleted'));
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title={t('settings.deleteFarm')}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <MapPin size={14} className="inline mr-1" />
                          {farm.location || t('settings.notSet')}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <Ruler size={14} className="inline mr-1" />
                          {farm.landSize} {t('common.acres')}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Droplets size={14} className="inline mr-1" />
                          {farm.soilType ? translateSoilType(farm.soilType) : t('settings.notSet')}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} />
              {t('settings.preferences')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('settings.theme')}</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => updateSetting('theme', 'light')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      settings.theme === 'light'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Sun size={16} />
                    {t('settings.light')}
                    {settings.theme === 'light' && <Check size={16} />}
                  </button>
                  <button
                    onClick={() => updateSetting('theme', 'dark')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      settings.theme === 'dark'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Moon size={16} />
                    {t('settings.dark')}
                    {settings.theme === 'dark' && <Check size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('settings.language')}</label>
                <div className="flex items-center gap-3">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={20} />
                {t('settings.notifications')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{t('settings.enableNotifications')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.receiveUpdates')}</p>
                  </div>
                  <button
                    onClick={() => updateSetting('notifications', !settings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                    aria-label={settings.notifications ? t('settings.disableNotifications') || 'Disable notifications' : t('settings.enableNotifications') || 'Enable notifications'}
                    title={settings.notifications ? t('settings.disableNotifications') || 'Disable notifications' : t('settings.enableNotifications') || 'Enable notifications'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Push Notification Setup */}
            <PushNotificationSetup />

            {/* Email Notification Preferences */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Notification Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Climate warnings (temperature, rainfall, drought)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Low stock alerts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Harvest reminders</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">System updates and announcements</span>
                </label>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database size={20} />
              {t('settings.dataPrivacy')}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="data-retention-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.dataRetention')}</label>
                <select
                  id="data-retention-select"
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label={t('settings.dataRetention')}
                >
                  <option value={30}>30 {t('settings.days')}</option>
                  <option value={90}>90 {t('settings.days')}</option>
                  <option value={365}>1 {t('settings.year')}</option>
                  <option value={730}>2 {t('settings.years')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Save size={20} />
              {t('settings.savePreferences')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;