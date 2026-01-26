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
  Cloud,
  Package,
  RefreshCw,
  Calendar,
  Clock,
  Globe,
  Gauge,
  LayoutDashboard,
  Download,
  Upload,
  Trash2,
  Shield,
  Key,
  LogOut,
  AlertTriangle,
  TrendingUp,
  Camera,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { mockFarms } from '../data/mockData';
import type { Farm } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PushNotificationSetup from '../components/PushNotificationSetup';
import TwoFactorAuthSetup from '../components/TwoFactorAuthSetup';
import { translateSoilType } from '../utils/translations';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user, updateUser, uploadProfilePicture } = useAuth();
  const { location: gpsLocation, requestLocation } = useLocation();
  const { t, i18n: i18nInstance } = useTranslation();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [sessions, setSessions] = useState<Array<{
    id: string;
    isCurrent: boolean;
    device: string;
    browser: string;
    ipAddress: string;
    lastActivity: string;
    createdAt: string;
  }>>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [user2FAEnabled, setUser2FAEnabled] = useState(false);
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
      weatherAlerts: true,
      stockAlertThreshold: 20,
      autoRefresh: false,
      refreshInterval: 30,
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'IST',
      units: 'metric',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      cropRecommendations: true,
      irrigationReminders: true,
      lowStockAlert: true,
      climateWarnings: true,
      harvestReminders: true,
      systemUpdates: true,
      dashboardWidgets: ['weather', 'stock', 'map', 'alerts'],
    };
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    landSize: user?.land_size || 0,
    soilType: user?.soil_type || '',
  });
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  // Load active sessions when security tab is active
  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
      load2FAStatus();
    }
  }, [activeTab]);

  const load2FAStatus = async () => {
    if (!user) return;
    try {
      // Check if user has 2FA enabled by checking user profile
      // This would typically come from the user object or a separate API call
      // For now, we'll check localStorage or make an API call
      const userProfile = await api.getUserProfile();
      if (userProfile.data?.two_factor_enabled) {
        setUser2FAEnabled(true);
      }
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
    }
  };

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await api.getActiveSessions();
      if (response.sessions) {
        setSessions(response.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm('Are you sure you want to logout from all other devices? You will remain logged in on this device.')) {
      try {
        await api.logoutAllDevices();
        await loadSessions();
        alert('Successfully logged out from all other devices');
      } catch (error: any) {
        alert(error?.message || 'Failed to logout from all devices');
      }
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) {
      return <Smartphone size={20} className="text-gray-500" />;
    } else if (device.toLowerCase().includes('tablet')) {
      return <Tablet size={20} className="text-gray-500" />;
    }
    return <Monitor size={20} className="text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
      month: 'long'
    });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Use currentTheme from ThemeContext as source of truth for theme
        setSettings((prev) => ({ ...parsed, language: parsed.language || i18n.language || 'en', theme: currentTheme }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    } else {
      // Initialize theme from ThemeContext if no saved settings
      setSettings((prev) => ({ ...prev, theme: currentTheme }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Sync settings.theme with ThemeContext.theme whenever ThemeContext changes
  // This ensures Settings page reflects theme changes from Header/Layout toggle
  useEffect(() => {
    setSettings((prev) => {
      if (prev.theme !== currentTheme) {
        return { ...prev, theme: currentTheme };
      }
      return prev;
    });
  }, [currentTheme]);

  const handleSaveSettings = () => {
    // Save settings with current theme from ThemeContext to ensure sync
    const settingsToSave = { ...settings, theme: currentTheme };
    localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
    // Theme is already handled by ThemeContext, no need to manually manipulate DOM
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

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('profile.invalidImageType') || 'Please select a valid image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('profile.imageTooLarge') || 'Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePictureUpload = async () => {
    const fileInput = document.getElementById('settings-profile-picture-input') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      alert(t('profile.noFileSelected') || 'Please select an image file');
      return;
    }

    setUploadingPicture(true);
    try {
      await uploadProfilePicture(file);
      setPreviewUrl(null);
      // Reset file input
      if (fileInput) fileInput.value = '';
      alert(t('profile.pictureUploaded') || 'Profile picture uploaded successfully');
    } catch (error: any) {
      alert(`${t('profile.failedToUploadPicture') || 'Failed to upload picture'}: ${error.message}`);
      setPreviewUrl(null);
    } finally {
      setUploadingPicture(false);
    }
  };

  // Get profile picture URL
  const getProfilePictureUrl = (): string | null => {
    if (previewUrl) return previewUrl;
    if (user?.picture_url) {
      // If picture_url is already a full URL, return it; otherwise construct it
      if (user.picture_url.startsWith('http')) {
        return user.picture_url;
      }
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';
      const baseUrl = apiBaseUrl.replace('/api', '');
      return `${baseUrl}${user.picture_url}`;
    }
    return null;
  };

  const profilePictureUrl = getProfilePictureUrl();

  const handleCancelProfile = () => {
    setIsEditing(false);
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      landSize: user?.land_size || 0,
      soilType: user?.soil_type || '',
    });
    setPreviewUrl(null);
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Theme changes are handled directly via toggleTheme in the buttons, not through updateSetting
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 font-semibold'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {t('settings.profile')}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preferences'
                ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 font-semibold'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center text-white text-5xl border-4 border-white dark:border-gray-800 shadow-lg">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt={user?.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')
                    )}
                  </div>
                  <label
                    htmlFor="settings-profile-picture-input"
                    className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
                    title={t('profile.changePicture') || 'Change picture'}
                  >
                    <Camera size={18} />
                    <input
                      id="settings-profile-picture-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePictureChange}
                      title="Upload profile picture"
                      aria-label="Profile picture"
                    />
                  </label>
                </div>
                {previewUrl && (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handlePictureUpload}
                      disabled={uploadingPicture}
                      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploadingPicture ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          {t('profile.uploading') || 'Uploading...'}
                        </>
                      ) : (
                        <>
                          <Camera size={16} />
                          {t('profile.uploadPicture') || 'Upload Picture'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setPreviewUrl(null);
                        const fileInput = document.getElementById('settings-profile-picture-input') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      {t('common.cancel')}
                    </button>
                  </div>
                )}
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                    {user?.role === 'admin' ? '👨‍💼 Admin' : '👨‍🌾 Farmer'}
                  </span>
                </div>
              </div>

              {/* Profile Information */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('settings.profile')}</h2>
                    {!isEditing && (!profileData.name || !profileData.location) && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                        {t('settings.profileIncomplete')}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                    >
                      <Edit2 size={16} />
                      {profileData.name || profileData.location ? t('settings.editProfile') : t('settings.addDetails')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User size={16} className="inline mr-2" />
                      {t('settings.fullName')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{profileData.name || t('common.notSet')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User size={16} className="inline mr-2" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{profileData.email || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          type="button"
                          onClick={handleUseMyLocation}
                          disabled={gpsLocation.loading}
                          className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {profileData.location || t('common.notSet')}
                      </p>
                    )}
                    {isEditing && gpsLocation.error && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">{gpsLocation.error}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Ruler size={16} className="inline mr-2" />
                      {t('settings.landSize')}
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={profileData.landSize || ''}
                        onChange={(e) => setProfileData({ ...profileData, landSize: parseFloat(e.target.value) || 0 })}
                        placeholder={t('settings.landSize')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{profileData.landSize > 0 ? `${profileData.landSize} ${t('settings.landSize').split('(')[1]?.replace(')', '') || 'acres'}` : t('common.notSet')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="settings-soil-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Droplets size={16} className="inline mr-2" />
                      {t('settings.soilType')}
                    </label>
                    {isEditing ? (
                      <select
                        id="settings-soil-type"
                        value={profileData.soilType}
                        onChange={(e) => setProfileData({ ...profileData, soilType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{profileData.soilType ? translateSoilType(profileData.soilType) : t('common.notSet')}</p>
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
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                    >
                      <X size={20} />
                      {t('common.cancel')}
                    </button>
                  </div>
                )}
                {!isEditing && (!profileData.name || !profileData.location) && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>{t('common.success')}:</strong> {t('settings.profileTip')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('settings.farmInformation')}</h2>
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
                  <div key={farm.id} className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                    {isEditingFarm ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={farmData.name}
                          onChange={(e) => setFarmEditData({ ...farmData, name: e.target.value })}
                          placeholder={t('settings.enterFarmName')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <input
                          type="text"
                          value={farmData.location}
                          onChange={(e) => setFarmEditData({ ...farmData, location: e.target.value })}
                          placeholder={t('settings.enterLocation')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            aria-label={t('settings.landSize')}
                          />
                          <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">{t('common.acres')}</span>
                        </div>
                        <label htmlFor="farm-soil-type" className="sr-only">{t('settings.soilType')}</label>
                        <select
                          id="farm-soil-type"
                          value={farmData.soilType}
                          onChange={(e) => setFarmEditData({ ...farmData, soilType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1 text-gray-700 dark:text-gray-300 transition-colors"
                          >
                            <X size={14} />
                            {t('common.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">{farm.name}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingFarmId(farm.id);
                                setFarmEditData({ name: farm.name, location: farm.location, landSize: farm.landSize, soilType: farm.soilType });
                              }}
                              className="p-1 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded transition-colors"
                              title={t('settings.editFarm')}
                              aria-label={t('settings.editFarm')}
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
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title={t('settings.deleteFarm')}
                              aria-label={t('settings.deleteFarm')}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <MapPin size={14} className="inline mr-1 text-gray-600 dark:text-gray-400" />
                          {farm.location || t('settings.notSet')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <Ruler size={14} className="inline mr-1 text-gray-600 dark:text-gray-400" />
                          {farm.landSize} {t('common.acres')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <Droplets size={14} className="inline mr-1 text-gray-600 dark:text-gray-400" />
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} className="text-orange-600 dark:text-orange-400" />
              {t('settings.preferences')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('settings.theme')}</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (currentTheme !== 'light') {
                        toggleTheme();
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      currentTheme === 'light'
                        ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Sun size={16} />
                    {t('settings.light')}
                    {currentTheme === 'light' && <Check size={16} />}
                  </button>
                  <button
                    onClick={() => {
                      if (currentTheme !== 'dark') {
                        toggleTheme();
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      currentTheme === 'dark'
                        ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Moon size={16} />
                    {t('settings.dark')}
                    {currentTheme === 'dark' && <Check size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('settings.language')}</label>
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
                  <input
                    type="checkbox"
                    checked={settings.climateWarnings !== false}
                    onChange={(e) => updateSetting('climateWarnings', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Climate warnings (temperature, rainfall, drought)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.lowStockAlert !== false}
                    onChange={(e) => updateSetting('lowStockAlert', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Low stock alerts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.harvestReminders !== false}
                    onChange={(e) => updateSetting('harvestReminders', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Harvest reminders</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.systemUpdates !== false}
                    onChange={(e) => updateSetting('systemUpdates', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">System updates and announcements</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.irrigationReminders !== false}
                    onChange={(e) => updateSetting('irrigationReminders', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Irrigation reminders</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.cropRecommendations !== false}
                    onChange={(e) => updateSetting('cropRecommendations', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Crop recommendations</span>
                </label>
              </div>
            </div>
          </div>

          {/* Currency & Units */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Globe size={20} className="text-orange-600 dark:text-orange-400" />
              {t('settings.currency')} & {t('settings.units')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currency-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.currency')}</label>
                <select
                  id="currency-select"
                  value={settings.currency || 'INR'}
                  onChange={(e) => updateSetting('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label={t('settings.selectCurrency')}
                >
                  <option value="INR">{t('settings.inr')}</option>
                  <option value="USD">{t('settings.usd')}</option>
                  <option value="EUR">{t('settings.eur')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="units-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.units')}</label>
                <select
                  id="units-select"
                  value={settings.units || 'metric'}
                  onChange={(e) => updateSetting('units', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label={t('settings.selectUnits')}
                >
                  <option value="metric">{t('settings.metric')}</option>
                  <option value="imperial">{t('settings.imperial')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Weather Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Cloud size={20} className="text-blue-600 dark:text-blue-400" />
              {t('settings.weatherSettings')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('settings.enableWeatherAlerts')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.enableClimateWarnings')}</p>
                </div>
                <button
                  onClick={() => updateSetting('weatherAlerts', !settings.weatherAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.weatherAlerts !== false ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-label={settings.weatherAlerts !== false ? 'Disable weather alerts' : 'Enable weather alerts'}
                  title={settings.weatherAlerts !== false ? 'Disable weather alerts' : 'Enable weather alerts'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.weatherAlerts !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('settings.enableClimateWarnings')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temperature, rainfall, and drought alerts</p>
                </div>
                <button
                  onClick={() => updateSetting('climateWarnings', !settings.climateWarnings)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.climateWarnings !== false ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-label={settings.climateWarnings !== false ? 'Disable climate warnings' : 'Enable climate warnings'}
                  title={settings.climateWarnings !== false ? 'Disable climate warnings' : 'Enable climate warnings'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.climateWarnings !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Stock & Inventory Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Package size={20} className="text-green-600 dark:text-green-400" />
              {t('settings.stockSettings')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('settings.enableLowStockAlert')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.enableLowStockAlert')}</p>
                </div>
                <button
                  onClick={() => updateSetting('lowStockAlert', !settings.lowStockAlert)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.lowStockAlert !== false ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-label={settings.lowStockAlert !== false ? 'Disable low stock alert' : 'Enable low stock alert'}
                  title={settings.lowStockAlert !== false ? 'Disable low stock alert' : 'Enable low stock alert'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.lowStockAlert !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div>
                <label htmlFor="stock-threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.stockAlertThreshold')}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    id="stock-threshold"
                    min="1"
                    max="50"
                    value={settings.stockAlertThreshold || 20}
                    onChange={(e) => updateSetting('stockAlertThreshold', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">Alert when stock is below this percentage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Gauge size={20} className="text-purple-600 dark:text-purple-400" />
              {t('settings.displaySettings')}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="date-format-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.dateFormat')}</label>
                <select
                  id="date-format-select"
                  value={settings.dateFormat || 'DD/MM/YYYY'}
                  onChange={(e) => updateSetting('dateFormat', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label={t('settings.selectDateFormat')}
                >
                  <option value="DD/MM/YYYY">{t('settings.ddmmyyyy')}</option>
                  <option value="MM/DD/YYYY">{t('settings.mmddyyyy')}</option>
                  <option value="YYYY-MM-DD">{t('settings.yyyymmdd')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="timezone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.timeZone')}</label>
                <select
                  id="timezone-select"
                  value={settings.timeZone || 'IST'}
                  onChange={(e) => updateSetting('timeZone', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label={t('settings.selectTimeZone')}
                >
                  <option value="IST">{t('settings.ist')}</option>
                  <option value="UTC">{t('settings.utc')}</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('settings.enableAutoRefresh')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically refresh data</p>
                </div>
                <button
                  onClick={() => updateSetting('autoRefresh', !settings.autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoRefresh ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-label={settings.autoRefresh ? 'Disable auto refresh' : 'Enable auto refresh'}
                  title={settings.autoRefresh ? 'Disable auto refresh' : 'Enable auto refresh'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {settings.autoRefresh && (
                <div>
                  <label htmlFor="refresh-interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.refreshInterval')}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      id="refresh-interval"
                      min="1"
                      max="60"
                      value={settings.refreshInterval || 30}
                      onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Customization */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <LayoutDashboard size={20} className="text-indigo-600 dark:text-indigo-400" />
              {t('settings.dashboardCustomization')}
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.dashboardWidgets?.includes('weather') ?? true}
                  onChange={(e) => {
                    const widgets = settings.dashboardWidgets || [];
                    if (e.target.checked) {
                      updateSetting('dashboardWidgets', [...widgets, 'weather']);
                    } else {
                      updateSetting('dashboardWidgets', widgets.filter(w => w !== 'weather'));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.showWeatherWidget')}</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.dashboardWidgets?.includes('stock') ?? true}
                  onChange={(e) => {
                    const widgets = settings.dashboardWidgets || [];
                    if (e.target.checked) {
                      updateSetting('dashboardWidgets', [...widgets, 'stock']);
                    } else {
                      updateSetting('dashboardWidgets', widgets.filter(w => w !== 'stock'));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.showStockWidget')}</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.dashboardWidgets?.includes('map') ?? true}
                  onChange={(e) => {
                    const widgets = settings.dashboardWidgets || [];
                    if (e.target.checked) {
                      updateSetting('dashboardWidgets', [...widgets, 'map']);
                    } else {
                      updateSetting('dashboardWidgets', widgets.filter(w => w !== 'map'));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.showMapWidget')}</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.dashboardWidgets?.includes('alerts') ?? true}
                  onChange={(e) => {
                    const widgets = settings.dashboardWidgets || [];
                    if (e.target.checked) {
                      updateSetting('dashboardWidgets', [...widgets, 'alerts']);
                    } else {
                      updateSetting('dashboardWidgets', widgets.filter(w => w !== 'alerts'));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.showAlertsWidget')}</span>
              </label>
            </div>
          </div>

          {/* Advanced Reminders */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
              {t('settings.advancedSettings')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('settings.enableCropRecommendations')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI-based crop suggestions</p>
                </div>
                <button
                  onClick={() => updateSetting('cropRecommendations', !settings.cropRecommendations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.cropRecommendations !== false ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-label={settings.cropRecommendations !== false ? 'Disable crop recommendations' : 'Enable crop recommendations'}
                  title={settings.cropRecommendations !== false ? 'Disable crop recommendations' : 'Enable crop recommendations'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.cropRecommendations !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('settings.enableIrrigationReminders')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get reminders for irrigation schedules</p>
                </div>
                <button
                  onClick={() => updateSetting('irrigationReminders', !settings.irrigationReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.irrigationReminders !== false ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-label={settings.irrigationReminders !== false ? 'Disable irrigation reminders' : 'Enable irrigation reminders'}
                  title={settings.irrigationReminders !== false ? 'Disable irrigation reminders' : 'Enable irrigation reminders'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.irrigationReminders !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('settings.enableHarvestReminders')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remind before harvest time</p>
                </div>
                <button
                  onClick={() => updateSetting('harvestReminders', !settings.harvestReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.harvestReminders !== false ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-label={settings.harvestReminders !== false ? 'Disable harvest reminders' : 'Enable harvest reminders'}
                  title={settings.harvestReminders !== false ? 'Disable harvest reminders' : 'Enable harvest reminders'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.harvestReminders !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data Export & Import */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Database size={20} className="text-blue-600 dark:text-blue-400" />
              {t('settings.dataPrivacy')}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="data-retention-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.dataRetention')}</label>
                <select
                  id="data-retention-select"
                  value={settings.dataRetention || 365}
                  onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label={t('settings.dataRetention')}
                >
                  <option value={30}>30 {t('settings.days')}</option>
                  <option value={90}>90 {t('settings.days')}</option>
                  <option value={365}>1 {t('settings.year')}</option>
                  <option value={730}>2 {t('settings.years')}</option>
                </select>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('settings.exportData')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('settings.exportDataDescription')}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // TODO: Implement export functionality
                      alert(t('settings.exportAllData'));
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                  >
                    <Download size={16} />
                    {t('settings.exportAllData')}
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement import functionality
                      alert(t('settings.importData'));
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Upload size={16} />
                    {t('settings.importData')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Customization */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <LayoutDashboard size={20} className="text-purple-600 dark:text-purple-400" />
              {t('settings.dashboardCustomization')}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settings.customizeDashboard') || 'Choose which widgets to display on your dashboard'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['weather', 'stock', 'map', 'alerts', 'crops', 'expenses'].map((widget) => (
                    <label key={widget} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.dashboardWidgets?.includes(widget) ?? true}
                        onChange={(e) => {
                          const currentWidgets = settings.dashboardWidgets || [];
                          if (e.target.checked) {
                            updateSetting('dashboardWidgets', [...currentWidgets, widget]);
                          } else {
                            updateSetting('dashboardWidgets', currentWidgets.filter((w: string) => w !== widget));
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{t(`settings.show${widget.charAt(0).toUpperCase() + widget.slice(1)}Widget`) || widget}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600 dark:text-indigo-400" />
              {t('settings.dateTimeSettings') || 'Date & Time Settings'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-format-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.dateFormat')}</label>
                <select
                  id="date-format-select"
                  value={settings.dateFormat || 'DD/MM/YYYY'}
                  onChange={(e) => updateSetting('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="DD/MM/YYYY">{t('settings.ddmmyyyy')}</option>
                  <option value="MM/DD/YYYY">{t('settings.mmddyyyy')}</option>
                  <option value="YYYY-MM-DD">{t('settings.yyyymmdd')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="time-zone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.timeZone')}</label>
                <select
                  id="time-zone-select"
                  value={settings.timeZone || 'IST'}
                  onChange={(e) => updateSetting('timeZone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="IST">{t('settings.ist')}</option>
                  <option value="UTC">{t('settings.utc')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auto-Refresh Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <RefreshCw size={20} className="text-blue-600 dark:text-blue-400" />
              {t('settings.autoRefresh') || 'Auto-Refresh Settings'}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('settings.enableAutoRefresh')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.autoRefreshDescription') || 'Automatically refresh dashboard data'}</p>
                </div>
                <button
                  onClick={() => updateSetting('autoRefresh', !settings.autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoRefresh ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-label={settings.autoRefresh ? t('settings.disableAutoRefresh') || 'Disable auto-refresh' : t('settings.enableAutoRefresh') || 'Enable auto-refresh'}
                  title={settings.autoRefresh ? t('settings.disableAutoRefresh') || 'Disable auto-refresh' : t('settings.enableAutoRefresh') || 'Enable auto-refresh'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {settings.autoRefresh && (
                <div>
                  <label htmlFor="refresh-interval-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.refreshInterval')}</label>
                  <input
                    id="refresh-interval-input"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.refreshInterval || 30}
                    onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('settings.refreshIntervalHint') || 'Refresh interval in minutes'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Session Management */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-amber-600 dark:text-amber-400" />
              {t('settings.sessionManagement') || 'Session Management'}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('settings.activeSessions') || 'Active Sessions'}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('settings.sessionDescription') || 'Manage your active sessions across devices'}</p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Current Session</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">This device • {(() => {
                        const d = new Date();
                        const day = d.getDate();
                        const month = d.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                          month: 'long'
                        });
                        const year = d.getFullYear();
                        const hours = String(d.getHours()).padStart(2, '0');
                        const minutes = String(d.getMinutes()).padStart(2, '0');
                        return `${day} ${month} ${year}, ${hours}:${minutes}`;
                      })()}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogoutAll}
                className="flex items-center gap-2 px-4 py-2 border border-amber-300 dark:border-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-amber-700 dark:text-amber-400"
              >
                <LogOut size={16} />
                {t('settings.logoutAllDevices') || 'Logout from All Devices'}
              </button>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-red-200 dark:border-red-900/30 border-l-4 border-l-red-500">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-red-600 dark:text-red-400" />
              {t('settings.accountSecurity')}
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => {
                  // TODO: Implement change password
                  alert(t('settings.changePassword'));
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                <Key size={16} />
                {t('settings.changePassword')}
              </button>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">{t('settings.deleteAccount')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('settings.deleteAccountDescription')}</p>
                <button
                  onClick={() => {
                    if (confirm(t('settings.confirmDeleteAccount'))) {
                      // TODO: Implement account deletion
                      alert('Account deletion functionality will be implemented');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                  {t('settings.deleteAccount')}
                </button>
              </div>
            </div>
          </div>

          {/* About & Help */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-gray-600 dark:text-gray-400" />
              {t('settings.aboutHelp') || 'About & Help'}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('settings.appVersion') || 'App Version'}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">FarmSync v1.0.0</p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                  onClick={() => {
                    // TODO: Open help/documentation
                    window.open('https://github.com/Austin-Joshua/FarmSync', '_blank');
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 w-full justify-start"
                >
                  <Gauge size={16} />
                  {t('settings.viewDocumentation') || 'View Documentation'}
                </button>
                <button
                  onClick={() => {
                    // TODO: Open feedback form
                    alert(t('settings.feedbackComingSoon') || 'Feedback feature coming soon!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 w-full justify-start"
                >
                  <TrendingUp size={16} />
                  {t('settings.sendFeedback') || 'Send Feedback'}
                </button>
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

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-primary-600 dark:text-primary-400" />
              Two-Factor Authentication
            </h2>
            <TwoFactorAuthSetup
              user2FAEnabled={user2FAEnabled}
              on2FAEnabled={() => setUser2FAEnabled(true)}
              on2FADisabled={() => setUser2FAEnabled(false)}
            />
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield size={20} className="text-primary-600 dark:text-primary-400" />
                Active Sessions
              </h2>
              <button
                onClick={loadSessions}
                disabled={loadingSessions}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loadingSessions ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage your active sessions across devices. You can see where you're logged in and logout from other devices.
            </p>

            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin text-primary-600" size={24} />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No active sessions found
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border ${
                      session.isCurrent
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getDeviceIcon(session.device)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {session.device}
                            </p>
                            {session.isCurrent && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                                Current Session
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {session.browser} • {session.ipAddress}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Last active: {formatDate(session.lastActivity)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Created: {formatDate(session.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sessions.length > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogoutAll}
                  className="flex items-center gap-2 px-4 py-2 border border-amber-300 dark:border-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-amber-700 dark:text-amber-400 w-full justify-center"
                >
                  <LogOut size={16} />
                  Logout from All Other Devices
                </button>
              </div>
            )}
          </div>

          {/* Password Reset */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Key size={20} className="text-primary-600 dark:text-primary-400" />
              Password Management
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Forgot your password? You can reset it using the forgot password feature.
              </p>
              <a
                href="/forgot-password"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                <Key size={16} />
                Reset Password
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;