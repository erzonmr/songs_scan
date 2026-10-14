# REGISTRO DE AVANCE · 2026-10-13

## Resumen verificable
**MVP de código fuente generado; no desplegado; compilación y ejecución aún no verificadas.** Se intentó `npm install` en el entorno de generación y no terminó por límite de ejecución/conectividad; no se incluyen `node_modules` ni `package-lock.json`.

## Implementado en archivos
- [x] Vite/React/TypeScript, diseño responsive CSS, iconos Lucide.
- [x] Configuración PWA y manifest instalable, precache de estáticos.
- [x] Modo demo en RAM para explorar interfaz sin claves ni Firebase.
- [x] Interfaz de acceso Firebase con correo/contraseña y Google.
- [x] Importación/captura web de hasta 3 imágenes.
- [x] Recorte rectangular de una imagen seleccionada, rotación y Canvas JPEG comprimido.
- [x] Cloud Function callable de IA con UID único y JSON Schema de respuesta.
- [x] Editor textual, advertencias IA, extracción manual de líneas evidentes de acordes.
- [x] Biblioteca CRUD, favoritos, búsqueda por contenido, sincronización Firestore en tiempo real.
- [x] Control básico de versión en ediciones Firestore, exportación TXT.
- [x] Reglas Firestore y Storage, guía de despliegue y CI de validación.

## Parcial, no verificado o pendiente
- [ ] Verificación exitosa de `npm install`, `npm run build` y `npm test`.
- [ ] Creación/conexión del proyecto Firebase y primera autenticación real.
- [ ] Despliegue de `processSong`, configuración `OWNER_UID` y secreto de OpenAI.
- [ ] Escaneos reales que demuestren eliminación correcta de acordes.
- [ ] Recorte de perspectiva cuatro esquinas, ajustes persistentes por cada página.
- [ ] Subida temporal de imágenes a Storage con TTL, reintentos y cola.
- [ ] Políticas de coste/cuotas, App Check obligatorio, protección anti-abuso avanzada.
- [ ] Detección de duplicados, historial, backup/exportación total, búsqueda escalable.
- [ ] Pruebas automatizadas E2E, accesibilidad y dispositivos reales.
- [ ] Despliegue HTTPS productivo y prueba de instalación PWA.

## Limitaciones honestas
El MVP representa un **primer incremento real** pero no la totalidad del brief. En modo demo no existe nube ni IA, y los datos se pierden al recargar. La IA solo funciona tras conectar y desplegar correctamente Firebase/Functions, autorizar propietario y registrar clave API. La función usa base64 directo, lo cual limita fotografías grandes.
