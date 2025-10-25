import axios, { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { Card, User, LoginData, RegisterData, CardsResponse, LoginResponse, RegisterResponse, UsersResponse, CardResponse } from '@/types';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cardify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Utilisation du header x-auth-token comme attendu par le backend
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Une erreur est survenue';
    
    // Gestion spéciale pour les erreurs d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem('cardify_token');
      localStorage.removeItem('cardify_user');
      
      // Rediriger vers login sauf si on est déjà sur les pages publiques
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      
      toast.error('Session expirée, veuillez vous reconnecter');
    } else if (error.response?.status === 403) {
      toast.error('Accès non autorisé');
    } else if (error.response?.status === 429) {
      toast.error('Trop de tentatives, veuillez patienter');
    } else if (error.response?.status >= 500) {
      toast.error('Erreur serveur, veuillez réessayer plus tard');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  // Connexion utilisateur
  async login(loginData: LoginData): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await api.post('/users/login', loginData);
      
      if (response.data.success && response.data.token) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('cardify_token', response.data.token);
        localStorage.setItem('cardify_user', JSON.stringify(response.data.user));
        toast.success('Connexion réussie !');
      }
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la connexion');
    }
  },

  // Inscription utilisateur
  async register(registerData: RegisterData): Promise<RegisterResponse> {
    try {
      const response: AxiosResponse<RegisterResponse> = await api.post('/users/register', registerData);
      
      if (response.data.success && response.data.token) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('cardify_token', response.data.token);
        localStorage.setItem('cardify_user', JSON.stringify(response.data.user));
        toast.success('Inscription réussie !');
      }
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  // Déconnexion
  logout(): void {
    localStorage.removeItem('cardify_token');
    localStorage.removeItem('cardify_user');
    toast.success('Déconnexion réussie');
  },

  // Récupérer les infos utilisateur stockées
  getCurrentUser(): User | null {
    try {
      const userString = localStorage.getItem('cardify_user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error);
      return null;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    try {
      return !!localStorage.getItem('cardify_token');
    } catch {
      return false;
    }
  },
};

// Services utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs (Admin uniquement)
  async getAllUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<UsersResponse> = await api.get('/users');
      return response.data.users;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  },

  // Récupérer un utilisateur par ID
  async getUserById(id: string): Promise<User> {
    try {
      const response: AxiosResponse<{ user: User }> = await api.get(`/users/${id}`);
      return response.data.user;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur');
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.put(`/users/${id}`, userData);
      toast.success('Profil mis à jour avec succès');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  },

  // Changer le statut business
  async toggleBusinessStatus(id: string): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.patch(`/users/${id}`);
      toast.success('Statut business modifié');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  },

  // Supprimer un utilisateur
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Utilisateur supprimé');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la suppression');
    }
  },

  // Mettre à jour le profil (méthode spécifique pour ProfilePage)
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('Utilisateur non connecté');
      
      const response: AxiosResponse<{ user: User }> = await api.put(`/users/${currentUser._id}`, profileData);
      
      // Mettre à jour les données utilisateur en localStorage
      localStorage.setItem('cardify_user', JSON.stringify(response.data.user));
      toast.success('Profil mis à jour avec succès');
      
      return response.data.user;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  },

  // Changer le mot de passe
  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await api.patch('/users/change-password', passwordData);
      toast.success('Mot de passe mis à jour avec succès');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  },
};

// Services cartes
export const cardService = {
  // Récupérer toutes les cartes (public)
  async getAllCards(): Promise<Card[]> {
    try {
      const response: AxiosResponse<CardsResponse> = await api.get('/cards');
      return response.data.cards;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des cartes');
    }
  },

  // Récupérer une carte par ID (public)
  async getCardById(id: string): Promise<Card> {
    try {
      const response: AxiosResponse<Card> = await api.get(`/cards/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération de la carte');
    }
  },

  // Récupérer mes cartes (authentifié)
  async getMyCards(): Promise<Card[]> {
    try {
      const response: AxiosResponse<CardsResponse> = await api.get('/cards/my-cards');
      return response.data.cards || (response.data as unknown as Card[]);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération de vos cartes');
    }
  },

  // Créer une carte (Business uniquement)
  async createCard(cardData: Partial<Card>): Promise<Card> {
    try {
      const response: AxiosResponse<CardResponse> = await api.post('/cards', cardData);
      toast.success('Carte créée avec succès !');
      return response.data.card;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création de la carte');
    }
  },

  // Mettre à jour une carte
  async updateCard(id: string, cardData: Partial<Card>): Promise<Card> {
    try {
      const response: AxiosResponse<Card> = await api.put(`/cards/${id}`, cardData);
      toast.success('Carte mise à jour avec succès');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour de la carte');
    }
  },

  // Liker/Disliker une carte
  async toggleLike(id: string): Promise<Card> {
    try {
      const response: AxiosResponse<{ card: Card; message: string }> = await api.patch(`/cards/${id}`);
      
      // Afficher un message selon l'action
      if (response.data.message?.includes('likée')) {
        toast.success('Carte likée !', { icon: '❤️' });
      } else {
        toast.success('Like retiré', { icon: '💔' });
      }
      
      return response.data.card;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors du like');
    }
  },

  // Supprimer une carte
  async deleteCard(id: string): Promise<void> {
    try {
      await api.delete(`/cards/${id}`);
      toast.success('Carte supprimée avec succès');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la suppression de la carte');
    }
  },

  // Upload d'image de carte (placeholder pour l'instant)
  async uploadCardImage(file: File): Promise<string> {
    try {
      // Pour l'instant, on utilise un object URL comme placeholder
      // Dans une vraie implémentation, on uploaderait vers un service de stockage
      return URL.createObjectURL(file);
    } catch (error: unknown) {
      throw new Error('Erreur lors de l\'upload de l\'image');
    }
  }
};

// Export de l'instance axios pour les besoins avancés
export { api };

// Helper pour les uploads d'images (optionnel, pour plus tard)
export const uploadService = {
  // Placeholder pour l'upload d'images
  async uploadImage(): Promise<string> {
    // Pour l'instant, on utilise des images placeholder
    // Cette fonction peut être étendue avec un service comme Cloudinary
    return 'https://via.placeholder.com/300x200';
  },
};
