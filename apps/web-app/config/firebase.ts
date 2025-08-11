// Centraliza a @altamedica/firebase-config para evitar duplicación
import {
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseStorage,
  initializeFirebase
} from '@altamedica/firebase-config';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Inicializa una única vez usando el paquete central
initializeFirebase();

// Re-exportes compatibles con el código existente
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export const storage = getFirebaseStorage();

// App por defecto
const app = getFirebaseApp();
export default app;

// Opcional: Performance/Analytics sólo en navegador
let performance: any = null;
let analytics: any = null;

if (typeof window !== 'undefined') {
  try {
    performance = getPerformance(app);
    // Analytics sólo si está soportado
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  } catch (error) {
    console.warn('Failed to initialize Firebase Performance/Analytics:', error);
  }
}

export { analytics, performance };

