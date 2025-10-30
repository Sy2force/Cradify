/**
 * 🗄️ Système de Cache Avancé - Cardify
 * Auteur: Shaya Coca
 * Description: Gestionnaire de cache multi-niveaux avec persistance et invalidation intelligente
 */

// Types pour le système de cache
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  accessCount: number;
  lastAccess: number;
  tags: string[];
  size: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live en ms
  maxSize?: number; // Taille max en bytes
  maxEntries?: number; // Nombre max d'entrées
  persistent?: boolean; // Persistance dans localStorage
  tags?: string[]; // Tags pour l'invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  size: number;
  hitRate: number;
}

/**
 * Cache en mémoire avec LRU et gestion intelligente
 */
export class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats = { hits: 0, misses: 0 };
  private maxSize: number;
  private maxEntries: number;
  private defaultTtl: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    this.maxEntries = options.maxEntries || 1000;
    this.defaultTtl = options.ttl || 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Calculer la taille approximative d'un objet
   */
  private calculateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Approximation
    }
  }

  /**
   * Nettoyer les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Éviction LRU si nécessaire
   */
  private evictIfNeeded(): void {
    if (this.cache.size <= this.maxEntries) return;

    // Trier par dernière utilisation
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccess - b.lastAccess);

    // Supprimer les plus anciennes
    const toRemove = entries.slice(0, entries.length - this.maxEntries + 1);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Obtenir une valeur du cache
   */
  get(key: string): T | null {
    this.cleanup();
    
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccess = Date.now();
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Définir une valeur dans le cache
   */
  set(key: string, data: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || this.defaultTtl;
    const size = this.calculateSize(data);

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + ttl,
      accessCount: 0,
      lastAccess: now,
      tags: options.tags || [],
      size
    };

    this.cache.set(key, entry);
    this.evictIfNeeded();
  }

  /**
   * Supprimer une entrée
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Vider le cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Invalider par tags
   */
  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Obtenir les statistiques
   */
  getStats(): CacheStats {
    const entries = this.cache.size;
    const size = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      entries,
      size,
      hitRate
    };
  }

  /**
   * Obtenir toutes les clés
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Vérifier si une clé existe
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

/**
 * Cache persistant avec localStorage
 */
export class PersistentCache<T = any> extends MemoryCache<T> {
  private storageKey: string;

  constructor(storageKey: string, options: CacheOptions = {}) {
    super(options);
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  /**
   * Charger depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        for (const [key, entry] of Object.entries(data)) {
          if (Date.now() < (entry as CacheEntry<T>).expiry) {
            this.cache.set(key, entry as CacheEntry<T>);
          }
        }
      }
    } catch (error) {
      console.warn('Erreur chargement cache persistant:', error);
    }
  }

  /**
   * Sauvegarder dans localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur sauvegarde cache persistant:', error);
    }
  }

  /**
   * Override set pour sauvegarder
   */
  set(key: string, data: T, options: CacheOptions = {}): void {
    super.set(key, data, options);
    this.saveToStorage();
  }

  /**
   * Override delete pour sauvegarder
   */
  delete(key: string): boolean {
    const result = super.delete(key);
    this.saveToStorage();
    return result;
  }

  /**
   * Override clear pour sauvegarder
   */
  clear(): void {
    super.clear();
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Gestionnaire de cache global
 */
export class CacheManager {
  private caches = new Map<string, MemoryCache>();
  private defaultOptions: CacheOptions;

  constructor(defaultOptions: CacheOptions = {}) {
    this.defaultOptions = {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxEntries: 100,
      ...defaultOptions
    };
  }

  /**
   * Obtenir ou créer un cache
   */
  getCache<T>(name: string, options?: CacheOptions): MemoryCache<T> {
    if (!this.caches.has(name)) {
      const cacheOptions = { ...this.defaultOptions, ...options };
      const cache = options?.persistent 
        ? new PersistentCache<T>(`cardify-cache-${name}`, cacheOptions)
        : new MemoryCache<T>(cacheOptions);
      
      this.caches.set(name, cache as MemoryCache);
    }
    return this.caches.get(name) as MemoryCache<T>;
  }

  /**
   * Invalider tous les caches par tag
   */
  invalidateByTag(tag: string): number {
    let totalInvalidated = 0;
    for (const cache of this.caches.values()) {
      totalInvalidated += cache.invalidateByTag(tag);
    }
    return totalInvalidated;
  }

  /**
   * Obtenir les statistiques globales
   */
  getGlobalStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    return stats;
  }

  /**
   * Vider tous les caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }
}

// Instance globale du gestionnaire de cache
export const cacheManager = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxEntries: 200,
  maxSize: 20 * 1024 * 1024 // 20MB
});

/**
 * Décorateur pour mettre en cache les résultats de fonction
 */
export function cached<T extends (...args: any[]) => any>(
  cacheKey: string,
  options: CacheOptions = {}
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = cacheManager.getCache(cacheKey, options);

    descriptor.value = function (...args: Parameters<T>) {
      const key = `${propertyName}-${JSON.stringify(args)}`;
      
      let result = cache.get(key);
      if (result === null) {
        result = method.apply(this, args);
        cache.set(key, result, options);
      }
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Utilitaires de cache pour les composants React
 */
export const cacheUtils = {
  // Cache pour les données utilisateur
  user: cacheManager.getCache('user', { 
    ttl: 10 * 60 * 1000, // 10 minutes
    persistent: true,
    tags: ['user']
  }),

  // Cache pour les cartes
  cards: cacheManager.getCache('cards', { 
    ttl: 2 * 60 * 1000, // 2 minutes
    tags: ['cards']
  }),

  // Cache pour les images
  images: cacheManager.getCache('images', { 
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 50 * 1024 * 1024, // 50MB
    tags: ['images']
  }),

  // Cache pour les préférences
  preferences: cacheManager.getCache('preferences', { 
    persistent: true,
    ttl: 24 * 60 * 60 * 1000, // 24 heures
    tags: ['preferences']
  }),

  // Invalider les données utilisateur
  invalidateUser: () => cacheManager.invalidateByTag('user'),
  
  // Invalider les cartes
  invalidateCards: () => cacheManager.invalidateByTag('cards'),
  
  // Obtenir les statistiques
  getStats: () => cacheManager.getGlobalStats()
};

export default cacheManager;
