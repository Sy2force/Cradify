import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Check,
  Shield,
  CreditCard,
  Edit3,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageProps } from '@/types';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

// Schema de validation pour le profil
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  middleName: z.string().optional(),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z
    .string()
    .min(1, 'Le téléphone est requis')
    .regex(/^[\d\s+\-()]+$/, 'Format de téléphone invalide'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  country: z.string().min(1, 'Le pays est requis'),
  state: z.string().optional(),
  city: z.string().min(1, 'La ville est requise'),
  street: z.string().min(1, 'L\'adresse est requise'),
  houseNumber: z.string().min(1, 'Le numéro est requis'),
  zip: z.string().min(1, 'Le code postal est requis'),
});

// Schema pour changer le mot de passe
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z
    .string()
    .min(1, 'Le nouveau mot de passe est requis')
    .min(7, 'Le mot de passe doit contenir au moins 7 caractères')
    .regex(/(?=.*[a-z])/, 'Au moins une minuscule requise')
    .regex(/(?=.*[A-Z])/, 'Au moins une majuscule requise')
    .regex(/(?=.*\d)/, 'Au moins un chiffre requis')
    .regex(/(?=.*[!@#$%^&*])/, 'Au moins un caractère spécial requis'),
  confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage({ className }: PageProps = {}) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue,
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const watchedPassword = watch();

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setValue('firstName', user.name.first);
      setValue('middleName', user.name.middle || '');
      setValue('lastName', user.name.last);
      setValue('phone', user.phone);
      setValue('email', user.email);
      setValue('country', user.address.country);
      setValue('state', user.address.state || '');
      setValue('city', user.address.city);
      setValue('street', user.address.street);
      setValue('houseNumber', String(user.address.houseNumber));
      setValue('zip', String(user.address.zip));
    }
  }, [user, setValue]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const updatedData = {
        name: {
          first: data.firstName,
          middle: data.middleName || '',
          last: data.lastName,
        },
        phone: data.phone,
        email: data.email,
        address: {
          country: data.country,
          state: data.state || '',
          city: data.city,
          street: data.street,
          houseNumber: parseInt(data.houseNumber),
          zip: parseInt(data.zip),
        },
      };

      const updatedUser = await userService.updateProfile(updatedData);
      await updateUser(updatedUser);
      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsSaving(true);
      await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Mot de passe changé avec succès !');
      setIsChangingPassword(false);
      resetPassword();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (user) {
      resetProfile({
        firstName: user.name.first,
        middleName: user.name.middle || '',
        lastName: user.name.last,
        phone: user.phone,
        email: user.email,
        country: user.address.country,
        state: user.address.state || '',
        city: user.address.city,
        street: user.address.street,
        houseNumber: String(user.address.houseNumber),
        zip: String(user.address.zip),
      });
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    resetPassword();
  };

  if (!user) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 flex items-center justify-center ${className || ''}`}>
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 py-8 ${className || ''}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez vos informations personnelles et préférences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.name.first} {user.name.middle && user.name.middle + ' '}{user.name.last}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center space-x-1 mt-1">
                  <Mail size={14} />
                  <span>{user.email}</span>
                </p>
              </div>

              {/* Account Type */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Type de compte</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    (user.role === 'admin' || user.isAdmin)
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : user.isBusiness
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                  }`}>
                    {user.role === 'admin' || user.isAdmin ? 'Administrateur' : user.isBusiness ? 'Business' : 'Utilisateur'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Cartes créées</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.cardsCount || 0}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<Edit3 />}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isSaving}
                >
                  {isEditing ? 'Annuler' : 'Modifier Profile'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<Settings />}
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  disabled={isSaving}
                >
                  {isChangingPassword ? 'Annuler' : 'Changer mot de passe'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Profile Form */}
            {isEditing && (
              <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Edit3 className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Modifier le Profil
                  </h3>
                </div>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Informations personnelles
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          {...registerProfile('firstName')}
                          label="Prénom *"
                          placeholder="Jean"
                          error={profileErrors.firstName?.message}
                          disabled={isSaving}
                        />
                        <Input
                          {...registerProfile('lastName')}
                          label="Nom *"
                          placeholder="Dupont"
                          error={profileErrors.lastName?.message}
                          disabled={isSaving}
                        />
                      </div>

                      <Input
                        {...registerProfile('middleName')}
                        label="Deuxième prénom"
                        placeholder="Marie (optionnel)"
                        disabled={isSaving}
                      />

                      <Input
                        {...registerProfile('email')}
                        type="email"
                        label="Email *"
                        placeholder="jean.dupont@example.com"
                        leftIcon={<Mail size={20} />}
                        error={profileErrors.email?.message}
                        disabled={isSaving}
                      />

                      <Input
                        {...registerProfile('phone')}
                        type="tel"
                        label="Téléphone *"
                        placeholder="+33 1 23 45 67 89"
                        leftIcon={<Phone size={20} />}
                        error={profileErrors.phone?.message}
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Adresse
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          {...registerProfile('country')}
                          label="Pays *"
                          placeholder="France"
                          leftIcon={<MapPin size={20} />}
                          error={profileErrors.country?.message}
                          disabled={isSaving}
                        />
                        <Input
                          {...registerProfile('state')}
                          label="Région"
                          placeholder="Île-de-France"
                          error={profileErrors.state?.message}
                          disabled={isSaving}
                        />
                      </div>

                      <Input
                        {...registerProfile('city')}
                        label="Ville *"
                        placeholder="Paris"
                        error={profileErrors.city?.message}
                        disabled={isSaving}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Input
                            {...registerProfile('street')}
                            label="Rue *"
                            placeholder="Avenue des Champs-Élysées"
                            error={profileErrors.street?.message}
                            disabled={isSaving}
                          />
                        </div>
                        <Input
                          {...registerProfile('houseNumber')}
                          label="Numéro *"
                          placeholder="123"
                          error={profileErrors.houseNumber?.message}
                          disabled={isSaving}
                        />
                      </div>

                      <Input
                        {...registerProfile('zip')}
                        label="Code postal *"
                        placeholder="75008"
                        error={profileErrors.zip?.message}
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      isLoading={isSaving}
                      disabled={isSaving}
                      leftIcon={!isSaving ? <Save /> : undefined}
                      className="flex-1"
                    >
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={isSaving}
                      leftIcon={<X />}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Change Form */}
            {isChangingPassword && (
              <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Changer le Mot de Passe
                  </h3>
                </div>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  <div className="relative">
                    <Input
                      {...registerPassword('currentPassword')}
                      type={showCurrentPassword ? 'text' : 'password'}
                      label="Mot de passe actuel *"
                      placeholder="••••••••"
                      error={passwordErrors.currentPassword?.message}
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-[2.7rem] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isSaving}
                      title={showCurrentPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      aria-label={showCurrentPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      {...registerPassword('newPassword')}
                      type={showNewPassword ? 'text' : 'password'}
                      label="Nouveau mot de passe *"
                      placeholder="••••••••"
                      error={passwordErrors.newPassword?.message}
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-[2.7rem] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isSaving}
                      title={showNewPassword ? 'Masquer le nouveau mot de passe' : 'Afficher le nouveau mot de passe'}
                      aria-label={showNewPassword ? 'Masquer le nouveau mot de passe' : 'Afficher le nouveau mot de passe'}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      {...registerPassword('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirmer le nouveau mot de passe *"
                      placeholder="••••••••"
                      error={passwordErrors.confirmPassword?.message}
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[2.7rem] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isSaving}
                      title={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                      aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Exigences du nouveau mot de passe :
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center space-x-2 ${
                        watchedPassword.newPassword?.length >= 7 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <Check size={12} />
                        <span>Au moins 7 caractères</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        /(?=.*[a-z])/.test(watchedPassword.newPassword || '') ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <Check size={12} />
                        <span>Une minuscule</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        /(?=.*[A-Z])/.test(watchedPassword.newPassword || '') ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <Check size={12} />
                        <span>Une majuscule</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        /(?=.*\d)/.test(watchedPassword.newPassword || '') ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <Check size={12} />
                        <span>Un chiffre</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        /(?=.*[!@#$%^&*])/.test(watchedPassword.newPassword || '') ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <Check size={12} />
                        <span>Un caractère spécial</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      isLoading={isSaving}
                      disabled={isSaving}
                      leftIcon={!isSaving ? <Save /> : undefined}
                      className="flex-1"
                    >
                      {isSaving ? 'Changement...' : 'Changer le mot de passe'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelPasswordChange}
                      disabled={isSaving}
                      leftIcon={<X />}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Default Information Display */}
            {!isEditing && !isChangingPassword && (
              <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <User className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informations du Profil
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Informations personnelles
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Prénom:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{user.name.first}</span>
                      </div>
                      {user.name.middle && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Deuxième prénom:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{user.name.middle}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Nom:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{user.name.last}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Email:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Téléphone:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{user.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Adresse
                    </h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Adresse:</span>
                        <span className="font-medium text-gray-900 dark:text-white text-right">
                          {user.address.houseNumber} {user.address.street}<br />
                          {user.address.zip} {user.address.city}<br />
                          {user.address.state && `${user.address.state}, `}{user.address.country}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
