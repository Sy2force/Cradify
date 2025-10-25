import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError, User, Card, LoginForm, RegisterForm, CardForm } from './types';

// Configuration de base d'Axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token automatiquement
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les réponses d'erreur
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expiré, déconnecter l'utilisateur
          this.clearToken();
          localStorage.removeItem('cardify_token');
          localStorage.removeItem('cardify_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Récupérer le token du localStorage au démarrage
    this.token = localStorage.getItem('cardify_token');
  }

  // Gestion du token
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('cardify_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('cardify_token');
    localStorage.removeItem('cardify_user');
  }

  getToken(): string | null {
    return this.token;
  }

  // Méthode générique pour les requêtes
  private async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client[method](url, data, config);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiError } };
        if (axiosError.response?.data) {
          throw axiosError.response.data;
        }
      }
      throw {
        success: false,
        message: 'Erreur de connexion au serveur'
      } as ApiError;
    }
  }

  // === AUTHENTIFICATION ===
  
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ success: boolean; message: string; user: User; token: string }>(
      'post',
      '/users/login',
      credentials
    );
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return {
      success: response.success,
      message: response.message,
      data: {
        user: response.user,
        token: response.token
      }
    };
  }

  async register(userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ success: boolean; message: string; user: User; token: string }>(
      'post',
      '/users/register',
      userData
    );
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return {
      success: response.success,
      message: response.message,
      data: {
        user: response.user,
        token: response.token
      }
    };
  }

  logout(): void {
    this.clearToken();
  }

  // === UTILISATEURS ===

  async getAllUsers(): Promise<ApiResponse<{ users: User[]; count: number }>> {
    return this.makeRequest('get', '/users');
  }

  async getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest('get', `/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest('put', `/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.makeRequest('delete', `/users/${id}`);
  }

  async changeBusinessStatus(id: string): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest('patch', `/users/${id}`);
  }

  // === CARTES ===

  async getAllCards(): Promise<ApiResponse<{ cards: Card[]; count: number }>> {
    const response = await this.makeRequest<{ success: boolean; message: string; cards: Card[]; totalCount?: number; count?: number }>('get', '/cards');
    return {
      success: response.success,
      message: response.message || 'Cartes récupérées avec succès',
      data: {
        cards: response.cards || [],
        count: response.totalCount || response.count || 0
      }
    };
  }

  async getCardById(id: string): Promise<ApiResponse<{ card: Card }>> {
    return this.makeRequest('get', `/cards/${id}`);
  }

  async getMyCards(): Promise<ApiResponse<{ cards: Card[]; count: number }>> {
    const response = await this.makeRequest<{ success: boolean; message: string; cards: Card[]; totalCount?: number; count?: number }>('get', '/cards/my-cards');
    return {
      success: response.success,
      message: response.message || 'Mes cartes récupérées avec succès',
      data: {
        cards: response.cards || [],
        count: response.count || 0
      }
    };
  }

  async createCard(cardData: CardForm): Promise<ApiResponse<{ card: Card }>> {
    return this.makeRequest('post', '/cards', cardData);
  }

  async updateCard(id: string, cardData: Partial<CardForm>): Promise<ApiResponse<{ card: Card }>> {
    return this.makeRequest('put', `/cards/${id}`, cardData);
  }

  async deleteCard(id: string): Promise<ApiResponse> {
    return this.makeRequest('delete', `/cards/${id}`);
  }

  async likeCard(id: string): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> {
    return this.makeRequest('patch', `/cards/${id}`);
  }

  // === RECHERCHE ET FILTRES ===

  async searchCards(query: string): Promise<ApiResponse<{ cards: Card[]; count: number }>> {
    return this.makeRequest('get', `/cards?search=${encodeURIComponent(query)}`);
  }

  // === STATISTIQUES ===

  async getStats(): Promise<ApiResponse<{ 
    totalUsers: number; 
    totalCards: number; 
    businessUsers: number; 
  }>> {
    return this.makeRequest('get', '/stats');
  }
}

// Instance unique de l'API client
export const apiClient = new ApiClient();

// Export des méthodes individuelles pour plus de commodité
export const {
  login,
  register,
  logout,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeBusinessStatus,
  getAllCards,
  getCardById,
  getMyCards,
  createCard,
  updateCard,
  deleteCard,
  likeCard,
  searchCards,
  getStats,
  setToken,
  clearToken,
  getToken
} = apiClient;

export default apiClient;
