import { initializeApp, cert, getApps, getApp, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

// Singleton instances
let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: Storage | undefined;

/**
 * Obtiene las credenciales de Firebase Admin desde las variables de entorno
 * Soporta tanto JSON completo como variables individuales
 */
function getFirebaseCredentials(): ServiceAccount | null {
  // Primero intenta usar el JSON completo de la cuenta de servicio
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
      };
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    }
  }

  // Fallback a variables individuales
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }

  return null;
}

/**
 * Inicializa Firebase Admin SDK de manera optimizada para serverless
 * Esta función es idempotente y thread-safe
 */
function initializeFirebaseAdmin(): App | null {
  // Si ya está inicializado, retornar la instancia existente
  if (app) return app;
  
  // Verificar si ya hay una app inicializada
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    return app;
  }

  try {
    const credentials = getFirebaseCredentials();
    
    if (credentials) {
      // Inicialización con credenciales completas
      app = initializeApp({
        credential: cert(credentials),
        projectId: credentials.projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      console.log('✅ Firebase Admin initialized with service account');
    } else if (process.env.NODE_ENV === 'development') {
      // En desarrollo, permitir inicialización sin credenciales
      // Útil para usar con el emulador de Firebase
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'altamedica-demo'
      });
      console.log('⚠️ Firebase Admin initialized in development mode');
    } else {
      console.error('❌ Firebase Admin credentials not found');
      return null;
    }

    return app;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    return null;
  }
}

/**
 * Obtiene la instancia de Firebase Admin Auth
 * @returns Firebase Auth instance o null si falla la inicialización
 */
export function getAuthAdmin(): Auth | null {
  if (auth) return auth;
  
  const firebaseApp = initializeFirebaseAdmin();
  if (!firebaseApp) return null;
  
  auth = getAuth(firebaseApp);
  return auth;
}

/**
 * Obtiene la instancia de Firestore Admin
 * @returns Firestore instance o null si falla la inicialización
 */
export function getFirestoreAdmin(): Firestore | null {
  if (db) return db;
  
  const firebaseApp = initializeFirebaseAdmin();
  if (!firebaseApp) return null;
  
  db = getFirestore(firebaseApp);
  
  // Configurar ajustes de Firestore solo si no han sido configurados antes
  try {
    db.settings({
      ignoreUndefinedProperties: true,
      // Aumentar el tiempo de espera para funciones serverless
      ...(process.env.NODE_ENV === 'production' && {
        preferRest: true // Usar REST en lugar de gRPC para mejor compatibilidad con serverless
      })
    });
  } catch (error) {
    // Los settings ya fueron configurados, ignorar el error
    console.log('Firestore settings already configured');
  }
  
  return db;
}

/**
 * Obtiene la instancia de Firebase Storage Admin
 * @returns Storage instance o null si falla la inicialización
 */
export function getStorageAdmin(): Storage | null {
  if (storage) return storage;
  
  const firebaseApp = initializeFirebaseAdmin();
  if (!firebaseApp) return null;
  
  storage = getStorage(firebaseApp);
  return storage;
}

/**
 * Alias convenientes para mantener compatibilidad con código existente
 */
export const adminAuth = getAuthAdmin();
export const adminDb = getFirestoreAdmin();
export const adminStorage = getStorageAdmin();

/**
 * Verifica si Firebase Admin está correctamente inicializado
 */
export function isFirebaseAdminInitialized(): boolean {
  return !!initializeFirebaseAdmin();
}

/**
 * Limpia las instancias de Firebase Admin (útil para tests)
 */
export function cleanupFirebaseAdmin(): void {
  app = undefined;
  auth = undefined;
  db = undefined;
  storage = undefined;
}