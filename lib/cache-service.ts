// Comprehensive caching service for Knowledge Hub

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  hits: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0
  };

  // Default TTL: 5 minutes
  private defaultTTL = 5 * 60 * 1000;

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    };

    this.cache.set(key, entry);
    this.cleanup();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    // Estimate memory usage
    const memoryUsage = this.estimateMemoryUsage();

    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage
    };
  }

  private cleanup(): void {
    // Remove expired entries
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Limit cache size (LRU eviction)
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove oldest 20% of entries
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // String characters are 2 bytes
      size += JSON.stringify(entry.data).length * 2;
      size += 32; // Overhead for entry metadata
    }
    return Math.round(size / 1024); // Return in KB
  }

  // Preload data into cache
  async preload<T>(key: string, loader: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await loader();
    this.set(key, data, ttl);
    return data;
  }

  // Get or set pattern
  async getOrSet<T>(key: string, loader: () => Promise<T>, ttl?: number): Promise<T> {
    return this.preload(key, loader, ttl);
  }

  // Batch operations
  setMany<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  getMany<T>(keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({
      key,
      data: this.get<T>(key)
    }));
  }

  // Cache warming
  async warmCache<T>(
    keys: string[],
    loader: (key: string) => Promise<T>,
    ttl?: number
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const data = await loader(key);
          this.set(key, data, ttl);
        } catch (error) {
          console.warn(`Failed to warm cache for key: ${key}`, error);
        }
      }
    });

    await Promise.all(promises);
  }
}

// Specialized caches for different data types
export const theoriesCache = new CacheService();
export const searchCache = new CacheService();
export const mediaCache = new CacheService();
export const userDataCache = new CacheService();

// Cache keys
export const CACHE_KEYS = {
  THEORIES: {
    ALL: 'theories:all',
    BY_CATEGORY: (category: string) => `theories:category:${category}`,
    BY_ID: (id: string) => `theories:id:${id}`,
    SEARCH: (query: string, filters: string) => `theories:search:${query}:${filters}`,
    POPULAR: 'theories:popular',
    RECENT: 'theories:recent'
  },
  USER: {
    PROGRESS: (userId: string) => `user:progress:${userId}`,
    BOOKMARKS: (userId: string) => `user:bookmarks:${userId}`,
    PREFERENCES: (userId: string) => `user:preferences:${userId}`
  },
  MEDIA: {
    IMAGE: (url: string) => `media:image:${url}`,
    DIAGRAM: (id: string) => `media:diagram:${id}`
  }
} as const;

// Cache utilities
export class CacheUtils {
  static generateSearchKey(query: string, filters: any): string {
    const filterString = JSON.stringify(filters);
    return CACHE_KEYS.THEORIES.SEARCH(query, filterString);
  }

  static async cacheTheoryContent(theoryId: string, content: any): Promise<void> {
    theoriesCache.set(CACHE_KEYS.THEORIES.BY_ID(theoryId), content, 10 * 60 * 1000); // 10 minutes
  }

  static async getCachedTheoryContent(theoryId: string): Promise<any | null> {
    return theoriesCache.get(CACHE_KEYS.THEORIES.BY_ID(theoryId));
  }

  static async cacheSearchResults(query: string, filters: any, results: any[]): Promise<void> {
    const key = this.generateSearchKey(query, filters);
    searchCache.set(key, results, 2 * 60 * 1000); // 2 minutes for search results
  }

  static async getCachedSearchResults(query: string, filters: any): Promise<any[] | null> {
    const key = this.generateSearchKey(query, filters);
    return searchCache.get(key);
  }

  static getAllCacheStats(): Record<string, any> {
    return {
      theories: theoriesCache.getStats(),
      search: searchCache.getStats(),
      media: mediaCache.getStats(),
      userData: userDataCache.getStats()
    };
  }

  static clearAllCaches(): void {
    theoriesCache.clear();
    searchCache.clear();
    mediaCache.clear();
    userDataCache.clear();
  }

  // Preload essential data
  static async preloadEssentialData(): Promise<void> {
    try {
      // Preload popular theories
      await theoriesCache.preload(
        CACHE_KEYS.THEORIES.POPULAR,
        async () => {
          const response = await fetch('/api/theories?popular=true');
          return response.json();
        },
        15 * 60 * 1000 // 15 minutes
      );

      // Preload recent theories
      await theoriesCache.preload(
        CACHE_KEYS.THEORIES.RECENT,
        async () => {
          const response = await fetch('/api/theories?recent=true');
          return response.json();
        },
        10 * 60 * 1000 // 10 minutes
      );
    } catch (error) {
      console.warn('Failed to preload essential data:', error);
    }
  }
}

// React hook for cache management
export function useCache() {
  const [cacheStats, setCacheStats] = React.useState(CacheUtils.getAllCacheStats());

  const refreshStats = React.useCallback(() => {
    setCacheStats(CacheUtils.getAllCacheStats());
  }, []);

  const clearAllCaches = React.useCallback(() => {
    CacheUtils.clearAllCaches();
    refreshStats();
  }, [refreshStats]);

  React.useEffect(() => {
    const interval = setInterval(refreshStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    cacheStats,
    refreshStats,
    clearAllCaches
  };
}

// Add React import
import React from 'react';
