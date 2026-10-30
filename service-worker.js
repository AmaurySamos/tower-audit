const CACHE_NAME = "tower-audit-v2";

const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json"
];

self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Delete old caches so updated versions of index.html actually reach the phones
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    // Only cache-first for GET requests to this site; let uploads go straight to the network
    if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
