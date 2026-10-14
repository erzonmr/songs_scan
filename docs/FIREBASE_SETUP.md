# Entorno Firebase · SongScan

Estado: 2026-10-13. Proyecto dedicado y separado de las otras aplicaciones de la cuenta.

| Recurso | Estado |
|---|---|
| Proyecto Firebase | `songscan-erzonmr`, nombre SongScan, activo |
| Número de proyecto | `134741965728` |
| Aplicación web | SongScan, `1:134741965728:web:6fbf314c068e604fb402c5` |
| Hosting | PWA publicada en https://songscan-erzonmr.web.app |
| Facturación | Vinculada a la cuenta elegida por el propietario |
| Authentication | Inicializado; acceso por correo/contraseña; propietario registrado |
| Registro público | Deshabilitado en la configuración de Authentication |
| Firestore | Base `(default)`, Native / Standard, región `us-central1` |
| Reglas | Reglas definitivas desplegadas para el UID del propietario; lectura anónima rechazada (403) |
| App Check | reCAPTCHA Enterprise configurado para la aplicación web, TTL de una hora |
| Dominios reCAPTCHA | `songscan-erzonmr.web.app`, `songscan-erzonmr.firebaseapp.com` |
| Configuración local | `.firebaserc`, `.env.production.local` y entorno Functions, ignorados por Git |
| APIs de Functions | Cloud Functions, Cloud Run, Cloud Build, Artifact Registry, Eventarc y Secret Manager habilitadas |
| IA | Activada en la PWA; `processSong` desplegada y en estado ACTIVE en `us-central1` |
| Secreto OpenAI | Versión 2 habilitada y vinculada a la función; versión anterior deshabilitada |
| Imágenes de despliegue | Artifact Registry elimina imágenes de más de siete días |
| Google Sign-In | No configurado; la interfaz no muestra ese proveedor |

## Primer acceso

1. Abre https://songscan-erzonmr.web.app.
2. Escribe el correo del propietario confirmado.
3. Pulsa **Establecer o restablecer contraseña** y sigue el enlace que Firebase enviará a tu correo. Revisa también spam.
4. Establece tu contraseña personalmente y vuelve a entrar en la PWA. No compartas contraseñas ni enlaces de recuperación por chat.

La cuenta se creó sin asignar una contraseña conocida por el agente. La solicitud de recuperación se envía solamente al pulsar el botón; no se enviaron correos durante la configuración.

## Actualizar la clave de IA

En una terminal local:

```powershell
firebase functions:secrets:set OPENAI_API_KEY --project songscan-erzonmr
```

Introduce la clave en el prompt seguro. La IA ya está habilitada mediante `VITE_AI_ENABLED=true` en la configuración local. Después de cambiar el secreto, valida la clave y vuelve a desplegar mediante `npm run deploy` para que `processSong` utilice la nueva versión. La función exige App Check y el UID del propietario.

`npm run deploy:web` publica Hosting y Firestore sin intentar desplegar la función. La biblioteca y la edición manual no requieren IA.

## Verificación

- Compilación y pruebas de frontend, backend y navegador correctas.
- Recursos HTTPS, manifest y service worker publicados; el bundle contiene la configuración real del proyecto y su propietario.
- Lecturas anónimas de la biblioteca rechazadas por el servicio real.
- Clave validada contra OpenAI: acceso a `gpt-4.1-mini` con HTTP 200.
- Prueba real de visión en Responses API con una imagen sintética: título y dos versos transcritos correctamente, sin las líneas de acordes, con respuesta completa y esquema JSON válido.
- `processSong` confirmada ACTIVE con secreto versión 2, timeout de 120 segundos y máximo de dos instancias.
- Endpoint callable: peticiones sin credenciales rechazadas con 401/UNAUTHENTICATED; preflight desde Hosting aceptado con 204.
- Build publicado con IA activada: recurso JavaScript remoto idéntico al build local.
- Primera sesión del propietario completada, 3 canciones creadas y sincronización entre dispositivos validada en producción.
- Pendiente validar transcripción con fotografías reales de cancioneros físicos e instalación móvil cuando concluyan las pruebas de usuario.
- App Check de Firestore permanece sin enforcement hasta verificar las solicitudes válidas del navegador; la función exige App Check en código.

Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para configuración general y validación posterior.
