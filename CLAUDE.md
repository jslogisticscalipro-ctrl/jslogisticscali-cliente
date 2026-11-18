# CLAUDE.md

Guía para Claude en `jslogistics-cliente-frontend`: la **landing pública y el portal de clientes** de JS Logistics (mensajería en Cali). Las reglas detalladas de código están en AGENTS.md (se carga aquí):

@AGENTS.md

Antes de cambiar algo lee también [docs/ESTADO.md](docs/ESTADO.md) (decisiones, trampas y últimos cambios) y [ARCHITECTURE.md](ARCHITECTURE.md) (el porqué). El contrato de la API está en `js-logistics/backend/README.md` (repo hermano `js-logistics`, que tiene el backend y la app de oficina y mensajeros). Si algo de esta guía choca con lo que pide la persona, pregúntale antes de seguir.

## Stack y comandos

React 18 · TypeScript estricto · Vite 6 · Tailwind 3 · React Router 6 · TanStack Query 5 · lucide-react · react-toastify. Sin pruebas automáticas todavía.

```bash
npm install
npm run dev:demo   # datos inventados, sin backend: http://localhost:3000 (cliente@demo.co / demo1234)
npm run dev        # contra el backend local (Vite manda /api a VITE_PROXY_API, por defecto http://localhost:4000)
npm run build && npm run build:demo   # los dos deben pasar antes de dar algo por terminado
```

Revisa las pantallas con `dev:demo` a 375 px (celular) y en escritorio, claro y oscuro, sin scroll horizontal (320, 360 y 390 px).

## Estructura

`src/api/` (cliente HTTP único `http.ts`, `auth`, `cliente`, `solicitudes`, `rastreo`, `chatbot`) · `src/auth/` (sesión y `RequireRole`) · `src/portal/clasico/` (el portal: **hay uno solo**) · `src/pages/` (landing, login, registro, rastreo) · `src/lib/` (`formato.ts` fechas y pesos en hora de Colombia, `negocio.ts` reglas copiadas de `js-logistics/app/js/app.js`, `pwa.ts`) · `src/demo/datos.ts` (modo demo) · `public/` (`sw.js`, manifiesto, íconos). El mapa completo está en AGENTS.md.

## Variables de entorno (solo nombres)

`VITE_API_URL` (producción `https://api.jslogistics.pro`, sin `/api` al final), `VITE_DEMO` (`true` = datos de prueba) y `VITE_PROXY_API` (solo desarrollo). Todo `VITE_*` termina en el navegador: **nunca un secreto**. `.env.example` las lista.

## Despliegue

- **Vercel** publica `jslogistics.pro` desde `main`; `vercel.json` fija Vite, `dist`, la regla de SPA, el caché de `assets` y que `sw.js` nunca se cachea. Las vistas previas de cada PR se construyen en **modo demo**, sin backend.
- El **backend** (Render + Supabase) es del repo `js-logistics`. La cookie `jsl_sesion` es del mismo sitio que la API (`api.jslogistics.pro`), así que `VITE_API_URL` debe ser un subdominio del mismo dominio. Si el backend cambia de URL se cambia la variable y se vuelve a publicar.
- **Orden:** si un cambio necesita algo nuevo de la API, primero se publica el backend (migración de esquema, luego Render) y después este frontend.

## Reglas delicadas

- **Dinero y negocio** (saldos, cobros, textos de estado): el servidor decide. Si el backend ya da el valor (saldos, totales), úsalo y no lo recalcules. Lo que sí queda en `lib/negocio.ts` debe dar lo mismo que `app.js`; no lo cambies sin comparar. Pesos enteros, con `pesos()`.
- **Día de Colombia:** agrupa y muestra días solo con `lib/formato.ts` (`America/Bogota`). Nunca `toLocaleDateString()` suelto ni la hora del navegador.
- **Sesión:** cookie HttpOnly; nada de tokens en el navegador. Toda llamada pasa por `api()` de `src/api/http.ts` (cookies, `X-JSL: 1`, `ApiError`, aviso de 401).
- **Tiempo real:** la campanita y las solicitudes abren `GET /api/eventos` (Server-Sent Events) y refrescan al instante cuando el backend avisa de una solicitud propia; el sondeo de 30 s es respaldo. Si cambias eso, conserva el respaldo.
- **PWA:** `public/sw.js` **solo guarda `sin-conexion.html`**; no toca `/api` ni `/assets`, para no mostrar nunca pedidos o saldos viejos. No le agregues caché de datos; si cambias la pantalla sin conexión, sube `VERSION`. Con la app instalada, la portada y el rastreo redirigen a `/cliente/` (ver `lib/pwa.ts` y ESTADO.md).
- **Modo demo:** toda consulta o mutación nueva necesita su rama `if (DEMO)` en `src/demo/datos.ts`; sin ella se rompen las vistas previas de Vercel.

## Qué no tocar sin pedido explícito

La landing, el login y el menú (su diseño se hizo por pedido del dueño: ver AGENTS.md, regla 10); `clasico.css` salvo al final del archivo; cookies y CSRF; cualquier secreto o dato real de clientes en el repositorio; `src/services/api.ts` (axios heredado, solo `Register` y `Track`).

## Ramas y pull requests

1. Una rama por cambio a partir de `main` (`feat/…`, `fix/…`, `docs/…`). **Nunca push directo a `main`** ni force-push en ramas ajenas.
2. Commits en español, una línea que diga qué cambia para el usuario.
3. PR contra `main` que diga qué cambió, en cuál portal y cómo se probó; Vercel deja la vista previa en modo demo para revisarlo. Revisa esa vista previa en celular y escritorio antes de aprobar.
4. Si tomaste una decisión que otro agente deba respetar o dejaste algo pendiente, anótalo en `docs/ESTADO.md` en el mismo PR.
5. Si este repo es el de **producción** de un cliente: trabaja siempre en ramas y PR (así se pueden revisar y traer después los cambios al repo de desarrollo con `git fetch` y `merge`/`cherry-pick`), y no mezcles cambios no relacionados en un mismo commit.
