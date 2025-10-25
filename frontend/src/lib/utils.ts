import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const errorWithMessage = error as { message: string };
    return errorWithMessage.message;
  }
  return 'Une erreur inattendue est survenue';
}

export function formatFullName(name: { first: string; middle?: string; last: string } | string, middleName?: string, lastName?: string): string {
  if (typeof name === 'object') {
    const parts = [name.first, name.middle, name.last].filter(Boolean);
    return parts.join(' ');
  } else {
    const parts = [name, middleName, lastName].filter(Boolean);
    return parts.join(' ');
  }
}

export function getRandomGradient(index: number): string {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-400 to-blue-500', 
    'from-purple-400 to-pink-400',
    'from-yellow-400 to-red-500',
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-500',
    'from-teal-400 to-blue-500',
    'from-orange-400 to-pink-500'
  ];
  
  return gradients[index % gradients.length] || gradients[0]!;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Support French phone numbers (10 digits starting with 0)
  const frenchPhoneRegex = /^0[1-9](?:[0-9]{8})$/;
  // Support international format (+33...)
  const internationalPhoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
  
  const cleanPhone = phone.replace(/\s+/g, '');
  return frenchPhoneRegex.test(cleanPhone) || internationalPhoneRegex.test(cleanPhone);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Utilitaires pour la gestion des erreurs
export function isAxiosError(error: unknown): error is { response?: { data?: { message?: string } } } {
  return error !== null && typeof error === 'object' && 'response' in error;
}

// Formatage des numéros de téléphone
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('33')) {
    const withoutCountryCode = '0' + cleaned.substring(2);
    return withoutCountryCode.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

// Validation de mots de passe forts
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utilitaire pour créer des URLs sécurisées
export function createSafeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsedUrl.href;
  } catch {
    return '#';
  }
}

// Capitaliser la première lettre
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Formater une taille de fichier
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getAvatarUrl(name: { first: string; last: string } | string): string {
  if (typeof name === 'string') {
    const parts = name.split(' ').filter(Boolean);
    const initials = parts.length > 1 ? `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}` : name.substring(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff`;
  }
  const initials = `${name.first[0] ?? ''}${name.last[0] ?? ''}`;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff`;
}
