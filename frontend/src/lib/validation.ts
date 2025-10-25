import { z } from 'zod';

// Validation pour les noms
export const nameSchema = z.object({
  first: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(256, 'Le prénom ne peut pas dépasser 256 caractères'),
  middle: z.string()
    .max(256, 'Le deuxième prénom ne peut pas dépasser 256 caractères')
    .optional(),
  last: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(256, 'Le nom ne peut pas dépasser 256 caractères')
});

// Validation pour les adresses
export const addressSchema = z.object({
  country: z.string()
    .min(1, 'Le pays est obligatoire')
    .max(256, 'Le pays ne peut pas dépasser 256 caractères'),
  city: z.string()
    .min(1, 'La ville est obligatoire')
    .max(256, 'La ville ne peut pas dépasser 256 caractères'),
  street: z.string()
    .min(1, 'La rue est obligatoire')
    .max(256, 'La rue ne peut pas dépasser 256 caractères'),
  houseNumber: z.number()
    .min(1, 'Le numéro de maison doit être positif'),
  state: z.string()
    .max(256, 'L\'état ne peut pas dépasser 256 caractères')
    .optional(),
  zip: z.number().optional()
});

// Validation pour les images
export const imageSchema = z.object({
  url: z.string()
    .url('URL d\'image invalide')
    .regex(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i, 'L\'URL doit pointer vers une image valide'),
  alt: z.string()
    .max(256, 'Le texte alternatif ne peut pas dépasser 256 caractères')
    .default('Image')
});

// Validation pour l'inscription
export const registerSchema = z.object({
  name: nameSchema,
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est obligatoire'),
  password: z.string()
    .min(7, 'Le mot de passe doit contenir au moins 7 caractères')
    .max(20, 'Le mot de passe ne peut pas dépasser 20 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Le mot de passe doit contenir au moins : 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial'),
  phone: z.string()
    .regex(/^0[2-9]-\d{7}$/, 'Format: 0X-XXXXXXX (ex: 05-1234567)'),
  image: imageSchema.optional(),
  address: addressSchema,
  isBusiness: z.boolean().optional()
});

// Validation pour la connexion
export const loginSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est obligatoire'),
  password: z.string()
    .min(1, 'Le mot de passe est obligatoire')
});

// Validation pour les cartes
export const cardSchema = z.object({
  title: z.string()
    .min(2, 'Le titre doit contenir au moins 2 caractères')
    .max(256, 'Le titre ne peut pas dépasser 256 caractères'),
  subtitle: z.string()
    .min(2, 'Le sous-titre doit contenir au moins 2 caractères')
    .max(256, 'Le sous-titre ne peut pas dépasser 256 caractères'),
  description: z.string()
    .min(2, 'La description doit contenir au moins 2 caractères')
    .max(1024, 'La description ne peut pas dépasser 1024 caractères'),
  phone: z.string()
    .regex(/^0[2-9]-\d{7}$/, 'Format: 0X-XXXXXXX (ex: 05-1234567)'),
  email: z.string()
    .email('Format d\'email invalide'),
  web: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  image: imageSchema.optional(),
  address: addressSchema
});

// Validation pour la mise à jour du profil
export const updateProfileSchema = registerSchema.partial().omit({ password: true });

// Validation pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Le mot de passe actuel est obligatoire'),
  newPassword: z.string()
    .min(7, 'Le nouveau mot de passe doit contenir au moins 7 caractères')
    .max(20, 'Le nouveau mot de passe ne peut pas dépasser 20 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Le mot de passe doit contenir au moins : 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

// Validation pour la recherche
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'La recherche ne peut pas être vide')
    .max(100, 'La recherche ne peut pas dépasser 100 caractères'),
  category: z.enum(['technology', 'business', 'creative', 'health', 'education', 'other']).optional(),
  sortBy: z.enum(['createdAt', 'title', 'likes']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Types dérivés des schémas Zod
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;

// Fonction utilitaire pour valider des données
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erreur de validation inconnue'] };
  }
};

// Validation côté client pour les formulaires React Hook Form
export const getZodResolver = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown) => {
    const result = validateData(schema, data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    
    const errors: Record<string, { message: string }> = {};
    result.errors?.forEach(error => {
      // Extraire le chemin d'erreur de Zod pour React Hook Form
      errors.root = { message: error };
    });
    
    return { values: {}, errors };
  };
};
