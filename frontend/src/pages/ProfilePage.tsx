import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Camera, Save, User, Mail, Phone, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    imageUrl: '',
    address: {
      country: '',
      city: '',
      street: '',
      houseNumber: 0,
      zip: 0,
      state: ''
    },
    isBusiness: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name.first,
        lastName: user.name.last,
        email: user.email,
        phone: user.phone,
        imageUrl: user.image?.url || '',
        address: {
          country: user.address.country,
          city: user.address.city,
          street: user.address.street,
          houseNumber: user.address.houseNumber,
          zip: user.address.zip,
          state: user.address.state || ''
        },
        isBusiness: user.isBusiness
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
    setHasChanges(true);

    // Auto-save après 2 secondes d'inactivité
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    const timeout = setTimeout(() => {
      handleAutoSave();
    }, 2000);
    setAutoSaveTimeout(timeout);
  };

  const handleAutoSave = async () => {
    if (!hasChanges || !user) return;

    try {
      if (process.env.NODE_ENV === 'production') {
        // Mode démo - simulation de sauvegarde réussie
        toast.success(t('profile.savedDemo'));
        setHasChanges(false);
        return;
      }

      await updateProfile({
        name: {
          first: formData.firstName,
          last: formData.lastName,
          middle: user.name.middle
        },
        email: formData.email,
        phone: formData.phone,
        image: formData.imageUrl ? {
          url: formData.imageUrl,
          alt: `${formData.firstName} ${formData.lastName}`
        } : user.image,
        address: formData.address,
        isBusiness: formData.isBusiness
      });
      setHasChanges(false);
      toast.success(t('profile.savedAuto'));
    } catch {
      // Erreur de sauvegarde automatique silencieuse
    }
  };

  const handleManualSave = async () => {
    if (!user) return;

    try {
      await updateProfile({
        name: {
          first: formData.firstName,
          last: formData.lastName,
          middle: user.name.middle
        },
        email: formData.email,
        phone: formData.phone,
        image: formData.imageUrl ? {
          url: formData.imageUrl,
          alt: `${formData.firstName} ${formData.lastName}`
        } : user.image,
        address: formData.address,
        isBusiness: formData.isBusiness
      });
      setHasChanges(false);
    } catch {
      toast.error(t('profile.saveError'));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{t('profile.loginRequired')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('profile.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t('profile.subtitle')}</p>
          {hasChanges && (
            <div className="mt-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700 backdrop-blur-sm">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                💾 {t('profile.unsavedChanges')}
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Avatar Section */}
              <div className="xl:col-span-1">
                <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-6">
                  <div className="relative mx-auto w-40 h-40 mb-6">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-2xl transform hover:scale-105 transition-all duration-300">
                      {formData.imageUrl ? (
                        <img 
                          src={formData.imageUrl} 
                          alt={`${formData.firstName} ${formData.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <button 
                      className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                      title={t('profile.changeAvatar')}
                      aria-label={t('profile.changeAvatar')}
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                    <Building className="w-4 h-4 mr-1" />
                    {formData.isBusiness ? t('profile.businessAccount') : t('profile.personalAccount')}
                  </div>

                  {/* URL Avatar */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.avatarUrl')}
                    </label>
                    <Input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="https://exemple.com/avatar.jpg"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="xl:col-span-3">
                <div className="space-y-8">
                  {/* Informations personnelles */}
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                      <User className="w-6 h-6 mr-3 text-blue-600" />
                      {t('profile.personalInfoSection')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('form.firstName')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('form.lastName')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          {t('form.email')} *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-green-600" />
                          {t('form.phone')} *
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="06-12345678"
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    {/* Type de compte */}
                    <div className="md:col-span-2 mt-6">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-6 border border-blue-200 dark:border-gray-600">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center">
                            <Building className="w-6 h-6 mr-3 text-blue-600" />
                            <div>
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('profile.businessFeatures')}
                              </span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Accès aux fonctionnalités professionnelles
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.isBusiness}
                            onChange={(e) => handleInputChange('isBusiness', e.target.checked)}
                            className="w-6 h-6 rounded-lg border-2 border-blue-300 text-blue-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 dark:border-gray-500 dark:focus:border-blue-400 transition-all duration-200"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Adresse */}
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center">
                      <MapPin className="w-6 h-6 mr-3 text-green-600" />
                      {t('profile.addressSection')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('register.countryLabel')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.address.country}
                          onChange={(e) => handleInputChange('address.country', e.target.value)}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('register.cityLabel')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('register.streetLabel')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => handleInputChange('address.street', e.target.value)}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('register.houseNumberLabel')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.address.houseNumber}
                          onChange={(e) => handleInputChange('address.houseNumber', parseInt(e.target.value) || 0)}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('register.zipLabel')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.address.zip}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            handleInputChange('address.zip', parseInt(value) || 0);
                          }}
                          className="h-12 rounded-xl"
                          maxLength={6}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('profile.stateRegion')}
                        </label>
                        <Input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) => handleInputChange('address.state', e.target.value)}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center pt-8">
                    <Button
                      onClick={handleManualSave}
                      disabled={!hasChanges || isLoading}
                      className="h-14 px-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center text-lg"
                    >
                      <Save className="w-5 h-5 mr-3" />
                      {isLoading ? t('profile.saving') : t('profile.saveNow')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
