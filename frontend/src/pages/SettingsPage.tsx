import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  User, Save, Shield, Bell, Palette,
  Eye, EyeOff, Trash2, Lock, Settings as SettingsIcon,
  CreditCard, Sun, Moon, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Container from '@/components/ui/Container';
import type { PageProps } from '@/types';

// Validation schemas
const profileSchema = z.object({
  firstName: z.string().min(2, 'Min 2 caractères'),
  lastName: z.string().min(2, 'Min 2 caractères'),
  phone: z.string().regex(/^[\d\s+\-()]+$/, 'Format invalide'),
  email: z.string().email('Email invalide'),
  country: z.string().min(1, 'Requis'),
  city: z.string().min(1, 'Requis'),
  street: z.string().min(1, 'Requis'),
  houseNumber: z.string().min(1, 'Requis'),
  zip: z.string().min(1, 'Requis'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requis'),
  newPassword: z.string().min(7, 'Min 7 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 'Doit contenir maj, min, chiffre et symbole'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage({ className }: PageProps = {}) {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = 
    useForm<ProfileFormData>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        firstName: user?.name?.first || '',
        lastName: user?.name?.last || '',
        phone: user?.phone || '',
        email: user?.email || '',
        country: user?.address?.country || 'France',
        city: user?.address?.city || '',
        street: user?.address?.street || '',
        houseNumber: String(user?.address?.houseNumber || ''),
        zip: String(user?.address?.zip || ''),
      },
    });

  // Password form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset } = 
    useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const updatedUser = {
        name: { first: data.firstName, middle: '', last: data.lastName },
        phone: data.phone,
        email: data.email,
        address: {
          country: data.country,
          state: '',
          city: data.city,
          street: data.street,
          houseNumber: parseInt(data.houseNumber),
          zip: parseInt(data.zip),
        },
      };
      await apiClient.updateUser(user._id, updatedUser);
      updateProfile(updatedUser);
      toast.success('Profil mis à jour !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // API call would go here
      toast.success('Mot de passe modifié !');
      reset();
    } catch (error) {
      toast.error('Erreur lors du changement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await apiClient.deleteUser(user._id);
      logout();
      navigate('/');
      toast.success('Compte supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpgradeToBusiness = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await apiClient.changeBusinessStatus(user._id);
      updateProfile({ ...user, isBusiness: true });
      toast.success('Compte Business activé !');
    } catch (error) {
      toast.error('Erreur lors de la mise à niveau');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 py-8 ${className || ''}`}>
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
              <p className="text-gray-600 dark:text-gray-300">Gérez votre compte</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-4">
              <nav className="space-y-2">
                {[
                  { id: 'profile', icon: User, label: 'Profil' },
                  { id: 'security', icon: Shield, label: 'Sécurité' },
                  { id: 'preferences', icon: Palette, label: 'Préférences' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'preferences')}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-300">
                <div className="px-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Statut</p>
                  {user.isAdmin && (
                    <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Admin</span>
                    </div>
                  )}
                  {user.isBusiness ? (
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm font-medium">Business</span>
                    </div>
                  ) : (
                    <Button size="sm" fullWidth onClick={handleUpgradeToBusiness} leftIcon={<CreditCard className="w-4 h-4" />}>
                      Passer à Business
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informations Personnelles</h2>
                  <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input {...registerProfile('firstName')} label="Prénom *" error={profileErrors.firstName?.message} />
                      <Input {...registerProfile('lastName')} label="Nom *" error={profileErrors.lastName?.message} />
                      <Input {...registerProfile('phone')} type="tel" label="Téléphone *" error={profileErrors.phone?.message} />
                      <Input {...registerProfile('email')} type="email" label="Email *" error={profileErrors.email?.message} />
                      <Input {...registerProfile('country')} label="Pays *" error={profileErrors.country?.message} />
                      <Input {...registerProfile('city')} label="Ville *" error={profileErrors.city?.message} />
                      <Input {...registerProfile('street')} label="Rue *" error={profileErrors.street?.message} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input {...registerProfile('houseNumber')} label="N°" error={profileErrors.houseNumber?.message} />
                        <Input {...registerProfile('zip')} label="CP *" error={profileErrors.zip?.message} />
                      </div>
                    </div>
                    <Button type="submit" isLoading={isLoading} leftIcon={<Save />}>
                      Enregistrer
                    </Button>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sécurité</h2>
                  <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 mb-8">
                    <div className="relative">
                      <Input {...registerPassword('currentPassword')} 
                        type={showPassword.current ? 'text' : 'password'}
                        label="Mot de passe actuel"
                        error={passwordErrors.currentPassword?.message} />
                      <button type="button" onClick={() => setShowPassword(s => ({ ...s, current: !s.current }))}
                        className="absolute right-3 top-8 text-gray-400">
                        {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input {...registerPassword('newPassword')}
                        type={showPassword.new ? 'text' : 'password'}
                        label="Nouveau mot de passe"
                        error={passwordErrors.newPassword?.message} />
                      <button type="button" onClick={() => setShowPassword(s => ({ ...s, new: !s.new }))}
                        className="absolute right-3 top-8 text-gray-400">
                        {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input {...registerPassword('confirmPassword')}
                        type={showPassword.confirm ? 'text' : 'password'}
                        label="Confirmer"
                        error={passwordErrors.confirmPassword?.message} />
                      <button type="button" onClick={() => setShowPassword(s => ({ ...s, confirm: !s.confirm }))}
                        className="absolute right-3 top-8 text-gray-400">
                        {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <Button type="submit" isLoading={isLoading} leftIcon={<Lock />}>
                      Modifier le mot de passe
                    </Button>
                  </form>

                  <div className="pt-6 border-t border-gray-200 dark:border-dark-300">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">Zone dangereuse</h3>
                    <Button variant="outline" onClick={() => setShowDeleteModal(true)} leftIcon={<Trash2 />}
                      className="text-red-600 hover:text-red-700 border-red-300">
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Préférences</h2>
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Thème</h3>
                    <div className="flex space-x-4">
                      <button onClick={() => theme === 'dark' && toggleTheme()}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                          theme === 'light' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        <Sun className="w-4 h-4" />
                        <span>Clair</span>
                      </button>
                      <button onClick={() => theme === 'light' && toggleTheme()}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                          theme === 'dark' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        <Moon className="w-4 h-4" />
                        <span>Sombre</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Les paramètres de notifications seront bientôt disponibles.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-100 rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Supprimer le compte</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Cette action est irréversible. Toutes vos données seront perdues.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" fullWidth onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </Button>
                <Button fullWidth onClick={handleDeleteAccount} isLoading={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white">
                  Supprimer
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </Container>
    </div>
  );
}
