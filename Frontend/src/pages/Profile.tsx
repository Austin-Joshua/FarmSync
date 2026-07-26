// Farmer Profile Management page
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon, MapPin, Ruler, Droplets, Edit2, Save, X, Phone, Mail,
  Camera, Loader, Building2, Home, Globe, Badge
} from 'lucide-react';
import { translateSoilType } from '../utils/translations';
import { BACKEND_ORIGIN } from '../config/api';
import ApiService from '../services/api';
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
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

const ROLE_LABELS: Record<string, string> = {
  farmer: '🌾 Farmer',
  citizen: '🏙️ Citizen',
  admin: '🛡️ Administrator',
};

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const uploadProfilePicture = ApiService.uploadProfilePicture;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const buildForm = () => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    location: user?.location || '',
    state: (user as any)?.state || '',
    district: (user as any)?.district || '',
    village: (user as any)?.village || '',
    landSize: user?.land_size || 0,
    soilType: user?.soil_type || '',
    preferredLanguage: (user as any)?.preferredLanguage || 'en',
  });

  const [formData, setFormData] = useState(buildForm());

  useEffect(() => {
    if (user) setFormData(buildForm());
  }, [user]);

  const handleSave = async () => {
    if (!user) { toast.error('Not authenticated'); return; }
    setSaving(true);
    try {
      await updateUser({
        name: formData.name,
        phone: formData.phone || undefined,
        state: formData.state || undefined,
        district: formData.district || undefined,
        village: formData.village || undefined,
        location: [formData.village, formData.district, formData.state].filter(Boolean).join(', ') || formData.location || undefined,
        land_size: formData.landSize || 0,
        soil_type: formData.soilType || undefined,
        preferred_language: formData.preferredLanguage || undefined,
      } as any);
      setIsEditing(false);
      toast.success('Profile updated successfully ✓');
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setIsEditing(false); setFormData(buildForm()); setPreviewUrl(null); };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePictureUpload = async () => {
    const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { toast.error('Please select an image file'); return; }
    setUploadingPicture(true);
    try {
      await uploadProfilePicture(file);
      setPreviewUrl(null);
      if (fileInput) fileInput.value = '';
      toast.success('Profile picture updated');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message || error}`);
      setPreviewUrl(null);
    } finally {
      setUploadingPicture(false);
    }
  };

  const profilePictureUrl = previewUrl || (user?.picture_url
    ? (user.picture_url.startsWith('http') ? user.picture_url : `${BACKEND_ORIGIN}${user.picture_url}`)
    : null);

  const avatarInitial = user?.name?.charAt(0).toUpperCase() || 'U';
  const locationDisplay = [(user as any)?.village, (user as any)?.district, (user as any)?.state].filter(Boolean).join(', ') || user?.location || '—';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h1>
          <p className="text-text-muted mt-1 text-sm">{t('profile.subtitle')}</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
            <Edit2 size={18} />
            {t('profile.editProfile')}
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-xl">
                {profilePictureUrl
                  ? <img src={profilePictureUrl} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                  : avatarInitial}
              </div>
              <label htmlFor="profile-picture-input" className="absolute -bottom-2 -right-2 bg-accent hover:bg-accent-hover text-white rounded-full p-2 cursor-pointer shadow-lg transition-all transform hover:scale-110">
                <Camera size={16} />
                <input id="profile-picture-input" type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
              </label>
            </div>

            {previewUrl && (
              <div className="mt-4 flex gap-2">
                <button onClick={handlePictureUpload} className="btn-primary py-1 px-2 text-xs flex items-center gap-1" disabled={uploadingPicture}>
                  {uploadingPicture ? <Loader size={12} className="animate-spin" /> : <Save size={12} />} Save
                </button>
                <button onClick={() => setPreviewUrl(null)} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                  <X size={12} /> Cancel
                </button>
              </div>
            )}

            {/* Role Badge */}
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                <Badge size={12} />
                {ROLE_LABELS[(user as any)?.role] || (user as any)?.role || 'User'}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-6 w-full">
            {/* Personal Info */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon size={12} className="text-accent" /> {t('profile.fullName')}
                  </label>
                  {isEditing
                    ? <input className="input text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    : <p className="text-gray-900 dark:text-gray-100 font-semibold">{formData.name || '—'}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} className="text-accent" /> {t('email')}
                  </label>
                  <p className="text-text-muted font-medium text-sm">{formData.email}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={12} className="text-accent" /> {t('profile.phoneNumber')}
                  </label>
                  {isEditing
                    ? <input className="input text-sm" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 9876543210" />
                    : <p className="text-gray-900 dark:text-gray-100 font-semibold">{formData.phone || '—'}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={12} className="text-accent" /> Language
                  </label>
                  {isEditing
                    ? <select className="input text-sm" value={formData.preferredLanguage} onChange={e => setFormData({...formData, preferredLanguage: e.target.value})}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                      </select>
                    : <p className="text-gray-900 dark:text-gray-100 font-semibold">{LANGUAGES.find(l => l.code === formData.preferredLanguage)?.label || formData.preferredLanguage}</p>}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Farm Location</h3>
              {!isEditing && (
                <div className="flex items-center gap-2 mb-3 text-sm text-text-muted">
                  <MapPin size={14} className="text-accent shrink-0" />
                  <span>{locationDisplay}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} className="text-accent" /> State
                  </label>
                  {isEditing
                    ? <select className="input text-sm" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                        <option value="">Select State</option>
                        {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    : <p className="text-gray-900 dark:text-gray-100 font-semibold">{formData.state || '—'}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={12} className="text-accent" /> District
                  </label>
                  {isEditing
                    ? <input className="input text-sm" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="e.g. Nashik" />
                    : <p className="text-gray-900 dark:text-gray-100 font-semibold">{formData.district || '—'}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Home size={12} className="text-accent" /> Village / Town
                  </label>
                  {isEditing
                    ? <input className="input text-sm" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} placeholder="e.g. Igatpuri" />
                    : <p className="text-gray-900 dark:text-gray-100 font-semibold">{formData.village || '—'}</p>}
                </div>
              </div>
            </div>

            {/* Farm Details */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Farm Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler size={12} className="text-accent" /> {t('profile.landSizeAcres')}
                  </label>
                  {isEditing
                    ? <input type="number" step="0.1" min="0" className="input text-sm" value={formData.landSize || ''} onChange={e => setFormData({...formData, landSize: parseFloat(e.target.value) || 0})} placeholder="e.g. 5.5" />
                    : <p className="text-gray-900 dark:text-gray-100 font-semibold">{formData.landSize > 0 ? `${formData.landSize} acres` : '—'}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Droplets size={12} className="text-accent" /> {t('profile.soilType')}
                  </label>
                  {isEditing
                    ? <select className="input text-sm" value={formData.soilType} onChange={e => setFormData({...formData, soilType: e.target.value})}>
                        <option value="">Select Soil Type</option>
                        {['Alluvial', 'Black (Regur)', 'Red & Yellow', 'Laterite', 'Arid & Desert', 'Saline', 'Peaty', 'Forest'].map(s => (
                          <option key={s} value={s}>{translateSoilType(s)}</option>
                        ))}
                      </select>
                    : <p className="text-gray-900 dark:text-gray-100 font-semibold">{formData.soilType ? translateSoilType(formData.soilType) : '—'}</p>}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                  {t('profile.saveChanges')}
                </button>
                <button onClick={handleCancel} disabled={saving} className="btn-secondary flex items-center gap-2">
                  <X size={18} /> {t('common.cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
