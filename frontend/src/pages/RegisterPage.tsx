import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Phone,
  Building,
  UserPlus,
  ArrowLeft,
  Shield,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { PageProps } from '@/types';
import toast from 'react-hot-toast';

// Validation Schema with Zod
const registerSchema = z.object({
  name: z.object({
    first: z
      .string()
      .min(1, 'Le prénom est requis')
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom contient des caractères invalides'),
    middle: z
      .string()
      .max(50, 'Le deuxième prénom ne peut pas dépasser 50 caractères')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]*$/, 'Le deuxième prénom contient des caractères invalides')
      .optional(),
    last: z
      .string()
      .min(1, 'Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides')
  }),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères')
    .toLowerCase(),
  phone: z
    .string()
    .min(1, 'Le téléphone est requis')
    .regex(/^(?:\+33|0)[1-9](?:[0-9]{8})$/, 'Format de téléphone français invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
    .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/(?=.*[@$!%*?&])/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z
    .string()
    .min(1, 'La confirmation du mot de passe est requise'),
  isBusiness: z
    .boolean()
    .default(false),
  terms: z
    .boolean()
    .refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface PasswordStrengthIndicator {
  score: number;
  label: string;
  color: string;
}

export default function RegisterPage({ className }: PageProps = {}) {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    trigger
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      isBusiness: false,
      terms: false
    }
  });

  const watchPassword = watch('password', '');
  const watchIsBusiness = watch('isBusiness', false);

  const getPasswordStrength = (password: string): PasswordStrengthIndicator => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    const indicators: Record<number, PasswordStrengthIndicator> = {
      0: { score: 0, label: '', color: '' },
      1: { score: 1, label: 'Très faible', color: 'bg-red-500' },
      2: { score: 2, label: 'Faible', color: 'bg-orange-500' },
      3: { score: 3, label: 'Moyen', color: 'bg-yellow-500' },
      4: { score: 4, label: 'Fort', color: 'bg-blue-500' },
      5: { score: 5, label: 'Très fort', color: 'bg-green-500' }
    };

    return indicators[score] ?? indicators[0]!;
  };

  const passwordStrength = getPasswordStrength(watchPassword);

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    setIsLoading(true);
    clearErrors();

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        isBusiness: data.isBusiness,
        address: {
          street: '',
          houseNumber: 0,
          city: '',
          state: '',
          zip: 0,
          country: ''
        }
      });
      
      toast.success('Compte créé avec succès !');
      navigate('/login', { 
        state: { 
          message: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.' 
        }
      });
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      
      if (error instanceof Error) {
        const message = error.message;
        
        if (message.includes('email')) {
          setError('email', { 
            type: 'server', 
            message: 'Cet email est déjà utilisé' 
          });
        } else if (message.includes('phone')) {
          setError('phone', { 
            type: 'server', 
            message: 'Ce numéro de téléphone est déjà utilisé' 
          });
        } else {
          toast.error(message || 'Erreur lors de la création du compte');
        }
      } else {
        toast.error('Erreur inconnue lors de la création du compte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async (): Promise<void> => {
    const fieldsToValidate = currentStep === 1 
      ? ['name.first', 'name.last', 'email'] as const
      : ['phone', 'password', 'confirmPassword'] as const;
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = (): void => {
    setCurrentStep(1);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = (): void => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={`min-h-screen flex-center bg-gradient-hero dark:bg-gradient-to-br dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 py-12 px-4 sm:px-6 lg:px-8 ${className || ''}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-delay-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

          {/* Logo/Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full border border-primary-200 dark:border-primary-800 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Cardify
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-responsive-md font-bold text-gray-900 dark:text-white mb-2">
            Créer votre compte
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Rejoignez la communauté Cardify en quelques clics
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex-center text-sm font-semibold ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-300 text-gray-500'}`}>
                {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Informations</span>
            </div>
            <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300 dark:bg-dark-300'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex-center text-sm font-semibold ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-300 text-gray-500'}`}>
                2
              </div>
              <span className="text-sm font-medium">Sécurité</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-effect rounded-2xl p-8 shadow-cardify-xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        {...register('name.first')}
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="Jean"
                        className={`pl-10 ${errors.name?.first ? 'input-error' : ''}`}
                        disabled={isSubmitting || isLoading}
                      />
                    </div>
                    {errors.name?.first && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="error-message"
                      >
                        {errors.name.first.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom *
                    </label>
                    <Input
                      {...register('name.last')}
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Dupont"
                      className={`${errors.name?.last ? 'input-error' : ''}`}
                      disabled={isSubmitting || isLoading}
                    />
                    {errors.name?.last && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="error-message"
                      >
                        {errors.name.last.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      {...register('email')}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jean.dupont@email.com"
                      className={`pl-10 ${errors.email ? 'input-error' : ''}`}
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-message"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Type de compte
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-all ${!watchIsBusiness ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-300 hover:border-gray-300 dark:hover:border-dark-200'}`}>
                      <input
                        {...register('isBusiness')}
                        type="radio"
                        value="false"
                        className="sr-only"
                        onChange={() => register('isBusiness').onChange({ target: { name: 'isBusiness', value: false } })}
                      />
                      <div className="flex flex-col items-center text-center">
                        <User className="w-6 h-6 mb-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Personnel</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Pour un usage individuel</span>
                      </div>
                    </label>

                    <label className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-all ${watchIsBusiness ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-300 hover:border-gray-300 dark:hover:border-dark-200'}`}>
                      <input
                        {...register('isBusiness')}
                        type="radio"
                        value="true"
                        className="sr-only"
                        onChange={() => register('isBusiness').onChange({ target: { name: 'isBusiness', value: true } })}
                      />
                      <div className="flex flex-col items-center text-center">
                        <Building className="w-6 h-6 mb-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Business</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Pour les entreprises</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Next Button */}
                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full"
                >
                  Continuer
                </Button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de téléphone *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      {...register('phone')}
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="06 12 34 56 78"
                      className={`pl-10 ${errors.phone ? 'input-error' : ''}`}
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-message"
                    >
                      {errors.phone.message}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Votre mot de passe"
                      className={`pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                      disabled={isSubmitting || isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isSubmitting || isLoading}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {watchPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Force du mot de passe</span>
                        <span className={`text-xs font-medium ${passwordStrength.score >= 4 ? 'text-green-600 dark:text-green-400' : passwordStrength.score >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color} ${
                            passwordStrength.score === 1 ? 'w-[20%]' :
                            passwordStrength.score === 2 ? 'w-[40%]' :
                            passwordStrength.score === 3 ? 'w-[60%]' :
                            passwordStrength.score === 4 ? 'w-[80%]' :
                            passwordStrength.score === 5 ? 'w-full' : 'w-0'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-message"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      {...register('confirmPassword')}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Confirmer votre mot de passe"
                      className={`pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                      disabled={isSubmitting || isLoading}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isSubmitting || isLoading}
                      aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-message"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      {...register('terms')}
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 dark:border-dark-300 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
                      disabled={isSubmitting || isLoading}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      J'accepte les{' '}
                      <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                        conditions d'utilisation
                      </Link>
                      {' '}et la{' '}
                      <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                        politique de confidentialité
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-message"
                    >
                      {errors.terms.message}
                    </motion.p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                    disabled={isSubmitting || isLoading}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="flex-1"
                    leftIcon={<UserPlus className="w-5 h-5" />}
                  >
                    {isSubmitting || isLoading ? 'Création...' : 'Créer le compte'}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          {currentStep === 1 && (
            <>
              {/* Divider */}
              <div className="mt-8 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t divider" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-dark-100 text-gray-500 dark:text-gray-400">
                      Déjà un compte ?
                    </span>
                  </div>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </>
          )}
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-6"
        >
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Données protégées avec chiffrement SSL 256-bit</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
