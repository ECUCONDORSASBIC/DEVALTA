import { getFirestoreAdmin } from './firebase-admin';

// Get Firestore instance from Firebase Admin
const db = getFirestoreAdmin();

if (!db) {
  throw new Error('Firebase Admin no está inicializado correctamente');
}

// Export Firestore instance
export { db };
export default db;

// Convenience functions for common Firestore operations
export async function checkFirestoreConnection() {
  try {
    if (!db) throw new Error('Firestore not initialized');
    
    // Test connection by getting a timestamp
    const testDoc = await db.collection('_health').doc('connection_test').get();
    console.log('✅ Firestore connection established');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
}
