/**
 * @altamedica/auth/services/AuthService
 * Servicio de autenticación unificado - Migrado desde auth-service
 */

'use client';

import { getFirebaseAuth, getFirebaseFirestore } from '@altamedica/firebase';
import {
    Auth,
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, Firestore, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

// Tipos exportados - Roles corregidos según arquitectura real
export enum UserRole {
  ADMIN = 'admin', // Solo para ti, acceso especial
  DOCTOR = 'doctor',
  PATIENT = 'patient', 
  COMPANY = 'company', // Las empresas son companies, no company_admin
  GUEST = 'guest'
}

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  emailVerified: boolean;
  profileComplete?: boolean;
  metadata?: {
    lastLoginAt?: string;
    createdAt?: string;
  };
  // Campos específicos por rol
  patientData?: {
    medicalRecordNumber?: string;
    dateOfBirth?: string;
    bloodType?: string;
  };
  doctorData?: {
    licenseNumber?: string;
    specialties?: string[];
    hospitalAffiliations?: string[];
  };
  companyData?: {
    companyId?: string;
    department?: string;
    position?: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Roles disponibles para registro público (sin admin)
export enum PublicUserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient', 
  COMPANY = 'company'
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  role?: PublicUserRole; // Solo roles públicos permitidos en registro
  displayName?: string; // Opcional, se genera automáticamente desde firstName + lastName
}

// Clase principal del servicio
export class AuthService {
  private _auth: Auth | null = null;
  private _db: Firestore | null = null;
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    // Configurar scopes para obtener información adicional
    this.googleProvider.addScope('profile');
    this.googleProvider.addScope('email');
    // Forzar selección de cuenta
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  private get auth(): Auth {
    if (!this._auth) {
      this._auth = getFirebaseAuth();
    }
    return this._auth;
  }

  private get db(): Firestore {
    if (!this._db) {
      this._db = getFirebaseFirestore();
    }
    return this._db;
  }

  /**
   * Registra un nuevo usuario
   */
  async signUp(data: RegisterData): Promise<User> {
    try {
      // Validar que el rol no sea admin (seguridad adicional)
      if ((data.role as any) === 'admin') {
        throw new Error('El rol de administrador no está disponible para registro público');
      }

      // Validar campos requeridos
      if (!data.firstName || !data.lastName) {
        throw new Error('firstName y lastName son campos requeridos');
      }

      // Crear usuario en Firebase Auth
      const credential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );

      // Actualizar perfil con nombre completo
      const displayName = data.displayName || `${data.firstName} ${data.lastName}`;
      await updateProfile(credential.user, {
        displayName: displayName
      });

      // Enviar email de verificación
      await sendEmailVerification(credential.user);

      // Crear perfil en Firestore - Solo roles públicos permitidos  
      const userData: User = {
        id: credential.user.uid,
        uid: credential.user.uid,
        email: data.email,
        displayName: displayName,
        role: data.role ? (data.role as unknown as UserRole) : UserRole.PATIENT, // Mapeo de roles
        emailVerified: false,
        profileComplete: false,
        metadata: {
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }
      };

      await setDoc(doc(this.db, 'users', credential.user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return userData;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      return await this.getUserData(credential.user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Inicia sesión con Google
   */
  async loginWithGoogle(): Promise<User> {
    try {
      const credential = await signInWithPopup(this.auth, this.googleProvider);
      
      // Verificar si es un usuario nuevo
      const userDoc = await getDoc(doc(this.db, 'users', credential.user.uid));
      
      if (!userDoc.exists()) {
        // Crear perfil para nuevo usuario de Google con rol temporal
        const userData: User = {
          id: credential.user.uid,
          uid: credential.user.uid,
          email: credential.user.email!,
          displayName: credential.user.displayName || credential.user.email!.split('@')[0],
          role: UserRole.GUEST, // Rol temporal para forzar la selección
          photoURL: credential.user.photoURL || undefined,
          emailVerified: credential.user.emailVerified,
          profileComplete: false,
          metadata: {
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          }
        };

        await setDoc(doc(this.db, 'users', credential.user.uid), {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        return userData;
      }

      return await this.getUserData(credential.user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Cierra sesión
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Registro especial de administrador - Solo para uso interno
   * @param adminKey Clave especial para crear admins
   * @param userData Datos del usuario admin
   */
  async registerAdmin(adminKey: string, userData: LoginCredentials & { displayName: string }): Promise<User> {
    // Clave especial que solo Eduardo conoce
    const ADMIN_SECRET_KEY = 'altamedica_admin_2025_eduardo_secret';
    
    if (adminKey !== ADMIN_SECRET_KEY) {
      throw new Error('No autorizado para crear administradores');
    }

    try {
      // Crear usuario en Firebase Auth
      const credential = await createUserWithEmailAndPassword(
        this.auth,
        userData.email,
        userData.password
      );

      const user = credential.user;
      await updateProfile(user, { displayName: userData.displayName });

      // Crear usuario en Firestore con rol admin
      const newUser: User = {
        id: user.uid,
        uid: user.uid,
        email: user.email!,
        displayName: userData.displayName,
        role: UserRole.ADMIN, // Forzar rol admin
        emailVerified: user.emailVerified,
        profileComplete: true,
        metadata: {
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }
      };

      await setDoc(doc(this.db, 'users', user.uid), newUser);
      console.info(`[AuthService] ⚡ Usuario ADMIN creado: ${userData.email}`);
      return newUser;
    } catch (error: any) {
      console.error('[AuthService] Error creando admin:', error);
      throw new Error(`Error en registro de administrador: ${error.message}`);
    }
  }

  /**
   * Envía email para resetear contraseña
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = this.auth.currentUser;
    
    if (!firebaseUser) {
      return null;
    }

    return await this.getUserData(firebaseUser);
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Si hay cambios en displayName o photoURL, actualizar también en Firebase Auth
      const currentUser = this.auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        const authUpdates: any = {};
        
        if (updates.displayName) {
          authUpdates.displayName = updates.displayName;
        }
        if (updates.photoURL) {
          authUpdates.photoURL = updates.photoURL;
        }
        
        if (Object.keys(authUpdates).length > 0) {
          await updateProfile(currentUser, authUpdates);
        }
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (!userDoc.exists()) {
        return false;
      }
      
      const userData = userDoc.data() as User;
      return userData.role === role;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  async hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (!userDoc.exists()) {
        return false;
      }
      
      const userData = userDoc.data() as User;
      return roles.includes(userData.role);
    } catch (error) {
      console.error('Error checking user roles:', error);
      return false;
    }
  }

  /**
   * Suscribe a cambios en el estado de autenticación
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getUserData(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Obtiene los datos del usuario desde Firestore
   */
  private async getUserData(firebaseUser: FirebaseUser): Promise<User> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Si no existe en Firestore, crear un perfil básico con rol GUEST
        const userData: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
          role: UserRole.GUEST, // Rol temporal
          photoURL: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
          profileComplete: false
        };
        
        await setDoc(doc(this.db, 'users', firebaseUser.uid), {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        return userData;
      }
      
      // Actualizar última vez que inició sesión
      await updateDoc(doc(this.db, 'users', firebaseUser.uid), {
        'metadata.lastLoginAt': new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
      
      const userData = userDoc.data() as User;
      
      // Asegurar que los campos básicos estén sincronizados
      userData.emailVerified = firebaseUser.emailVerified;
      userData.email = firebaseUser.email!;
      
      return userData;
    } catch (error) {
      console.error('Error getting user data:', error);
      
      // Retornar datos básicos si hay error
      return {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        role: UserRole.PATIENT,
        photoURL: firebaseUser.photoURL || undefined,
        emailVerified: firebaseUser.emailVerified
      };
    }
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(error: any): Error {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
      'auth/cancelled-popup-request': 'Solicitud cancelada',
      'auth/popup-blocked': 'Ventana emergente bloqueada',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión'
    };

    const message = errorMessages[error.code] || error.message || 'Error de autenticación';
    
    return new Error(message);
  }
}

// Instancia singleton
let authServiceInstance: AuthService | null = null;

/**
 * Obtiene la instancia del servicio de autenticación
 */
export const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
};

// Exportación por defecto
export default AuthService;