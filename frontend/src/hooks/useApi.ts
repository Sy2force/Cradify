/**
 * 🌐 Hook API Avancé - Cardify
 * Auteur: Shaya Coca
 * Description: Hook React pour la gestion avancée des appels API avec cache, retry et optimisations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useLocalStorage } from './useLocalStorage';

interface UseApiOptions {
  cache?: boolean;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  debounce?: number;
  background?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Cache global en mémoire
const memoryCache = new Map<string, CacheEntry<any>>();

// Configuration axios par défaut
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cardify-auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cardify-auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useApi = <T = any>(
  url: string,
  options: UseApiOptions = {}
) => {
  const {
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retry = 3,
    retryDelay = 1000,
    debounce = 0,
    background = false,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Cache persistant pour certaines données
  const { value: persistentCache, setValue: setPersistentCache } = useLocalStorage(
    `api-cache-${url}`,
    null as T | null,
    { expirationTime: cacheTime }
  );

  // Générer une clé de cache
  const getCacheKey = useCallback((url: string, config?: AxiosRequestConfig) => {
    const params = config?.params ? JSON.stringify(config.params) : '';
    return `${url}${params}`;
  }, []);

  // Vérifier le cache
  const getCachedData = useCallback((cacheKey: string): T | null => {
    if (!cache) return null;

    // Vérifier le cache mémoire d'abord
    const memoryEntry = memoryCache.get(cacheKey);
    if (memoryEntry && Date.now() < memoryEntry.expiry) {
      return memoryEntry.data;
    }

    // Vérifier le cache persistant
    if (persistentCache) {
      return persistentCache;
    }

    return null;
  }, [cache, persistentCache]);

  // Mettre en cache les données
  const setCachedData = useCallback((cacheKey: string, data: T) => {
    if (!cache) return;

    const expiry = Date.now() + cacheTime;
    
    // Cache mémoire
    memoryCache.set(cacheKey, { data, timestamp: Date.now(), expiry });
    
    // Cache persistant pour les données importantes
    if (url.includes('/profile') || url.includes('/cards')) {
      setPersistentCache(data);
    }
  }, [cache, cacheTime, url, setPersistentCache]);

  // Fonction de retry avec backoff exponentiel
  const executeWithRetry = useCallback(async (
    requestFn: () => Promise<AxiosResponse<T>>,
    currentRetry = 0
  ): Promise<AxiosResponse<T>> => {
    try {
      return await requestFn();
    } catch (error) {
      if (currentRetry < retry && !axios.isCancel(error)) {
        const delay = retryDelay * Math.pow(2, currentRetry);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(requestFn, currentRetry + 1);
      }
      throw error;
    }
  }, [retry, retryDelay]);

  // Fonction principale de fetch
  const fetchData = useCallback(async (
    requestUrl: string,
    config?: AxiosRequestConfig,
    skipCache = false
  ) => {
    const cacheKey = getCacheKey(requestUrl, config);
    
    // Vérifier le cache si pas de skip
    if (!skipCache) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          lastFetch: Date.now()
        }));
        return cachedData;
      }
    }

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (!background) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const response = await executeWithRetry(() => 
        apiClient.get<T>(requestUrl, {
          ...config,
          signal: abortControllerRef.current?.signal
        })
      );

      const data = response.data;
      
      // Mettre en cache
      setCachedData(cacheKey, data);
      
      setState({
        data,
        loading: false,
        error: null,
        lastFetch: Date.now()
      });

      retryCountRef.current = 0;
      onSuccess?.(data);
      
      return data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.message || error.message
          : 'Erreur inconnue';
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));

        onError?.(error);
      }
      throw error;
    }
  }, [getCacheKey, getCachedData, setCachedData, executeWithRetry, background, onSuccess, onError]);

  // Fonction de fetch avec debounce
  const debouncedFetch = useCallback((
    requestUrl: string,
    config?: AxiosRequestConfig,
    skipCache = false
  ) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (debounce > 0) {
      debounceTimeoutRef.current = setTimeout(() => {
        fetchData(requestUrl, config, skipCache);
      }, debounce);
    } else {
      fetchData(requestUrl, config, skipCache);
    }
  }, [fetchData, debounce]);

  // Fonction POST
  const post = useCallback(async <TData = any, TResponse = T>(
    postUrl: string,
    data: TData,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.post<TResponse>(postUrl, data, config);
      
      setState(prev => ({ ...prev, loading: false }));
      onSuccess?.(response.data);
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Erreur inconnue';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      onError?.(error);
      throw error;
    }
  }, [onSuccess, onError]);

  // Fonction PUT
  const put = useCallback(async <TData = any, TResponse = T>(
    putUrl: string,
    data: TData,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.put<TResponse>(putUrl, data, config);
      
      setState(prev => ({ ...prev, loading: false }));
      onSuccess?.(response.data);
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Erreur inconnue';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      onError?.(error);
      throw error;
    }
  }, [onSuccess, onError]);

  // Fonction DELETE
  const del = useCallback(async (
    deleteUrl: string,
    config?: AxiosRequestConfig
  ): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await apiClient.delete(deleteUrl, config);
      
      setState(prev => ({ ...prev, loading: false }));
      onSuccess?.(null);
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Erreur inconnue';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      onError?.(error);
      throw error;
    }
  }, [onSuccess, onError]);

  // Fonction de refresh
  const refresh = useCallback(() => {
    debouncedFetch(url, undefined, true);
  }, [url, debouncedFetch]);

  // Fonction de clear cache
  const clearCache = useCallback(() => {
    const cacheKey = getCacheKey(url);
    memoryCache.delete(cacheKey);
    setPersistentCache(null);
  }, [url, getCacheKey, setPersistentCache]);

  // Fetch initial
  useEffect(() => {
    if (url) {
      debouncedFetch(url);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [url, debouncedFetch]);

  return {
    ...state,
    fetch: (config?: AxiosRequestConfig) => debouncedFetch(url, config),
    post,
    put,
    delete: del,
    refresh,
    clearCache,
    // Utilitaires
    isStale: state.lastFetch ? Date.now() - state.lastFetch > cacheTime : true,
    retryCount: retryCountRef.current
  };
};

/**
 * Hook spécialisé pour l'authentification
 */
export const useAuth = () => {
  const { data: user, loading, error, post, clearCache } = useApi('/api/auth/profile');

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const response = await post('/api/auth/login', credentials);
    localStorage.setItem('cardify-auth-token', response.token);
    return response;
  }, [post]);

  const logout = useCallback(() => {
    localStorage.removeItem('cardify-auth-token');
    clearCache();
    window.location.href = '/login';
  }, [clearCache]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};

/**
 * Hook spécialisé pour les cartes
 */
export const useCards = () => {
  return useApi('/api/cards', {
    cache: true,
    cacheTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  });
};

export default useApi;
