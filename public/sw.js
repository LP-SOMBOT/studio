/*
* Oskar Shop Service Worker
* Essential for PWA Installability and Push Notifications.
*/

const CACHE_NAME = 'oskar-shop-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // PWA requirement: handle fetch events. 
  // We prioritize network for real-time gaming data.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Oskar Shop', body: event.data ? event.data.text() : 'Adeeg deg deg ah!' };
  }
  
  const options = {
    body: data.body || 'Adeeg deg deg ah iyo Qiimo jaban.',
    icon: data.icon || 'https://placehold.co/192x192/0EA5E9/FFFFFF/png?text=O',
    badge: 'https://placehold.co/192x192/0EA5E9/FFFFFF/png?text=O',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Oskar Shop', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});