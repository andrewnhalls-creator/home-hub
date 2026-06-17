// Home Hub service worker — handles push notifications, notification clicks, and offline caching.

const STATIC_CACHE = "home-hub-static-v1";
const PAGE_CACHE = "home-hub-pages-v1";

// ─── Install: claim clients immediately ──────────────────────────────────────

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  // Remove obsolete caches from older SW versions
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) {
            return k !== STATIC_CACHE && k !== PAGE_CACHE;
          })
          .map(function (k) {
            return caches.delete(k);
          }),
      );
    }),
  );
  self.clients.claim();
});

// ─── Fetch: cache strategy ────────────────────────────────────────────────────

self.addEventListener("fetch", function (event) {
  const req = event.request;

  // Only intercept GET requests
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Cache-first for Next.js immutable static assets
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (response) {
            if (response.ok) cache.put(req, response.clone());
            return response;
          });
        });
      }),
    );
    return;
  }

  // Network-first for shopping routes, fall back to cached page shell
  if (
    url.pathname === "/compra" ||
    url.pathname.startsWith("/compra/listas")
  ) {
    event.respondWith(
      fetch(req)
        .then(function (response) {
          if (response.ok) {
            caches.open(PAGE_CACHE).then(function (cache) {
              cache.put(req, response.clone());
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match(req);
        }),
    );
    return;
  }
});

// ─── Push notifications ───────────────────────────────────────────────────────

self.addEventListener("push", function (event) {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Home Hub", body: event.data.text() };
  }

  const title = data.title || "Home Hub";
  const options = {
    body: data.body || "",
    icon: "/favicon.ico",
    tag: data.tag || "home-hub-notification",
    data: { url: data.url || "/" },
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
