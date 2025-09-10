import { CACHE_KEYS, CacheUtils, searchCache, theoriesCache } from '@/lib/cache-service';
import { ServiceWorkerManager } from '@/lib/service-worker';

// Mock fetch
global.fetch = jest.fn();

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn().mockResolvedValue({
      addEventListener: jest.fn(),
      active: {
        postMessage: jest.fn()
      }
    }),
    getRegistration: jest.fn().mockResolvedValue(null)
  },
  writable: true
});

describe('Cache Service', () => {
  beforeEach(() => {
    theoriesCache.clear();
    searchCache.clear();
    jest.clearAllMocks();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve data', () => {
      const testData = { id: '1', title: 'Test Theory' };
      theoriesCache.set('test-key', testData);

      const retrieved = theoriesCache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = theoriesCache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should respect TTL and expire entries', async () => {
      const testData = { id: '1', title: 'Test Theory' };
      theoriesCache.set('test-key', testData, 100); // 100ms TTL

      expect(theoriesCache.get('test-key')).toEqual(testData);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(theoriesCache.get('test-key')).toBeNull();
    });

    it('should track cache statistics', () => {
      theoriesCache.set('key1', 'data1');
      theoriesCache.set('key2', 'data2');

      theoriesCache.get('key1'); // Hit
      theoriesCache.get('key1'); // Hit
      theoriesCache.get('non-existent'); // Miss

      const stats = theoriesCache.getStats();
      expect(stats.totalEntries).toBe(2);
      expect(stats.totalHits).toBe(2);
      expect(stats.totalMisses).toBe(1);
      expect(stats.hitRate).toBe(66.67);
    });
  });

  describe('Cache Utilities', () => {
    it('should generate consistent search keys', () => {
      const query = 'test query';
      const filters = { category: 'cognitive-biases', difficulty: ['beginner'] };

      const key1 = CacheUtils.generateSearchKey(query, filters);
      const key2 = CacheUtils.generateSearchKey(query, filters);

      expect(key1).toBe(key2);
    });

    it('should cache and retrieve theory content', async () => {
      const theoryId = 'anchoring-bias';
      const content = { title: 'Anchoring Bias', summary: 'Test summary' };

      await CacheUtils.cacheTheoryContent(theoryId, content);
      const retrieved = await CacheUtils.getCachedTheoryContent(theoryId);

      expect(retrieved).toEqual(content);
    });

    it('should cache and retrieve search results', async () => {
      const query = 'bias';
      const filters = { category: [] };
      const results = [{ id: '1', title: 'Test Theory' }];

      await CacheUtils.cacheSearchResults(query, filters, results);
      const retrieved = await CacheUtils.getCachedSearchResults(query, filters);

      expect(retrieved).toEqual(results);
    });
  });

  describe('Batch Operations', () => {
    it('should set multiple entries at once', () => {
      const entries = [
        { key: 'key1', data: 'data1' },
        { key: 'key2', data: 'data2' },
        { key: 'key3', data: 'data3' }
      ];

      theoriesCache.setMany(entries);

      expect(theoriesCache.get('key1')).toBe('data1');
      expect(theoriesCache.get('key2')).toBe('data2');
      expect(theoriesCache.get('key3')).toBe('data3');
    });

    it('should get multiple entries at once', () => {
      theoriesCache.set('key1', 'data1');
      theoriesCache.set('key2', 'data2');

      const results = theoriesCache.getMany(['key1', 'key2', 'key3']);

      expect(results).toEqual([
        { key: 'key1', data: 'data1' },
        { key: 'key2', data: 'data2' },
        { key: 'key3', data: null }
      ]);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with loader function', async () => {
      const loader = jest.fn().mockImplementation((key: string) =>
        Promise.resolve(`data-${key}`)
      );

      const keys = ['key1', 'key2', 'key3'];
      await theoriesCache.warmCache(keys, loader);

      expect(loader).toHaveBeenCalledTimes(3);
      expect(theoriesCache.get('key1')).toBe('data-key1');
      expect(theoriesCache.get('key2')).toBe('data-key2');
      expect(theoriesCache.get('key3')).toBe('data-key3');
    });

    it('should not reload existing cache entries', async () => {
      const loader = jest.fn().mockImplementation((key: string) =>
        Promise.resolve(`data-${key}`)
      );

      // Pre-populate one key
      theoriesCache.set('key1', 'existing-data');

      const keys = ['key1', 'key2'];
      await theoriesCache.warmCache(keys, loader);

      expect(loader).toHaveBeenCalledTimes(1); // Only called for key2
      expect(theoriesCache.get('key1')).toBe('existing-data');
      expect(theoriesCache.get('key2')).toBe('data-key2');
    });
  });
});

