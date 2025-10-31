import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Card, 
  LoginData, 
  RegisterData, 
  CardFormData,
  LoginResponse,
  RegisterResponse,
  CardsResponse,
  CardResponse
} from '../types';
import { globalCache } from '../hooks/useCache';

import { API_CONFIG } from '../shared/constants';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_CONFIG.TIMEOUT,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('cardify_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials: LoginData): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response: AxiosResponse<RegisterResponse> = await this.api.post('/users/register', userData);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<{ success: boolean; user: User }> = await this.api.get('/auth/me');
    return response.data.user;
  }

  async updateProfile(userId: string, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<{ success: boolean; user: User }> = await this.api.put(`/users/${userId}`, userData);
    // Cache updated user profile
    globalCache.set('user-profile', response.data.user, 10 * 60 * 1000); // 10 minutes
    return response.data.user;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    this.clearAuth();
  }

  // Cards methods
  async getCards(): Promise<Card[]> {
    // Check cache first
    const cacheKey = 'cards-list';
    const cachedCards = globalCache.get<Card[]>(cacheKey);
    if (cachedCards) {
      return cachedCards;
    }

    const response: AxiosResponse<CardsResponse> = await this.api.get('/cards');
    // Cache for 2 minutes
    globalCache.set(cacheKey, response.data.cards, 2 * 60 * 1000);
    return response.data.cards;
  }

  async getCardById(cardId: string): Promise<Card> {
    // Check cache first
    const cacheKey = `card-${cardId}`;
    const cachedCard = globalCache.get<Card>(cacheKey);
    if (cachedCard) {
      return cachedCard;
    }

    const response: AxiosResponse<CardResponse> = await this.api.get(`/cards/${cardId}`);
    // Cache for 5 minutes
    globalCache.set(cacheKey, response.data.card, 5 * 60 * 1000);
    return response.data.card;
  }

  async getCard(cardId: string): Promise<Card> {
    return this.getCardById(cardId);
  }

  async createCard(cardData: CardFormData): Promise<Card> {
    const formattedData = {
      title: cardData.title,
      subtitle: cardData.subtitle,
      description: cardData.description,
      phone: cardData.phone,
      email: cardData.email,
      web: cardData.web,
      image: cardData.imageUrl ? {
        url: cardData.imageUrl,
        alt: cardData.imageAlt || cardData.title
      } : undefined,
      address: {
        country: cardData.country,
        city: cardData.city,
        street: cardData.street,
        houseNumber: cardData.houseNumber,
        state: cardData.state,
        zip: cardData.zip
      }
    };

    const response: AxiosResponse<CardResponse> = await this.api.post('/cards', formattedData);
    // Invalidate cards list cache
    globalCache.delete('cards-list');
    return response.data.card;
  }

  async updateCard(cardId: string, cardData: Partial<CardFormData>): Promise<Card> {
    const formattedData = {
      ...cardData,
      image: cardData.imageUrl ? {
        url: cardData.imageUrl,
        alt: cardData.imageAlt || cardData.title
      } : undefined,
      address: cardData.country ? {
        country: cardData.country,
        city: cardData.city,
        street: cardData.street,
        houseNumber: cardData.houseNumber,
        state: cardData.state,
        zip: cardData.zip
      } : undefined
    };

    const response: AxiosResponse<CardResponse> = await this.api.put(`/cards/${cardId}`, formattedData);
    // Invalidate caches
    globalCache.delete('cards-list');
    globalCache.delete(`card-${cardId}`);
    return response.data.card;
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.api.delete(`/cards/${cardId}`);
    // Invalidate caches
    globalCache.delete('cards-list');
    globalCache.delete(`card-${cardId}`);
  }

  async likeCard(cardId: string): Promise<Card> {
    const response: AxiosResponse<CardResponse> = await this.api.patch(`/cards/${cardId}/like`);
    // Invalidate caches
    globalCache.delete('cards-list');
    globalCache.delete(`card-${cardId}`);
    return response.data.card;
  }

  async getUserCards(): Promise<Card[]> {
    const response: AxiosResponse<CardsResponse> = await this.api.get('/cards/my-cards');
    return response.data.cards;
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('cardify_token', token);
  }

  clearAuth(): void {
    localStorage.removeItem('cardify_token');
    localStorage.removeItem('cardify_user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('cardify_token');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Mock data for production when backend is not available
  async getMockCards(): Promise<Card[]> {
    return [
      {
        _id: 'demo-1',
        title: 'Marie Dubois',
        subtitle: 'Développeuse Full-Stack',
        description: 'Passionnée par les technologies modernes, je développe des applications web performantes avec React, Node.js et TypeScript. Spécialisée dans l\'architecture cloud et les APIs REST.',
        phone: '06-12345678',
        email: 'marie.dubois@techcorp.fr',
        web: 'https://marie-dev.fr',
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        imageAlt: 'Photo de Marie Dubois',
        address: {
          country: 'France',
          city: 'Paris',
          street: 'Rue de Rivoli',
          houseNumber: 123,
          state: 'Île-de-France',
          zip: 75001
        },
        bizNumber: 1234567,
        likes: ['user-1', 'user-2'],
        user_id: 'demo-user-1',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z'
      },
      {
        _id: 'demo-2',
        title: 'Jean Martin',
        subtitle: 'Designer UX/UI',
        description: 'Créateur d\'expériences digitales mémorables. Je conçois des interfaces intuitives et esthétiques qui placent l\'utilisateur au centre de chaque interaction.',
        phone: '06-87654321',
        email: 'jean.martin@designstudio.com',
        web: 'https://jeanmartin-design.com',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        imageAlt: 'Photo de Jean Martin',
        address: {
          country: 'France',
          city: 'Lyon',
          street: 'Place Bellecour',
          houseNumber: 45,
          state: 'Auvergne-Rhône-Alpes',
          zip: 69002
        },
        bizNumber: 2345678,
        likes: ['user-3'],
        user_id: 'demo-user-2',
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-18T16:30:00Z'
      },
      {
        _id: 'demo-3',
        title: 'Sophie Leclerc',
        subtitle: 'Consultante Marketing Digital',
        description: 'Stratégies digitales innovantes pour booster votre présence en ligne. Expertise en SEO, réseaux sociaux et campagnes publicitaires ciblées.',
        phone: '06-11223344',
        email: 'sophie@marketing-plus.fr',
        web: 'https://marketingplus-consulting.fr',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        imageAlt: 'Photo de Sophie Leclerc',
        address: {
          country: 'France',
          city: 'Marseille',
          street: 'La Canebière',
          houseNumber: 78,
          state: 'Provence-Alpes-Côte d\'Azur',
          zip: 13001
        },
        bizNumber: 3456789,
        likes: ['user-1', 'user-4', 'user-5'],
        user_id: 'demo-user-3',
        createdAt: '2024-01-05T14:20:00Z',
        updatedAt: '2024-01-22T11:10:00Z'
      }
    ];
  }

  // Enhanced demo mode methods
  async getDemoProfile(): Promise<User> {
    return {
      _id: 'demo-user-current',
      name: {
        first: 'Alex',
        last: 'Dupont'
      },
      email: 'alex.dupont@cardify.demo',
      phone: '06-99887766',
      image: {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        alt: 'Photo d\'Alex Dupont'
      },
      address: {
        country: 'France',
        city: 'Nice',
        street: 'Promenade des Anglais',
        houseNumber: 25,
        state: 'Provence-Alpes-Côte d\'Azur',
        zip: 6000
      },
      isBusiness: true,
      isAdmin: false,
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-25T18:30:00Z'
    };
  }
}

export const apiService = new ApiService();
export default apiService;
