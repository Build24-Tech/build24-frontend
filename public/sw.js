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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
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

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

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
});

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
