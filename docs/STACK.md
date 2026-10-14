# STACK TÉCNICO

| Área | Objetivo | Estado MVP |
|---|---|---|
| Frontend | React + TypeScript + Vite | Código implementado |
| Estilos | Tailwind CSS + shadcn/ui | **No incluidos**; MVP usa CSS propio |
| PWA | vite-plugin-pwa + Workbox | Configurado, requiere compilación/prueba |
| Iconos | Lucide React | Implementado |
| Estado | Zustand | **No incluido**; hooks React por simplicidad |
| Rutas | React Router | **No incluido**; navegación local por estado |
| Validación | Zod | **No incluido**; comprobaciones básicas en frontend/backend |
| Captura | Input HTML `capture=environment` | Implementado, depende del navegador |
| Edición imagen | Canvas API + OpenCV.js | Solo Canvas + recorte rectangular y giro; OpenCV.js pendiente |
| Auth | Firebase Authentication | Integrado, requiere configuración |
| Datos | Cloud Firestore | Integrado, requiere configuración |
| Imágenes | Cloud Storage | NO usado por MVP; reglas deniegan acceso |
| IA | OpenAI Responses API `gpt-4.1-mini` | Cloud Function incluida, pendiente despliegue y prueba real |
| Backend | Firebase Functions v2 Node.js 22 | Código fuente incluido |
| Hosting | Firebase Hosting | Configurado, pendiente despliegue |
| Pruebas | Vitest | Pruebas básicas de filtro incluidas |
| E2E | Playwright | Pendiente |
| CI | GitHub Actions | Flujo de compilación y test incluido |
| Control | Git + GitHub | Repositorio listo para inicializar |

**Criterio:** no confundir tecnologías propuestas con tecnologías ya integradas. Algunas se posponen deliberadamente para reducir dependencias del MVP.
