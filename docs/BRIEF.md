# BRIEF FUNCIONAL · SongScan
**Versión del documento:** 1.1 · **Versión del código:** 0.2.0

## Visión
PWA instalable para digitalizar canciones de cancioneros físicos, eliminar automáticamente los acordes usando IA con visión, revisar el texto y guardarlo en una biblioteca privada sincronizada en la nube.

## Decisiones de producto
- Plataforma: PWA responsive Android, iOS y escritorio.
- Usuarios: propietario único, autenticación obligatoria en producción.
- Idioma: español; preparado para futuras extensiones.
- Letra: solo texto cantado, sin acordes; conservar estrofas, coros, tildes y repeticiones expresas.
- Nube: Firestore, sin persistencia intencionada de canciones en almacenamiento local.
- IA: motor remoto de visión, clave exclusivamente en backend.
- Interfaz: mobile-first, biblioteca, escáner, editor y ajustes.

## Requisitos funcionales (objetivo final)
**Captura:** cámara integrada web, carga desde galería, hasta N páginas reordenables, reemplazo y eliminación.
**Ajuste de imagen:** recorte manual por cuatro esquinas, giro, perspectiva, brillo, contraste, limpieza de contenido aledaño.
**Reconocimiento:** detectar título, letra, estrofas, coros; eliminar acordes convencionales y extendidos (G/B, F#m7, etc.); marcar ilegibles sin inventar nada.
**Edición:** comparar fotografía con transcripción, corregir y validar antes de guardar.
**Biblioteca:** CRUD, búsqueda de letra y título, categorías, etiquetas, favoritos, duplicados, exportación TXT/PDF opcional.
**Sincronización:** observadores en tiempo real, revisión de conflictos, mensajes claros de guardado/errores.
**Privacidad:** un único UID autorizado; reglas Firestore, secretos, cuotas, registros mínimos y borrado de archivos temporales.
**PWA:** instalación, HTTPS, service worker para recursos estáticos; canciones no disponibles offline por diseño.

## Fuera de alcance v1
Transposición, ChordPro, colaboración, audio, partitura, bibliotecas públicas, edición offline y OCR tradicional obligatorio.

## Casos de aceptación objetivo
1. Fotografiar una canción y quitar contenido periférico.
2. Procesar acordes encima y entre palabras sin perder letra.
3. Reconocer canción multipágina sin duplicar estrofas.
4. Marcar texto ilegible y permitir corregirlo.
5. Guardar la letra como texto en nube y consultarla desde otro dispositivo.
6. Restringir todos los datos al único propietario.
7. Mostrar conflicto de edición ante actualizaciones concurrentes.
8. No persistir imágenes o letras en almacenamiento de navegador controlado por la app.

> Para saber qué está realmente implementado, consulta `PROGRESS.md`. Este brief describe el **objetivo**, no certifica características terminadas.
