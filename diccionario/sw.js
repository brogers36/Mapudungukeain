/* Tañi Nemülkawe: offline support. The page and data are fetched from the network first, so updates arrive as soon as
   there is a connection, and served from the cache when offline. The parser engine (motor.js) is cached too and revalidated on each load. */
const CACHE = 'nemulkawe-20261112113049';
const CORE = ['./', './index.html', './datos.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './worker.js', './stub.js', './gramatica.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('nemulkawe-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const scope = new URL(self.registration.scope);
  const inScope = url.origin === location.origin && url.pathname.startsWith(scope.pathname);
  /* the dictionary's web page (acerca/) is a separate page: never cache it as the app page */
  if (url.origin === location.origin && url.pathname.startsWith(scope.pathname + 'acerca/')) return;
  if (req.mode === 'navigate' && inScope) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  /* the manifest and the icons too: Android's installer re-reads them from the site, and a stale cached copy makes the
     install fall back to a Chrome shortcut */
  /* the parser engine (motor.js) too, and all of these revalidated with the server (no-cache): GitHub Pages lets browsers
     reuse a copy for ten minutes, and a cache-first engine kept the old parser after an update while the page was new */
  if (inScope && /\/(datos|datos_es|ejemplos|worker|stub|gramatica|motor)\.js$|\/manifest\.webmanifest$|\/(icon-\d+|icon-maskable-\d+|apple-touch-icon)\.png$/.test(url.pathname)) {
    e.respondWith(fetch(req, {cache: 'no-cache'}).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
      .catch(() => caches.match(req)));
    return;
  }
  if (inScope || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r; })));
  }
});
