/**
 * OskarShop PWA Service Worker
 * Required for browser installability.
 */

const CACHE_NAME = 'oskar-shop-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch pass-through to satisfy PWA requirements
  event.respondWith(fetch(event.request));
});