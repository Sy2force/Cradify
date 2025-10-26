import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '../lib/api';
import { User, AuthContextType, RegisterData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('cardify_token');
        const storedUser = localStorage.getItem('cardify_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          try {
            const profile = await apiService.getProfile();
            setUser(profile);
            localStorage.setItem('cardify_user', JSON.stringify(profile));
          } catch (error) {
            // Token expired or invalid
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        
        // Store in localStorage
        localStorage.setItem('cardify_token', response.token);
        localStorage.setItem('cardify_user', JSON.stringify(response.user));
        
        apiService.setAuthToken(response.token);
        toast.success('Connexion réussie !');
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.register(userData);
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        
        // Store in localStorage
        localStorage.setItem('cardify_token', response.token);
        localStorage.setItem('cardify_user', JSON.stringify(response.user));
        
        apiService.setAuthToken(response.token);
        toast.success('Inscription réussie !');
      } else {
        throw new Error('Réponse d\'inscription invalide');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur d\'inscription';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    apiService.clearAuth();
    toast.success('Déconnexion réussie');
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!user) {
      toast.error('Aucun utilisateur connecté');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await apiService.updateProfile(user._id, userData);
      setUser(updatedUser);
      localStorage.setItem('cardify_user', JSON.stringify(updatedUser));
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de mise à jour';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
