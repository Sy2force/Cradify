/**
 * 🚀 Utilitaires de Performance - Cardify
 * Auteur: Shaya Coca
 * Description: Optimisations et monitoring des performances frontend
 */

// Types pour les métriques de performance
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

/**
 * Lazy loading pour les images
 */
export const setupLazyLoading = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Préchargement des ressources critiques
 */
export const preloadCriticalResources = (resources: string[]): void => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    // Déterminer le type de ressource
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
      link.as = 'image';
    } else if (resource.match(/\.(woff|woff2|ttf|otf)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Mesure des Core Web Vitals
 */
export const measureWebVitals = (): Promise<PerformanceMetrics> => {
  return new Promise((resolve) => {
    const metrics: Partial<PerformanceMetrics> = {};
    
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metrics.lcp = lastEntry.startTime;
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming;
      if (firstEntry && 'processingStart' in firstEntry) {
        metrics.fid = firstEntry.processingStart - firstEntry.startTime;
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      metrics.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }

    // Résoudre après un délai pour collecter toutes les métriques
    setTimeout(() => {
      resolve(metrics as PerformanceMetrics);
    }, 3000);
  });
};

/**
 * Analyse des ressources chargées
 */
export const analyzeResourceTiming = (): ResourceTiming[] => {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  return resources.map(resource => ({
    name: resource.name.split('/').pop() || resource.name,
    duration: resource.duration,
    size: resource.transferSize || 0,
    type: getResourceType(resource.name)
  })).sort((a, b) => b.duration - a.duration);
};

/**
 * Déterminer le type de ressource
 */
const getResourceType = (url: string): string => {
  if (url.match(/\.(css)$/)) return 'CSS';
  if (url.match(/\.(js)$/)) return 'JavaScript';
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'Image';
  if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'Font';
  if (url.includes('/api/')) return 'API';
  return 'Other';
};

/**
 * Optimisation des images avec WebP
 */
export const optimizeImageFormat = (src: string): string => {
  // Vérifier le support WebP
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  if (supportsWebP && src.match(/\.(jpg|jpeg|png)$/)) {
    return src.replace(/\.(jpg|jpeg|png)$/, '.webp');
  }
  
  return src;
};

/**
 * Debounce pour optimiser les événements
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * Throttle pour limiter la fréquence d'exécution
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Cache en mémoire avec TTL
 */
export class MemoryCache<T> {
  private cache = new Map<string, { data: T; expiry: number }>();

  set(key: string, data: T, ttl: number = 300000): void { // 5 minutes par défaut
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Monitoring des performances en temps réel
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  start(): void {
    this.setupObservers();
    this.startResourceMonitoring();
  }

  stop(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private setupObservers(): void {
    // Observer pour les métriques de peinture
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(() => {
        // Performance paint metrics logged
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(paintObserver);

    // Observer pour les ressources
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        if (resource.duration > 1000) { // Ressources lentes > 1s
          console.warn(`🐌 Ressource lente: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
        }
      }
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  private startResourceMonitoring(): void {
    setInterval(() => {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        // Memory monitoring active
      }
    }, 30000); // Toutes les 30 secondes
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

/**
 * Optimisation du rendu avec requestAnimationFrame
 */
export const optimizeRendering = (callback: () => void): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

/**
 * Préchargement intelligent des routes
 */
export const preloadRoute = async (routePath: string): Promise<void> => {
  try {
    // Précharger le composant de la route
    const modulePromise = import(/* webpackChunkName: "[request]" */ `../pages${routePath}`);
    
    // Précharger les données de la route si nécessaire
    if (routePath.includes('/cards/')) {
      const cardId = routePath.split('/').pop();
      if (cardId) {
        fetch(`/api/cards/${cardId}`).catch(() => {}); // Silencieux si échec
      }
    }
    
    await modulePromise;
    // Route preloaded: ${routePath}
  } catch (error) {
    console.warn(`⚠️ Échec préchargement route: ${routePath}`, error);
  }
};

/**
 * Initialisation des optimisations de performance
 */
export const initPerformanceOptimizations = (): void => {
  // Lazy loading des images
  setupLazyLoading();
  
  // Préchargement des ressources critiques
  preloadCriticalResources([
    '/fonts/inter-var.woff2',
    '/api/auth/profile'
  ]);
  
  // Démarrage du monitoring
  const monitor = new PerformanceMonitor();
  monitor.start();
  
  // Nettoyage au déchargement de la page
  window.addEventListener('beforeunload', () => {
    monitor.stop();
  });
  
  // Performance optimizations initialized
};