describe('Service Worker Manager', () => {
  let swManager: ServiceWorkerManager;

  beforeEach(() => {
    swManager = ServiceWorkerManager.getInstance();
    jest.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = ServiceWorkerManager.getInstance();
    const instance2 = ServiceWorkerManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register service worker successfully', async () => {
    const result = await swManager.register();
    expect(result).toBe(true);
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
      scope: '/'
    });
  });

  it('should handle registration failure gracefully', async () => {
    (navigator.serviceWorker.register as jest.Mock).mockRejectedValueOnce(
      new Error('Registration failed')
    );

    const result = await swManager.register();
    expect(result).toBe(false);
  });

  it('should check if service worker is supported', () => {
    expect(swManager.isSupported()).toBe(true);
  });
});

describe('Performance Optimization Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    theoriesCache.clear();
    searchCache.clear();
  });

  it('should preload essential data', async () => {
    const mockPopularTheories = [
      { id: '1', title: 'Popular Theory 1' },
      { id: '2', title: 'Popular Theory 2' }
    ];

    const mockRecentTheories = [
      { id: '3', title: 'Recent Theory 1' },
      { id: '4', title: 'Recent Theory 2' }
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockPopularTheories)
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockRecentTheories)
      } as Response);

    await CacheUtils.preloadEssentialData();

    expect(fetch).toHaveBeenCalledWith('/api/theories?popular=true');
    expect(fetch).toHaveBeenCalledWith('/api/theories?recent=true');

    const popularCached = theoriesCache.get(CACHE_KEYS.THEORIES.POPULAR);
    const recentCached = theoriesCache.get(CACHE_KEYS.THEORIES.RECENT);

    expect(popularCached).toEqual(mockPopularTheories);
    expect(recentCached).toEqual(mockRecentTheories);
  });

  it('should handle preload failures gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Should not throw
    await expect(CacheUtils.preloadEssentialData()).resolves.toBeUndefined();
  });

  it('should provide comprehensive cache statistics', () => {
    // Add some data to different caches
    theoriesCache.set('theory1', { id: '1' });
    theoriesCache.set('theory2', { id: '2' });
    searchCache.set('search1', [{ id: '1' }]);

    // Generate some hits and misses
    theoriesCache.get('theory1'); // Hit
    theoriesCache.get('nonexistent'); // Miss
    searchCache.get('search1'); // Hit

    const allStats = CacheUtils.getAllCacheStats();

    expect(allStats.theories.totalEntries).toBe(2);
    expect(allStats.theories.totalHits).toBe(1);
    expect(allStats.theories.totalMisses).toBe(1);
    expect(allStats.search.totalEntries).toBe(1);
    expect(allStats.search.totalHits).toBe(1);
  });

  it('should clear all caches', () => {
    // Populate caches
    theoriesCache.set('theory1', { id: '1' });
    searchCache.set('search1', [{ id: '1' }]);

    expect(theoriesCache.get('theory1')).toBeTruthy();
    expect(searchCache.get('search1')).toBeTruthy();

    CacheUtils.clearAllCaches();

    expect(theoriesCache.get('theory1')).toBeNull();
    expect(searchCache.get('search1')).toBeNull();
  });
});

describe('Memory Management', () => {
  it('should estimate memory usage', () => {
    const largeData = {
      id: '1',
      title: 'A'.repeat(1000),
      content: 'B'.repeat(5000)
    };

    theoriesCache.set('large-entry', largeData);
    const stats = theoriesCache.getStats();

    expect(stats.memoryUsage).toBeGreaterThan(0);
  });

  it('should cleanup expired entries', async () => {
    // Clear cache first to ensure clean state
    theoriesCache.clear();

    // Add entries with short TTL
    theoriesCache.set('short1', 'data1', 50);
    theoriesCache.set('short2', 'data2', 50);
    theoriesCache.set('long', 'data3', 10000);

    expect(theoriesCache.getStats().totalEntries).toBe(3);

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 100));

    // Access cache to trigger cleanup
    theoriesCache.get('long');

    const stats = theoriesCache.getStats();
    expect(stats.totalEntries).toBe(1);
  });
});
