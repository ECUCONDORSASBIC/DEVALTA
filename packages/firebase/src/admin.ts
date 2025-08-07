import admin from '@altamedica/firebase-admin';
import type { app } from 'firebase-admin';

// Configurar Firebase Admin solo si no está ya inicializado
let firebaseAdmin: app.App;

if (admin.apps.length === 0) {
  // Verificar que las variables de entorno están disponibles
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase Admin: Variables de entorno no configuradas completamente');
    console.warn('   FIREBASE_PROJECT_ID:', projectId ? '✅' : '❌');
    console.warn('   FIREBASE_CLIENT_EMAIL:', clientEmail ? '✅' : '❌');
    console.warn('   FIREBASE_PRIVATE_KEY:', privateKey ? '✅' : '❌');
    
    // Usar configuración de desarrollo con valores por defecto
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId || 'altamedic-20f69',
        clientEmail: clientEmail || 'firebase-adminsdk-demo@altamedic-20f69.iam.gserviceaccount.com',
        privateKey: privateKey || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n7VrQYie2Wq1nGdka7/hn7J8P1sURjBW8K5iHDWb+M1o5WzAcnPLyEs9LTDPeMa95\nNUze8zwpkeyWgQHs8+ysFPxXzpJ7VXjWzmZqwUjB2J1vzbUqLlRaWi703ICFlvE6\nkRlQOb6dkJ+J/2YVjP9B1ZckI+5mJkQtsD9GM74Oym2pyBdVvsClR55Bvtl4uL1t\n4uRrLwiyKzJiGmR01XGsCrg2lms3eQIDAQABAoIBADhlixaWt8P6EJWmQHDimdVK\n+6/OGngrhIlj4eRlmYxWw4c/5UdqpL3rD3N9Bsm+oxN8R1O4r6UxokIpB19Lh1MY\nWbl6a8b7yJ1E5CJ/GR4ZgKyM6cWfB5Bqtc4gH3Yz1BuZgZ3E1UplxUcRfV7j+sK5\n8hByH4mGrUdfw6j8mRdu1Jk3sgJv3zLymxyIQsQNKwCIB1K/mCj3P3XZJzD8Bkv8\nmQ7Ra4Q2qJ7QU3bJvewLjXlZtXfZAL2QQlY37CJ5mLs9upce3mFM0ZSa1x4Ns2Rq\nctQmQYA4UwJvhyg4yqR9DVzJ9m9wJ/3yJWQJBANXmWiXdH8wH2JTIQU9vdQm3G3f\nkwCrLfXJQmQ7q1Pypz3qO/BJ8s1JmC7jJCE4o5fc8A4tBm4Cea99UUpy0w8BpMX9\nZLyA8R9HrIqJ4NFZx6KVZsmIaojWJHaFhidSnZ1B4Gn01RiyjW0BkEYvr/HRjJC8\nWROHu7lBZJJBGYhrCgI/9UJ1W7DpBScQytS4xL0L3MsJA8mZFpm11bksUfk4pshn\nCnqGqJB2jX4V6UzVt2eq9p5Ncvm3Z8ACFYfRkjQdPI09y98EoVjp9a5wCBJ51qXq\n9bFDuM20o6eJnGzqHfpyWm1zUiw4NqDIzZizN5B4QJBANjANwLrFgKt/ze4gMg2V\nJ6+u/2H5OCj74vs5lNYF1kQoGsKvyiFclWzWH9uDmBrSfL9ytPt2gVc2xQALwZR+\nLYwjU2MJa4x7VsPvGdjBfvMCF8znAgZMBuSeG6LlWAdX/8r0ec0shS30Nv3X6b5O\n9P6BiNtrjVz/heD1LNoUZ/gTAboCQQDgxOR2LskVAj1C6zNloYlsZ0G8aWpC2RwD\nN6os4T7bRsNbJ4ZHl7T6fE4y0Uo5fH6A0ymC5gYtMs1isQqBz22iZ5QxZtCqAiE9\nBQonC3Lj5wdR99m2JNxCdN4Xn/JJVL0n8Iqj0oa8dtcoV2Ruk8FCo1qkS1Z5xn7d\nAh8tR0fMoQZBCQJBAKvRqJt6tSk3BDfYw8D/3VU9MXqTE1eC/7KqOouFu0WcP7wq\n9QqybiB9w+Jf1w4u+svqDVq5n5cyrct2uVZTvqjq\n-----END PRIVATE KEY-----\n',
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://altamedic-20f69-default-rtdb.firebaseio.com',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'altamedic-20f69.firebasestorage.app',
    });
    
    console.log('✅ Firebase Admin inicializado en modo desarrollo');
  } else {
    // Usar configuración de producción
    try {
      // Asegurar que la clave privada esté correctamente formateada
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
      
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log('✅ Firebase Admin inicializado en modo producción');
    } catch (error) {
      console.error('❌ Error al inicializar Firebase Admin:', error);
      // Fallback a configuración de desarrollo
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: 'altamedic-20f69',
          clientEmail: 'firebase-adminsdk-demo@altamedic-20f69.iam.gserviceaccount.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n7VrQYie2Wq1nGdka7/hn7J8P1sURjBW8K5iHDWb+M1o5WzAcnPLyEs9LTDPeMa95\nNUze8zwpkeyWgQHs8+ysFPxXzpJ7VXjWzmZqwUjB2J1vzbUqLlRaWi703ICFlvE6\nkRlQOb6dkJ+J/2YVjP9B1ZckI+5mJkQtsD9GM74Oym2pyBdVvsClR55Bvtl4uL1t\n4uRrLwiyKzJiGmR01XGsCrg2lms3eQIDAQABAoIBADhlixaWt8P6EJWmQHDimdVK\n+6/OGngrhIlj4eRlmYxWw4c/5UdqpL3rD3N9Bsm+oxN8R1O4r6UxokIpB19Lh1MY\nWbl6a8b7yJ1E5CJ/GR4ZgKyM6cWfB5Bqtc4gH3Yz1BuZgZ3E1UplxUcRfV7j+sK5\n8hByH4mGrUdfw6j8mRdu1Jk3sgJv3zLymxyIQsQNKwCIB1K/mCj3P3XZJzD8Bkv8\nmQ7Ra4Q2qJ7QU3bJvewLjXlZtXfZAL2QQlY37CJ5mLs9upce3mFM0ZSa1x4Ns2Rq\nctQmQYA4UwJvhyg4yqR9DVzJ9m9wJ/3yJWQJBANXmWiXdH8wH2JTIQU9vdQm3G3f\nkwCrLfXJQmQ7q1Pypz3qO/BJ8s1JmC7jJCE4o5fc8A4tBm4Cea99UUpy0w8BpMX9\nZLyA8R9HrIqJ4NFZx6KVZsmIaojWJHaFhidSnZ1B4Gn01RiyjW0BkEYvr/HRjJC8\nWROHu7lBZJJBGYhrCgI/9UJ1W7DpBScQytS4xL0L3MsJA8mZFpm11bksUfk4pshn\nCnqGqJB2jX4V6UzVt2eq9p5Ncvm3Z8ACFYfRkjQdPI09y98EoVjp9a5wCBJ51qXq\n9bFDuM20o6eJnGzqHfpyWm1zUiw4NqDIzZizN5B4QJBANjANwLrFgKt/ze4gMg2V\nJ6+u/2H5OCj74vs5lNYF1kQoGsKvyiFclWzWH9uDmBrSfL9ytPt2gVc2xQALwZR+\nLYwjU2MJa4x7VsPvGdjBfvMCF8znAgZMBuSeG6LlWAdX/8r0ec0shS30Nv3X6b5O\n9P6BiNtrjVz/heD1LNoUZ/gTAboCQQDgxOR2LskVAj1C6zNloYlsZ0G8aWpC2RwD\nN6os4T7bRsNbJ4ZHl7T6fE4y0Uo5fH6A0ymC5gYtMs1isQqBz22iZ5QxZtCqAiE9\nBQonC3Lj5wdR99m2JNxCdN4Xn/JJVL0n8Iqj0oa8dtcoV2Ruk8FCo1qkS1Z5xn7d\nAh8tR0fMoQZBCQJBAKvRqJt6tSk3BDfYw8D/3VU9MXqTE1eC/7KqOouFu0WcP7wq\n9QqybiB9w+Jf1w4u+svqDVq5n5cyrct2uVZTvqjq\n-----END PRIVATE KEY-----\n',
        }),
        databaseURL: 'https://altamedic-20f69-default-rtdb.firebaseio.com',
        storageBucket: 'altamedic-20f69.firebasestorage.app',
      });
      console.log('✅ Firebase Admin inicializado en modo fallback');
    }
  }
} else {
  firebaseAdmin = admin.apps[0] as app.App;
  console.log('✅ Firebase Admin ya inicializado, usando instancia existente');
}

// Exportar instancias de los servicios
export const adminAuth = admin.auth(firebaseAdmin);

// Configure Firestore with robust singleton pattern (FIREBASE OFFICIAL SOLUTION)
let firestoreDb: admin.firestore.Firestore;
let isConfigured = false;

function initializeFirestore() {
  if (firestoreDb && isConfigured) {
    return firestoreDb;
  }

  try {
    firestoreDb = admin.firestore(firebaseAdmin);
    
    // Only configure if not already done
    if (!isConfigured) {
      firestoreDb.settings({
        ignoreUndefinedProperties: true
      });
      isConfigured = true;
      console.log('✅ Firestore configured with ignoreUndefinedProperties');
    }
  } catch (error) {
    // If settings already called, just get the instance
    console.log('⚠️ Firestore already configured, using existing instance');
    firestoreDb = admin.firestore(firebaseAdmin);
  }

  return firestoreDb;
}

export const adminDb = initializeFirestore();
export const adminStorage = admin.storage(firebaseAdmin);

// Función para verificar tokens ID de Firebase Auth
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

// Exportar la app para uso directo si es necesario
export { firebaseAdmin };

export default firebaseAdmin;
