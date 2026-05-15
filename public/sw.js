
/**
 * OskarShop Service Worker
 * Handles PWA installation and Push Notifications for background events.
 */

const CACHE_NAME = 'oskar-shop-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

/**
 * Handle Push Notifications
 */
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || 'https://placehold.co/192x192/7C3AED/FFFFFF/png?text=O',
      badge: 'https://placehold.co/96x96/7C3AED/FFFFFF/png?text=O',
      tag: data.tag || 'general-alert',
      renotify: true,
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Oskar Shop', options)
    );
  } catch (e) {
    // Fallback for non-JSON payloads
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Oskar Shop Update', {
        body: text,
        icon: 'https://placehold.co/192x192/7C3AED/FFFFFF/png?text=O',
      })
    );
  }
});

/**
 * Handle Notification Click
 */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
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
