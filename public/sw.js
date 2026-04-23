
/**
 * Oskar Shop - Service Worker
 * Handles PWA installability and background notifications.
 */

const CACHE_NAME = 'oskar-shop-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // standard fetch handler for PWA installability
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

/**
 * Background Notification Handling
 * This allows the browser to show notifications even when the app is in the background.
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Oskar Shop Update';
  const options = {
    body: data.body || 'Something new is happening!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: data.url || '/',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow(event.notification.data || '/');
    })
  );
});
