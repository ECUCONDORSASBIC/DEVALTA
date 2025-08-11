/**
 * @altamedica/firebase-config
 * Configuración centralizada de Firebase para toda la plataforma AltaMedica
 */

import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  sendEmailVerification,
  setPersistence
} from 'firebase/auth';
import {
  Firestore,
  connectFirestoreEmulator,
  getFirestore
} from 'firebase/firestore';
import {
  FirebaseStorage,
  connectStorageEmulator,
  getStorage
} from 'firebase/storage';

// Tipos de configuración
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
  measurementId?: string;
}

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  analytics?: Analytics;
}

// Configuración desde variables de entorno
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validación de configuración
const validateConfig = (config: FirebaseConfig): void => {
  const requiredKeys: (keyof FirebaseConfig)[] = [
    'apiKey', 
    'authDomain', 
    'projectId', 
    'appId'
  ];
  
  const missingKeys = requiredKeys.filter(key => !config[key]);
  
  if (missingKeys.length > 0) {
    const errorMsg = `Firebase configuration missing: ${missingKeys.join(', ')}`;
    console.error('🚨 [Firebase Config]', errorMsg);
    
    // En desarrollo, mostrar advertencia pero no lanzar error
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Running in development mode with missing Firebase config');
      console.warn('⚠️ Some features may not work properly');
    } else {
      throw new Error(errorMsg);
    }
  }
};

// Control de emuladores
const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
const AUTH_EMULATOR_URL = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL || 'http://localhost:9099';
const FIRESTORE_EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost';
const FIRESTORE_EMULATOR_PORT = parseInt(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080');
const STORAGE_EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost';
const STORAGE_EMULATOR_PORT = parseInt(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT || '9199');

// Estado de conexión de emuladores
let emulatorsConnected = false;

/**
 * Conecta los emuladores de Firebase si están configurados
 */
const connectEmulators = (services: FirebaseServices): void => {
  if (USE_EMULATORS && !emulatorsConnected && typeof window !== 'undefined') {
    try {
      console.log('🔧 [Firebase] Conectando emuladores...');
      
      // Auth emulator
      connectAuthEmulator(services.auth, AUTH_EMULATOR_URL, { 
        disableWarnings: true 
      });
      
      // Firestore emulator
      connectFirestoreEmulator(
        services.db, 
        FIRESTORE_EMULATOR_HOST, 
        FIRESTORE_EMULATOR_PORT
      );
      
      // Storage emulator
      connectStorageEmulator(
        services.storage, 
        STORAGE_EMULATOR_HOST, 
        STORAGE_EMULATOR_PORT
      );
      
      emulatorsConnected = true;
      console.log('✅ [Firebase] Emuladores conectados exitosamente');
    } catch (error) {
      console.error('❌ [Firebase] Error conectando emuladores:', error);
    }
  }
};

// Instancias singleton
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let firebaseAnalytics: Analytics | undefined;

/**
 * Inicializa Firebase con la configuración centralizada
 * @returns Servicios de Firebase inicializados
 */
export const initializeFirebase = (): FirebaseServices => {
  // Validar configuración
  validateConfig(firebaseConfig);
  
  // Inicializar app si no existe
  if (!firebaseApp) {
    try {
      console.log('🔥 [Firebase] Inicializando Firebase...');
      firebaseApp = !getApps().length 
        ? initializeApp(firebaseConfig) 
        : getApp();
      console.log('✅ [Firebase] App inicializada:', firebaseConfig.projectId);
    } catch (error) {
      console.error('❌ [Firebase] Error inicializando app:', error);
      throw error;
    }
  }
  
  // Inicializar Auth
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
    
    // Configurar persistencia en el navegador
    if (typeof window !== 'undefined') {
      setPersistence(firebaseAuth, browserLocalPersistence)
        .then(() => console.log('✅ [Firebase Auth] Persistencia configurada'))
        .catch((error) => console.error('❌ [Firebase Auth] Error configurando persistencia:', error));
    }
  }
  
  // Inicializar Firestore
  if (!firebaseDb) {
    firebaseDb = getFirestore(firebaseApp);
  }
  
  // Inicializar Storage
  if (!firebaseStorage) {
    firebaseStorage = getStorage(firebaseApp);
  }
  
  // Inicializar Analytics (solo en producción y navegador)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    isSupported().then((supported) => {
      if (supported && !firebaseAnalytics) {
        firebaseAnalytics = getAnalytics(firebaseApp!);
        console.log('✅ [Firebase] Analytics inicializado');
      }
    });
  }
  
  const services: FirebaseServices = {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
    analytics: firebaseAnalytics
  };
  
  // Conectar emuladores si están configurados
  connectEmulators(services);
  
  return services;
};

/**
 * Obtiene los servicios de Firebase ya inicializados
 * @throws Error si Firebase no ha sido inicializado
 */
export const getFirebaseServices = (): FirebaseServices => {
  if (!firebaseApp || !firebaseAuth || !firebaseDb || !firebaseStorage) {
    throw new Error('Firebase no ha sido inicializado. Llama a initializeFirebase() primero.');
  }
  
  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
    analytics: firebaseAnalytics
  };
};

// Exportaciones individuales para retrocompatibilidad
export const getFirebaseApp = (): FirebaseApp => {
  const { app } = getFirebaseServices();
  return app;
};

export const getFirebaseAuth = (): Auth => {
  const { auth } = getFirebaseServices();
  return auth;
};

export const getFirebaseDb = (): Firestore => {
  const { db } = getFirebaseServices();
  return db;
};

export const getFirebaseStorage = (): FirebaseStorage => {
  const { storage } = getFirebaseServices();
  return storage;
};

// Hook para React (opcional)
export const useFirebase = (): FirebaseServices => {
  if (typeof window === 'undefined') {
    throw new Error('useFirebase solo puede ser usado en el cliente');
  }
  
  return initializeFirebase();
};

// Exportar tipos
export type { Analytics, Auth, FirebaseApp, FirebaseStorage, Firestore };

// Inicialización automática (opcional, comentar si prefieres control manual)
if (typeof window !== 'undefined') {
  try {
    initializeFirebase();
  } catch (error) {
    console.warn('⚠️ [Firebase] Auto-inicialización falló:', error);
  }
}

// Exportación por defecto
export default {
  initializeFirebase,
  getFirebaseServices,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseStorage,
  useFirebase
};

// Helpers convenientes
export const sendVerificationEmail = async (user: User): Promise<void> => {
  // Asegura inicialización
  if (!firebaseAuth) initializeFirebase();
  return sendEmailVerification(user);
};

// Exportaciones convenientes (singletons) para DX
// Se inicializan de forma perezosa para evitar errores en SSR
export const app: FirebaseApp = (() => {
  try {
    return getFirebaseApp();
  } catch {
    return initializeFirebase().app;
  }
})();

export const auth: Auth = (() => {
  try {
    return getFirebaseAuth();
  } catch {
    return initializeFirebase().auth;
  }
})();

export const db: Firestore = (() => {
  try {
    return getFirebaseDb();
  } catch {
    return initializeFirebase().db;
  }
})();

export const storage: FirebaseStorage = (() => {
  try {
    return getFirebaseStorage();
  } catch {
    return initializeFirebase().storage;
  }
})();