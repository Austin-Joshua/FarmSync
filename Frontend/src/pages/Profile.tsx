// Farmer Profile Management page
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, MapPin, Ruler, Droplets, Edit2, Save, X, Phone, Mail, Camera, Loader } from 'lucide-react';
import { translateSoilType } from '../utils/translations';
import { BACKEND_ORIGIN } from '../config/api';
import ApiService from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const uploadProfilePicture = ApiService.uploadProfilePicture;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    location: user?.location || '',
    district: (user as any)?.district || '',
    state: (user as any)?.state || 'Tamil Nadu',
    pincode: (user as any)?.pincode || '',
    landSize: user?.land_size || 0,
    soilType: user?.soil_type || '',
    irrigationType: (user as any)?.irrigation_type || '',
    farmerId: (user as any)?.farmer_id || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any)?.phone || '',
        location: user.location || '',
        district: (user as any)?.district || '',
        state: (user as any)?.state || 'Tamil Nadu',
        pincode: (user as any)?.pincode || '',
        landSize: user.land_size || 0,
        soilType: user.soil_type || '',
        irrigationType: (user as any)?.irrigation_type || '',
        farmerId: (user as any)?.farmer_id || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error(t('profile.userNotAuthenticated'));
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        district: formData.district || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
        land_size: formData.landSize || 0,
        soil_type: formData.soilType || undefined,
        irrigation_type: formData.irrigationType || undefined,
        farmer_id: formData.farmerId || undefined,
      });
      setIsEditing(false);
      toast.success(t('profile.profileUpdated') || 'Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(`${t('profile.failedToUpdate') || 'Failed to update'}: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
      location: user?.location || '',
      district: (user as any)?.district || '',
      state: (user as any)?.state || 'Tamil Nadu',
      pincode: (user as any)?.pincode || '',
      landSize: user?.land_size || 0,
      soilType: user?.soil_type || '',
      irrigationType: (user as any)?.irrigation_type || '',
      farmerId: (user as any)?.farmer_id || '',
    });
    setPreviewUrl(null);
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.invalidImageType') || 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge') || 'Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePictureUpload = async () => {
    const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast.error(t('profile.noFileSelected') || 'Please select an image file');
      return;
    }

    setUploadingPicture(true);
    try {
      await uploadProfilePicture(file);
      setPreviewUrl(null);
      if (fileInput) fileInput.value = '';
      toast.success(t('profile.pictureUploaded') || 'Profile picture updated');
    } catch (error: any) {
      toast.error(`${t('profile.failedToUploadPicture') || 'Upload failed'}: ${error.message}`);
      setPreviewUrl(null);
    } finally {
      setUploadingPicture(false);
    }
  };

  const profilePictureUrl = previewUrl || (user?.picture_url ? (user.picture_url.startsWith('http') ? user.picture_url : `${BACKEND_ORIGIN}${user.picture_url}`) : null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('profile.subtitle')}</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
            <Edit2 size={20} />
            {formData.name || formData.location ? t('profile.editProfile') : t('profile.addDetails')}
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0 group relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center text-white text-5xl border-4 border-white dark:border-gray-800 shadow-xl">
              {profilePictureUrl ? (
                <img src={profilePictureUrl} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <label htmlFor="profile-picture-input" className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all transform hover:scale-110">
              <Camera size={18} />
              <input 
                id="profile-picture-input" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePictureChange} 
              />
            </label>
            {previewUrl && (
              <div className="mt-4 flex gap-2">
                <button onClick={handlePictureUpload} className="btn-primary py-1 px-2 text-xs" disabled={uploadingPicture}>
                  {uploadingPicture ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                </button>
                <button onClick={() => setPreviewUrl(null)} className="btn-secondary py-1 px-2 text-xs">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <UserIcon size={14} className="text-primary-600" />
                  {t('profile.fullName')}
                </label>
                {isEditing ? (
                  <input className="input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.name || t('common.notSet')}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} className="text-primary-600" />
                  {t('email')}
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium opacity-60">{formData.email}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} className="text-primary-600" />
                  {t('profile.phoneNumber')}
                </label>
                {isEditing ? (
                  <input className="input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.phone || t('common.notSet')}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={14} className="text-primary-600" />
                  {t('profile.location')}
                </label>
                {isEditing ? (
                  <input className="input" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.location || t('common.notSet')}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Ruler size={14} className="text-primary-600" />
                  {t('profile.landSizeAcres')}
                </label>
                {isEditing ? (
                  <input type="number" className="input" value={formData.landSize} onChange={(e) => setFormData({...formData, landSize: parseFloat(e.target.value) || 0})} />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.landSize > 0 ? `${formData.landSize} ${t('common.acres')}` : t('common.notSet')}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Droplets size={14} className="text-primary-600" />
                  {t('profile.soilType')}
                </label>
                {isEditing ? (
                  <select className="input" value={formData.soilType} onChange={(e) => setFormData({...formData, soilType: e.target.value})}>
                    <option value="">{t('profile.selectSoilType')}</option>
                    <option value="Alluvial">{translateSoilType('Alluvial')}</option>
                    <option value="Red Soil">{translateSoilType('Red Soil')}</option>
                    <option value="Black Soil">{translateSoilType('Black Soil')}</option>
                    <option value="Sandy">{translateSoilType('Sandy')}</option>
                    <option value="Clay">{translateSoilType('Clay')}</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.soilType ? translateSoilType(formData.soilType) : t('common.notSet')}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-6">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                  {t('profile.saveChanges')}
                </button>
                <button onClick={handleCancel} disabled={saving} className="btn-secondary">{t('common.cancel')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

