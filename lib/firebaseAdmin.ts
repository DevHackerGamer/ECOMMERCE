import 'server-only';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function initializeFirebaseAdmin() {
  // Return existing app if already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env'
    );
  }

  // Handle escaped newlines in private key
  privateKey = privateKey.replace(/\\n/g, '\n');

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
    storageBucket,
  });
  return app;
}

const adminApp = initializeFirebaseAdmin();
export const adminDb = getFirestore(adminApp);
export const adminBucket = getStorage(adminApp).bucket();
if (process.env.FIRESTORE_EMULATOR_HOST && adminDb) {
  // No explicit connectToEmulator API on admin SDK; honoring env var is sufficient.
}