/* Guarda la app en el móvil para que funcione sin conexión.
   Si cambias algún archivo, sube también este con VERSION distinta para forzar la actualización. */
const VERSION = 'cambios-futsal-1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'icon-maskable-512.png',
  'saira-latin-400-normal.woff2', 'saira-latin-500-normal.woff2', 'saira-latin-600-normal.woff2',
  'saira-condensed-latin-500-normal.woff2', 'saira-condensed-latin-600-normal.woff2', 'saira-condensed-latin-700-normal.woff2'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req).then(res => { if (res && res.ok) cache.put(key, res.clone()); return res; }).catch(() => null);
    if (cached) { e.waitUntil(fresh); return cached; }   // al instante desde el móvil; se actualiza en segundo plano
    return (await fresh) || new Response('Sin conexión', { status: 503 });
  }));
});
