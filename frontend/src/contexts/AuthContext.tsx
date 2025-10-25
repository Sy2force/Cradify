import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import type { User, AuthContext as AuthContextType, RegisterForm } from '@/lib/types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialisation : vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('cardify_token');
        const storedUser = localStorage.getItem('cardify_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          apiClient.setToken(storedToken);
        }
      } catch (error) {
        // Erreur lors de l'initialisation de l'auth - nettoyage du localStorage
        // Nettoyer le localStorage en cas d'erreur
        localStorage.removeItem('cardify_token');
        localStorage.removeItem('cardify_user');
        apiClient.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.data?.user && response.data?.token) {
        const userData = response.data.user;
        const tokenData = response.data.token;
        
        setUser(userData);
        setToken(tokenData);
        
        // Stocker dans localStorage
        localStorage.setItem('cardify_token', tokenData);
        localStorage.setItem('cardify_user', JSON.stringify(userData));
        
        toast.success('Connexion réussie !');
      } else {
        throw new Error('Réponse d\'authentification invalide');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion au serveur';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterForm): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.register(userData);
      
      if (response.success && response.data?.user && response.data?.token) {
        const newUser = response.data.user;
        const tokenData = response.data.token;
        
        setUser(newUser);
        setToken(tokenData);
        
        // Stocker dans localStorage
        localStorage.setItem('cardify_token', tokenData);
        localStorage.setItem('cardify_user', JSON.stringify(newUser));
        
        toast.success('Inscription réussie !');
      } else {
        throw new Error('Réponse d\'inscription invalide');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur d\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cardify_token');
    localStorage.removeItem('cardify_user');
    apiClient.clearToken();
    toast.success('Déconnexion réussie');
  };

  // Fonction de mise à jour du profil utilisateur (local)
  const updateProfile = (userData: Partial<User>): void => {
    if (!user) {
      toast.error('Aucun utilisateur connecté');
      return;
    }

    try {
      // Mettre à jour l'état local
      const newUserData = { ...user, ...userData };
      setUser(newUserData);
      localStorage.setItem('cardify_user', JSON.stringify(newUserData));
      toast.success('Profil mis à jour');
    } catch (error) {
      // Erreur de mise à jour du profil
      toast.error('Erreur de mise à jour du profil');
    }
  };

  // Fonction de mise à jour du profil utilisateur (avec API)
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user || !token) {
      toast.error('Aucun utilisateur connecté');
      throw new Error('Aucun utilisateur connecté');
    }

    setIsLoading(true);
    try {
      // Appeler l'API pour mettre à jour le profil
      const response = await apiClient.updateUser(user._id, userData);
      
      if (response.success) {
        // Gérer différents formats de réponse API
        const dataWithUser = response.data as { user?: User } | User | undefined;
        let updatedUser: User | undefined;
        
        if (response.user) {
          updatedUser = response.user;
        } else if (dataWithUser && 'user' in dataWithUser && dataWithUser.user) {
          updatedUser = dataWithUser.user;
        } else if (dataWithUser && '_id' in dataWithUser) {
          updatedUser = dataWithUser as User;
        }
        
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem('cardify_user', JSON.stringify(updatedUser));
          toast.success('Profil mis à jour avec succès');
        } else {
          throw new Error('Données utilisateur non trouvées dans la réponse');
        }
      } else {
        throw new Error('Échec de la mise à jour du profil');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil';
      // Erreur de mise à jour du profil
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
    error,
    isBusiness: user?.isBusiness || false,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

// Hook pour vérifier les permissions
export function usePermissions() {
  const { user } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isBusiness: user?.isBusiness || false,
    isAdmin: user?.isAdmin || false,
    canCreateCards: user?.isBusiness || false,
    canManageUsers: user?.isAdmin || false,
  };
}
