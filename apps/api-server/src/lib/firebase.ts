import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Configuración de Firebase Admin
const firebaseConfig = {
  type: process.env.FIREBASE_TYPE || 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

// Inicializar Firebase Admin si no está ya inicializado
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert(firebaseConfig),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('✅ Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error);
  }
}

// Obtener instancias de Auth y Firestore
export const auth = getAuth();
export const db = getFirestore();

// Función para verificar token de Firebase
export async function verifyFirebaseToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verificando token de Firebase:', error);
    return null;
  }
}

// Función para crear usuario en Firebase Auth
export async function createFirebaseUser(userData: {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
}) {
  try {
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber,
    });
    
    return userRecord;
  } catch (error) {
    console.error('Error creando usuario en Firebase:', error);
    throw error;
  }
}

// Función para actualizar usuario en Firebase Auth
export async function updateFirebaseUser(uid: string, updates: {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  disabled?: boolean;
}) {
  try {
    const userRecord = await auth.updateUser(uid, updates);
    return userRecord;
  } catch (error) {
    console.error('Error actualizando usuario en Firebase:', error);
    throw error;
  }
}

// Función para eliminar usuario de Firebase Auth
export async function deleteFirebaseUser(uid: string) {
  try {
    await auth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error('Error eliminando usuario de Firebase:', error);
    throw error;
  }
}

// Función para obtener usuario de Firebase Auth
export async function getFirebaseUser(uid: string) {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error obteniendo usuario de Firebase:', error);
    return null;
  }
}

// Función para sincronizar usuario entre PostgreSQL y Firebase
export async function syncUserToFirebase(userData: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
}) {
  try {
    // Verificar si el usuario ya existe en Firebase
    const existingUser = await auth.getUserByEmail(userData.email);
    
    if (existingUser) {
      // Actualizar usuario existente
      await auth.updateUser(existingUser.uid, {
        displayName: `${userData.first_name} ${userData.last_name}`,
        disabled: userData.status !== 'active',
      });
      
      // Actualizar claims personalizados
      await auth.setCustomUserClaims(existingUser.uid, {
        role: userData.role,
        userId: userData.id,
        status: userData.status,
      });
      
      return existingUser.uid;
    } else {
      // Crear nuevo usuario (sin contraseña, se manejará por separado)
      const userRecord = await auth.createUser({
        email: userData.email,
        displayName: `${userData.first_name} ${userData.last_name}`,
        disabled: userData.status !== 'active',
      });
      
      // Establecer claims personalizados
      await auth.setCustomUserClaims(userRecord.uid, {
        role: userData.role,
        userId: userData.id,
        status: userData.status,
      });
      
      return userRecord.uid;
    }
  } catch (error) {
    console.error('Error sincronizando usuario con Firebase:', error);
    throw error;
  }
}

// Función para obtener claims personalizados de un usuario
export async function getCustomClaims(uid: string) {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord.customClaims;
  } catch (error) {
    console.error('Error obteniendo claims personalizados:', error);
    return null;
  }
}

// Función para verificar si un usuario tiene un rol específico
export async function hasRole(uid: string, requiredRole: string): Promise<boolean> {
  try {
    const claims = await getCustomClaims(uid);
    return claims?.role === requiredRole;
  } catch (error) {
    console.error('Error verificando rol:', error);
    return false;
  }
}

// Función para enviar email de verificación
export async function sendEmailVerification(uid: string) {
  try {
    const actionCodeSettings = {
      url: process.env.FRONTEND_URL + '/auth/verify-email',
      handleCodeInApp: true,
    };
    
    const link = await auth.generateEmailVerificationLink(
      (await auth.getUser(uid)).email!,
      actionCodeSettings
    );
    
    return link;
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    throw error;
  }
}

// Función para enviar email de reset de contraseña
export async function sendPasswordResetEmail(email: string) {
  try {
    const actionCodeSettings = {
      url: process.env.FRONTEND_URL + '/auth/reset-password',
      handleCodeInApp: true,
    };
    
    const link = await auth.generatePasswordResetLink(email, actionCodeSettings);
    
    return link;
  } catch (error) {
    console.error('Error enviando email de reset de contraseña:', error);
    throw error;
  }
}

// Función para verificar acción de email
export async function verifyActionCode(actionCode: string) {
  try {
    const info = await auth.verifyPasswordResetCode(actionCode);
    return info;
  } catch (error) {
    console.error('Error verificando código de acción:', error);
    throw error;
  }
}

// Función para confirmar reset de contraseña
export async function confirmPasswordReset(actionCode: string, newPassword: string) {
  try {
    await auth.confirmPasswordReset(actionCode, newPassword);
    return true;
  } catch (error) {
    console.error('Error confirmando reset de contraseña:', error);
    throw error;
  }
}

// Función para obtener lista de usuarios (con paginación)
export async function listUsers(maxResults: number = 1000, nextPageToken?: string) {
  try {
    const listUsersResult = await auth.listUsers(maxResults, nextPageToken);
    return listUsersResult;
  } catch (error) {
    console.error('Error listando usuarios:', error);
    throw error;
  }
}

// Función para buscar usuarios por email
export async function findUsersByEmail(email: string) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    return null;
  }
}

// Función para obtener estadísticas de usuarios
export async function getUserStats() {
  try {
    const stats = await auth.getUserCount();
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas de usuarios:', error);
    throw error;
  }
}

// Exportar configuración para uso en otros módulos
export { firebaseConfig }; 