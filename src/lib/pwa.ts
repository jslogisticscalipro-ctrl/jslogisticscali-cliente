/* App instalable (PWA): registra el service worker y maneja el aviso 'Instalar app'.
   El service worker (public/sw.js) no guarda datos de la API; ver el comentario de ese archivo. */
import { useEffect, useState } from 'react';

interface EventoInstalar extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let pedido: EventoInstalar | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

const instalada = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const esIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Se llama una vez al arrancar (main.tsx). Solo en producción: en desarrollo un service worker estorba. */
export function iniciarPwa() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); pedido = e as EventoInstalar; avisar(); });
  window.addEventListener('appinstalled', () => { pedido = null; avisar(); });
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((reg) => {
      // Busca una versión nueva del service worker cada vez que la app vuelve a primer plano.
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void reg.update().catch(() => undefined); });
    }).catch(() => { /* sin service worker la app funciona igual, solo no se ofrece la pantalla sin conexión */ });
  });
}

/** `instalar`: el navegador ya ofrece instalar. `ios`: Safari de iPhone, no tiene botón y hay que explicar los pasos. `null`: no mostrar nada. */
export function useInstalarApp() {
  const [, forzar] = useState(0);
  useEffect(() => { const f = () => forzar((n) => n + 1); oyentes.add(f); return () => { oyentes.delete(f); }; }, []);
  const modo: 'instalar' | 'ios' | null = instalada() ? null : pedido ? 'instalar' : esIOS() ? 'ios' : null;
  async function instalar() {
    if (!pedido) return;
    const p = pedido;
    pedido = null; // el navegador solo deja usar el evento una vez
    await p.prompt();
    await p.userChoice.catch(() => undefined);
    avisar();
  }
  return { modo, instalar };
}
