import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
};
export const cloudEnabled = Boolean(config.apiKey && config.projectId && config.appId);
export const firebaseApp: FirebaseApp | null = cloudEnabled ? (getApps()[0] ?? initializeApp(config)) : null;
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp ? initializeFirestore(firebaseApp, {localCache:memoryLocalCache()}) : null;
export const functions: Functions | null = firebaseApp ? getFunctions(firebaseApp,import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1') : null;
