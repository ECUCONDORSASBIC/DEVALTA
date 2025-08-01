// Configuración de Firebase usando el paquete centralizado @altamedica/firebase
// Solo importamos las funciones del cliente para evitar problemas de SSR
import { initializeFirebase, getFirebaseAuth, getFirebaseFirestore } from '@altamedica/firebase/client-only';

// Inicializar Firebase con la configuración centralizada
const app = initializeFirebase();

// Initialize Firebase Authentication and get a reference to the service
export const auth = getFirebaseAuth();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirebaseFirestore();

export default app;
