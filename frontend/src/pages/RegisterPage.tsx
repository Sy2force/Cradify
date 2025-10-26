import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
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
      newErrors.firstName = 'Prénom requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nom requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 7) {
      newErrors.password = 'Le mot de passe doit contenir au moins 7 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Pays requis';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Ville requise';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Rue requise';
    }

    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'Numéro de maison requis';
    }

    if (!formData.zip.trim()) {
      newErrors.zip = 'Code postal requis';
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
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Créer un compte Cardify
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="John"
                  required
                />

                <Input
                  label="Nom"
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
                  label="Adresse email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  required
                />

                <Input
                  label="Téléphone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+33 1 23 45 67 89"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sécurité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mot de passe"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />

                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Pays"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  error={errors.country}
                  placeholder="France"
                  required
                />

                <Input
                  label="Ville"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  placeholder="Paris"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Rue"
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  error={errors.street}
                  placeholder="Rue de la Paix"
                  required
                />

                <Input
                  label="Numéro"
                  type="number"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  error={errors.houseNumber}
                  placeholder="123"
                  required
                />

                <Input
                  label="Code postal"
                  type="number"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  error={errors.zip}
                  placeholder="75001"
                  required
                />
              </div>
            </div>

            {/* Type de compte */}
            <div className="flex items-center">
              <input
                id="isBusiness"
                name="isBusiness"
                type="checkbox"
                checked={formData.isBusiness}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isBusiness" className="ml-2 block text-sm text-gray-900">
                Compte professionnel (peut créer des cartes de visite)
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
