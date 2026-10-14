# SongScan MVP · PWA de letras sin acordes

Aplicación React + TypeScript + Vite, PWA instalable, con captura/importación de imágenes, recorte rectangular, IA con visión a través de Firebase Cloud Functions, editor de letras y biblioteca privada en Cloud Firestore.

> **Estado:** MVP inicial de código fuente. No es un producto terminado ni se ha desplegado. Para usar la nube y la IA es obligatorio configurar Firebase, autorizar un único UID y registrar la clave de OpenAI. Sin configuración ejecuta una **demo temporal** que NO guarda datos ni utiliza IA. La instalación de dependencias y la compilación no pudieron verificarse en el entorno donde se generó este paquete (conectividad npm insuficiente); ejecuta las verificaciones indicadas.

## Requisitos
- Windows 10/11, PowerShell 7 o terminal compatible
- Node.js 22 LTS y npm
- Firebase CLI: `npm install -g firebase-tools`
- Cuenta Firebase con proyecto preparado (el despliegue de Cloud Functions puede requerir el plan Blaze)
- Cuenta de OpenAI con API activada y facturación aplicable

## 1. Iniciar la demostración (sin nube)
```powershell
cd songscan-mvp
npm install
npm run dev
```
Abre la URL que muestre Vite. La demo permite capturar o cargar fotografías, hacer recortes rectangulares, escribir letras, crear una biblioteca en RAM, editar/buscar/favoritos y exportar TXT. **Al recargar se pierde el contenido.** No representa sincronización en la nube.

## 2. Configurar Firebase para uso real
1. En [Firebase Console](https://console.firebase.google.com/), crea un proyecto.
2. Agrega una aplicación Web y copia su configuración pública.
3. Activa Authentication: proveedor correo/contraseña y/o Google.
4. Crea manualmente la cuenta del propietario en Authentication, o inicia sesión con Google y toma su UID desde la consola. No hay registro público en la app.
5. Habilita Cloud Firestore. Asegúrate de elegir una ubicación adecuada.
6. Crea `.env` copiando `.env.example` y rellena las variables `VITE_FIREBASE_*`.
7. **Antes de desplegar** reemplaza `REEMPLAZAR_OWNER_UID` en `firestore.rules` por el UID exacto del propietario. No publiques las reglas sin corregirlas. Este UID no debe compartirse con usuarios no autorizados.
8. Selecciona el proyecto: `firebase login` y `firebase use --add` (o crea `.firebaserc` localmente).
9. Desde la raíz del proyecto, despliega reglas: `firebase deploy --only firestore:rules,firestore:indexes,storage`.
10. Configura el secreto para el backend: `firebase functions:secrets:set OPENAI_API_KEY` y pega la clave únicamente en la consola solicitada.
11. El backend usa el parámetro `OWNER_UID` definido en `functions/src/index.ts`: al desplegar Functions, Firebase CLI pedirá su valor. Introduce el mismo UID autorizado. Es posible definirlo también en `functions/.env.<PROJECT_ID>` con `OWNER_UID=...` (archivo sensible que no debes subir).
12. Instala dependencias y compila Functions:
```powershell
cd functions
npm install
npm run build
cd ..
```
13. Despliega función: `firebase deploy --only functions:processSong`.
14. Compila frontend: `npm run build`.
15. Despliega PWA: `firebase deploy --only hosting`.
16. En Firebase Authentication añade el dominio de Hosting a *Authorized domains* si fuera necesario.

**Importante:** el inicio de sesión puede funcionar aunque `processSong` aún no se haya desplegado; en ese caso la lectura de imágenes con IA fallará, y la edición manual seguirá disponible. Se recomienda probar primero en un proyecto de Firebase separado de producción.

## 3. Probar calidad
```powershell
npm test
npm run build
cd functions
npm run build
```
Si TypeScript o dependencias informan incompatibilidades, resuélvelas y ejecuta nuevamente todas las pruebas antes de desplegar.

## 4. Flujo de uso
1. Inicia sesión (solo modo Firebase).
2. Ve a **Escanear** y toma o importa imágenes (hasta tres páginas en MVP).
3. Selecciona una página y delimita un rectángulo arrastrando sobre la vista previa. Puedes restaurar la selección y rotar la página seleccionada.
4. Pulsa **Preparar imagen** para observar el recorte. En MVP solo se conserva el recorte/rotación de la página actualmente seleccionada; las otras páginas se procesan completas. Para recortar todas individualmente hay que completar el editor multipágina.
5. Pulsa **Extraer letra con IA**. Se enviarán las fotografías como imágenes JPEG preparadas en una llamada autenticada al backend.
6. Revisa título, letra y advertencias, corrige y **Guardar canción**.
7. En la biblioteca usa búsqueda, favoritos, edición, borrado y exportación TXT.

## 5. Seguridad y limitaciones
- No coloques `OPENAI_API_KEY` en `.env` de Vite ni en el navegador.
- La función exige Firebase Auth y compara UID con `OWNER_UID`; las reglas de Firestore requieren el UID exacto.
- La biblioteca de producción usa Firestore con caché en memoria (sin persistencia offline deliberada).
- `storage.rules` deniega todo: MVP transmite imágenes pequeñas a callable Functions y no almacena fotos permanentemente. Esto difiere del flujo de subida temporal de la arquitectura objetivo.
- El servicio `processSong` acepta 1–3 imágenes JPEG con máximo ~2.8MB en base64 por imagen; el total puede superar límites de la infraestructura; utiliza fotos recortadas. No hay todavía colas ni limitación de cuotas por usuario.
- No se ha activado App Check en el callable (`enforceAppCheck:false`). Debe activarse y probarse antes de exponer a uso público.
- La eliminación de acordes usa primordialmente IA. El botón adicional aplica un filtro heurístico conservador; no garantiza identificar acordes intercalados.
- Recorte actual: rectangular por arrastre, **no** corrección de perspectiva de cuatro puntos.
- No hay guardado de borradores offline, importación PDF, historial de cambios, conflictos de edición con interfaz de resolución ni detección de duplicados.
- No almacena la biblioteca en disco; la demo usa RAM. Las imágenes se mantienen en RAM durante la sesión y pueden pasar por el procesamiento interno del navegador.
- No se recomienda cargar material con restricciones de copyright sin autorización.

Consulta `/docs` para el brief completo, stack, arquitectura, roadmap y avance verificado.
