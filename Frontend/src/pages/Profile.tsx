// Farmer Profile Management page
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Ruler, Droplets, Edit2, Save, X } from 'lucide-react';
import { translateSoilType } from '../utils/translations';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    landSize: user?.land_size || 0,
    soilType: user?.soil_type || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        landSize: user.land_size || 0,
        soilType: user.soil_type || '',
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
        location: formData.location || null,
        land_size: formData.landSize || 0,
        soil_type: formData.soilType || null,
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
      location: user?.location || '',
      landSize: user?.land_size || 0,
      soilType: user?.soil_type || '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600 mt-1">{t('profile.subtitle')}</p>
          {!isEditing && (!formData.name || !formData.location) && (
            <p className="text-sm text-yellow-600 mt-2">
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
            <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center text-white text-5xl">
              {user?.name?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {user?.role === 'admin' ? `👨‍💼 ${t('auth.admin')}` : `👨‍🌾 ${t('auth.farmer')}`}
              </span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <p className="text-gray-900 font-medium">{formData.name || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
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
                  <p className="text-gray-900 font-medium">{formData.email || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  {t('profile.location')}
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
                  <p className="text-gray-900 font-medium">{formData.location || t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Ruler size={16} className="inline mr-2" />
                  {t('profile.landSizeAcres')}
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.landSize || ''}
                    onChange={(e) => setFormData({ ...formData, landSize: parseFloat(e.target.value) || 0 })}
                    placeholder={t('profile.enterLandSize')}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.landSize > 0 ? `${formData.landSize} ${t('common.acres')}` : t('common.notSet')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplets size={16} className="inline mr-2" />
                  {t('profile.soilType')}
                </label>
                {isEditing ? (
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="input-field"
                  >
                    <option value="">{t('profile.selectSoilType')}</option>
                    <option value="Alluvial">{translateSoilType('Alluvial')}</option>
                    <option value="Red Soil">{translateSoilType('Red Soil')}</option>
                    <option value="Black Soil">{translateSoilType('Black Soil')}</option>
                    <option value="Sandy">{translateSoilType('Sandy')}</option>
                    <option value="Clay">{translateSoilType('Clay')}</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">{formData.soilType ? translateSoilType(formData.soilType) : t('common.notSet')}</p>
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
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <X size={20} />
                  {t('common.cancel')}
                </button>
              </div>
            )}
            {!isEditing && (!formData.name || !formData.location) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
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

