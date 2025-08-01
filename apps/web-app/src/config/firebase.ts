// config/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// Reemplazar con tu configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Singleton pattern para Firebase
let app: FirebaseApp
let db: Firestore
let auth: Auth
let storage: FirebaseStorage

// Función para inicializar Firebase de forma segura
const initializeFirebase = () => {
  try {
    // Verificar si ya existe una instancia
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
      console.log('Firebase inicializado correctamente')
    } else {
      app = getApp()
      console.log('Firebase ya estaba inicializado, usando instancia existente')
    }

    // Inicializar servicios
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)

    return { app, db, auth, storage }
  } catch (error) {
    console.error('Error inicializando Firebase:', error)
    throw error
  }
}

// Inicializar Firebase solo en el cliente con verificación de configuración
if (typeof window !== 'undefined') {
  // Verificar que todas las variables de entorno estén disponibles
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    initializeFirebase()
  } else {
    console.warn('Firebase no configurado - usando modo API Server')
  }
}

// Exportar servicios
export { db, auth, storage }
export default app 