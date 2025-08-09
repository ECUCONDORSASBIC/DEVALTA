import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, connectStorageEmulator, getStorage } from 'firebase/storage';

// Firebase configuration interface
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Default configuration for development - Updated with correct AltaMedica config
const defaultConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkzR3fZjtwsGu4wJ6jNnbjcSLGu3rWoGs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "altamedic-20f69.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altamedic-20f69",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "altamedic-20f69.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "131880235210",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:131880235210:web:35d867452b6488c245c433",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-X3FJNH06PN",
};

// Firebase app instance
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

// Initialize Firebase
export function initializeFirebase(config?: FirebaseConfig): FirebaseApp {
  if (getApps().length === 0) {
    app = initializeApp(config || defaultConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize services
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);

  // Connect to emulators only if explicitly enabled
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined') {
    connectToEmulators();
  }

  return app;
}

// Connect to Firebase emulators
function connectToEmulators() {
  try {
    // Connect Auth emulator
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      return; // Skip emulator connection in production
    }
    
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    } catch (authError) {
      console.log('Auth emulator already connected or not available');
    }

    // Connect Firestore emulator
    try {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    } catch (firestoreError) {
      console.log('Firestore emulator already connected or not available');
    }

    // Connect Storage emulator
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
    } catch (storageError) {
      console.log('Storage emulator already connected or not available');
    }
  } catch (error) {
    console.log('Emulators already connected or not available:', error);
  }
}

// Export services with automatic initialization
export function getFirebaseAuth(): Auth {
  if (!auth) {
    console.log('Auto-initializing Firebase...');
    const firebaseApp = initializeFirebase();
    if (!firebaseApp) {
      throw new Error('Failed to initialize Firebase app');
    }
    auth = getAuth(firebaseApp);
  }
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    console.log('Auto-initializing Firebase for Firestore...');
    const firebaseApp = initializeFirebase();
    if (!firebaseApp) {
      throw new Error('Failed to initialize Firebase app');
    }
    firestore = getFirestore(firebaseApp);
  }
  if (!firestore) {
    throw new Error('Firebase Firestore is not initialized');
  }
  return firestore;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    console.log('Auto-initializing Firebase for Storage...');
    initializeFirebase();
  }
  return storage;
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    console.log('Auto-initializing Firebase App...');
    initializeFirebase();
  }
  return app;
}

// Re-export Firebase types and functions for convenience
export {
    createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile, type User,
    type UserCredential
} from 'firebase/auth';

export {
    addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc,
    getDoc,
    getDocs, increment, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, startAfter, updateDoc, where, type CollectionReference, type DocumentData, type DocumentReference, type DocumentSnapshot, type Query, type QuerySnapshot
} from 'firebase/firestore';

export {
    deleteObject, getDownloadURL, listAll, ref,
    uploadBytes,
    uploadString, type StorageReference,
    type UploadResult
} from 'firebase/storage';

