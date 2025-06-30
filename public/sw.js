
const CACHE_NAME = 'prepgenie-v2';
const STATIC_CACHE = 'prepgenie-static-v2';
const DYNAMIC_CACHE = 'prepgenie-dynamic-v2';
const API_CACHE = 'prepgenie-api-v2';

// Cache strategies configuration
const CACHE_STRATEGIES = {
  // Static assets - Cache first, long-term caching
  static: [
    '/',
    '/manifest.json',
    '/favicon.ico'
  ],
  
  // Dynamic content - Stale while revalidate
  dynamic: [
    '/dashboard',
    '/notes',
    '/flashcards'
  ],
  
  // API calls - Network first with cache fallback
  api: [
    '/api/',
    'https://api.supabase.co/'
  ]
};

// Install event - precache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CACHE_STRATEGIES.static);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old cache versions
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('prepgenie-') && 
              ![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)
            )
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // API requests - Network first with cache fallback
  if (isApiRequest(url)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  }
  // Static assets - Cache first with network fallback
  else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  }
  // Dynamic content - Stale while revalidate
  else if (isDynamicContent(url)) {
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
  }
  // Everything else - Network first
  else {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  }
});

// Helper functions for URL classification
function isApiRequest(url) {
  return CACHE_STRATEGIES.api.some(pattern => url.pathname.startsWith(pattern) || url.href.includes(pattern));
}

function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.woff2', '.woff'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) || 
         CACHE_STRATEGIES.static.includes(url.pathname);
}

function isDynamicContent(url) {
  return CACHE_STRATEGIES.dynamic.some(pattern => url.pathname.startsWith(pattern));
}

// Cache strategies implementation
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Update cache in background for next time
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {}); // Ignore network errors
      
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    // Return offline fallback if available
    return createOfflineFallback(request);
  }
}

async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // No cache either, return offline fallback
    return createOfflineFallback(request);
  }
}

async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to update cache in background
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Don't await the network update
    networkPromise;
    return cachedResponse;
  }
  
  // No cache, wait for network
  try {
    return await networkPromise;
  } catch (error) {
    return createOfflineFallback(request);
  }
}

// Offline fallback responses
function createOfflineFallback(request) {
  if (request.headers.get('accept')?.includes('text/html')) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - PrepGenie</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              color: #374151;
              background: #f9fafb;
            }
            .container { 
              max-width: 500px; 
              margin: 0 auto; 
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            h1 { color: #1f2937; margin-bottom: 1rem; }
            p { margin-bottom: 1rem; line-height: 1.6; }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're offline</h1>
            <p>PrepGenie is currently unavailable. Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
  
  if (request.headers.get('accept')?.includes('application/json')) {
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This request is not available offline' 
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      }
    );
  }
  
  return new Response('Service Unavailable', { status: 503 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Sync any pending offline actions
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('pending-')) {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.log('Background sync failed for:', request.url);
        }
      }
    }
  } catch (error) {
    console.log('Background sync error:', error);
  }
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'prepgenie-notification'
      })
    );
  }
});
