
/**
 * Service Worker for Oskar Shop
 * Required for PWA installability and offline support.
 */

const CACHE_NAME = 'oskar-shop-v1';

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim any clients immediately, so the page doesn't need to be reloaded.
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  /**
   * Basic fetch handler. 
   * A 'fetch' event listener is mandatory for the browser to consider the app a PWA.
   */
  event.respondWith(
    fetch(event.request).catch(() => {
      // Fallback or offline logic could go here
      return caches.match(event.request);
    })
  );
});
