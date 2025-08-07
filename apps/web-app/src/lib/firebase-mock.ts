// Mock Firebase configuration for development without real Firebase
import { mockAuth } from '../services/mock-auth';

console.log('🔧 [Firebase Mock] Usando Firebase Mock para desarrollo');

// Mock de Firebase Auth
export const auth = {
  signInWithEmailAndPassword: async (auth: any, email: string, password: string) => {
    const result = await mockAuth.signIn(email, password);
    return { user: result.user };
  },
  createUserWithEmailAndPassword: async (auth: any, email: string, password: string) => {
    const result = await mockAuth.signIn(email, password);
    return { user: result.user };
  },
  signOut: async () => {
    await mockAuth.signOut();
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    return mockAuth.onAuthStateChanged(callback);
  },
  currentUser: null
};

// Mock de Firestore
export const db = {
  collection: () => ({
    doc: () => ({
      set: async () => ({}),
      get: async () => ({ exists: () => false, data: () => ({}) }),
      update: async () => ({})
    })
  })
};

// Mock de Storage
export const storage = {
  ref: () => ({
    child: () => ({
      put: async () => ({}),
      getDownloadURL: async () => 'https://placeholder.com/image.jpg'
    })
  })
};

// Mock app
export const app = {
  name: 'altamedica-mock',
  options: {}
};

export default app;

// Funciones getter para compatibilidad
export const getFirebaseApp = () => Promise.resolve(app);
export const getFirebaseDb = () => Promise.resolve(db);
export const getFirebaseAuth = () => Promise.resolve(auth);
export const getFirebaseStorage = () => Promise.resolve(storage);