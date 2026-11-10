/* Mapudungukeaiñ Fill Püle: offline support.
   The game page is fetched from the network first, so updates arrive as soon as there is a connection,
   and served from the cache when offline. Icons and Google Fonts are served from the cache.
   Only caches named mapudungukeain-* are managed here; the dictionary keeps its own (nemulkawe-*). */
const CACHE = 'mapudungukeain-v20261109195944';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('mapudungukeain-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* the dictionary (diccionario/) and the about page (acerca/) are separate pages: never cache them as the game page,
     and leave the dictionary's files to its own service worker */
  const scope = new URL(self.registration.scope).pathname;
  if (url.origin === location.origin && /^(diccionario|acerca)\//.test(url.pathname.slice(scope.length))) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  /* the manifest and icons are fetched from the network first: Android re-reads them to install or update the app, and a
     stale cached copy keeps an old scope or makes the install fall back to a Chrome shortcut */
  if (url.origin === location.origin && /\/manifest\.webmanifest$|\/(icon-\d+|icon-maskable-\d+|apple-touch-icon)\.png$/.test(url.pathname)) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
      .catch(() => caches.match(req)));
    return;
  }
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r; })));
  }
});
