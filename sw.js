// Service worker: caches the app shell so the app opens offline; live data always comes from the network.
const CACHE = "ashrf-tours-v6";
const SHELL = [
  "./", "index.html", "styles.css", "app.js", "config.js", "i18n.js", "manifest.webmanifest",
  "auth.js", "quotes.js", "codes-gate.js", "access-codes.js", "assets/logo.svg", "assets/icon-192.png", "assets/icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isShell = url.origin === location.origin || url.hostname === "unpkg.com";
  if (!isShell) return; // APIs and map tiles: straight to network
  // network-first so updates to config/logo show up, cache as offline fallback
  e.respondWith(
    fetch(req, { cache: "no-cache" })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
  );
});
