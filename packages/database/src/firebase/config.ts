/**
 * 🔥 FIREBASE CONFIGURATION - CENTRALIZED
 * Configuración centralizada de Firebase para todo el ecosistema AltaMedica
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "altamedica-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altamedica-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "altamedica-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DEMO"
}

// Singleton para la app de Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

/**
 * Inicializa Firebase de forma centralizada
 * Solo se ejecuta una vez por sesión
 */
export function initializeFirebaseApp(): FirebaseApp {
  if (!app) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }
  }
  return app
}

/**
 * Obtiene la instancia de Firebase Auth
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const app = initializeFirebaseApp()
    auth = getAuth(app)
    
    // Conectar a emulador en desarrollo
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      connectToEmulators()
    }
  }
  return auth
}

/**
 * Obtiene la instancia de Firestore
 */
export function getFirebaseFirestore(): Firestore {
  if (!db) {
    const app = initializeFirebaseApp()
    db = getFirestore(app)
    
    // Conectar a emulador en desarrollo
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      connectToEmulators()
    }
  }
  return db
}

/**
 * Obtiene la instancia de Firebase Storage
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    const app = initializeFirebaseApp()
    storage = getStorage(app)
  }
  return storage
}

/**
 * Conecta a los emuladores de Firebase en desarrollo
 */
function connectToEmulators(): void {
  try {
    // Solo conectar si no están ya conectados
    const currentAuth = getFirebaseAuth()
    if (currentAuth && !currentAuth.config.emulator) {
      connectAuthEmulator(currentAuth, 'http://localhost:9099', { 
        disableWarnings: true 
      })
    }
    
    const currentDb = getFirebaseFirestore()
    // Para Firestore, verificar si ya está conectado
    const firestoreSettings = (currentDb as any)._delegate?._databaseId
    if (currentDb && (!firestoreSettings || !firestoreSettings.includes('localhost'))) {
      connectFirestoreEmulator(currentDb, 'localhost', 8080)
    }
  } catch (error) {
    // Los emuladores pueden ya estar conectados, ignorar errores
    console.log('🔧 Emuladores de Firebase ya configurados o no disponibles')
  }
}

/**
 * Utilidades de configuración
 */
export const firebaseUtils = {
  /**
   * Verifica si Firebase está en modo emulador
   */
  isEmulatorMode(): boolean {
    return process.env.NODE_ENV === 'development' && 
           process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
  },

  /**
   * Obtiene la configuración actual de Firebase
   */
  getConfig() {
    return firebaseConfig
  },

  /**
   * Obtiene información del proyecto
   */
  getProjectInfo() {
    return {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      isEmulator: this.isEmulatorMode(),
      environment: process.env.NODE_ENV
    }
  }
}

// Exportaciones principales para uso directo
export { app, auth, db, storage }

// Re-exportar tipos útiles
export type { FirebaseApp, Auth, Firestore, FirebaseStorage }

// Exportar la app inicializada por defecto
export default initializeFirebaseApp()