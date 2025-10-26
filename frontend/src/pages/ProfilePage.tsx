import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Camera, Save, User, Mail, Phone, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
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
      toast.success('Profil sauvegardé automatiquement');
    } catch (error) {
      console.error('Erreur de sauvegarde automatique:', error);
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
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Vous devez être connecté pour voir cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et préférences
          </p>
          {hasChanges && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💾 Modifications non sauvegardées (sauvegarde automatique dans 2 secondes)
              </p>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    {formData.imageUrl ? (
                      <img 
                        src={formData.imageUrl} 
                        alt={`${formData.firstName} ${formData.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-600">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                    title="Changer l'avatar"
                    aria-label="Changer l'avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {formData.isBusiness ? 'Compte Business' : 'Compte Personnel'}
                </p>
              </div>

              {/* URL Avatar */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'avatar
                </label>
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://exemple.com/avatar.jpg"
                />
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="md:col-span-2 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Informations personnelles
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Téléphone *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="06-12345678"
                    required
                  />
                </div>

                {/* Type de compte */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isBusiness}
                      onChange={(e) => handleInputChange('isBusiness', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Compte Business (accès aux fonctionnalités professionnelles)
                      </span>
                    </div>
                  </label>
                </div>

                {/* Adresse */}
                <div className="md:col-span-2 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Adresse
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <Input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <Input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rue *
                  </label>
                  <Input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro *
                  </label>
                  <Input
                    type="number"
                    value={formData.address.houseNumber}
                    onChange={(e) => handleInputChange('address.houseNumber', parseInt(e.target.value) || 0)}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <Input
                    type="number"
                    value={formData.address.zip}
                    onChange={(e) => handleInputChange('address.zip', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État/Région
                  </label>
                  <Input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  onClick={handleManualSave}
                  disabled={!hasChanges || isLoading}
                  className="flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder maintenant'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
