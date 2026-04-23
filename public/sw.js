
/**
 * OskarShop PWA Service Worker
 * Handles background notifications and offline capabilities.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Oskar Shop", body: event.data.text() };
    }
  }

  const title = data.title || "Oskar Shop Update";
  const options = {
    body: data.body || "New update from Oskar Shop!",
    icon: data.icon || "https://placehold.co/192x192/7C3AED/FFFFFF/png?text=O",
    badge: "https://placehold.co/96x96/7C3AED/FFFFFF/png?text=O",
    tag: data.tag || 'general-notification',
    renotify: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
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
