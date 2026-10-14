# Despliegue en Firebase

## 1. Preparar el proyecto

1. Crea o selecciona un proyecto Firebase y habilita el plan necesario para Cloud Functions (Blaze).
2. Registra una aplicación web y copia su configuración pública.
3. Habilita Firestore en modo privado. La función de esta versión se despliega en `us-central1`; elige una ubicación de datos adecuada antes de crear la base.
4. Habilita correo/contraseña y/o Google en Authentication. Crea la cuenta del propietario y copia su UID. Si utilizas Google, puedes entrar una vez, obtener el UID en consola y configurar ese propietario antes de publicar la aplicación.
5. Añade los dominios de Hosting y cualquier dominio personalizado a los dominios autorizados de Authentication.
6. Registra la aplicación web en App Check con reCAPTCHA Enterprise. Autoriza los dominios donde se servirá y copia la clave pública del sitio. La función exige un token App Check válido.

No envíes claves privadas ni contraseñas por chat ni las añadas a Git.

## 2. Configuración local

```powershell
npm ci
npm ci --prefix functions
npm install --global firebase-tools@15.5.1
firebase login --reauth
firebase projects:list
Copy-Item .env.example .env.production.local
```

Completa `.env.production.local`:

```dotenv
VITE_FIREBASE_API_KEY=valor-publico-de-la-app-web
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=identificador-de-la-app-web
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
VITE_OWNER_UID=uid-del-propietario
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=clave-publica-del-sitio
```

Storage es opcional y no se utiliza para las fotografías. `VITE_*` se incorpora al JavaScript público; nunca añadas `OPENAI_API_KEY` con ese prefijo. El UID es un identificador, y la autorización real se comprueba también en servidor.

Registra la clave OpenAI mediante el prompt seguro de Firebase CLI:

```powershell
firebase functions:secrets:set OPENAI_API_KEY --project TU_PROJECT_ID
```

El script genera `.firebase/firestore.rules` y `functions/.env.TU_PROJECT_ID` desde la misma variable `VITE_OWNER_UID`. Ambos archivos están ignorados en Git. No edites el marcador de `firestore.rules`: es una plantilla cerrada por defecto y también se usa en las pruebas del emulador.

## 3. Validación y publicación

```powershell
npm run check
npm run test:rules
npx playwright install chromium
npm run test:e2e
npm audit
npm audit --prefix functions
npm run build:production
npm run deploy
```

`npm run deploy` publica Hosting, reglas/índices Firestore y Functions usando el Project ID de la configuración. Los hooks verifican coherencia y compilan. También puedes hacer un ensayo sin publicar:

```powershell
firebase deploy --dry-run --project TU_PROJECT_ID --only hosting,firestore,functions
```

No uses `npm run build` para certificar configuración real: permite generar la demo que utilizan CI y las pruebas. `build:production` exige toda la configuración del despliegue.

Storage queda fuera del despliegue normal. Si ya tienes un bucket dedicado para esta aplicación y quieres aplicar sus reglas de denegación, puedes ejecutar explícitamente `firebase deploy --project TU_PROJECT_ID --only storage`.

## 4. Verificar el primer despliegue

1. Abre la URL HTTPS indicada por Firebase y entra con el propietario.
2. Crea una letra, edítala, marca favorito, exporta y comprueba su aparición en otro dispositivo.
3. Entra con otra cuenta: debe aparecer acceso restringido. Cierra sesión y comprueba que no queda visible la biblioteca ni un borrador anterior.
4. Fotografía una canción real, recorta cada página, prepara las imágenes, ejecuta IA y compara la letra antes de guardar.
5. Comprueba ilegibles, acordes y una canción de varias páginas. El resultado de IA requiere revisión humana.
6. Instala la PWA en Android y, mediante Safari, en iOS. Las pruebas automatizadas móviles emulan Chromium; no certifican Safari ni cámara física.
7. Comprueba App Check y errores en la consola de Firebase. Tras comprobar las solicitudes válidas, activa también enforcement de App Check para Firestore desde consola.
8. Configura alertas de presupuesto Firebase y límites del proyecto OpenAI. Las cuotas de la app limitan solicitudes; no constituyen un tope monetario global.

