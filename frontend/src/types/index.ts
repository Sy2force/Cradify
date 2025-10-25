// Types pour l'API Cardify Backend
export interface User {
  _id: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  email: string;
  phone: string;
  image?: {
    url: string;
    alt: string;
  };
  address: {
    country: string;
    city: string;
    street: string;
    houseNumber: number;
    state?: string;
    zip: number;
  };
  isBusiness: boolean;
  isAdmin: boolean;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended';
  cardsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  phone: string;
  email: string;
  web?: string;
  image?: {
    url: string;
    alt: string;
  };
  address: {
    country: string;
    city: string;
    street: string;
    houseNumber: number;
    state?: string;
    zip: number;
  };
  bizNumber: number;
  likes: string[];
  user_id: string | User;
  createdAt: string;
  updatedAt: string;
}

// Types pour l'authentification
export interface AuthUser {
  _id: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  email: string;
  phone: string;
  image?: {
    url: string;
    alt: string;
  };
  address: {
    country: string;
    city: string;
    street: string;
    houseNumber: number;
    state?: string;
    zip: number;
  };
  isBusiness: boolean;
  isAdmin: boolean;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended';
  cardsCount?: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isBusiness: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => Promise<void>;
  updateProfile: (userData: Partial<AuthUser>) => void;
}

// Types pour les formulaires
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  email: string;
  password: string;
  phone: string;
  image?: {
    url: string;
    alt: string;
  };
  address: {
    country: string;
    city: string;
    street: string;
    houseNumber: number;
    state?: string;
    zip: number;
  };
  isBusiness: boolean;
}

export interface CardFormData {
  title: string;
  subtitle: string;
  description: string;
  phone: string;
  email: string;
  web?: string;
  country: string;
  state?: string;
  city: string;
  street: string;
  houseNumber: string;
  zip: string;
  imageUrl?: string;
  imageAlt?: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  token: string;
}

export interface CardsResponse {
  success: boolean;
  count: number;
  cards: Card[];
}

export interface CardResponse {
  success: boolean;
  message?: string;
  card: Card;
}

export interface UsersResponse {
  success: boolean;
  count: number;
  users: User[];
}

// Types pour les thèmes
export type Theme = 'light' | 'dark' | 'system';

// Types pour les erreurs
export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

// Types pour les composants UI
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export interface CardProps {
  card: Card;
  className?: string;
  showActions?: boolean;
  onLike?: (cardId: string) => void;
  onEdit?: (cardId: string) => void;
  onDelete?: (cardId: string) => void;
}

// Types pour les hooks
export interface UseDebounceOptions {
  delay: number;
}

// Types pour les formulaires étendus
export interface RegisterFormData {
  first: string;
  middle?: string;
  last: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  state?: string;
  city: string;
  street: string;
  houseNumber: string;
  zip: string;
  isBusiness: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

export interface ProfileFormData {
  first: string;
  middle?: string;
  last: string;
  email: string;
  phone: string;
  country: string;
  state?: string;
  city: string;
  street: string;
  houseNumber: string;
  zip: string;
  imageUrl?: string;
  imageAlt?: string;
}

// Types pour les pages
export interface PageProps {
  className?: string;
}

// Types pour les contextes
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
}

// Types pour les filtres et tri
export type SortOption = 'newest' | 'oldest' | 'title' | 'likes';
export type ViewMode = 'grid' | 'list';

export interface FilterOptions {
  search: string;
  sort: SortOption;
  viewMode: ViewMode;
}

// Types pour les événements
export type FormEvent = React.FormEvent<HTMLFormElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type ClickEvent = React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>;
export type KeyboardEvent = React.KeyboardEvent<HTMLElement>;
