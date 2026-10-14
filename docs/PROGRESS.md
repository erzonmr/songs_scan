# Avance verificado · 2026-10-13

Versión 0.2.0. PWA publicada en Firebase Hosting con facturación, propietario, Authentication y reglas configurados. IA activada: secreto validado, `processSong` desplegada y Hosting actualizado. La primera sesión y las pruebas autenticadas reales requieren que el propietario establezca su contraseña. Consulta `FIREBASE_SETUP.md`.

## Verificado localmente

- Compilación TypeScript del frontend y backend; generación de manifest, iconos y service worker.
- Ocho pruebas de frontend/configuración: filtro de acordes, aislamiento de sesión, recuperación de contraseña y validación de configuración de producción.
- Ocho pruebas de backend: imágenes, contrato de respuesta IA y límites de consumo.
- Cinco pruebas de reglas en el emulador Firestore: CRUD del propietario, rechazo de otras cuentas, validación de campos, versiones y contadores privados.
- Seis pruebas E2E Chromium: biblioteca/exportación, PWA y recorte/giro multipágina en escritorio y viewport móvil.
- Auditoría npm de raíz y Functions sin vulnerabilidades reportadas con las dependencias fijadas en sus lockfiles.

Las pruebas unitarias del contrato IA usan respuestas controladas y no consumen la API OpenAI. Además, se realizó una prueba de visión con una imagen sintética contra la API real y resultado correcto. Las pruebas de permisos usan un proyecto de demostración emulado y no alteran una base real.

## Cambios desde 0.1.0

- Tipos Vite y transacción de favoritos corregidos.
- Estado privado desmontado al salir; cuentas no autorizadas no montan biblioteca ni editor.
- Validación estricta de campos, tamaños, timestamps y versiones en reglas.
- Preparación de despliegue que genera reglas y configuración de Functions para un mismo propietario y detecta proyectos/regiones incoherentes.
- App Check Enterprise en frontend y obligatorio en `processSong`.
- Cuotas transaccionales persistentes: diez solicitudes/hora, treinta/día UTC y diez segundos entre intentos.
- Tiempo máximo de petición IA, límites de imágenes individuales/totales, rechazo de transcripciones incompletas y validación de advertencias.
- Recorte y giro independientes por página; área de selección alineada con la imagen visible.
- Actualización PWA mediante aviso, sin recarga automática durante edición.
- Dependencias actualizadas, lockfiles versionados, CI completo y workflow de despliegue manual.
- Código formateado y autenticación/actualizaciones PWA separadas de la biblioteca.

## Pendiente del entorno real

- Propietario, UID y facturación configurados; pendiente primera sesión del propietario y validación autenticada.
- Sesión CLI y reglas definitivas del propietario verificadas en el despliegue real.
- Secreto OpenAI y `processSong` desplegados; visión validada mediante imagen sintética directamente contra OpenAI. Pendiente la primera transcripción autenticada desde la PWA.
- Hosting HTTPS y reglas publicados; pendientes escaneos IA reales y sincronización autenticada entre dispositivos.
- Instalación y cámara física en Android/iOS; validación de Safari.

## Límites de alcance

Sin corrección de perspectiva, reordenación, duplicados, historial o respaldo completo. No se almacenan originales en Storage. La demo pierde datos al recargar. Las pruebas móviles automatizadas no representan un iPhone real.
