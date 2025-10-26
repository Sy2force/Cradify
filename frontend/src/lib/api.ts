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

const API_BASE_URL = 'http://localhost:10000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
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
    return response.data.user;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    this.clearAuth();
  }

  // Cards methods
  async getCards(): Promise<Card[]> {
    const response: AxiosResponse<CardsResponse> = await this.api.get('/cards');
    return response.data.cards;
  }

  async getCard(cardId: string): Promise<Card> {
    const response: AxiosResponse<CardResponse> = await this.api.get(`/cards/${cardId}`);
    return response.data.card;
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
    return response.data.card;
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.api.delete(`/cards/${cardId}`);
  }

  async likeCard(cardId: string): Promise<Card> {
    const response: AxiosResponse<CardResponse> = await this.api.patch(`/cards/${cardId}/like`);
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
}

export const apiService = new ApiService();
export default apiService;
