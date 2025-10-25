import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CreditCard, 
  Save, 
  ArrowLeft, 
  Upload, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  User,
  Image as ImageIcon,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cardService } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card as CardType, PageProps } from '@/types';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

// Schema de validation Zod
const cardSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .min(2, 'Le titre doit contenir au moins 2 caractères')
    .max(256, 'Le titre ne peut pas dépasser 256 caractères'),
  subtitle: z
    .string()
    .min(1, 'Le sous-titre est requis')
    .min(2, 'Le sous-titre doit contenir au moins 2 caractères')
    .max(256, 'Le sous-titre ne peut pas dépasser 256 caractères'),
  description: z
    .string()
    .min(1, 'La description est requise')
    .min(2, 'La description doit contenir au moins 2 caractères')
    .max(1024, 'La description ne peut pas dépasser 1024 caractères'),
  phone: z
    .string()
    .min(1, 'Le téléphone est requis')
    .regex(/^[\d\s+\-()]+$/, 'Format de téléphone invalide'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  web: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), 'L\'URL doit commencer par http:// ou https://'),
  // Address fields
  country: z.string().min(1, 'Le pays est requis'),
  state: z.string().optional(),
  city: z.string().min(1, 'La ville est requise'),
  street: z.string().min(1, 'L\'adresse est requise'),
  houseNumber: z.string().min(1, 'Le numéro est requis'),
  zip: z.string().min(1, 'Le code postal est requis'),
});

type CardFormData = z.infer<typeof cardSchema>;

