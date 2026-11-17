/* Carga de pantallas que sobrevive a un despliegue nuevo.
   Con la app instalada (PWA) la pestaña puede quedar abierta días: sigue con el JavaScript viejo, que pide archivos
   /assets/… con el nombre de la versión anterior. Después de un despliegue esos archivos ya no existen y el menú
   mostraba solo "Failed to fetch dynamically imported module: https://…". Aquí se reintenta una vez (por si fue la señal)
   y, si el archivo de verdad ya no existe, se recarga la app UNA vez para traer la versión nueva. */
const CLAVE = "jsl_recarga_chunks";
const VENTANA_MS = 60_000;

/** Recarga una sola vez por minuto, para no entrar en un ciclo si el fallo es de red y no de versión. */
function recargarUnaVez(): boolean {
  try {
    const antes = Number(sessionStorage.getItem(CLAVE) || 0);
    if (Date.now() - antes < VENTANA_MS) return false;
    sessionStorage.setItem(CLAVE, String(Date.now()));
  } catch { /* sin sessionStorage se intenta igual una vez */ }
  window.location.reload();
  return true;
}

export function cargaSegura<T>(cargar: () => Promise<T>): Promise<T> {
  return cargar().catch(() => new Promise<T>((resolver, rechazar) => {
    setTimeout(() => { cargar().then(resolver, (e) => { if (!recargarUnaVez()) rechazar(e); /* si recarga, la promesa queda pendiente */ }); }, 600);
  }));
}

/** Vite avisa con este evento cuando falla la precarga de un archivo de la app (versión vieja). */
export function vigilarVersionVieja() {
  window.addEventListener("vite:preloadError", (e) => { e.preventDefault(); recargarUnaVez(); });
}
