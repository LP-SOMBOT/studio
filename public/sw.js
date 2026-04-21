
/**
 * Oskar Shop - PWA Service Worker
 * This service worker is required for the app to be installable on mobile and desktop.
 * It provides the minimum requirements for the PWA 'Install' prompt to be triggered.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic fetch listener to satisfy PWA criteria
  event.respondWith(fetch(event.request));
});
