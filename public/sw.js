// Mari Milkat Service Worker (PWA & Web Push Notifications)
const CACHE_NAME = 'mari-milkat-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/favicon.svg'
];

// 1. Install Event: Cache shell assets & activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up stale caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Stale-While-Revalidate for static assets, network-only for APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass service worker for non-GET requests or backend API calls
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Network First with Cache Fallback for navigation and assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful response for offline use
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback to root index.html for SPA route navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// 4. Web Push Notification Event: Runs even when browser tab is closed!
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Mari Milkat | Property Alert';
  const options = {
    body: data.body || 'You have a new real estate notification.',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    image: data.image || undefined,
    tag: data.tag || `mari-milkat-${Date.now()}`,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      primaryKey: data.id || '1',
      ...(data.data || {})
    },
    vibrate: [200, 100, 200],
    actions: data.actions || [
      { action: 'explore', title: '👀 View Property' },
      { action: 'close', title: '✖ Dismiss' }
    ],
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 5. Notification Click Event: Focus or open window to target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a client window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

