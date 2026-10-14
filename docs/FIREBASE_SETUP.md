# Entorno Firebase · SongScan

Estado de preparación: 2026-10-13. Proyecto nuevo y separado de las otras aplicaciones de la cuenta.

| Recurso | Estado |
|---|---|
| Proyecto Firebase | `songscan-erzonmr`, nombre SongScan, activo |
| Número de proyecto | `134741965728` |
| Aplicación web | SongScan, `1:134741965728:web:6fbf314c068e604fb402c5` |
| Hosting | Sitio `songscan-erzonmr` creado; PWA todavía sin publicar |
| URL prevista | `https://songscan-erzonmr.web.app` |
| Firestore | Base `(default)`, Native / Standard, región `us-central1` |
| Reglas iniciales | Desplegadas: deniegan todas las lecturas y escrituras de clientes |
| App Check | reCAPTCHA Enterprise configurado para la aplicación web, TTL de una hora |
| Dominios reCAPTCHA | `songscan-erzonmr.web.app`, `songscan-erzonmr.firebaseapp.com` |
| Configuración local | `.firebaserc` y `.env.production.local`, ignorados por Git |
| Sesión CLI | Reautenticada; creación de recursos y despliegue inicial de reglas comprobados |

## Pendiente para publicar

1. Elegir cuál de las dos cuentas de facturación activas se vinculará al proyecto; Functions necesita facturación habilitada.
2. Confirmar el correo del propietario, inicializar Authentication y obtener/configurar su UID. La cuenta administradora de Google Cloud no crea automáticamente un usuario de Firebase Auth.
3. Registrar `OPENAI_API_KEY` en Secret Manager desde el prompt seguro de Firebase CLI. No enviar la clave por chat ni incorporarla a Vite.
4. Completar `VITE_OWNER_UID`, generar las reglas definitivas, desplegar la función y Hosting, y verificar el flujo real.

Las reglas iniciales cerradas no sustituyen las reglas finales del propietario. El despliegue habitual las reemplazará mediante `prepare-deploy.mjs` una vez que la configuración esté completa. No se ha publicado una demo como si fuera la aplicación de producción.

Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para los comandos y la validación posterior al despliegue.
