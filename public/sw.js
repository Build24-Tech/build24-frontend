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

// Service Worker for Knowledge Hub content caching
const CACHE_NAME = 'knowledge-hub-v1';
const THEORY_CACHE = 'theory-content-v1';
const MEDIA_CACHE = 'theory-media-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// URLs to cache
const STATIC_ASSETS = [
  '/dashboard/knowledge-hub',
  '/api/theories',
  '/content/theories/'
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
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


  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) =>
              cacheName !== CACHE_NAME &&
              cacheName !== THEORY_CACHE &&
              cacheName !== MEDIA_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
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

  // Theory content - cache first strategy
  if (url.pathname.includes('/content/theories/') || url.pathname.includes('/api/theories')) {
    event.respondWith(cacheFirst(request, THEORY_CACHE));
    return;
  }

  // Theory images and media - stale while revalidate
  if (url.pathname.includes('/images/theories/') ||
    url.pathname.includes('/media/theories/') ||
    request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE));
    return;
  }

  // API requests - network first with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Default strategy for other requests
  event.respondWith(
    caches.match(request)
      .then((response) => response || fetch(request))
  );

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

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => { }); // Ignore network errors

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    return new Response(
      JSON.stringify({ error: 'Content unavailable offline' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => { }); // Ignore network errors

  return cachedResponse || fetchPromise;
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.map((name) => caches.delete(name)))
        )
        .then(() => event.ports[0].postMessage({ success: true }))
    );
  }

  if (event.data && event.data.type === 'CACHE_THEORY') {
    const { theoryId, content } = event.data;
    event.waitUntil(
      caches.open(THEORY_CACHE)
        .then((cache) =>
          cache.put(
            `/api/theories/${theoryId}`,
            new Response(JSON.stringify(content), {
              headers: { 'Content-Type': 'application/json' }
            })
          )
        )
        .then(() => event.ports[0].postMessage({ success: true }))
    );
  }
});
