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
- [ ] Confirmar propietario y completar su UID.
- [ ] Habilitar servicios/facturación, reCAPTCHA Enterprise y secreto OpenAI.
- [x] Renovar sesión CLI y comprobar creación/despliegue de recursos.
- [ ] Ejecutar ensayo y despliegue final de Functions/Hosting.
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
