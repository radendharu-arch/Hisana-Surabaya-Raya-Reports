// Service worker khusus Pusat Laporan Hisana.
// Tujuannya cuma bikin halaman ini "installable" (PWA) — bukan untuk cache data
// dashboard, karena data di tiap dashboard sifatnya live/berubah tiap hari.
const CACHE_NAME = 'hisana-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Network-first untuk semua request: selalu coba ambil versi terbaru dulu.
// Kalau offline / gagal, baru fallback ke shell yang di-cache (index.html saja).
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
