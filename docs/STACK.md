# Stack técnico · 0.2.0

| Área | Implementación |
|---|---|
| Runtime | Node.js 22; npm con lockfiles raíz y Functions |
| Frontend | React 19, TypeScript 5.9, Vite 8 |
| Estilos | CSS propio responsive; Lucide React |
| Estado/navegación | Hooks React y navegación local por estado |
| Sesión | Firebase Authentication y SessionGate con propietario único |
| Datos | Firestore con caché en memoria y reglas validadas |
| Captura | Input de archivos/cámara; JPG, PNG y WebP |
| Ajustes de imagen | Canvas; recorte y giro independientes por página |
| IA | OpenAI Responses API, gpt-4.1-mini, JSON Schema |
| Backend | Firebase Functions v2, Node.js 22, Admin SDK |
| Protección | App Check Enterprise, UID, cuotas Firestore y validación de entradas |
| Hosting/PWA | Firebase Hosting, vite-plugin-pwa 2, Workbox |
| Pruebas | Vitest 5, Testing Library, node:test y Rules Unit Testing |
| Navegador | Playwright; Chromium escritorio y emulación Pixel 7 |
| CI/CD | GitHub Actions: validación por push/PR y despliegue manual |
| Formato | Prettier |

Firebase web se fija en 12.12.0, compatible con Node 22. La dependencia transitiva `@grpc/grpc-js` se fuerza a la rama corregida 1.14.6 o superior mediante `overrides`; los lockfiles registran las versiones efectivas. No se aplicó el downgrade de Firebase sugerido automáticamente por la auditoría.

No se utilizan Tailwind, shadcn/ui, Zustand, React Router, Zod ni OpenCV. Storage está configurado con acceso denegado y no almacena fotografías. Las versiones exactas se consultan en los archivos de bloqueo; los servicios reales siguen requiriendo configuración y verificación de despliegue.
