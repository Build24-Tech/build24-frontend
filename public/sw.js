// Service Worker for Launch Essentials PWA
const CACHE_NAME = 'launch-essentials-v1';
const STATIC_CACHE_NAME = 'launch-essentials-static-v1';
const DYNAMIC_CACHE_NAME = 'launch-essentials-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/launch-essentials',
  '/launch-essentials/offline',
  '/favicon.png',
  '/og-image.png',
  // Add critical CSS and JS files here
];

// Assets to cache on first request
const DYNAMIC_ASSETS = [
  '/launch-essentials/validation',
  '/launch-essentials/definition',
  '/launch-essentials/architecture',
  '/launch-essentials/go-to-market',
  '/launch-essentials/operations',
  '/launch-essentials/financial',
  '/launch-essentials/risk',
  '/launch-essentials/optimization',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle launch essentials routes
  if (url.pathname.startsWith('/launch-essentials')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Serve from cache
            return cachedResponse;
          }

          // Fetch from network and cache
          return fetch(request)
            .then((networkResponse) => {
              // Don't cache if not successful
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }

              // Clone the response
              const responseToCache = networkResponse.clone();

              // Cache dynamic assets
              if (DYNAMIC_ASSETS.some(asset => url.pathname.includes(asset))) {
                caches.open(DYNAMIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }

              return networkResponse;
            })
            .catch(() => {
              // Network failed, try to serve offline page
              if (url.pathname.startsWith('/launch-essentials')) {
                return caches.match('/launch-essentials/offline');
              }
            });
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful API responses
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(request);
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/launch-essentials'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Launch Essentials', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/launch-essentials')
    );
  }
});

// Sync progress data when back online
async function syncProgressData() {
  try {
    // Get stored offline data
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const offlineData = await cache.match('/offline-progress');

    if (offlineData) {
      const data = await offlineData.json();

      // Send to server
      const response = await fetch('/api/sync-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Remove from cache after successful sync
        await cache.delete('/offline-progress');
        console.log('Progress data synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync progress data:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);

  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

console.log('Service Worker loaded');
