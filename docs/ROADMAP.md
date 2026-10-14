# Roadmap

## Base preparada para despliegue · 0.2.0

- [x] React/TypeScript/Vite y PWA compilables.
- [x] Biblioteca, editor, búsqueda, favoritos y exportación TXT.
- [x] Captura/importación de tres páginas con recorte y giro independientes.
- [x] Integración Auth/Firestore/Functions y propietario único.
- [x] Validación de datos y control de versiones.
- [x] App Check y cuotas persistentes de IA.
- [x] Pruebas de sesión, backend, permisos y navegador.
- [x] Lockfiles, auditorías, CI y despliegue manual documentado.

## Primer despliegue real

- [x] Crear proyecto Firebase separado, registrar aplicación web y obtener configuración.
- [x] Crear Firestore y desplegar reglas iniciales cerradas; configurar App Check Enterprise.
- [x] Confirmar propietario, crear su cuenta y configurar su UID.
- [x] Vincular facturación y habilitar APIs de Functions.
- [x] Registrar y validar el secreto OpenAI; desplegar `processSong`.
- [x] Validar visión con una imagen sintética contra OpenAI y activar el botón en la PWA.
- [x] Renovar sesión CLI y comprobar creación/despliegue de recursos.
- [x] Publicar Hosting y reglas definitivas del propietario.
- [ ] Completar la primera transcripción autenticada desde la sesión del propietario.
- [ ] Validar transcripción con canciones reales, ilegibles y varias páginas.
- [ ] Validar biblioteca entre dispositivos y conflictos de edición.
- [ ] Verificar instalación/cámara en Android y Safari iOS.
- [ ] Activar enforcement App Check de Firestore tras observar solicitudes válidas y configurar alertas de gasto.

## Mejoras posteriores

- [ ] Perspectiva de cuatro esquinas, brillo y contraste.
- [ ] Reordenar/reemplazar páginas y comparar todas las referencias en el editor.
- [ ] Duplicados, historial y exportación/restauración de biblioteca completa.
- [ ] Resolución guiada de conflictos y búsquedas para bibliotecas grandes.
- [ ] Storage temporal y trabajos asíncronos si aumenta el tamaño o volumen de documentos.

La aceptación en producción depende de las pruebas reales; los checks locales no certifican la precisión de la transcripción IA.
