const CACHE_NAME = "taller-celulares-v1"
const urlsToCache = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Interceptar requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devolver desde cache si existe, sino fetch de la red
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Activar Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
