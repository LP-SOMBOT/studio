/**
 * Standard Service Worker for PWA Installability
 */
const CACHE_NAME = 'oskar-shop-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch to satisfy PWA requirements
  event.respondWith(fetch(event.request));
});
