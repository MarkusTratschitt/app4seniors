/* eslint-disable @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-floating-promises,
  @typescript-eslint/require-await */

const CACHE_PREFIX = "seniors-cache";
const PRECACHE_VERSION = "v1";
const PRECACHE_NAME = `${CACHE_PREFIX}-precache-${PRECACHE_VERSION}`;
const PAGE_CACHE_NAME = `${CACHE_PREFIX}-pages-${PRECACHE_VERSION}`;
const MEDIA_CACHE_NAME = `${CACHE_PREFIX}-media-${PRECACHE_VERSION}`;

const TOP_HOWTO_SLUGS = [
  "android-home-kacheln-ordnen",
  "android-notfallinformationen",
  "android-screenshot",
  "android-wifi-verbinden",
  "ios-airdrop-fotos",
  "ios-display-zoom",
  "ios-notfallkontakte",
  "ios-screenshot",
  "ipados-apple-pencil-notes",
  "ipados-files-share",
  "ipados-screenshot",
  "ipados-split-view",
  "macos-airdrop",
  "macos-fokus-modus",
  "macos-screenshot",
  "macos-textgroesse-anpassen",
  "windows-bildschirm-vergroessern",
  "windows-screenshot",
  "windows-taskleiste-pin",
  "windows-updates-installieren",
];

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  ...TOP_HOWTO_SLUGS.slice(0, 50).map((slug) => `/howto/${slug}`),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE_NAME);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch (error) {
            console.warn("[sw] Failed to precache", url, error);
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const validCaches = [PRECACHE_NAME, PAGE_CACHE_NAME, MEDIA_CACHE_NAME];
      const hadPreviousCaches = keys.some((key) =>
        key.startsWith(CACHE_PREFIX),
      );

      await Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();

      if (hadPreviousCaches) {
        await notifyClients({ type: "SW_ACTIVATED", updated: true });
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (
    request.destination === "image" ||
    request.destination === "audio" ||
    request.destination === "video"
  ) {
    event.respondWith(handleMediaRequest(request));
    return;
  }

  if (
    url.origin === self.location.origin &&
    url.pathname.startsWith("/howto/")
  ) {
    event.respondWith(cacheFirst(request, PAGE_CACHE_NAME));
  }
});

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(PAGE_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(PAGE_CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    const precache = await caches.open(PRECACHE_NAME);
    const fallback = await precache.match("/");
    if (fallback) {
      return fallback;
    }

    return new Response("Offline-Modus: Inhalt nicht verfügbar.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function handleMediaRequest(request) {
  const cache = await caches.open(MEDIA_CACHE_NAME);
  const cached = await cache.match(request);

  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  await Promise.all(
    clients.map(async (client) => {
      try {
        client.postMessage(message);
      } catch (error) {
        console.warn("[sw] Failed to post message", error);
      }
    }),
  );
}
