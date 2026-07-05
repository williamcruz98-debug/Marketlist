const CACHE = 'market-list-v1';

// Install: cache only what we know exists
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Cache the page itself using current location
      return cache.add(self.location.href.replace('sw.js', 'index.html'))
        .catch(function() { return; }); // fail silently if can't cache
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(e) {
  if(e.request.method !== 'GET') return;
  if(!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        if(response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(e.request);
      })
  );
});
