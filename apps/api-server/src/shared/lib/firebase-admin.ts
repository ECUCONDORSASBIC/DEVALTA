// Mover el contenido desde src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Firebase Admin SDK configuration
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'altamedica-dev',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK if not already initialized
let app;
if (!getApps().length) {
  const serviceAccount: ServiceAccount = {
    projectId: firebaseConfig.projectId,
    clientEmail: firebaseConfig.clientEmail!,
    privateKey: firebaseConfig.privateKey!,
  };

  app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  });
} else {
  app = getApps()[0];
}

// Export Firebase services
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);

export default app;