# ROADMAP SIN ESTIMACIONES DE TIEMPO

- [x] Fase 1. Estructura Vite/React/TypeScript, PWA y diseño inicial con CSS propio.
- [~] Fase 2. Autenticación Firebase y reglas para UID único. **Código incluido; integración de proyecto real pendiente.**
- [~] Fase 3. Captura de cámara/galería y selección de hasta 3 imágenes. **Falta reordenar/reemplazar con interfaz dedicada.**
- [~] Fase 4. Recorte de imágenes. **Rectangular y giro implementados; pendiente perspectiva 4 esquinas y guardar ajustes independientes de cada página.**
- [~] Fase 5. IA con visión. **Cloud Function y contrato JSON incluidos; falta despliegue, ensayos y control de consumo.**
- [x] Fase 6. Editor manual de título, letra y categoría, exportación TXT, advertencias IA.
- [~] Fase 7. Biblioteca Firestore y favoritos/búsqueda. **Pendientes detección de duplicados, etiquetas y respaldos.**
- [~] Fase 8. Sync con `onSnapshot` y control de versiones. **Pendiente UX de resolución de conflictos.**
- [~] Fase 9. Pruebas. **Vitest básico escrito; sin E2E ni prueba de campo.**
- [~] Fase 10. Hosting, CI/CD y documentación. **Archivos de configuración incluidos; despliegue sin ejecutar.**

## Siguientes prioridades recomendadas
1. Resolver e instalar dependencias localmente, ejecutar tests y build.
2. Crear Firebase, autenticación y UID único, verificar reglas.
3. Desplegar y probar IA con páginas reales de cancionero.
4. Editor multipágina con recorte individual y perspectiva cuatro puntos.
5. Subida temporal cifrada/privada a Cloud Storage para archivos grandes.
6. App Check, cuotas operativas, pruebas automatizadas y robustez.
7. Duplicados, búsqueda escalable, recuperación y backups.
