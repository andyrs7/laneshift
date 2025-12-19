// Basic offline caching
const CACHE_NAME = "lane-shift-cache-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});
