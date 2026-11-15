/* Constructor de verbos: offline support. The page, the interface (app.js, app.css), the rules (reglas.js), the roots (raices.js) and the data (datos.js) are fetched from the
   network first and revalidated, so an edit pushed to GitHub arrives as soon as there is a connection, and are served
   from the cache when offline. Only caches named verbos-* are managed here; the game and the dictionary keep their own. */
const CACHE = 'verbos-v3';
const CORE = ['./', './index.html', './app.js', './app.css', './reglas.js', './datos.js', './raices.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('verbos-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const scope = new URL(self.registration.scope);
  const inScope = url.origin === location.origin && url.pathname.startsWith(scope.pathname);
  if (!inScope) return;
  /* the app's web page (acerca/) is a separate page: never cache it as the app page */
  if (url.pathname.startsWith(scope.pathname + 'acerca/')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  /* everything else in scope: network first with revalidation (GitHub Pages lets browsers reuse a copy for ten minutes),
     falling back to the cache offline */
  e.respondWith(fetch(req, {cache: 'no-cache'}).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
    .catch(() => caches.match(req, {ignoreSearch: true})));
});
