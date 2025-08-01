/**
 * Servicio de Autenticación para Pacientes - Firebase Integration
 * Utiliza Firebase Auth + Firestore para autenticación y perfiles
 */

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '@altamedica/firebase/src/config-production';

export interface UserProfile {
  id: string; // Firebase UID
  email: string;
  role: 'patient' | 'doctor' | 'company' | 'admin';
  firstName: string;
  lastName: string;
  displayName: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  preferences?: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      shareDataForResearch: boolean;
      allowMarketingCommunications: boolean;
    };
  };
  lastLogin?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Compatibilidad con la interfaz anterior
export interface User extends UserProfile {
  first_name: string; // Alias para firstName
  last_name: string;  // Alias para lastName
  date_of_birth?: string; // Alias para dateOfBirth
  last_login?: string; // Convertido a string para compatibilidad
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'company';
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  // Mantener compatibilidad con nomenclatura anterior
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: UserProfile;
  firebaseUser: FirebaseUser;
}

class FirebaseAuthService {
  private currentUser: FirebaseUser | null = null;
  private currentUserProfile: UserProfile | null = null;
  private authStateListeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    this.initializeAuthStateListener();
  }

  private initializeAuthStateListener() {
    // Escuchar cambios en el estado de autenticación de Firebase
    const authInstance = auth();
    if (!authInstance) return;
    
    onAuthStateChanged(authInstance, async (firebaseUser) => {
      this.currentUser = firebaseUser;
      
      if (firebaseUser) {
        try {
          // Obtener perfil del usuario desde Firestore
          const userProfile = await this.getUserProfile(firebaseUser.uid);
          this.currentUserProfile = userProfile;
        } catch (error) {
          console.error('Error loading user profile:', error);
          this.currentUserProfile = null;
        }
      } else {
        this.currentUserProfile = null;
      }

      // Notificar a todos los listeners
      this.authStateListeners.forEach(listener => {
        listener(this.currentUserProfile);
      });
    });
  }

  /**
   * Agregar listener para cambios en el estado de autenticación
   */
  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Llamar inmediatamente con el estado actual
    callback(this.currentUserProfile);
    
    // Retornar función para remover el listener
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Obtener perfil de usuario desde Firestore
   */
  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const dbInstance = db();
      if (!dbInstance) return null;
      
      const userDoc = await getDoc(doc(dbInstance, 'users', uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Crear perfil de usuario en Firestore
   */
  private async createUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const userProfile: UserProfile = {
      id: uid,
      email: profileData.email || '',
      role: profileData.role || 'patient',
      firstName: profileData.firstName || profileData.first_name || '',
      lastName: profileData.lastName || profileData.last_name || '',
      displayName: `${profileData.firstName || profileData.first_name} ${profileData.lastName || profileData.last_name}`,
      status: 'active',
      phone: profileData.phone,
      dateOfBirth: profileData.dateOfBirth || profileData.date_of_birth,
      gender: profileData.gender,
      bloodType: profileData.bloodType || profileData.blood_type as any,
      allergies: profileData.allergies || [],
      emergencyContact: profileData.emergencyContact || (
        profileData.emergency_contact_name ? {
          name: profileData.emergency_contact_name,
          phone: profileData.emergency_contact_phone || '',
          relationship: 'Emergency Contact'
        } : undefined
      ),
      medicalHistory: profileData.medicalHistory || [],
      insurance: profileData.insurance,
      preferences: {
        language: 'es',
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        privacy: {
          shareDataForResearch: false,
          allowMarketingCommunications: false
        }
      },
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    const dbInstance = db();
    if (!dbInstance) throw new Error('Database not available');
    
    await setDoc(doc(dbInstance, 'users', uid), userProfile);
    return userProfile;
  }

  /**
   * Registrar un nuevo usuario con Firebase Auth
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Normalizar datos (compatibilidad con nomenclatura anterior)
      const normalizedData = {
        ...userData,
        firstName: userData.firstName || userData.first_name || '',
        lastName: userData.lastName || userData.last_name || '',
        dateOfBirth: userData.dateOfBirth || userData.date_of_birth,
        bloodType: userData.bloodType || userData.blood_type,
        emergencyContact: userData.emergencyContact || (
          userData.emergency_contact_name ? {
            name: userData.emergency_contact_name,
            phone: userData.emergency_contact_phone || '',
            relationship: 'Emergency Contact'
          } : undefined
        )
      };

      // Crear usuario en Firebase Auth
      const authInstance = auth();
      if (!authInstance) throw new Error('Auth not available');
      
      const userCredential = await createUserWithEmailAndPassword(
        authInstance, 
        normalizedData.email, 
        normalizedData.password
      );

      const firebaseUser = userCredential.user;

      // Crear perfil en Firestore
      const userProfile = await this.createUserProfile(firebaseUser.uid, {
        ...normalizedData,
        email: firebaseUser.email || normalizedData.email
      });

      this.currentUser = firebaseUser;
      this.currentUserProfile = userProfile;

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: userProfile,
        firebaseUser
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      // Mapear errores de Firebase a mensajes más amigables
      let errorMessage = 'Error al registrar usuario';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El email no es válido';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Iniciar sesión con Firebase Auth
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Autenticar con Firebase
      const authInstance = auth();
      if (!authInstance) throw new Error('Auth not available');
      
      const userCredential = await signInWithEmailAndPassword(
        authInstance, 
        credentials.email, 
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Obtener perfil del usuario
      let userProfile = await this.getUserProfile(firebaseUser.uid);
      
      if (!userProfile) {
        // Si no existe perfil, crear uno básico
        userProfile = await this.createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email || credentials.email,
          role: 'patient',
          firstName: firebaseUser.displayName?.split(' ')[0] || 'Usuario',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || ''
        });
      } else {
        // Actualizar último login
        const dbInstance = db();
        if (dbInstance) {
          await updateDoc(doc(dbInstance, 'users', firebaseUser.uid), {
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }

      this.currentUser = firebaseUser;
      this.currentUserProfile = userProfile;

      return {
        success: true,
        message: 'Sesión iniciada exitosamente',
        user: userProfile,
        firebaseUser
      };
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Mapear errores de Firebase
      let errorMessage = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email no válido';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Esta cuenta ha sido suspendida';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Iniciar sesión con Google
   */
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const authInstance = auth();
      if (!authInstance) throw new Error('Auth not available');
      
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(authInstance, provider);
      const firebaseUser = userCredential.user;

      // Obtener o crear perfil
      let userProfile = await this.getUserProfile(firebaseUser.uid);
      
      if (!userProfile) {
        userProfile = await this.createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email || '',
          role: 'patient',
          firstName: firebaseUser.displayName?.split(' ')[0] || 'Usuario',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || ''
        });
      }

      this.currentUser = firebaseUser;
      this.currentUserProfile = userProfile;

      return {
        success: true,
        message: 'Sesión iniciada con Google exitosamente',
        user: userProfile,
        firebaseUser
      };
    } catch (error: any) {
      console.error('Error en login con Google:', error);
      throw new Error('Error al iniciar sesión con Google');
    }
  }

  /**
   * Cerrar sesión con Firebase
   */
  async logout(): Promise<void> {
    try {
      const authInstance = auth();
      if (!authInstance) throw new Error('Auth not available');
      
      await signOut(authInstance);
      this.currentUser = null;
      this.currentUserProfile = null;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  /**
   * Obtener el token de Firebase actual
   */
  async getToken(): Promise<string | null> {
    if (!this.currentUser) return null;
    
    try {
      const token = await this.currentUser.getIdToken();
      return token;
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      return null;
    }
  }

  /**
   * Obtener el usuario de Firebase actual
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.currentUser;
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUserProfile) {
      return null;
    }

    // Convertir UserProfile a User para compatibilidad
    const user: User = {
      ...this.currentUserProfile,
      first_name: this.currentUserProfile.firstName,
      last_name: this.currentUserProfile.lastName,
      date_of_birth: this.currentUserProfile.dateOfBirth,
      last_login: this.currentUserProfile.lastLogin?.toDate().toISOString()
    };

    return user;
  }

  /**
   * Obtener perfil completo del usuario actual
   */
  getCurrentUserProfile(): UserProfile | null {
    return this.currentUserProfile;
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      const dbInstance = db();
      if (!dbInstance) throw new Error('Database not available');
      
      const userRef = doc(dbInstance, 'users', this.currentUser.uid);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      
      // Actualizar el perfil local
      this.currentUserProfile = {
        ...this.currentUserProfile!,
        ...updates,
        updatedAt: serverTimestamp() as Timestamp
      };

      return this.currentUserProfile;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña con Firebase Auth
   */
  async changePassword(newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      await updatePassword(this.currentUser, newPassword);
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Por seguridad, necesitas volver a iniciar sesión antes de cambiar tu contraseña');
      }
      
      throw new Error('Error al cambiar contraseña');
    }
  }

  /**
   * Solicitar restablecimiento de contraseña con Firebase
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const authInstance = auth();
      if (!authInstance) throw new Error('Auth not available');
      
      await sendPasswordResetEmail(authInstance, email);
    } catch (error: any) {
      console.error('Error solicitando restablecimiento:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No existe una cuenta con este email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email no válido');
      }
      
      throw new Error('Error al enviar email de restablecimiento');
    }
  }
}

// Exportar instancia singleton
export const authService = new FirebaseAuthService();

// Exportar el servicio como default también
export default authService; 