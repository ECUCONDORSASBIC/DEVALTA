// Exportar configuración principal
export * from './config';

// Exportar funciones administrativas
export * from './admin';

// Exportar funciones de performance
export * from './performance';

// Exportar cliente con funciones de inicialización
export * from './client';

// Exportar cliente-only para aplicaciones del lado del cliente
export * from './client-only';

// Re-exportar funciones clave para facilitar el uso
export { adminAuth, adminDb, adminStorage, firebaseAdmin, verifyIdToken } from './admin';

