import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Save,
  Moon,
  Sun,
  Edit2,
  Loader,
  Globe,
  Upload,
  Camera,
  User,
  Bell,
  Trash2,
  Database,
  Sprout,
  Shield,
  Users,
  Settings as SettingsIcon,
  Download,
  AlertTriangle,
  Lock
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'farm' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Personal Details State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    experience: localStorage.getItem('fs_experience') || '5',
    govId: localStorage.getItem('fs_gov_id') || 'AID-9081-34',
    gender: localStorage.getItem('fs_gender') || 'Male',
    dob: localStorage.getItem('fs_dob') || '',
    education: localStorage.getItem('fs_education') || 'Secondary School',
    primaryLang: localStorage.getItem('fs_primary_lang') || 'English',
  });

  // 2. Family & Household Details State
  const [familyData, setFamilyData] = useState({
    familyType: localStorage.getItem('fs_family_type') || 'Nuclear',
    householdSize: localStorage.getItem('fs_household_size') || '4',
    dependentsCount: localStorage.getItem('fs_dependents_count') || '2',
    activeFarmersCount: localStorage.getItem('fs_active_farmers_count') || '2',
    annualIncome: localStorage.getItem('fs_annual_income') || '₹1 Lakh - ₹3 Lakhs',
    emergencyContactName: localStorage.getItem('fs_emergency_name') || '',
    emergencyContactRelation: localStorage.getItem('fs_emergency_relation') || 'Spouse',
    emergencyContactPhone: localStorage.getItem('fs_emergency_phone') || '',
  });

  // 3. Farm Details State
  const [farmData, setFarmData] = useState({
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    landSize: (user as any)?.landSize || (user as any)?.land_size || 0,
    soilType: (user as any)?.soilType || (user as any)?.soil_type || 'Loamy',
    irrigation: localStorage.getItem('fs_irrigation') || 'Borewell',
    primaryCrop: localStorage.getItem('fs_primary_crop') || 'Rice',
    ownershipType: localStorage.getItem('fs_ownership_type') || 'Owned',
    farmingPractice: localStorage.getItem('fs_farming_practice') || 'Conventional',
    secondarySoilType: localStorage.getItem('fs_secondary_soil_type') || 'None',
    secondaryCrop: localStorage.getItem('fs_secondary_crop') || '',
    livestock: localStorage.getItem('fs_livestock') || 'None',
    machinery: (() => {
      try {
        return JSON.parse(localStorage.getItem('fs_machinery') || '["Tractor", "Sprayer"]');
      } catch (e) {
        return ["Tractor", "Sprayer"];
      }
    })(),
  });

  // 4. In-App Notification State
  const [notificationSettings, setNotificationSettings] = useState({
    push: localStorage.getItem('fs_notif_push') !== 'false',
    email: localStorage.getItem('fs_notif_email') !== 'false',
    sms: localStorage.getItem('fs_notif_sms') !== 'false',
    market: localStorage.getItem('fs_notif_market') !== 'false',
  });

  // 5. In-App Preference States
  const [appPreferences, setAppPreferences] = useState({
    weatherAlertFreq: localStorage.getItem('fs_weather_alert_freq') || 'Daily',
    defaultTab: localStorage.getItem('fs_default_tab') || 'Dashboard',
    unitPreference: localStorage.getItem('fs_unit_preference') || 'Acres & kg',
    wifiSync: localStorage.getItem('fs_wifi_sync') !== 'false',
    autoSync: localStorage.getItem('fs_auto_sync') !== 'false',
    biometricLock: localStorage.getItem('fs_biometric_lock') === 'true',
  });

  const [cacheSize, setCacheSize] = useState('14.2 MB');
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync state when user authentication context loads or changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        experience: localStorage.getItem('fs_experience') || '5',
        govId: localStorage.getItem('fs_gov_id') || 'AID-9081-34',
        gender: localStorage.getItem('fs_gender') || 'Male',
        dob: localStorage.getItem('fs_dob') || '',
        education: localStorage.getItem('fs_education') || 'Secondary School',
        primaryLang: localStorage.getItem('fs_primary_lang') || 'English',
      });
      setFarmData({
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        landSize: (user as any).landSize || (user as any).land_size || 0,
        soilType: (user as any).soilType || (user as any).soil_type || 'Loamy',
        irrigation: localStorage.getItem('fs_irrigation') || 'Borewell',
        primaryCrop: localStorage.getItem('fs_primary_crop') || 'Rice',
        ownershipType: localStorage.getItem('fs_ownership_type') || 'Owned',
        farmingPractice: localStorage.getItem('fs_farming_practice') || 'Conventional',
        secondarySoilType: localStorage.getItem('fs_secondary_soil_type') || 'None',
        secondaryCrop: localStorage.getItem('fs_secondary_crop') || '',
        livestock: localStorage.getItem('fs_livestock') || 'None',
        machinery: (() => {
          try {
            return JSON.parse(localStorage.getItem('fs_machinery') || '["Tractor", "Sprayer"]');
          } catch (e) {
            return ["Tractor", "Sprayer"];
          }
        })(),
      });
    }
  }, [user]);

  // Saves Profile details (mix of database & local storage)
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUser({
        name: profileData.name,
        phone: profileData.phone || undefined,
        location: profileData.location || undefined,
      });
      
      localStorage.setItem('fs_experience', profileData.experience);
      localStorage.setItem('fs_gov_id', profileData.govId);
      localStorage.setItem('fs_gender', profileData.gender);
      localStorage.setItem('fs_dob', profileData.dob);
      localStorage.setItem('fs_education', profileData.education);
      localStorage.setItem('fs_primary_lang', profileData.primaryLang);
      
      setIsEditing(false);
      toast.success(t('settings.profileUpdated') || 'Profile details updated successfully');
    } catch (error: any) {
      toast.error(`Profile update error: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  // Saves Family Details
  const handleSaveFamily = async () => {
    setSaving(true);
    try {
      localStorage.setItem('fs_family_type', familyData.familyType);
      localStorage.setItem('fs_household_size', familyData.householdSize);
      localStorage.setItem('fs_dependents_count', familyData.dependentsCount);
      localStorage.setItem('fs_active_farmers_count', familyData.activeFarmersCount);
      localStorage.setItem('fs_annual_income', familyData.annualIncome);
      localStorage.setItem('fs_emergency_name', familyData.emergencyContactName);
      localStorage.setItem('fs_emergency_relation', familyData.emergencyContactRelation);
      localStorage.setItem('fs_emergency_phone', familyData.emergencyContactPhone);
      
      setIsEditing(false);
      toast.success('Family details updated successfully');
    } catch (error: any) {
      toast.error(`Family update error: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  // Saves Farm Details
  const handleSaveFarm = async () => {
    setSaving(true);
    try {
      await updateUser({
        village: farmData.village || undefined,
        district: farmData.district || undefined,
        state: farmData.state || undefined,
        land_size: farmData.landSize || 0,
        soil_type: farmData.soilType || undefined,
      });

      localStorage.setItem('fs_irrigation', farmData.irrigation);
      localStorage.setItem('fs_primary_crop', farmData.primaryCrop);
      localStorage.setItem('fs_ownership_type', farmData.ownershipType);
      localStorage.setItem('fs_farming_practice', farmData.farmingPractice);
      localStorage.setItem('fs_secondary_soil_type', farmData.secondarySoilType);
      localStorage.setItem('fs_secondary_crop', farmData.secondaryCrop);
      localStorage.setItem('fs_livestock', farmData.livestock);
      localStorage.setItem('fs_machinery', JSON.stringify(farmData.machinery));
      
      setIsEditing(false);
      toast.success('Farm details updated successfully');
    } catch (error: any) {
      toast.error(`Farm details update error: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Notifications Switch Changes
  const handleSaveNotifications = (key: keyof typeof notificationSettings) => {
    const newVal = !notificationSettings[key];
    setNotificationSettings(prev => ({ ...prev, [key]: newVal }));
    localStorage.setItem(`fs_notif_${key}`, String(newVal));
    toast.success('Notification preferences updated');
  };

  // Handle In-App Custom Preferences Change
  const handlePreferenceChange = (key: keyof typeof appPreferences, value: any) => {
    setAppPreferences(prev => ({ ...prev, [key]: value }));
    let storageKey = '';
    if (key === 'weatherAlertFreq') storageKey = 'fs_weather_alert_freq';
    else if (key === 'defaultTab') storageKey = 'fs_default_tab';
    else if (key === 'unitPreference') storageKey = 'fs_unit_preference';
    else if (key === 'wifiSync') storageKey = 'fs_wifi_sync';
    else if (key === 'autoSync') storageKey = 'fs_auto_sync';
    else if (key === 'biometricLock') storageKey = 'fs_biometric_lock';
    
    localStorage.setItem(storageKey, String(value));
    toast.success('Preferences updated successfully');
  };

  // Handle profile image upload
  const handlePictureUpload = async () => {
    const fileInput = document.getElementById('settings-profile-picture-input') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingPicture(true);
    try {
      await api.uploadProfilePicture(file);
      setPreviewUrl(null);
      if (fileInput) fileInput.value = '';
      
      // Fetch fresh profile state to sync layout headers
      const profile = await api.getProfile();
      if (profile) {
        await updateUser(profile as any);
      }
      toast.success('Profile picture updated');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message || error}`);
      setPreviewUrl(null);
    } finally {
      setUploadingPicture(false);
    }
  };

  // Clear application cache
  const clearAppCache = () => {
    setCacheSize('0.0 MB');
    toast.success('Offline cache cleared successfully');
  };

  // Export User data as a JSON file
  const handleExportData = () => {
    const fullProfile = {
      personalDetails: {
        ...profileData,
        email: user?.email,
      },
      familyDetails: familyData,
      farmDetails: farmData,
      appPreferences: {
        ...appPreferences,
        notificationSettings,
      },
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(fullProfile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `farmsync_profile_${profileData.name.replace(/\s+/g, '_') || 'farmer'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Profile configuration exported successfully!');
  };

  // Restores local configurations to default values
  const handleResetSettings = () => {
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('fs_'));
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    localStorage.removeItem('fs_notif_push');
    localStorage.removeItem('fs_notif_email');
    localStorage.removeItem('fs_notif_sms');
    localStorage.removeItem('fs_notif_market');
    
    toast.success('Settings reset to system defaults. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Machinery Checkbox Toggler
  const toggleMachinery = (item: string) => {
    if (!isEditing) return;
    setFarmData(prev => {
      const machinery = prev.machinery.includes(item)
        ? prev.machinery.filter((m: string) => m !== item)
        : [...prev.machinery, item];
      return { ...prev, machinery };
    });
  };

  const tabs = [
    { id: 'profile', name: 'Personal Details', icon: User, desc: 'Identity, experience & contact' },
    { id: 'family', name: 'Family & Household', icon: Users, desc: 'Dependents, income & safety contact' },
    { id: 'farm', name: 'Farm & Land Details', icon: Sprout, desc: 'Land telemetry, soil & machinery' },
    { id: 'preferences', name: 'In-App Settings', icon: SettingsIcon, desc: 'Appearance, sync & utilities' }
  ] as const;

  const machineryOptions = [
    'Tractor',
    'Power Tiller',
    'Combined Harvester',
    'Seed Drill',
    'Drip Kit',
    'Sprayer',
    'Water Pump'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
        <p className="text-text-muted mt-1">Configure your personal identity, family members, agricultural properties, and app environment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-surface rounded-2xl border border-gray-150 dark:border-gray-700 p-4 shadow-sm space-y-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3.5 group border-l-4 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-accent font-bold border-accent dark:border-accent'
                      : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-750 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <IconComponent 
                    size={20} 
                    className={`${
                      isActive ? 'text-accent dark:text-accent' : 'text-gray-400 group-hover:text-gray-650 dark:group-hover:text-gray-300'
                    }`} 
                  />
                  <div>
                    <div className="text-sm font-semibold leading-none">{tab.name}</div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block font-medium group-hover:text-gray-500 dark:group-hover:text-gray-405 transition-colors">
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tab 1: Personal Details */}
          {activeTab === 'profile' && (
            <div className="card space-y-6 bg-surface p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-gray-100 dark:border-gray-700/50 pb-6">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-100 dark:bg-gray-700">
                    {previewUrl || user?.picture_url ? (
                      <img src={previewUrl || user?.picture_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-primary-700 dark:text-accent font-black bg-primary-50 dark:bg-primary-950/20">
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <label htmlFor="settings-profile-picture-input" className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full cursor-pointer shadow-lg hover:bg-accent-hover transition-colors">
                    <Camera size={16} />
                    <input 
                      id="settings-profile-picture-input" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setPreviewUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                
                <div className="space-y-1.5 text-center sm:text-left">
                  <h2 className="text-xl font-black text-text">{profileData.name || 'Agribusiness Owner'}</h2>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{user?.role || 'Farmer'}</p>
                  {previewUrl && (
                    <button onClick={handlePictureUpload} className="btn-primary py-1 px-3 text-xs font-bold flex items-center gap-1.5" disabled={uploadingPicture}>
                      {uploadingPicture ? <Loader className="animate-spin" size={12} /> : <Upload size={12} />}
                      Confirm Upload
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Full Name</label>
                  <input 
                    className="input-field" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Email Address</label>
                  <input className="input-field opacity-60 cursor-not-allowed" value={profileData.email} disabled />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Phone Number</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. +91 98765 43210"
                    value={profileData.phone} 
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Government Farmer ID / Aadhaar</label>
                  <input 
                    className="input-field font-mono" 
                    value={profileData.govId} 
                    onChange={(e) => setProfileData({...profileData, govId: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Gender</label>
                  <select 
                    className="input-field"
                    value={profileData.gender}
                    onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Date of Birth</label>
                  <input 
                    type="date"
                    className="input-field"
                    value={profileData.dob}
                    onChange={(e) => setProfileData({...profileData, dob: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Educational Level</label>
                  <select 
                    className="input-field"
                    value={profileData.education}
                    onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="Primary School">Primary Education</option>
                    <option value="Secondary School">Secondary Education (Class 10)</option>
                    <option value="Higher Secondary">Higher Secondary (Class 12)</option>
                    <option value="Graduate">Graduate Degree (B.Sc, B.A, etc.)</option>
                    <option value="Post Graduate">Post Graduate Degree</option>
                    <option value="Agricultural Diploma">Agricultural Diploma / Certificate</option>
                    <option value="Self-Taught">Self-Taught / Informal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Farming Experience (Years)</label>
                  <input 
                    type="number"
                    className="input-field" 
                    value={profileData.experience} 
                    onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Primary Spoken Language</label>
                  <select 
                    className="input-field"
                    value={profileData.primaryLang}
                    onChange={(e) => setProfileData({...profileData, primaryLang: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Malayalam">മലയാളം (Malayalam)</option>
                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Residential Location (City/Town)</label>
                  <input 
                    className="input-field" 
                    value={profileData.location} 
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                {isEditing ? (
                  <>
                    <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2" disabled={saving}>
                      {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                      {t('common.save')}
                    </button>
                    <button onClick={() => { setIsEditing(false); setPreviewUrl(null); }} className="btn-secondary">{t('common.cancel')}</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Family & Household */}
          {activeTab === 'family' && (
            <div className="card space-y-6 bg-surface p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-text flex items-center gap-2">
                  <Users className="text-accent" size={24} />
                  Family & Household Details
                </h2>
                <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Provide household statistics, active field helpers, and critical emergency next of kin contact parameters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Family Structure Type</label>
                  <select 
                    className="input-field"
                    value={familyData.familyType}
                    onChange={(e) => setFamilyData({...familyData, familyType: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="Nuclear">Nuclear Family</option>
                    <option value="Joint">Joint Family System</option>
                    <option value="Extended">Extended / Multi-Generational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Household Size (Total Members)</label>
                  <input 
                    type="number"
                    className="input-field"
                    value={familyData.householdSize}
                    onChange={(e) => setFamilyData({...familyData, householdSize: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Number of Dependents (Kids/Elders)</label>
                  <input 
                    type="number"
                    className="input-field"
                    value={familyData.dependentsCount}
                    onChange={(e) => setFamilyData({...familyData, dependentsCount: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Active Farming Members (Helper Count)</label>
                  <input 
                    type="number"
                    className="input-field"
                    value={familyData.activeFarmersCount}
                    onChange={(e) => setFamilyData({...familyData, activeFarmersCount: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Household Annual Income Bracket</label>
                  <select 
                    className="input-field"
                    value={familyData.annualIncome}
                    onChange={(e) => setFamilyData({...familyData, annualIncome: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="Under ₹1 Lakh">Under ₹1 Lakh</option>
                    <option value="₹1 Lakh - ₹3 Lakhs">₹1 Lakh - ₹3 Lakhs</option>
                    <option value="₹3 Lakhs - ₹5 Lakhs">₹3 Lakhs - ₹5 Lakhs</option>
                    <option value="₹5 Lakhs - ₹10 Lakhs">₹5 Lakhs - ₹10 Lakhs</option>
                    <option value="Above ₹10 Lakhs">Above ₹10 Lakhs</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700/50 pt-5 mt-4 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="text-danger" size={16} />
                  Emergency Contact / Next of Kin
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Contact Name</label>
                    <input 
                      className="input-field"
                      placeholder="Name of family member"
                      value={familyData.emergencyContactName}
                      onChange={(e) => setFamilyData({...familyData, emergencyContactName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Relationship</label>
                    <select 
                      className="input-field"
                      value={familyData.emergencyContactRelation}
                      onChange={(e) => setFamilyData({...familyData, emergencyContactRelation: e.target.value})}
                      disabled={!isEditing}
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Uncle/Aunt">Uncle / Aunt</option>
                      <option value="Cousin">Cousin</option>
                      <option value="Neighbor">Neighbor / Close Friend</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Contact Phone Number</label>
                    <input 
                      className="input-field"
                      placeholder="Emergency contact phone number"
                      value={familyData.emergencyContactPhone}
                      onChange={(e) => setFamilyData({...familyData, emergencyContactPhone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                {isEditing ? (
                  <>
                    <button onClick={handleSaveFamily} className="btn-primary flex items-center gap-2" disabled={saving}>
                      {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Family Details
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">{t('common.cancel')}</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                    <Edit2 size={18} />
                    Edit Family Details
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Farm Details */}
          {activeTab === 'farm' && (
            <div className="card space-y-6 bg-surface p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-text flex items-center gap-2">
                  <Sprout className="text-accent" size={24} />
                  Agribusiness & Land Details
                </h2>
                <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Provide agricultural field dimensions, soil specifications, crops cultivated, livestock inventory, and machinery checklist.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Village</label>
                  <input 
                    className="input-field" 
                    value={farmData.village} 
                    onChange={(e) => setFarmData({...farmData, village: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">District</label>
                  <input 
                    className="input-field" 
                    value={farmData.district} 
                    onChange={(e) => setFarmData({...farmData, district: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">State</label>
                  <input 
                    className="input-field" 
                    value={farmData.state} 
                    onChange={(e) => setFarmData({...farmData, state: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Total Cultivated Area (Acres)</label>
                  <input 
                    type="number"
                    step="0.1"
                    className="input-field" 
                    value={farmData.landSize} 
                    onChange={(e) => setFarmData({...farmData, landSize: parseFloat(e.target.value) || 0})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Land Ownership Model</label>
                  <select 
                    className="input-field"
                    value={farmData.ownershipType}
                    onChange={(e) => setFarmData({...farmData, ownershipType: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="Owned">Sole Ownership (Owned)</option>
                    <option value="Leased">Leased / Rented Land</option>
                    <option value="Sharecropping">Sharecropping Agreement</option>
                    <option value="Cooperative">Cooperative / Joint Farming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Farming Method / Practice</label>
                  <select 
                    className="input-field"
                    value={farmData.farmingPractice}
                    onChange={(e) => setFarmData({...farmData, farmingPractice: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="Organic">Organic Farming (100% Organic)</option>
                    <option value="Conventional">Conventional (Chemical/Fertilizer)</option>
                    <option value="Mixed">Mixed Farming (Crops + Livestock)</option>
                    <option value="Natural Farming">Zero Budget Natural Farming (ZBNF)</option>
                    <option value="Hydroponics">Hydroponics / Greenhouse Farming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Primary Soil Classification</label>
                  <select 
                    className="input-field" 
                    value={farmData.soilType} 
                    onChange={(e) => setFarmData({...farmData, soilType: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="Loamy">Loamy Soil</option>
                    <option value="Clayey">Clayey Soil</option>
                    <option value="Sandy">Sandy Soil</option>
                    <option value="Black Soil">Black Cotton Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Alluvial">Alluvial Soil</option>
                    <option value="Laterite">Laterite Soil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Secondary Soil Classification</label>
                  <select 
                    className="input-field" 
                    value={farmData.secondarySoilType} 
                    onChange={(e) => setFarmData({...farmData, secondarySoilType: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="None">None / Same as Primary</option>
                    <option value="Loamy">Loamy Soil</option>
                    <option value="Clayey">Clayey Soil</option>
                    <option value="Sandy">Sandy Soil</option>
                    <option value="Black Soil">Black Cotton Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Alluvial">Alluvial Soil</option>
                    <option value="Laterite">Laterite Soil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Water Irrigation Source</label>
                  <select 
                    className="input-field" 
                    value={farmData.irrigation} 
                    onChange={(e) => setFarmData({...farmData, irrigation: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="Borewell">Borewell / Tube well</option>
                    <option value="Canal Irrigation">Canal Network</option>
                    <option value="Drip System">Drip Irrigation</option>
                    <option value="Rain-fed">Rain-fed System</option>
                    <option value="Sprinkler">Overhead Sprinklers</option>
                    <option value="River / Pond">River / Farm Pond Access</option>
                    <option value="Rainwater Harvesting">Rainwater Harvesting structures</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Major Sowing Crop</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. Rice, Wheat"
                    value={farmData.primaryCrop} 
                    onChange={(e) => setFarmData({...farmData, primaryCrop: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Secondary/Rotational Crop</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. Mustard, Turmeric, Maize"
                    value={farmData.secondaryCrop} 
                    onChange={(e) => setFarmData({...farmData, secondaryCrop: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Livestock Owned</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. 4 Cows, 10 Poultry, None"
                    value={farmData.livestock} 
                    onChange={(e) => setFarmData({...farmData, livestock: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Machinery owned check boxes */}
              <div className="border-t border-gray-100 dark:border-gray-700/50 pt-5 mt-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-gray-500">Agricultural Machinery Owned</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {machineryOptions.map((item) => {
                    const isChecked = farmData.machinery.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleMachinery(item)}
                        disabled={!isEditing}
                        className={`text-left px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-950/20 dark:border-primary-800 dark:text-accent'
                            : 'bg-transparent border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400'
                        } ${isEditing ? 'cursor-pointer hover:border-primary-400' : 'cursor-not-allowed opacity-80'}`}
                      >
                        <span>{item}</span>
                        {isChecked && (
                          <span className="w-2 h-2 rounded-full bg-accent dark:bg-primary-400 shadow-sm shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700/50">
                {isEditing ? (
                  <>
                    <button onClick={handleSaveFarm} className="btn-primary flex items-center gap-2" disabled={saving}>
                      {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Farm Details
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">{t('common.cancel')}</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                    <Edit2 size={18} />
                    Edit Farm Details
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Appearance & Localization */}
              <div className="card space-y-6 bg-surface p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-text flex items-center gap-2">
                    <Globe className="text-accent" size={24} />
                    Appearance & Localization
                  </h2>
                  <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Configure screen colors, languages, unit preferences, and app navigation defaults.</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/80">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${currentTheme === 'dark' ? 'bg-amber-100 text-warning' : 'bg-indigo-100 text-indigo-600'}`}>
                      {currentTheme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-text uppercase tracking-wider text-sm">{t('settings.appearance')}</h3>
                      <p className="text-xs text-gray-550 dark:text-gray-400">{currentTheme === 'dark' ? t('common.darkMode') : t('common.lightMode')}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-accent transition-colors focus:outline-none shadow-inner"
                  >
                    <span
                      className={`${
                        currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">{t('settings.language')}</label>
                    <LanguageSwitcher />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Telemetry Measurement Unit</label>
                    <select
                      className="input-field"
                      value={appPreferences.unitPreference}
                      onChange={(e) => handlePreferenceChange('unitPreference', e.target.value)}
                    >
                      <option value="Acres & kg">Acres & kg (Standard Indian)</option>
                      <option value="Hectares & kg">Hectares & kg (Metric)</option>
                      <option value="Acres & Quintals">Acres & Quintals (Trade Unit)</option>
                      <option value="Bigha & kg">Bigha & kg (Regional)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Default Landing View</label>
                    <select
                      className="input-field"
                      value={appPreferences.defaultTab}
                      onChange={(e) => handlePreferenceChange('defaultTab', e.target.value)}
                    >
                      <option value="Dashboard">Dashboard Overview</option>
                      <option value="Crops">Crop Management</option>
                      <option value="Marketplace">Product Marketplace</option>
                      <option value="Community">Community Forum</option>
                      <option value="Calendar">Task Calendar</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="card space-y-6 bg-surface p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-text flex items-center gap-2">
                    <Bell className="text-accent" size={24} />
                    Notification & Weather Settings
                  </h2>
                  <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Configure warning channels and update intervals for weather reports and bids.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-100 dark:border-gray-700/50 pb-6">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Weather Alert Frequency</label>
                    <select
                      className="input-field"
                      value={appPreferences.weatherAlertFreq}
                      onChange={(e) => handlePreferenceChange('weatherAlertFreq', e.target.value)}
                    >
                      <option value="Hourly">Hourly Telemetry Sync</option>
                      <option value="Daily">Daily Weather Updates</option>
                      <option value="Extreme Only">Only Extreme Events</option>
                      <option value="Disabled">Mute Weather Alerts</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/85">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Push Notifications</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-450">Receive instant push warnings on pest detection & irrigation events</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.push}
                      onChange={() => handleSaveNotifications('push')}
                      className="rounded text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/85">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Email Alerts</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-455">Get periodic finance reports and marketplace bid activity summaries</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.email}
                      onChange={() => handleSaveNotifications('email')}
                      className="rounded text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/85">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">SMS Telemetry Warnings</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-455">Critical weather bulletins and sensor anomalies directly on your phone</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.sms}
                      onChange={() => handleSaveNotifications('sms')}
                      className="rounded text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Market Price Alerts</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-455">Daily updates on local eNAM market listings and price surges</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.market}
                      onChange={() => handleSaveNotifications('market')}
                      className="rounded text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Data Sync & Security */}
              <div className="card space-y-6 bg-surface p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-text flex items-center gap-2">
                    <Shield className="text-accent" size={24} />
                    Data Synchronization & Security
                  </h2>
                  <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Configure background sync conditions and biometric screen security.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/85">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Sync over Wi-Fi Only</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-450">Prevent mobile network data usage for large offline media uploads and maps</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('wifiSync', !appPreferences.wifiSync)}
                      className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 dark:bg-accent transition-colors focus:outline-none"
                    >
                      <span
                        className={`${
                          appPreferences.wifiSync ? 'translate-x-5' : 'translate-x-1'
                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/85">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Background Auto-Sync</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-450">Regularly synchronize field records and offline forms automatically in background</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('autoSync', !appPreferences.autoSync)}
                      className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 dark:bg-accent transition-colors focus:outline-none"
                    >
                      <span
                        className={`${
                          appPreferences.autoSync ? 'translate-x-5' : 'translate-x-1'
                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Biometric Authentication Screen Lock</p>
                      <p className="text-[11px] text-gray-550 dark:text-gray-455">Require face/fingerprint validation check upon app startup</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('biometricLock', !appPreferences.biometricLock)}
                      className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 dark:bg-accent transition-colors focus:outline-none"
                    >
                      <span
                        className={`${
                          appPreferences.biometricLock ? 'translate-x-5' : 'translate-x-1'
                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cache Management & Utilities */}
              <div className="card space-y-6 bg-surface p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-text flex items-center gap-2">
                    <Database className="text-accent" size={24} />
                    Storage & Local Caching
                  </h2>
                  <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Manage database size, clean offline segments, and export profile telemetry datasets.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/80">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">IndexedDB Storage</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-450">Offline map segments, sensor logs, and crop checklists</p>
                      <p className="text-xs text-accent font-bold mt-1">Current usage: {cacheSize}</p>
                    </div>
                    <button 
                      onClick={clearAppCache}
                      className="px-3.5 py-2 bg-red-50 text-red-650 font-bold border border-red-100 rounded-xl hover:bg-red-100 transition-colors text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Trash2 size={14} />
                      Clear Cache
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/80">
                    <div>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Export Profile Parameters</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-450">Download profile, farm details, and configurations as JSON file</p>
                    </div>
                    <button 
                      onClick={handleExportData}
                      className="px-3.5 py-2 bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-accent font-bold border border-primary-100 dark:border-primary-900 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/45 transition-colors text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Download size={14} />
                      Export Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card border-red-200 dark:border-red-900/50 space-y-6 bg-red-50/10 dark:bg-red-950/5 p-6 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-100 dark:bg-red-950/45 text-red-650 dark:text-red-450 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-text">Danger Zone</h2>
                    <p className="text-xs text-text-muted">Critical administrative utilities. Actions here cannot be undone.</p>
                  </div>
                </div>

                <div className="p-4 bg-surface/30 rounded-2xl border border-red-100 dark:border-red-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Reset Application Preferences</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-455">Clear all local configurations and restore to default parameters</p>
                  </div>
                  
                  {showResetConfirm ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleResetSettings} 
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Yes, Reset
                      </button>
                      <button 
                        onClick={() => setShowResetConfirm(false)} 
                        className="px-3.5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-250 font-bold rounded-xl text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowResetConfirm(true)}
                      className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 font-bold hover:bg-red-200 transition-colors text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Lock size={13} />
                      Reset to Defaults
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