## 5. Publicar desde GitHub Actions

El workflow `Desplegar Firebase` se ejecuta manualmente. En Settings → Environments crea `production` y configura estas variables con los mismos nombres de `.env.production.local`:

- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
- `VITE_OWNER_UID`, `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`.
- `VITE_FIREBASE_STORAGE_BUCKET`, si corresponde.

Añade `FIREBASE_SERVICE_ACCOUNT` como secreto del entorno con una credencial JSON de una cuenta de servicio autorizada para desplegar Hosting, Firestore y Functions y usar el secreto existente. La cuenta requiere permisos de despliegue y de uso de las cuentas de ejecución; no uses una cuenta de servicio ajena al proyecto. Restringe quién puede ejecutar este workflow y rota la credencial. La clave OpenAI permanece en Secret Manager, no en GitHub.

El workflow `Validar PWA` comprueba builds, pruebas, auditorías, reglas con emulador y navegador en cada push/PR. Una ejecución manual de despliegue no sustituye comprobar que la validación del commit está verde.

## Problemas frecuentes

- **401 al listar proyectos:** la sesión CLI caducó; ejecuta `firebase login --reauth` y vuelve a consultar.
- **Acceso restringido:** el UID autenticado no coincide con `VITE_OWNER_UID`; comprueba propietario, build y proyecto.
- **permission-denied de Firestore:** verifica las reglas generadas y el propietario desplegado; consulta la validación de campos/timestamps.
- **App Check inválido:** comprueba clave Enterprise, registro de la app y dominios; no desactives la comprobación de producción para ocultar el error.
- **IA unavailable:** comprueba secreto, facturación, despliegue y logs sin publicar contenido sensible.
- **resource-exhausted:** se agotó la cuota horaria/diaria o no han pasado diez segundos. Los contadores usan UTC.

Referencias oficiales: [App Check web](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider), [App Check Functions](https://firebase.google.com/docs/app-check/cloud-functions), [validación de campos Firestore](https://firebase.google.com/docs/firestore/security/rules-fields) y [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Acceso inicial y opciones de publicación

En SongScan, el propietario ya está creado. En la PWA puede solicitar **Establecer o restablecer contraseña** para elegirla personalmente. El agente no asignó una contraseña conocida ni envió correos de recuperación durante la preparación. Google Sign-In solo se muestra si `VITE_GOOGLE_AUTH_ENABLED=true` y requiere configurar su proveedor OAuth.

`VITE_AI_ENABLED=true` activa el botón de transcripción; mantenlo en `false` hasta registrar el secreto y desplegar la función. El workflow de despliegue admite ambas variables como variables del entorno GitHub `production`.

`npm run deploy:web` publica Hosting y Firestore sin Functions. `npm run deploy` publica esos recursos y específicamente `functions:processSong`.

Las pruebas E2E generan un build con `npm run build:demo`, que utiliza `.env.demo` y fuerza memoria temporal. `build:production` rechaza un entorno marcado como demo. Esto permite ejecutar las pruebas locales aunque exista una configuración Firebase real.

## Detección local de Functions y contenedores

El script de despliegue concede 60 segundos para detectar las funciones antes de publicar. Esto evita el timeout predeterminado de diez segundos observado durante el primer arranque local en Windows. Se puede ajustar mediante `FUNCTIONS_DISCOVERY_TIMEOUT`.

El repositorio `gcf-artifacts` de `us-central1` tiene una política de limpieza de imágenes de contenedor de más de siete días. El código fuente y los commits permanecen en GitHub; esta política se aplica a artefactos de construcción.
