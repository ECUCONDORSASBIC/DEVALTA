export * from './config';
export * from './admin';
export * from './performance';

// Re-exportar funciones clave para facilitar el uso
export { adminAuth, adminDb, adminStorage, firebaseAdmin, verifyIdToken } from './admin';

