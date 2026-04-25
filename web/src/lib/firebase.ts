import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { logger } from "./logger";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch {
  console.warn("Firebase initialization failed. This is expected during build if environment variables are missing.");
  // Return a dummy app object to avoid crashing the build
  app = { name: "[DEFAULT]" } as unknown as ReturnType<typeof initializeApp>;
}

// Initialize App Check
if (typeof window !== "undefined") {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_ALL) {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: string | undefined }).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN;
  }

  if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      logger.error("App Check initialization failed", { error });
    }
  }
}

let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;

if (typeof window !== "undefined") {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
  } catch {
    // Firebase initialization failed — expected during E2E tests
    // or when environment variables are missing.
    auth = {} as unknown as ReturnType<typeof getAuth>;
    db = {} as unknown as ReturnType<typeof getFirestore>;
  }
} else {
  auth = {} as unknown as ReturnType<typeof getAuth>;
  db = {} as unknown as ReturnType<typeof getFirestore>;
}

export { auth, db };
export default app;
