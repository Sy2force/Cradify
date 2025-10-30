/**
 * 🧪 Tests pour le Système de Cache - Cardify
 * Auteur: Shaya Coca
 * Description: Tests unitaires pour le système de cache avancé
 */

import { MemoryCache, PersistentCache, CacheManager, cacheManager, cacheUtils } from '../cache';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('MemoryCache', () => {
  let cache: MemoryCache<string>;

  beforeEach(() => {
    cache = new MemoryCache<string>({
      maxEntries: 5,
      ttl: 1000 // 1 second
    });
  });

  afterEach(() => {
    cache.clear();
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return null for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should handle TTL expiration', (done) => {
    cache.set('key1', 'value1', { ttl: 100 });
    
    setTimeout(() => {
      expect(cache.get('key1')).toBeNull();
      done();
    }, 150);
  });

  it('should update access statistics', () => {
    cache.set('key1', 'value1');
    cache.get('key1'); // Hit
    cache.get('key2'); // Miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(50);
  });

  it('should enforce max entries limit', () => {
    // Add more entries than the limit
    for (let i = 0; i < 10; i++) {
      cache.set(`key${i}`, `value${i}`);
    }

    const stats = cache.getStats();
    expect(stats.entries).toBeLessThanOrEqual(5);
  });

  it('should support tagging and invalidation', () => {
    cache.set('key1', 'value1', { tags: ['user', 'profile'] });
    cache.set('key2', 'value2', { tags: ['user'] });
    cache.set('key3', 'value3', { tags: ['cards'] });

    const invalidated = cache.invalidateByTag('user');
    expect(invalidated).toBe(2);
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
    expect(cache.get('key3')).toBe('value3');
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should return all keys', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    const keys = cache.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys.length).toBe(2);
  });

  it('should delete specific entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.delete('key1')).toBe(true);
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe('value2');
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    cache.clear();
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
    expect(cache.getStats().entries).toBe(0);
  });
});

describe('PersistentCache', () => {
  let cache: PersistentCache<string>;

  beforeEach(() => {
    localStorageMock.clear();
    cache = new PersistentCache<string>('test-cache', {
      maxEntries: 5,
      ttl: 1000
    });
  });

  afterEach(() => {
    cache.clear();
  });

  it('should persist data to localStorage', () => {
    cache.set('key1', 'value1');
    
    // Create new instance to test persistence
    const newCache = new PersistentCache<string>('test-cache');
    expect(newCache.get('key1')).toBe('value1');
  });

  it('should not load expired data from localStorage', () => {
    // Manually set expired data in localStorage
    const expiredData = {
      key1: {
        data: 'value1',
        timestamp: Date.now() - 2000,
        expiry: Date.now() - 1000,
        accessCount: 0,
        lastAccess: Date.now() - 2000,
        tags: [],
        size: 100
      }
    };
    localStorageMock.setItem('cardify-cache-test-cache', JSON.stringify(expiredData));

    const newCache = new PersistentCache<string>('test-cache');
    expect(newCache.get('key1')).toBeNull();
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    expect(() => cache.set('key1', 'value1')).not.toThrow();
    
    // Restore original method
    localStorageMock.setItem = originalSetItem;
  });
});

