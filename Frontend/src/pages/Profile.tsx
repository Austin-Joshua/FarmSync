// Farmer Profile Management page
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Ruler, Droplets, Edit2, Save, X, Phone, Mail, Home, Hash, Camera, Loader } from 'lucide-react';
import { translateSoilType } from '../utils/translations';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser, uploadProfilePicture } = useAuth();
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
      alert(t('profile.userNotAuthenticated'));
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location || null,
        district: formData.district || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        land_size: formData.landSize || 0,
        soil_type: formData.soilType || null,
        irrigation_type: formData.irrigationType || null,
        farmer_id: formData.farmerId || null,
      });
      setIsEditing(false);
      alert(t('profile.profileUpdated'));
    } catch (error: any) {
      alert(`${t('profile.failedToUpdate')} ${error.message}`);
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
    const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('profile.subtitle')}</p>
          {!isEditing && (!formData.name || !formData.location) && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              {t('profile.fillProfileDetails')}
            </p>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit2 size={20} />
            {formData.name || formData.location ? t('profile.editProfile') : t('profile.addDetails')}
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="card">
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
                htmlFor="profile-picture-input"
                className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
                title={t('profile.changePicture') || 'Change picture'}
              >
                <Camera size={18} />
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePictureChange}
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
                    const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
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
                {user?.role === 'admin' ? `👨‍💼 ${t('auth.admin')}` : `👨‍🌾 ${t('auth.farmer')}`}
              </span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User size={16} className="inline mr-2" />
                  {t('profile.fullName')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('profile.enterName')}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.name || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  {t('auth.email')}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('profile.enterEmail')}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.email || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  {t('profile.phoneNumber') || 'Phone Number'}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('profile.enterPhone') || 'Enter phone number'}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.phone || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Hash size={16} className="inline mr-2" />
                  {t('profile.farmerId') || 'Farmer ID'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.farmerId}
                    onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                    placeholder={t('profile.enterFarmerId') || 'Enter farmer ID'}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.farmerId || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  {t('profile.location')} / {t('profile.village') || 'Village'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t('profile.enterLocation')}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.location || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  {t('profile.district') || 'District'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder={t('profile.enterDistrict') || 'Enter district'}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.district || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label htmlFor="profile-state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  {t('profile.state') || 'State'}
                </label>
                {isEditing ? (
                  <select
                    id="profile-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input-field"
                    aria-label={t('profile.state') || 'State'}
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.state || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Hash size={16} className="inline mr-2" />
                  {t('profile.pincode') || 'Pincode'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder={t('profile.enterPincode') || 'Enter pincode'}
                    className="input-field"
                    maxLength={6}
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.pincode || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Ruler size={16} className="inline mr-2" />
                  {t('profile.landSizeAcres')}
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.landSize || ''}
                    onChange={(e) => setFormData({ ...formData, landSize: parseFloat(e.target.value) || 0 })}
                    placeholder={t('profile.enterLandSize')}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formData.landSize > 0 ? `${formData.landSize} ${t('common.acres')}` : t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label htmlFor="profile-soil-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Droplets size={16} className="inline mr-2" />
                  {t('profile.soilType')}
                </label>
                {isEditing ? (
                  <select
                    id="profile-soil-type"
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="input-field"
                    aria-label={t('profile.soilType')}
                  >
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

              <div>
                <label htmlFor="profile-irrigation-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Droplets size={16} className="inline mr-2" />
                  {t('irrigation.irrigationType') || 'Irrigation Type'}
                </label>
                {isEditing ? (
                  <select
                    id="profile-irrigation-type"
                    value={formData.irrigationType}
                    onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                    className="input-field"
                    aria-label={t('irrigation.irrigationType') || 'Irrigation Type'}
                  >
                    <option value="">{t('irrigation.selectType') || 'Select irrigation type'}</option>
                    <option value="drip">{t('irrigation.drip')}</option>
                    <option value="sprinkler">{t('irrigation.sprinkler')}</option>
                    <option value="manual">{t('irrigation.manual')}</option>
                    <option value="canal">{t('irrigation.canal') || 'Canal'}</option>
                    <option value="well">{t('irrigation.well') || 'Well'}</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {formData.irrigationType 
                      ? (formData.irrigationType === 'drip' ? t('irrigation.drip') : 
                         formData.irrigationType === 'sprinkler' ? t('irrigation.sprinkler') : 
                         formData.irrigationType === 'manual' ? t('irrigation.manual') : 
                         formData.irrigationType)
                      : t('common.notSet')}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSave} 
                  disabled={saving || !formData.name?.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!formData.name?.trim() ? t('profile.nameRequired') : ''}
                >
                  <Save size={20} />
                  {saving ? t('profile.saving') : t('profile.saveChanges')}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  <X size={20} />
                  {t('common.cancel')}
                </button>
              </div>
            )}
            {!isEditing && (!formData.name || !formData.location) && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>{t('common.tip')}:</strong> {t('profile.profileTip')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

