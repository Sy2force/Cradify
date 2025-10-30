/**
 * 📊 Hook de Performance - Cardify
 * Auteur: Shaya Coca
 * Description: Hook React pour le monitoring et l'optimisation des performances
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PerformanceMetrics, 
  measureWebVitals, 
  analyzeResourceTiming,
  MemoryCache,
  debounce
} from '../utils/performance';

interface UsePerformanceOptions {
  enableMetrics?: boolean;
  enableResourceAnalysis?: boolean;
  cacheSize?: number;
  debounceDelay?: number;
}

interface PerformanceState {
  metrics: PerformanceMetrics | null;
  resources: any[];
  isLoading: boolean;
  memoryUsage: number;
  cacheHitRate: number;
}

export const usePerformance = (options: UsePerformanceOptions = {}) => {
  const {
    enableMetrics = true,
    enableResourceAnalysis = true,
    cacheSize = 100,
    debounceDelay = 300
  } = options;

  const [state, setState] = useState<PerformanceState>({
    metrics: null,
    resources: [],
    isLoading: true,
    memoryUsage: 0,
    cacheHitRate: 0
  });

  const cache = useRef(new MemoryCache(cacheSize));
  const cacheStats = useRef({ hits: 0, misses: 0 });

  // Mesurer les métriques de performance
  const measureMetrics = useCallback(async () => {
    if (!enableMetrics) return;

    try {
      const metrics = await measureWebVitals();
      setState(prev => ({ ...prev, metrics, isLoading: false }));
    } catch (error) {
      console.error('Erreur mesure métriques:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [enableMetrics]);

  // Analyser les ressources
  const analyzeResources = useCallback(() => {
    if (!enableResourceAnalysis) return;

    try {
      const resources = analyzeResourceTiming();
      setState(prev => ({ ...prev, resources }));
    } catch (error) {
      console.error('Erreur analyse ressources:', error);
    }
  }, [enableResourceAnalysis]);

  // Surveiller l'utilisation mémoire
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      const memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100;
      setState(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Calculer le taux de succès du cache
  const updateCacheStats = useCallback(() => {
    const { hits, misses } = cacheStats.current;
    const total = hits + misses;
    const cacheHitRate = total > 0 ? (hits / total) * 100 : 0;
    setState(prev => ({ ...prev, cacheHitRate }));
  }, []);

  // Version debounced des fonctions
  const debouncedAnalyzeResources = useCallback(
    debounce(analyzeResources, debounceDelay),
    [analyzeResources, debounceDelay]
  );

  const debouncedMonitorMemory = useCallback(
    debounce(monitorMemory, debounceDelay),
    [monitorMemory, debounceDelay]
  );

  // Cache avec statistiques
  const getCachedData = useCallback(<T>(key: string): T | null => {
    const data = cache.current.get<T>(key);
    if (data) {
      cacheStats.current.hits++;
    } else {
      cacheStats.current.misses++;
    }
    updateCacheStats();
    return data;
  }, [updateCacheStats]);

  const setCachedData = useCallback(<T>(key: string, data: T, ttl?: number): void => {
    cache.current.set(key, data, ttl);
  }, []);

  // Optimiser le rendu avec requestAnimationFrame
  const optimizeRender = useCallback((callback: () => void) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(callback);
    });
  }, []);

  // Précharger des données
  const preloadData = useCallback(async (url: string, cacheKey?: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (cacheKey) {
        setCachedData(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      console.warn('Erreur préchargement:', url, error);
      return null;
    }
  }, [setCachedData]);

  // Nettoyer le cache
  const clearCache = useCallback(() => {
    cache.current.clear();
    cacheStats.current = { hits: 0, misses: 0 };
    updateCacheStats();
  }, [updateCacheStats]);

  // Observer les changements de performance
  useEffect(() => {
    let performanceObserver: PerformanceObserver | null = null;

    if (enableMetrics) {
      measureMetrics();
      
      // Observer les nouvelles entrées de performance
      if ('PerformanceObserver' in window) {
        performanceObserver = new PerformanceObserver(() => {
          debouncedAnalyzeResources();
        });
        
        performanceObserver.observe({ entryTypes: ['resource', 'navigation'] });
      }
    }

    return () => {
      if (performanceObserver) {
        performanceObserver.disconnect();
      }
    };
  }, [enableMetrics, measureMetrics, debouncedAnalyzeResources]);

  // Monitoring périodique
  useEffect(() => {
    const interval = setInterval(() => {
      debouncedMonitorMemory();
      if (enableResourceAnalysis) {
        debouncedAnalyzeResources();
      }
    }, 5000); // Toutes les 5 secondes

    return () => clearInterval(interval);
  }, [debouncedMonitorMemory, debouncedAnalyzeResources, enableResourceAnalysis]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  return {
    // État
    ...state,
    
    // Actions
    measureMetrics,
    analyzeResources,
    monitorMemory,
    optimizeRender,
    preloadData,
    clearCache,
    
    // Cache
    getCachedData,
    setCachedData,
    
    // Utilitaires
    isPerformanceSupported: 'performance' in window,
    isObserverSupported: 'PerformanceObserver' in window,
    
    // Métriques calculées
    performanceScore: state.metrics ? calculatePerformanceScore(state.metrics) : 0,
    memoryStatus: getMemoryStatus(state.memoryUsage),
    cacheEfficiency: getCacheEfficiency(state.cacheHitRate)
  };
};

// Calculer un score de performance global
const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
  const scores = {
    fcp: metrics.fcp < 1800 ? 100 : Math.max(0, 100 - (metrics.fcp - 1800) / 20),
    lcp: metrics.lcp < 2500 ? 100 : Math.max(0, 100 - (metrics.lcp - 2500) / 30),
    fid: metrics.fid < 100 ? 100 : Math.max(0, 100 - (metrics.fid - 100) / 5),
    cls: metrics.cls < 0.1 ? 100 : Math.max(0, 100 - (metrics.cls - 0.1) * 1000),
    ttfb: metrics.ttfb < 600 ? 100 : Math.max(0, 100 - (metrics.ttfb - 600) / 10)
  };

  return Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / 5);
};

// Déterminer le statut de la mémoire
const getMemoryStatus = (usage: number): 'good' | 'warning' | 'critical' => {
  if (usage < 70) return 'good';
  if (usage < 85) return 'warning';
  return 'critical';
};

// Évaluer l'efficacité du cache
const getCacheEfficiency = (hitRate: number): 'excellent' | 'good' | 'poor' => {
  if (hitRate >= 80) return 'excellent';
  if (hitRate >= 60) return 'good';
  return 'poor';
};

export default usePerformance;