describe('CacheManager', () => {
  let manager: CacheManager;

  beforeEach(() => {
    manager = new CacheManager({
      ttl: 1000,
      maxEntries: 10
    });
  });

  it('should create and manage multiple caches', () => {
    const cache1 = manager.getCache<string>('cache1');
    const cache2 = manager.getCache<number>('cache2');

    cache1.set('key1', 'value1');
    cache2.set('key2', 42);

    expect(cache1.get('key1')).toBe('value1');
    expect(cache2.get('key2')).toBe(42);
  });

  it('should return same cache instance for same name', () => {
    const cache1 = manager.getCache('test');
    const cache2 = manager.getCache('test');

    expect(cache1).toBe(cache2);
  });

  it('should invalidate across all caches by tag', () => {
    const cache1 = manager.getCache('cache1');
    const cache2 = manager.getCache('cache2');

    cache1.set('key1', 'value1', { tags: ['user'] });
    cache2.set('key2', 'value2', { tags: ['user'] });
    cache1.set('key3', 'value3', { tags: ['cards'] });

    const invalidated = manager.invalidateByTag('user');
    expect(invalidated).toBe(2);
  });

  it('should provide global statistics', () => {
    const cache1 = manager.getCache('cache1');
    const cache2 = manager.getCache('cache2');

    cache1.set('key1', 'value1');
    cache2.set('key2', 'value2');

    const stats = manager.getGlobalStats();
    expect(stats.cache1).toBeDefined();
    expect(stats.cache2).toBeDefined();
    expect(stats.cache1.entries).toBe(1);
    expect(stats.cache2.entries).toBe(1);
  });

  it('should clear all caches', () => {
    const cache1 = manager.getCache('cache1');
    const cache2 = manager.getCache('cache2');

    cache1.set('key1', 'value1');
    cache2.set('key2', 'value2');

    manager.clearAll();

    expect(cache1.get('key1')).toBeNull();
    expect(cache2.get('key2')).toBeNull();
  });
});

describe('cacheUtils', () => {
  beforeEach(() => {
    cacheUtils.user.clear();
    cacheUtils.cards.clear();
    cacheUtils.images.clear();
    cacheUtils.preferences.clear();
  });

  it('should provide specialized caches', () => {
    expect(cacheUtils.user).toBeDefined();
    expect(cacheUtils.cards).toBeDefined();
    expect(cacheUtils.images).toBeDefined();
    expect(cacheUtils.preferences).toBeDefined();
  });

  it('should invalidate user data', () => {
    cacheUtils.user.set('profile', { name: 'John' }, { tags: ['user'] });
    
    const invalidated = cacheUtils.invalidateUser();
    expect(invalidated).toBeGreaterThan(0);
    expect(cacheUtils.user.get('profile')).toBeNull();
  });

  it('should invalidate cards data', () => {
    cacheUtils.cards.set('list', [{ id: 1 }], { tags: ['cards'] });
    
    const invalidated = cacheUtils.invalidateCards();
    expect(invalidated).toBeGreaterThan(0);
    expect(cacheUtils.cards.get('list')).toBeNull();
  });

  it('should provide cache statistics', () => {
    cacheUtils.user.set('key1', 'value1');
    cacheUtils.cards.set('key2', 'value2');

    const stats = cacheUtils.getStats();
    expect(stats.user).toBeDefined();
    expect(stats.cards).toBeDefined();
  });
});

describe('Cache decorators and advanced features', () => {
  it('should calculate object size correctly', () => {
    const cache = new MemoryCache();
    const smallObject = { a: 1 };
    const largeObject = { data: 'x'.repeat(1000) };

    cache.set('small', smallObject);
    cache.set('large', largeObject);

    const stats = cache.getStats();
    expect(stats.size).toBeGreaterThan(0);
  });

  it('should handle cleanup of expired entries', (done) => {
    const cache = new MemoryCache({
      ttl: 100
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2', { ttl: 50 });

    setTimeout(() => {
      // Trigger cleanup by trying to get a value
      cache.get('key1');
      
      const stats = cache.getStats();
      expect(stats.entries).toBe(1); // Only key1 should remain
      done();
    }, 150);
  });

  it('should handle LRU eviction correctly', () => {
    const cache = new MemoryCache({
      maxEntries: 3
    });

    // Fill cache
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');

    // Access key1 to make it recently used
    cache.get('key1');

    // Add new entry, should evict key2 (least recently used)
    cache.set('key4', 'value4');

    expect(cache.get('key1')).toBe('value1'); // Should still exist
    expect(cache.get('key2')).toBeNull(); // Should be evicted
    expect(cache.get('key3')).toBe('value3'); // Should still exist
    expect(cache.get('key4')).toBe('value4'); // Should exist
  });
});
