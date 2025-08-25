// Service Worker registration and management utilities

export interface CacheStats {
  theoryCacheSize: number;
  mediaCacheSize: number;
  lastUpdated: Date;
}

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  async register(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.notifyUpdate();
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.unregister();
      this.registration = null;
      return true;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async clearCache(): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      this.registration!.active!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  async cacheTheory(theoryId: string, content: any): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      this.registration!.active!.postMessage(
        {
          type: 'CACHE_THEORY',
          theoryId,
          content
        },
        [messageChannel.port2]
      );
    });
  }

  async getCacheStats(): Promise<CacheStats | null> {
    if (!('caches' in window)) {
      return null;
    }

    try {
      const cacheNames = await caches.keys();
      let theoryCacheSize = 0;
      let mediaCacheSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        if (cacheName.includes('theory-content')) {
          theoryCacheSize += keys.length;
        } else if (cacheName.includes('theory-media')) {
          mediaCacheSize += keys.length;
        }
      }

      return {
        theoryCacheSize,
        mediaCacheSize,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }

  private notifyUpdate(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      return await navigator.serviceWorker.getRegistration();
    } catch (error) {
      console.error('Failed to get service worker registration:', error);
      return null;
    }
  }
}

// Hook for React components
export function useServiceWorker() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [cacheStats, setCacheStats] = React.useState<CacheStats | null>(null);

  React.useEffect(() => {
    const swManager = ServiceWorkerManager.getInstance();
    setIsSupported(swManager.isSupported());

    if (swManager.isSupported()) {
      swManager.register().then(setIsRegistered);
      swManager.getCacheStats().then(setCacheStats);
    }

    // Listen for updates
    const handleUpdate = () => {
      // Handle service worker update
      console.log('Service worker update available');
    };

    window.addEventListener('sw-update-available', handleUpdate);
    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);

  const clearCache = React.useCallback(async () => {
    const swManager = ServiceWorkerManager.getInstance();
    const success = await swManager.clearCache();
    if (success) {
      setCacheStats(await swManager.getCacheStats());
    }
    return success;
  }, []);

  const refreshCacheStats = React.useCallback(async () => {
    const swManager = ServiceWorkerManager.getInstance();
    const stats = await swManager.getCacheStats();
    setCacheStats(stats);
    return stats;
  }, []);

  return {
    isSupported,
    isRegistered,
    cacheStats,
    clearCache,
    refreshCacheStats
  };
}

// Add React import for the hook
import React from 'react';
