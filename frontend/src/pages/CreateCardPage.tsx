import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { apiService } from '../lib/api';
import { CardFormData } from '../types';
import { 
  Save, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building, 
  FileText, 
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export function CreateCardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CardFormData>({
    title: '',
    subtitle: '',
    description: '',
    phone: user?.phone || '',
    email: user?.email || '',
    web: '',
    country: user?.address?.country || '',
    state: user?.address?.state || '',
    city: user?.address?.city || '',
    street: user?.address?.street || '',
    houseNumber: user?.address?.houseNumber || 0,
    zip: user?.address?.zip || 0,
    imageUrl: '',
    imageAlt: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CardFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('createCard.titleRequired');
    }
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = t('createCard.subtitleRequired');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('createCard.descriptionRequired');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('createCard.phoneRequired');
    } else if (!/^0[2-9]-?\d{7,8}$/.test(formData.phone)) {
      newErrors.phone = t('createCard.phoneInvalid');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('createCard.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('createCard.emailInvalid');
    }
    if (!formData.country.trim()) {
      newErrors.country = t('createCard.countryRequired');
    }
    if (!formData.city.trim()) {
      newErrors.city = t('createCard.cityRequired');
    }
    if (!formData.street.trim()) {
      newErrors.street = t('createCard.streetRequired');
    }
    if (!formData.houseNumber || formData.houseNumber < 1) {
      newErrors.houseNumber = t('createCard.houseNumberRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(t('createCard.formError'));
      return;
    }

    setIsLoading(true);
    try {
      const cardData: CardFormData = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        web: formData.web || undefined,
        country: formData.country,
        state: formData.state || undefined,
        city: formData.city,
        street: formData.street,
        houseNumber: formData.houseNumber,
        zip: formData.zip || 0,
        imageUrl: formData.imageUrl,
        imageAlt: formData.imageAlt || formData.title
      };

      if (process.env.NODE_ENV === 'production') {
        // Mode démo - simulation de création réussie
        toast.success(t('createCard.createdDemo'));
        navigate('/cards');
        return;
      }

      await apiService.createCard(cardData);
      toast.success(t('createCard.created'));
      // Forcer le rechargement des cartes
      setTimeout(() => {
        window.location.href = '/cards';
      }, 500);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'production') {
        toast.error(t('createCard.checkDataError'));
      } else {
        const errorMessage = error.response?.data?.message || error.message || t('createCard.checkDataError');
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('createCard.loginRequired')}</h2>
          <p className="text-gray-600 mb-6">{t('createCard.loginRequiredDesc')}</p>
          <Button onClick={() => navigate('/login')}>{t('createCard.signIn')}</Button>
        </div>
      </div>
    );
  }

  if (!user.isBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('createCard.businessRequired')}</h2>
          <p className="text-gray-600 mb-6">
            {t('createCard.businessRequiredDesc')}
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/profile')}>
              {t('createCard.upgradeToBusiness')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/cards')}>
              {t('createCard.backToCards')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cards')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('createCard.back')}
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t('createCard.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('createCard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                {t('createCard.basicInfo')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createCard.cardTitle')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('createCard.cardTitlePlaceholder')}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createCard.cardSubtitle')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder={t('createCard.cardSubtitlePlaceholder')}
                    className={errors.subtitle ? 'border-red-500' : ''}
                  />
                  {errors.subtitle && (
                    <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createCard.description')} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('createCard.descriptionPlaceholder')}
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                {t('createCard.contact')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {t('form.phone')} *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="06-12345678"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {t('form.email')} *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@exemple.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {t('createCard.website')}
                  </label>
                  <Input
                    type="url"
                    value={formData.web}
                    onChange={(e) => handleInputChange('web', e.target.value)}
                    placeholder={t('createCard.websitePlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {t('createCard.address')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('register.countryLabel')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={errors.country ? 'border-red-500' : ''}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('register.cityLabel')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('register.streetLabel')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className={errors.street ? 'border-red-500' : ''}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('register.houseNumberLabel')} *
                  </label>
                  <Input
                    type="number"
                    value={formData.houseNumber}
                    onChange={(e) => handleInputChange('houseNumber', parseInt(e.target.value) || 0)}
                    min="1"
                    className={errors.houseNumber ? 'border-red-500' : ''}
                  />
                  {errors.houseNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.houseNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('register.zipLabel')}
                  </label>
                  <Input
                    type="number"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.stateRegion')}
                  </label>
                  <Input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                {t('createCard.image')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createCard.selectImage')}
                  </label>
                  <div className="flex flex-col space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      aria-label={t('createCard.selectImageAria')}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Create preview URL
                          const url = URL.createObjectURL(file);
                          handleInputChange('imageUrl', url);
                          handleInputChange('imageAlt', file.name);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <div className="text-xs text-gray-500">
                      {t('createCard.orEnterUrl')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createCard.imageUrl')}
                  </label>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder={t('createCard.imageUrlPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createCard.imageAlt')}
                  </label>
                  <Input
                    type="text"
                    value={formData.imageAlt}
                    onChange={(e) => handleInputChange('imageAlt', e.target.value)}
                    placeholder={t('createCard.imageAltPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/cards')}
                disabled={isLoading}
              >
{t('createCard.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
{isLoading ? t('createCard.creating') : t('createCard.create')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Preview */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {t('createCard.preview')}
            </h3>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {formData.title || t('createCard.previewTitle')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formData.subtitle || t('createCard.previewSubtitle')}
                  </p>
                </div>
                {formData.imageUrl && (
                  <div className="ml-4">
                    <img
                      src={formData.imageUrl}
                      alt={formData.imageAlt || formData.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {formData.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formData.phone}</span>
                  </div>
                )}
                {formData.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formData.email}</span>
                  </div>
                )}
                {formData.web && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{formData.web}</span>
                  </div>
                )}
                {(formData.city || formData.country) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {[formData.city, formData.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {formData.description && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-700">
                    {formData.description}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
