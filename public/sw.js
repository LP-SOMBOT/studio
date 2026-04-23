
/**
 * Oskar Shop PWA Service Worker
 * Handles background push notifications and PWA installability.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : 'New update from Oskar Shop' };
  }

  const title = data.title || 'Oskar Shop';
  const options = {
    body: data.body || 'Something new is happening!',
    icon: 'https://placehold.co/192x192/7C3AED/FFFFFF/png?text=O',
    badge: 'https://placehold.co/96x96/7C3AED/FFFFFF/png?text=O',
    data: data.url || '/',
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
