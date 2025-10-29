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
          
          // En production, accepter les données localStorage sans vérification backend
          if (process.env.NODE_ENV === 'production') {
            // Mode démo - utilisation des données locales
          } else {
            // Verify token is still valid (seulement en développement)
            try {
              const profile = await apiService.getProfile();
              setUser(profile);
              localStorage.setItem('cardify_user', JSON.stringify(profile));
            } catch {
              // En production, ne pas bloquer si l'API n'est pas disponible, utilisation des données locales
            }
          }
        }
      } catch {
        // Initialisation auth - données locales utilisées
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // En production, on simule une connexion réussie
      if (process.env.NODE_ENV === 'production') {
        // Simulation d'une connexion réussie avec des données démo
        const demoUser: User = {
          _id: 'demo-user-1',
          name: {
            first: 'Demo',
            last: 'User'
          },
          email: email,
          phone: '+33 1 23 45 67 89',
          address: {
            country: 'France',
            city: 'Paris',
            street: 'Champs-Élysées',
            houseNumber: 123,
            zip: 75008
          },
          isBusiness: false,
          isAdmin: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const demoToken = 'demo-token-' + Date.now();
        
        setUser(demoUser);
        setToken(demoToken);
        
        localStorage.setItem('cardify_token', demoToken);
        localStorage.setItem('cardify_user', JSON.stringify(demoUser));
        
        toast.success('Connexion réussie (mode démo) !');
        return;
      }

      // En développement, on essaie la vraie API
      const response = await apiService.login({ email, password });
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        
        localStorage.setItem('cardify_token', response.token);
        localStorage.setItem('cardify_user', JSON.stringify(response.user));
        
        apiService.setAuthToken(response.token);
        toast.success('Connexion réussie !');
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'production') {
        toast.error('Vérifiez vos identifiants');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la connexion';
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      // En production, on simule une inscription réussie
      if (process.env.NODE_ENV === 'production') {
        const demoUser: User = {
          _id: 'demo-user-' + Date.now(),
          name: {
            first: userData.name.first,
            last: userData.name.last
          },
          email: userData.email,
          phone: userData.phone,
          address: {
            country: userData.address.country,
            city: userData.address.city,
            street: userData.address.street,
            houseNumber: userData.address.houseNumber,
            zip: userData.address.zip || 0
          },
          isBusiness: userData.isBusiness || false,
          isAdmin: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const demoToken = 'demo-token-' + Date.now();
        
        setUser(demoUser);
        setToken(demoToken);
        
        localStorage.setItem('cardify_token', demoToken);
        localStorage.setItem('cardify_user', JSON.stringify(demoUser));
        
        toast.success('Inscription réussie (mode démo) !');
        return;
      }

      // En développement, on essaie la vraie API
      const response = await apiService.register(userData);
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        
        localStorage.setItem('cardify_token', response.token);
        localStorage.setItem('cardify_user', JSON.stringify(response.user));
        
        apiService.setAuthToken(response.token);
        toast.success('Inscription réussie !');
      } else {
        throw new Error('Réponse d\'inscription invalide');
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'production') {
        toast.error('Erreur lors de l\'inscription. Vérifiez vos données.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
        toast.error(errorMessage);
      }
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
      // En production, simulation de mise à jour réussie
      if (process.env.NODE_ENV === 'production') {
        const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('cardify_user', JSON.stringify(updatedUser));
        toast.success('Profil sauvegardé (mode démo)');
        return;
      }

      // En développement, vraie API
      const updatedUser = await apiService.updateProfile(user._id, userData);
      setUser(updatedUser);
      localStorage.setItem('cardify_user', JSON.stringify(updatedUser));
      toast.success('Profil mis à jour avec succès');
    } catch (error: unknown) {
      // En production, fallback sur sauvegarde locale
      if (process.env.NODE_ENV === 'production') {
        const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('cardify_user', JSON.stringify(updatedUser));
        toast.success('Profil sauvegardé localement');
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
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
