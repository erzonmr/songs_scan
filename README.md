# SongScan · PWA privada para digitalizar canciones

Versión 0.2.0. React + TypeScript + Vite, Firebase Authentication/Firestore/Functions y OpenAI Responses API. Fotografía hasta tres páginas, recorta y gira cada una, transcribe sin acordes, revisa y guarda la letra en una biblioteca privada.

La PWA está publicada en https://songscan-erzonmr.web.app con biblioteca privada, edición manual y reconocimiento IA activado. La función está desplegada y la clave validada; falta validar las primeras fotografías desde la sesión del propietario. El código compila y dispone de pruebas automatizadas de sesión, backend, permisos y navegador. Sin variables Firebase funciona una demo en memoria: sus canciones se pierden al recargar y no hay IA.

## Requisitos

- Node.js 22 (22.14 o superior dentro de la rama 22) y npm.
- Firebase CLI 15.5.1: `npm install --global firebase-tools@15.5.1`.
- Java 21 para las pruebas de reglas.
- Para producción: Firebase con facturación habilitada para Functions, propietario autorizado y secreto OpenAI en Secret Manager.

## Instalar y comprobar

```powershell
npm ci
npm ci --prefix functions
npm run check
npm run test:rules
npx playwright install chromium
npm run test:e2e
```

`npm run check` ejecuta pruebas de frontend/configuración, build PWA y pruebas/compilación del backend. Las pruebas de navegador generan su propio build de demo aislado; no utilizan las credenciales de producción locales. `npm audit` y `npm audit --prefix functions` revisan las dependencias de cada paquete.

## Explorar la demo

```powershell
npm run dev
```

Abre la dirección local que muestre Vite. Incluye biblioteca, editor, favoritos, búsqueda, exportación TXT y preparación de imágenes. La IA requiere Firebase real.

## Desplegar

El proyecto nuevo es `songscan-erzonmr`; su estado está en [FIREBASE_SETUP](docs/FIREBASE_SETUP.md). Sigue [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para configurar Firebase, Authentication, App Check y el secreto de OpenAI. Copia `.env.example` a `.env.production.local` y completa las variables públicas, incluido `VITE_OWNER_UID`.

```powershell
firebase login --reauth
npm run build:production
npm run deploy
```

El despliegue valida las variables, utiliza el Project ID configurado, genera reglas privadas para ese propietario y sincroniza `OWNER_UID` con Functions. `npm run deploy:web` publica solo Hosting y Firestore. Activa `VITE_AI_ENABLED=true` únicamente al completar el secreto y despliegue de `processSong`. Los hooks recompilan antes de publicar. Si falta configuración, se detiene; el build de demo se reserva para desarrollo y pruebas.

También se incluye un workflow manual **Desplegar Firebase**, configurable con variables y una credencial del entorno GitHub `production`.

## Seguridad y límites

- Un único UID autorizado en interfaz, reglas y backend; el estado privado se desmonta al cerrar sesión.
- Letras y fotografías en memoria; Firestore utiliza caché en memoria. Firebase Auth administra su propia persistencia de sesión.
- App Check obligatorio en la función callable, con reCAPTCHA Enterprise en el navegador.
- Máximo tres JPEG, 2.8 millones de caracteres por imagen y 6 millones en conjunto al llamar al backend.
- Cuota transaccional: 10 intentos por hora UTC, 30 por día UTC y diez segundos entre solicitudes. Los intentos fallidos posteriores a reservar cuota también cuentan.
- La clave OpenAI se almacena exclusivamente como secreto de Functions. La solicitud usa `store: false`; esto no sustituye las políticas de retención del proveedor.
- Storage no almacena imágenes; sus reglas deniegan todo. No se despliega por defecto porque el MVP no necesita un bucket.
- Las actualizaciones PWA solicitan confirmación para poder guardar antes de recargar.

## Alcance pendiente

Corrección de perspectiva, reordenación de páginas, duplicados, historial y respaldos completos. Las pruebas E2E actuales cubren demo y preparación de imágenes; la transcripción de cancioneros físicos desde la sesión del propietario y la sincronización entre dispositivos siguen pendientes de validación.

Consulta [PROGRESS](docs/PROGRESS.md), [ROADMAP](docs/ROADMAP.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [STACK](docs/STACK.md) y [BRIEF](docs/BRIEF.md).
