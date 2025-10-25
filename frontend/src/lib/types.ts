// Types pour les utilisateurs
export interface Name {
  first: string;
  middle?: string;
  last: string;
}

export interface Address {
  country: string;
  city: string;
  street: string;
  houseNumber: number;
  state?: string;
  zip?: number;
}

export interface Image {
  url: string;
  alt: string;
}

export interface User {
  _id: string;
  name: Name;
  email: string;
  phone: string;
  image: Image;
  address: Address;
  isBusiness: boolean;
  isAdmin: boolean;
  role?: UserRole | string;
  cardsCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Types pour les cartes
export interface Card {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  phone: string;
  email: string;
  web?: string;
  image: Image;
  address: Address;
  bizNumber: number;
  likes: string[];
  user_id: string | User;
  createdAt: string;
  updatedAt: string;
}

// Types pour les formulaires
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: Name;
  email: string;
  password: string;
  phone: string;
  image?: Image;
  address: Address;
  isBusiness?: boolean;
}

export interface CardForm {
  title: string;
  subtitle: string;
  description: string;
  phone: string;
  email: string;
  web?: string;
  image?: Image;
  address: Address;
}

// Types pour les réponses API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: User;
  card?: Card;
  cards?: Card[];
  users?: User[];
  count?: number;
}

// Types pour les erreurs
export interface ApiError {
  success: false;
  message: string;
  details?: string[];
  error?: string;
}

// Types pour l'authentification
export interface AuthUser {
  _id: string;
  name: Name;
  email: string;
  phone: string;
  image: Image;
  address: Address;
  isBusiness: boolean;
  isAdmin: boolean;
  role?: UserRole | string;
  cardsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContext {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isBusiness: boolean;
  error: string | null;
  updateProfile: (userData: Partial<User>) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// Types pour le thème
export type Theme = 'light' | 'dark';

export interface ThemeContext {
  theme: Theme;
  toggleTheme: () => void;
}

// Types pour les statistiques
export interface Stats {
  totalUsers: number;
  totalCards: number;
  totalLikes: number;
  businessUsers: number;
}

// Enums utiles
export enum UserRole {
  USER = 'user',
  BUSINESS = 'business',
  ADMIN = 'admin'
}

export enum CardCategory {
  TECHNOLOGY = 'technology',
  BUSINESS = 'business',
  CREATIVE = 'creative',
  HEALTH = 'health',
  EDUCATION = 'education',
  OTHER = 'other'
}

// Types pour les filtres et recherche
export interface CardFilters {
  search?: string;
  category?: CardCategory;
  sortBy?: 'createdAt' | 'title' | 'likes';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
