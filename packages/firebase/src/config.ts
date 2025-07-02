import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getPerformance } from 'firebase/performance';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkzR3fZjtwsGu4wJ6jNnbjcSLGu3rWoGs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "altamedic-20f69.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://altamedic-20f69-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altamedic-20f69",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "altamedic-20f69.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "131880235210",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:131880235210:web:35d867452b6488c245c433",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-X3FJNH06PN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Performance Monitoring (only in browser)
let performance: any = null;
let analytics: any = null;

if (typeof window !== 'undefined') {
  try {
    performance = getPerformance(app);
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase Performance/Analytics:', error);
  }
}

export { performance, analytics };
export default app;
