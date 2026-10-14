import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};
export const cloudEnabled =
  import.meta.env.VITE_DEMO_MODE !== "true" &&
  Boolean(config.apiKey && config.projectId && config.appId);
export const ownerUid = import.meta.env.VITE_OWNER_UID || "";
export const aiEnabled =
  cloudEnabled && import.meta.env.VITE_AI_ENABLED === "true";
export const googleAuthEnabled =
  import.meta.env.VITE_GOOGLE_AUTH_ENABLED === "true";
export const firebaseApp: FirebaseApp | null = cloudEnabled
  ? (getApps()[0] ?? initializeApp(config))
  : null;
if (firebaseApp && import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(
      import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY,
    ),
    isTokenAutoRefreshEnabled: true,
  });
}
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp
  ? initializeFirestore(firebaseApp, { localCache: memoryLocalCache() })
  : null;
export const functions: Functions | null = firebaseApp
  ? getFunctions(
      firebaseApp,
      import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "us-central1",
    )
  : null;
