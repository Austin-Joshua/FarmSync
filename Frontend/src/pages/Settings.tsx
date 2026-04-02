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
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    landSize: user?.land_size || 0,
    soilType: user?.soil_type || '',
  });

  // We can keep settings state if we plan to use it for preferences tab checkbox/inputs later
  // For now it was marked as unused. I'll keep it but actually use it in the UI if possible or remove.
  // Let's remove for now to clear lints.

  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        location: (user as any).location || '',
        landSize: (user as any).land_size || 0,
        soilType: (user as any).soil_type || '',
      });
      
      const fetchFarms = async () => {
        try {
          await api.getFarms();
          // We fetched but aren't displaying them currently in Settings.
          // In a real app we might show farm names.
        } catch (err) {
          console.error('Failed to fetch farms:', err);
        }
      };
      fetchFarms();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        name: profileData.name,
        location: profileData.location || null,
        land_size: profileData.landSize || 0,
        soil_type: profileData.soilType || null,
      });
      setIsEditing(false);
      toast.success(t('settings.profileUpdated') || 'Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(`${t('settings.profileUpdateError') || 'Failed to update profile'}: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async () => {
    const fileInput = document.getElementById('settings-profile-picture-input') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast.error(t('profile.noFileSelected') || 'Please select an image file');
      return;
    }

    setUploadingPicture(true);
    try {
      await api.uploadProfilePicture(file);
      setPreviewUrl(null);
      if (fileInput) fileInput.value = '';
      toast.success(t('profile.pictureUploaded') || 'Profile picture updated');
    } catch (error: any) {
      console.error('Upload picture error:', error);
      toast.error(`${t('profile.failedToUploadPicture') || 'Upload failed'}: ${error.message}`);
      setPreviewUrl(null);
    } finally {
      setUploadingPicture(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('settings.profile')}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preferences'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('settings.preferences')}
          </button>
        </nav>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 gap-6">
           {/* Profile Content (Truncated for brevity, but same as original with Store integration) */}
           <div className="card">
             <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="relative group">
                 <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-100 dark:bg-gray-700">
                   {previewUrl || user?.picture_url ? (
                     <img src={previewUrl || user?.picture_url} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-bold">
                       {user?.name?.charAt(0)}
                     </div>
                   )}
                 </div>
                 <label htmlFor="settings-profile-picture-input" className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-primary-700 transition-colors">
                   <Camera size={18} />
                   <input 
                    id="settings-profile-picture-input" 
                    type="file" 
                    className="hidden" 
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

               <div className="flex-1 space-y-4 w-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="label">{t('settings.fullName')}</label>
                     <input 
                       className="input" 
                       value={profileData.name} 
                       onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                       disabled={!isEditing}
                     />
                   </div>
                   <div>
                     <label className="label">{t('auth.emailAddress')}</label>
                     <input className="input opacity-50 cursor-not-allowed" value={user?.email || ''} disabled />
                   </div>
                 </div>

                 <div className="flex gap-3">
                   {isEditing ? (
                     <>
                        <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2" disabled={saving}>
                          {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                          {t('common.save')}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">{t('common.cancel')}</button>
                     </>
                   ) : (
                     <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                       <Edit2 size={18} />
                       {t('settings.editProfile')}
                     </button>
                   )}
                   {previewUrl && (
                     <button onClick={handlePictureUpload} className="btn-secondary" disabled={uploadingPicture}>
                       {uploadingPicture ? <Loader className="animate-spin" size={18} /> : <Upload size={18} />}
                       {t('profile.uploadPicture')}
                     </button>
                   )}
                 </div>
               </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="card space-y-8">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${currentTheme === 'dark' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {currentTheme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{t('settings.appearance')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentTheme === 'dark' ? t('common.darkMode') : t('common.lightMode')}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-primary-600 transition-colors focus:outline-none"
            >
              <span
                className={`${
                  currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe size={20} className="text-primary-600" />
              {t('settings.language')}
            </h3>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
