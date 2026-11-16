/* Service worker del portal de clientes y la landing de JS Logistics.
   A propósito hace muy poco: el único archivo que guarda es la pantalla "sin conexión". NO guarda pedidos, saldos, sueldos
   ni ninguna respuesta de /api, así que nunca se muestra un dato viejo. Los archivos de la app (/assets/…) los guarda el
   caché normal del navegador, con nombre nuevo en cada despliegue. Por eso una versión nueva se ve apenas se recarga.
   Si cambias la pantalla sin conexión, sube VERSION para que se vuelva a guardar. */
const VERSION = "v1";
const CACHE = "jsl-sin-conexion-" + VERSION;
const PANTALLA = "/sin-conexion.html";

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((c) => c.add(new Request(PANTALLA, { cache: "reload" }))).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k.startsWith("jsl-sin-conexion-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Solo cuando se abre una página (navegación) y no hay red se muestra la pantalla sin conexión. Todo lo demás (API, imágenes,
// scripts) pasa directo a la red sin que el service worker intervenga.
self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.mode !== "navigate") return;
  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  evento.respondWith(fetch(peticion).catch(() => caches.match(PANTALLA).then((r) => r || Response.error())));
});
