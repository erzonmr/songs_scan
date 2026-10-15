# SongScan · PWA privada para digitalizar canciones

Versión 0.2.0. React + TypeScript + Vite y Firebase Authentication/Firestore. Fotografía hasta tres páginas, recorta y gira cada una, transcribe sin acordes con guía visual, revisa y guarda la letra en una biblioteca privada.

La PWA está optimizada para funcionar directamente en el navegador con sincronización en Firestore o en modo demo en memoria.

## Requisitos

- Node.js 22 (22.14 o superior dentro de la rama 22) y npm.
- Firebase CLI (opcional para despliegue manual): `npm install --global firebase-tools`.

## Instalar y ejecutar

```powershell
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Compilar en modo demo aislado
npm run build:demo
```

## Desplegar en Firebase

Copia `.env.example` a `.env.production.local` y completa las variables de Firebase.

```powershell
firebase login
npm run build
firebase deploy --only hosting,firestore
```

También se incluye el workflow manual de GitHub Actions **Desplegar Firebase** para despliegue automatizado.

## Seguridad y características

- Un único UID autorizado en interfaz y reglas de Firestore; el estado privado se desmonta al cerrar sesión.
- Letras y fotografías en memoria; Firestore utiliza caché en memoria. Firebase Auth administra su propia persistencia de sesión.
- Recorte, giro y optimización de páginas en Canvas local antes de transcribir.
- PWA instalable con Service Worker para funcionamiento sin conexión y avisos de actualización segura.

Consulta la documentación técnica en [docs/](docs/).
