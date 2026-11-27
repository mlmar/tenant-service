// Cache only the application shell. API responses and customer data stay online.
const PREFIX = "__APP_SHELL__";
const CACHE = PREFIX + 'v1';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add('/')));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate' || new URL(event.request.url).origin !== self.location.origin) return;
  const { pathname } = new URL(event.request.url);
  if (pathname === '/api' || pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(CACHE);
    return await cache.match('/') ?? Response.error();
  }));
});
