// 電波がなくても開けるように、アプリのファイルを端末に保存しておく
const CACHE = "kakeibo-2026-11-21-3";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/apple-touch-icon.png", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map(path=>new Request(path,{cache:"reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("kakeibo-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// 新しい版があれば取りにいき、電波がなければ保存してある版を使う
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  if(new URL(e.request.url).searchParams.has("app-version-check")){
    e.respondWith(fetch(e.request,{cache:"no-store"}));return;
  }
  e.respondWith(
    fetch(e.request,{cache:"no-store"}).then((res) => {
      const copy = res.clone();
      if(res.ok&&!new URL(e.request.url).searchParams.has("app-version-check")) caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
