/**
 * Application constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CARDS: '/cards',
  CREATE_CARD: '/cards/create',
  EDIT_CARD: '/cards/edit',
  CARD_DETAIL: '/cards',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'cardify_token',
  USER: 'cardify_user',
  THEME: 'cardify_theme',
  LANGUAGE: 'cardify_language',
} as const;

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[0-9\-\s()]{8,15}$/,
  ZIP_REGEX: /^\d{4,6}$/,
  PASSWORD_MIN_LENGTH: 7,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// UI Constants
export const UI = {
  CARD_GRID_BREAKPOINTS: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
  AUTO_SAVE_DELAY: 2000,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion réseau',
  UNAUTHORIZED: 'Accès non autorisé',
  FORBIDDEN: 'Action non autorisée',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Données invalides',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie !',
  REGISTER_SUCCESS: 'Inscription réussie !',
  PROFILE_UPDATE: 'Profil mis à jour avec succès',
  CARD_CREATED: 'Carte créée avec succès',
  CARD_UPDATED: 'Carte mise à jour avec succès',
  CARD_DELETED: 'Carte supprimée avec succès',
} as const;
