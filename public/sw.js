
self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  const title = data.title || 'Oskar Shop';
  const options = {
    body: data.body || 'New update from Oskar Shop!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: data.link || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
