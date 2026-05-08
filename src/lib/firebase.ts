import { initializeApp, getApps, deleteApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function assertConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(
      `Missing Firebase env vars: ${missing.join(", ")}. Copy .env.example to .env.local and fill it in.`,
    );
  }
}

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  assertConfig();
  // Always use the [DEFAULT] app for the primary instance. Secondary apps
  // (used for provisioning) are created with explicit names.
  _app = getApps().find((a) => a.name === "[DEFAULT]") ?? initializeApp(firebaseConfig);
  return _app;
}

export function auth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function db(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

// Firestore collection names
export const COL = {
  users: "users",
  contents: "contents",
} as const;

/**
 * Creates a short-lived secondary Firebase app instance with its own Auth.
 * Used when a logged-in user (e.g. principal) needs to provision another
 * account without `createUserWithEmailAndPassword` swapping out their own
 * session in the primary app.
 *
 * The caller must invoke `dispose()` after use.
 */
export async function createSecondaryAuth(): Promise<{ auth: Auth; db: Firestore; dispose: () => Promise<void> }> {
  assertConfig();
  const name = `secondary-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const app = initializeApp(firebaseConfig, name);
  const secondaryAuth = getAuth(app);
  const secondaryDb = getFirestore(app);
  return {
    auth: secondaryAuth,
    db: secondaryDb,
    dispose: async () => {
      try { await secondaryAuth.signOut(); } catch { /* noop */ }
      try { await deleteApp(app); } catch { /* noop */ }
    },
  };
}