export default function CreateCardPage({ className }: PageProps = {}) {
  const { user, isBusiness } = useAuth();
  const navigate = useNavigate();
  const { cardId } = useParams();
  const isEditing = Boolean(cardId);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [altPreview, setAltPreview] = useState<string>('');
  const [, setExistingCard] = useState<CardType | null>(null);

  // Redirect if not business user
  useEffect(() => {
    if (user && !isBusiness) {
      navigate('/cards');
      toast.error('Vous devez avoir un compte Business pour créer des cartes');
    }
  }, [user, isBusiness, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      country: 'France',
      web: '',
    },
  });

  const watchedFields = watch();

  // Load existing card if editing
  useEffect(() => {
    if (isEditing && cardId && user && isBusiness) {
      loadExistingCard();
    }
  }, [isEditing, cardId, user, isBusiness]);

  const loadExistingCard = async () => {
    if (!cardId) return;
    
    try {
      setIsLoading(true);
      const existingCard = await cardService.getCardById(cardId);
      
      // Check if user owns this card
      if (existingCard.user_id !== user!._id) {
        navigate('/my-cards');
        toast.error('Vous ne pouvez pas modifier cette carte');
        return;
      }
      
      setExistingCard(existingCard);
      
      // Populate form with existing data
      setValue('title', existingCard.title);
      setValue('subtitle', existingCard.subtitle);
      setValue('description', existingCard.description);
      setValue('phone', existingCard.phone);
      setValue('email', existingCard.email);
      setValue('web', existingCard.web || '');
      setValue('country', existingCard.address.country);
      setValue('state', existingCard.address.state || '');
      setValue('city', existingCard.address.city);
      setValue('street', existingCard.address.street);
      setValue('houseNumber', String(existingCard.address.houseNumber));
      setValue('zip', String(existingCard.address.zip));
      
      // Set existing images
      if (existingCard.image?.url) {
        setImagePreview(existingCard.image.url);
      }
      if (existingCard.image?.alt) {
        setAltPreview(existingCard.image.alt);
      }
      
    } catch (error) {
      toast.error(getErrorMessage(error));
      navigate('/my-cards');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'alt') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne peut pas dépasser 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    if (type === 'main') {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        setAltPreview('');
        reader.readAsDataURL(file);
      } else {
        setImagePreview('');
        setAltPreview('');
      }
    } else {
      setAltPreview(URL.createObjectURL(file));
    }
  };

  // Remove image
  const removeImage = (type: 'main' | 'alt') => {
    if (type === 'main') {
      setImagePreview('');
    } else {
      setAltPreview('');
    }
  };

  // Submit form
  const onSubmit = async (data: CardFormData) => {
    try {
      setIsSaving(true);

      const cardData = {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        phone: data.phone,
        email: data.email,
        web: data.web || undefined,
        address: {
          country: data.country,
          state: data.state || '',
          city: data.city,
          street: data.street,
          houseNumber: parseInt(data.houseNumber),
          zip: parseInt(data.zip),
        },
      };

      if (isEditing && cardId) {
        await cardService.updateCard(cardId, cardData);
        toast.success('Carte mise à jour avec succès !');
      } else {
        await cardService.createCard(cardData);
        toast.success('Carte créée avec succès !');
      }

      // Note: Image upload functionality would be implemented here
      // For now, images are handled as preview URLs
      // Future implementation would use imageFile and altFile for actual uploads

      navigate('/my-cards');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render if not business user
  if (!user || !isBusiness) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 ${className || ''}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft />}
            onClick={() => navigate('/my-cards')}
            className="mb-4"
          >
            Retour à mes cartes
          </Button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Modifier la Carte' : 'Créer une Carte'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {isEditing 
                  ? 'Modifiez les informations de votre carte de visite'
                  : 'Créez votre nouvelle carte de visite professionnelle'
                }
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informations de Base
                  </h3>
                </div>

                <div className="space-y-4">
                  <Input
                    {...register('title')}
                    label="Titre / Nom *"
                    placeholder="Jean Dupont"
                    error={errors.title?.message}
                    disabled={isSaving}
                  />

                  <Input
                    {...register('subtitle')}
                    label="Sous-titre / Fonction *"
                    placeholder="Développeur Full Stack"
                    error={errors.subtitle?.message}
                    disabled={isSaving}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <textarea
                      {...register('description')}
                      placeholder="Développeur passionné avec 5 ans d'expérience..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      disabled={isSaving}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.description.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {watchedFields.description?.length || 0}/1024 caractères
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Phone className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contact
                  </h3>
                </div>

                <div className="space-y-4">
                  <Input
                    {...register('phone')}
                    type="tel"
                    label="Téléphone *"
                    placeholder="+33 1 23 45 67 89"
                    leftIcon={<Phone size={20} />}
                    error={errors.phone?.message}
                    disabled={isSaving}
                  />

                  <Input
                    {...register('email')}
                    type="email"
                    label="Email *"
                    placeholder="jean.dupont@example.com"
                    leftIcon={<Mail size={20} />}
                    error={errors.email?.message}
                    disabled={isSaving}
                  />

                  <Input
                    {...register('web')}
                    type="url"
                    label="Site Web"
                    placeholder="https://www.monsite.com"
                    leftIcon={<Globe size={20} />}
                    error={errors.web?.message}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Adresse
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      {...register('country')}
                      label="Pays *"
                      placeholder="France"
                      error={errors.country?.message}
                      disabled={isSaving}
                    />
                    <Input
                      {...register('state')}
                      label="Région/État"
                      placeholder="Île-de-France"
                      error={errors.state?.message}
                      disabled={isSaving}
                    />
                  </div>

                  <Input
                    {...register('city')}
                    label="Ville *"
                    placeholder="Paris"
                    error={errors.city?.message}
                    disabled={isSaving}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input
                        {...register('street')}
                        label="Rue *"
                        placeholder="Avenue des Champs-Élysées"
                        error={errors.street?.message}
                        disabled={isSaving}
                      />
                    </div>
                    <Input
                      {...register('houseNumber')}
                      label="Numéro *"
                      placeholder="123"
                      error={errors.houseNumber?.message}
                      disabled={isSaving}
                    />
                  </div>

                  <Input
                    {...register('zip')}
                    label="Code Postal *"
                    placeholder="75008"
                    error={errors.zip?.message}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Images (Optionnel)
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Principale
                    </label>
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-dark-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('main')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          disabled={isSaving}
                          title="Supprimer l'image"
                          aria-label="Supprimer l'image principale"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 dark:border-dark-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Cliquez pour sélectionner une image
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            PNG, JPG jusqu'à 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'main')}
                            className="sr-only"
                            disabled={isSaving}
                            title="Sélectionner une image principale"
                            aria-label="Sélectionner une image principale"
                          />
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Alt Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Alternative
                    </label>
                    {altPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={altPreview}
                          alt="Aperçu alternatif"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-dark-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('alt')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          disabled={isSaving}
                          title="Supprimer l'image alternative"
                          aria-label="Supprimer l'image alternative"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 dark:border-dark-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Cliquez pour sélectionner une image
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            PNG, JPG jusqu'à 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'alt')}
                            className="sr-only"
                            disabled={isSaving}
                            title="Sélectionner une image alternative"
                            aria-label="Sélectionner une image alternative"
                          />
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={isSaving}
                disabled={isSaving}
                leftIcon={!isSaving ? <Save /> : undefined}
              >
                {isSaving 
                  ? (isEditing ? 'Mise à jour...' : 'Création...') 
                  : (isEditing ? 'Mettre à Jour' : 'Créer la Carte')
                }
              </Button>
            </form>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:sticky lg:top-8 lg:self-start"
          >
            <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Aperçu
                </h3>
              </div>

              {/* Card Preview */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-dark-200 dark:to-dark-300 rounded-xl p-6 border border-gray-200 dark:border-dark-400">
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {watchedFields.title || 'Titre de la carte'}
                  </h4>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {watchedFields.subtitle || 'Fonction/Sous-titre'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {watchedFields.description || 'Description de la carte...'}
                  </p>

                  <div className="pt-3 border-t border-gray-200 dark:border-dark-400 space-y-1">
                    {watchedFields.phone && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Phone size={12} />
                        <span>{watchedFields.phone}</span>
                      </div>
                    )}
                    {watchedFields.email && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Mail size={12} />
                        <span>{watchedFields.email}</span>
                      </div>
                    )}
                    {watchedFields.web && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Globe size={12} />
                        <span>{watchedFields.web}</span>
                      </div>
                    )}
                    {(watchedFields.city || watchedFields.country) && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={12} />
                        <span>
                          {[watchedFields.city, watchedFields.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Conseils :</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Utilisez un titre accrocheur et professionnel</li>
                      <li>Décrivez clairement vos compétences</li>
                      <li>Ajoutez une image de qualité</li>
                      <li>Vérifiez vos informations de contact</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
