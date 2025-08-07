/**
 * 🔄 FIREBASE CONFIGURATION - COMPANIES APP
 * Re-export desde la configuración centralizada de @altamedica/database
 * Este archivo mantiene compatibilidad durante la migración
 */

// Re-exportar desde el package centralizado
export { 
  initializeFirebaseApp as default,
  getFirebaseAuth as auth,
  getFirebaseFirestore as db,
  getFirebaseStorage as storage,
  firebaseUtils,
  type FirebaseApp,
  type Auth,
  type Firestore,
  type FirebaseStorage
} from '@altamedica/database'

// Para compatibilidad con importaciones existentes
import { getFirebaseAuth, getFirebaseFirestore } from '@altamedica/database'

export const auth = getFirebaseAuth()
export const db = getFirebaseFirestore()
