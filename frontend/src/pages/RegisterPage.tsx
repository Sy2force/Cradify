import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    city: '',
    street: '',
    houseNumber: '',
    zip: '',
    isBusiness: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('register.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('register.lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('login.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('login.emailInvalid');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('login.passwordRequired');
    } else if (formData.password.length < 7) {
      newErrors.password = t('login.passwordMin');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('register.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.passwordMatch');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('register.phoneRequired');
    } else if (!/^0[1-9]-?\d{8}$/.test(formData.phone)) {
      newErrors.phone = t('register.phoneInvalid');
    }

    if (!formData.country.trim()) {
      newErrors.country = t('register.countryRequired');
    }

    if (!formData.city.trim()) {
      newErrors.city = t('register.cityRequired');
    }

    if (!formData.street.trim()) {
      newErrors.street = t('register.streetRequired');
    }

    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = t('register.houseNumberRequired');
    } else if (isNaN(Number(formData.houseNumber))) {
      newErrors.houseNumber = t('register.houseNumberInvalid');
    }

    if (!formData.zip.trim()) {
      newErrors.zip = t('register.zipRequired');
    } else if (isNaN(Number(formData.zip)) || formData.zip.length < 4 || formData.zip.length > 6) {
      newErrors.zip = t('register.zipInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        name: {
          first: formData.firstName,
          last: formData.lastName,
        },
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: {
          country: formData.country,
          city: formData.city,
          street: formData.street,
          houseNumber: Number(formData.houseNumber),
          zip: Number(formData.zip),
        },
        isBusiness: formData.isBusiness,
      };

      await register(userData);
      navigate('/');
    } catch {
      // Error handled in auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('register.subtitle')}
          </p>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('register.haveAccount')}{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {t('register.signIn')}
            </Link>
          </p>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">{t('register.personalInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('form.firstName')}
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="John"
                  required
                />

                <Input
                  label={t('form.lastName')}
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label={t('login.emailLabel')}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder={t('login.emailPlaceholder')}
                  autoComplete="email"
                  required
                />

                <Input
                  label={t('register.phoneLabel')}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + '-' + value.substring(2, 10);
                    }
                    const fakeEvent = {
                      target: { name: 'phone', value }
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleChange(fakeEvent);
                  }}
                  error={errors.phone}
                  placeholder="06-12345678"
                  required
                />
              </div>
            </div>

            {/* Informations de sécurité */}
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">{t('register.securityInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('login.passwordLabel')}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete="new-password"
                  required
                />

                <Input
                  label={t('register.confirmPasswordLabel')}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Adresse et localisation */}
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">{t('register.addressInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('register.countryLabel')}
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  error={errors.country}
                  placeholder="France"
                  required
                />

                <Input
                  label={t('register.cityLabel')}
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  placeholder="Paris"
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="col-span-2 md:col-span-1">
                  <Input
                    label={t('register.streetLabel')}
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    error={errors.street}
                    placeholder="Rue de la Paix"
                    required
                  />
                </div>

                <Input
                  label={t('register.houseNumberLabel')}
                  type="text"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  error={errors.houseNumber}
                  placeholder="123"
                  required
                />

                <Input
                  label={t('register.zipLabel')}
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    const fakeEvent = {
                      target: { name: 'zip', value }
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleChange(fakeEvent);
                  }}
                  error={errors.zip}
                  placeholder="75001"
                  maxLength={6}
                  required
                />
              </div>
            </div>

          {/* Type de compte */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl border border-blue-200 dark:border-gray-600">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isBusiness"
                checked={formData.isBusiness}
                onChange={handleChange}
                className="w-5 h-5 rounded-lg border-2 border-blue-300 text-blue-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 dark:border-gray-500 dark:focus:border-blue-400 transition-all duration-200"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('register.businessAccount')}
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {t('register.createAccount')}
          </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-400 rounded-full">{t('login.or')}</span>
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                onClick={() => navigate('/')}
              >
                {t('login.backToHome')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
