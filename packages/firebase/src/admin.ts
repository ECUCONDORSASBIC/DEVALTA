import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Verificar que las variables de entorno están disponibles
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID is required');
}

if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('FIREBASE_CLIENT_EMAIL is required');
}

if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error('FIREBASE_PRIVATE_KEY is required');
}

// Configurar Firebase Admin solo si no está ya inicializado
let firebaseAdmin: App;

if (getApps().length === 0) {
  firebaseAdmin = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  firebaseAdmin = getApps()[0] as App;
}

// Exportar instancias de los servicios
export const adminAuth = getAuth(firebaseAdmin);

// Configure Firestore with robust singleton pattern (FIREBASE OFFICIAL SOLUTION)
let firestoreDb: Firestore;
let isConfigured = false;

function initializeFirestore() {
  if (firestoreDb && isConfigured) {
    return firestoreDb;
  }

  try {
    firestoreDb = getFirestore(firebaseAdmin);
    
    // Only configure if not already done
    if (!isConfigured) {
      firestoreDb.settings({
        ignoreUndefinedProperties: true
      });
      isConfigured = true;
      console.log('✅ Firestore configured with ignoreUndefinedProperties');
    }
  } catch (error) {
    // If settings already called, just get the instance
    console.log('⚠️ Firestore already configured, using existing instance');
    firestoreDb = getFirestore(firebaseAdmin);
  }

  return firestoreDb;
}

export const adminDb = initializeFirestore();
export const adminStorage = getStorage(firebaseAdmin);

// Función para verificar tokens ID de Firebase Auth
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

// Exportar la app para uso directo si es necesario
export { firebaseAdmin };

export default firebaseAdmin;
