import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
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
} catch (error) {
  console.warn("Firebase initialization failed. This is expected during build if environment variables are missing.");
  // Return a dummy app object to avoid crashing the build
  app = { name: "[DEFAULT]" } as any;
}

// Initialize App Check
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    logger.error("App Check initialization failed", { error });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let auth: ReturnType<typeof getAuth> = {} as any;
if (typeof window !== "undefined") {
  try {
    auth = getAuth(app);
  } catch {
    // Firebase Auth initialization failed — expected during E2E tests
    // or when environment variables are missing.
    auth = {} as any;
  }
} else {
  auth = {} as any;
}
export { auth };
export default app;
