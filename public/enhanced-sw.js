
const CACHE_NAME = 'study-tool-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Cache configurations
const CACHE_CONFIG = {
  static: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
  },
  api: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxEntries: 50,
    maxAgeSeconds: 5 * 60 // 5 minutes
  },
  images: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxEntries: 200,
    maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
  }
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  // Add other critical assets
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Enhanced Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Enhanced Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Enhanced Service Worker activated');
        self.clients.claim();
        
        // Notify clients about activation
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              data: { timestamp: Date.now() }
            });
          });
        });
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (unless configured otherwise)
  if (url.origin !== location.origin && !url.origin.includes('supabase.co')) {
    return;
  }
  
  // Determine cache strategy based on request type
  let strategy;
  let cacheName;
  
  if (isStaticAsset(request)) {
    strategy = CACHE_CONFIG.static.strategy;
    cacheName = STATIC_CACHE;
  } else if (isAPIRequest(request)) {
    strategy = CACHE_CONFIG.api.strategy;
    cacheName = DYNAMIC_CACHE;
  } else if (isImageRequest(request)) {
    strategy = CACHE_CONFIG.images.strategy;
    cacheName = IMAGE_CACHE;
  } else {
    strategy = CACHE_STRATEGIES.NETWORK_FIRST;
    cacheName = DYNAMIC_CACHE;
  }
  
  event.respondWith(
    handleRequest(request, strategy, cacheName)
  );
});

// Handle different cache strategies
async function handleRequest(request, strategy, cacheName) {
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheName);
      
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheName);
      
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheName);
      
      default:
        return await networkFirst(request, cacheName);
    }
  } catch (error) {
    console.error('Request handling failed:', error);
    return await getOfflineFallback(request);
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return await getOfflineFallback(request);
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Notify clients about cache update
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_UPDATED',
            data: { url: request.url, timestamp: Date.now() }
          });
        });
      });
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Notify clients we're using offline fallback
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'OFFLINE_FALLBACK',
            data: { url: request.url }
          });
        });
      });
      
      return cachedResponse;
    }
    
    return await getOfflineFallback(request);
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  
  return cachedResponse || await networkResponsePromise || await getOfflineFallback(request);
}

// Get offline fallback
async function getOfflineFallback(request) {
  if (request.mode === 'navigate') {
    // Return cached index.html for navigation requests
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match('/') || new Response('Offline', { status: 503 });
  }
  
  if (isImageRequest(request)) {
    // Return placeholder image for images
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">Image Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Resource not available offline', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|html|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.origin.includes('supabase.co') ||
         url.pathname.includes('/functions/');
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/);
}

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'notes-sync') {
    event.waitUntil(syncNotes());
  } else if (event.tag === 'offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync notes when online
async function syncNotes() {
  try {
    console.log('Syncing notes...');
    // Implementation would sync offline notes
    
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          data: { type: 'notes', timestamp: Date.now() }
        });
      });
    });
  } catch (error) {
    console.error('Notes sync failed:', error);
  }
}

// Sync offline actions
async function syncOfflineActions() {
  try {
    console.log('Syncing offline actions...');
    // Implementation would replay offline actions
    
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          data: { type: 'actions', timestamp: Date.now() }
        });
      });
    });
  } catch (error) {
    console.error('Offline actions sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: data.data
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/')
  );
});

// Message handling
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(data.urls));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;
  }
});

// Cache specific URLs
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return Promise.all(
    urls.map(url => {
      return fetch(url)
        .then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        })
        .catch(error => console.warn('Failed to cache:', url, error));
    })
  );
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

console.log('Enhanced Service Worker loaded');
