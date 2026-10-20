const V = "kuechenplan-v3";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  const own = u.origin === location.origin;
  const lib = u.hostname === "www.gstatic.com" || u.hostname === "fonts.gstatic.com" || u.hostname === "fonts.googleapis.com";
  if (!own && !lib) return; // Firestore/Auth nie anfassen
  if (own && (r.mode === "navigate" || u.pathname.endsWith("firebase-config.js") || u.pathname.endsWith("index.html"))) {
    e.respondWith(fetch(r, {cache: "no-store"}).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(r).then(m => { const f = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; }).catch(() => m); return m || f; }));
});
