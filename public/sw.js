// No-op service worker — prevents 404 from external tools expecting /sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
