import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isBusiness: false,
    },
  });

  const isBusiness = watch('isBusiness');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      navigate('/');
    } catch (error: unknown) {
      // L'erreur est déjà affichée dans le contexte
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inscription
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Créez votre compte Cardify
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nom complet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prénom
                </label>
                <Input
                  placeholder="Prénom"
                  {...register('name.first')}
                  error={errors.name?.first?.message}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom
                </label>
                <Input
                  placeholder="Nom"
                  {...register('name.last')}
                  error={errors.name?.last?.message}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deuxième prénom (optionnel)
              </label>
              <Input
                placeholder="Deuxième prénom"
                {...register('name.middle')}
                error={errors.name?.middle?.message}
                disabled={isLoading}
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <Input
                  placeholder="05-1234567"
                  {...register('phone')}
                  error={errors.phone?.message}
                  disabled={isLoading}
                  helperText="Format: 0X-XXXXXXX"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ex: MonMotDePasse123!"
                {...register('password')}
                error={errors.password?.message}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">Le mot de passe doit contenir :</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Au moins 7 caractères</li>
                  <li>Une minuscule (a-z)</li>
                  <li>Une majuscule (A-Z)</li>
                  <li>Un chiffre (0-9)</li>
                  <li>Un caractère spécial (@$!%*?&)</li>
                </ul>
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Adresse
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pays
                  </label>
                  <Input
                    placeholder="Israel"
                    {...register('address.country')}
                    error={errors.address?.country?.message}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ville
                  </label>
                  <Input
                    placeholder="Tel Aviv"
                    {...register('address.city')}
                    error={errors.address?.city?.message}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rue
                  </label>
                  <Input
                    placeholder="Rothschild"
                    {...register('address.street')}
                    error={errors.address?.street?.message}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro
                  </label>
                  <Input
                    type="number"
                    placeholder="123"
                    {...register('address.houseNumber', { valueAsNumber: true })}
                    error={errors.address?.houseNumber?.message}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    État (optionnel)
                  </label>
                  <Input
                    placeholder="État"
                    {...register('address.state')}
                    error={errors.address?.state?.message}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code postal (optionnel)
                  </label>
                  <Input
                    type="number"
                    placeholder="12345"
                    {...register('address.zip', { valueAsNumber: true })}
                    error={errors.address?.zip?.message}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Image de profil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image de profil (optionnel)
              </label>
              <Input
                type="url"
                placeholder="https://exemple.com/image.jpg"
                {...register('image.url')}
                error={errors.image?.url?.message}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                URL vers votre photo de profil
              </p>
            </div>

            {/* Compte business */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isBusiness"
                {...register('isBusiness')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                disabled={isLoading}
              />
              <label htmlFor="isBusiness" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Compte professionnel (pour créer des cartes de visite)
              </label>
            </div>

            {isBusiness && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ Avec un compte professionnel, vous pourrez créer et gérer vos cartes de visite.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              isLoading={isLoading}
              size="lg"
              leftIcon={isLoading ? undefined : <UserPlus className="w-5 h-5" />}
            >
              {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
