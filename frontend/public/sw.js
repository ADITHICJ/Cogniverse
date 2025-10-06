// Service Worker for PrepSmart PWA
const CACHE_NAME = 'prepsmart-v1';
const STATIC_CACHE = 'prepsmart-static-v1';
const DYNAMIC_CACHE = 'prepsmart-dynamic-v1';

// Files to cache on install
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/dashboard/teacher',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Add other critical assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https?:\/\/.*\/api\/(templates|drafts)/,
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and browser requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') return;

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML documents - Network First with Cache Fallback
    event.respondWith(handleDocumentRequest(request));
  } else if (isStaticAsset(request)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAssetRequest(request));
  } else if (isAPIRequest(request)) {
    // API requests - Network First with Cache Fallback
    event.respondWith(handleAPIRequest(request));
  } else {
    // Other requests - Network First
    event.respondWith(handleNetworkFirst(request));
  }
});

// Document request handler (Network First)
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for document, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback page
    return caches.match('/');
  }
}

// Static asset request handler (Cache First)
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    throw error;
  }
}

// API request handler (Network First with limited cache)
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache GET requests that are successful
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Set a shorter TTL for API responses
      const responseWithTTL = await addTTLToResponse(networkResponse.clone());
      cache.put(request, responseWithTTL);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse && !isResponseExpired(cachedResponse)) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Network First fallback
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Helper functions
function isStaticAsset(request) {
  return request.destination === 'image' || 
         request.destination === 'style' || 
         request.destination === 'script' ||
         request.destination === 'font' ||
         request.url.includes('/_next/static/');
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

async function addTTLToResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-timestamp', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

function isResponseExpired(response) {
  const timestamp = response.headers.get('sw-cache-timestamp');
  if (!timestamp) return true;
  
  const cacheTime = parseInt(timestamp);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  return (now - cacheTime) > fiveMinutes;
}

// Background sync for draft saving
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-draft-sync') {
    event.waitUntil(syncDrafts());
  }
});

async function syncDrafts() {
  try {
    // Get pending draft saves from IndexedDB or localStorage
    // This would integrate with your draft saving logic
    console.log('[SW] Syncing pending drafts...');
    
    // Implementation would depend on how you store pending changes
    // For now, just log that sync was attempted
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Error syncing drafts:', error);
    throw error;
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have new collaboration updates!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'prepsmart-notification',
    data: {
      url: '/dashboard/teacher'
    },
    actions: [
      {
        action: 'open',
        title: 'View Updates'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.message || options.body;
      options.data.url = payload.url || options.data.url;
    } catch (error) {
      console.log('[SW] Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('PrepSmart', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/dashboard/teacher';
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window' })
        .then((clients) => {
          // Check if there's already a window open
          for (const client of clients) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker script loaded');