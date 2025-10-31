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
  imageUrl?: string; // Legacy field for form compatibility
  imageAlt?: string; // Legacy field for form compatibility
  address: {
    country: string;
    city: string;
    street: string;
    houseNumber: number;
    state?: string;
    zip: number;
  };
  bizNumber: number;
  likes: string[]; // User IDs who liked this card
  user_id: string | User;
  createdAt: string;
  updatedAt?: string; // Optional, may not be present from backend
}

// Types pour l'authentification
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
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
    zip?: number;
  };
  isBusiness?: boolean;
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
  houseNumber: number;
  zip: number;
  imageUrl?: string;
  imageAlt?: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  token?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
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

// Types pour les erreurs
export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}
