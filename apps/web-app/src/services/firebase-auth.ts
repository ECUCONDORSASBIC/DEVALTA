'use client'

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
  AuthError,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: 'patient' | 'doctor' | 'company'
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  // Campos específicos médicos
  medicalLicense?: string
  specialty?: string
  yearsExperience?: number
  companyName?: string
  companyType?: string
  verified: boolean
  createdAt: any
  lastLogin: any
}

export interface AuthService {
  // Autenticación básica
  signIn: (email: string, password: string) => Promise<User>
  signUp: (userData: RegisterData) => Promise<User>
  signOut: () => Promise<void>
  
  // OAuth
  signInWithGoogle: () => Promise<User>
  signInWithFacebook: () => Promise<User>
  
  // Recuperación de contraseña
  resetPassword: (email: string) => Promise<void>
  
  // Verificación
  sendVerificationEmail: (user: User) => Promise<void>
  
  // 2FA / Teléfono
  setupPhoneAuth: (phoneNumber: string) => Promise<any>
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>
  
  // Perfil de usuario
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  getUserProfile: (uid: string) => Promise<UserProfile | null>
  
  // Estado de autenticación
  onAuthChange: (callback: (user: User | null) => void) => () => void
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'patient' | 'doctor' | 'company'
  phone?: string
  dateOfBirth?: string
  gender?: string
  medicalLicense?: string
  specialty?: string
  yearsExperience?: number
  companyName?: string
  companyType?: string
}

class FirebaseAuthService implements AuthService {
  private googleProvider: GoogleAuthProvider
  private facebookProvider: FacebookAuthProvider

  constructor() {
    this.googleProvider = new GoogleAuthProvider()
    this.googleProvider.addScope('email')
    this.googleProvider.addScope('profile')
    
    this.facebookProvider = new FacebookAuthProvider()
    this.facebookProvider.addScope('email')
  }

  // Autenticación básica
  async signIn(email: string, password: string): Promise<User> {
    console.log('🔥 [FirebaseAuth] signIn llamado con email:', email);
    
    try {
      if (!auth) {
        console.error('❌ [FirebaseAuth] Firebase Auth no disponible');
        throw new Error('Firebase Auth no disponible')
      }
      
      console.log('🔐 [FirebaseAuth] Llamando a signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('✅ [FirebaseAuth] Usuario autenticado exitosamente:', user.uid);
      
      // Actualizar último login
      console.log('📝 [FirebaseAuth] Actualizando último login...');
      await this.updateLastLogin(user.uid)
      
      return user
    } catch (error) {
      console.error('❌ [FirebaseAuth] Error en signIn:', error);
      throw this.handleAuthError(error as AuthError)
    }
  }

  async signUp(userData: RegisterData): Promise<User> {
    try {
      if (!auth) throw new Error('Firebase Auth no disponible')
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )
      const user = userCredential.user

      // Actualizar perfil de autenticación
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      })

      // Crear perfil en Firestore
      await this.createUserProfile(user, userData)
      
      // Enviar email de verificación
      await this.sendVerificationEmail(user)
      
      return user
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  async signOut(): Promise<void> {
    try {
      // auth is already imported as a constant
      if (!auth) throw new Error('Firebase Auth no disponible')
      
      await signOut(auth)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // OAuth
  async signInWithGoogle(): Promise<User> {
    try {
      // auth is already imported as a constant
      if (!auth) throw new Error('Firebase Auth no disponible')
      
      const result = await signInWithPopup(auth, this.googleProvider)
      const user = result.user
      
      // Verificar si es nuevo usuario
      const profile = await this.getUserProfile(user.uid)
      if (!profile) {
        // Crear perfil básico para usuarios OAuth
        await this.createOAuthUserProfile(user)
      }
      
      await this.updateLastLogin(user.uid)
      return user
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  async signInWithFacebook(): Promise<User> {
    try {
      // auth is already imported as a constant
      if (!auth) throw new Error('Firebase Auth no disponible')
      
      const result = await signInWithPopup(auth, this.facebookProvider)
      const user = result.user
      
      const profile = await this.getUserProfile(user.uid)
      if (!profile) {
        await this.createOAuthUserProfile(user)
      }
      
      await this.updateLastLogin(user.uid)
      return user
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // Recuperación de contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      // auth is already imported as a constant
      if (!auth) throw new Error('Firebase Auth no disponible')
      
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // Verificación
  async sendVerificationEmail(user: User): Promise<void> {
    try {
      await sendEmailVerification(user)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // 2FA / Teléfono
  async setupPhoneAuth(phoneNumber: string): Promise<any> {
    try {
      // auth is already imported as a constant
      if (!auth) throw new Error('Firebase Auth no disponible')
      
      // Crear reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA resuelto')
        }
      })

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      return confirmationResult
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  async verifyPhoneCode(verificationId: string, code: string): Promise<void> {
    try {
      // auth is already imported as a constant
      if (!auth) throw new Error('Firebase Auth no disponible')
      
      const credential = PhoneAuthProvider.credential(verificationId, code)
      const user = authInstance.currentUser
      
      if (user) {
        await linkWithCredential(user, credential)
      }
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // Perfil de usuario
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      // auth is already imported as a constant
      if (!auth?.currentUser) throw new Error('Usuario no autenticado')
      
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      throw new Error(`Error actualizando perfil: ${error}`)
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    console.log('👤 [FirebaseAuth] getUserProfile llamado para uid:', uid);
    
    try {
      const userRef = doc(db, 'users', uid)
      console.log('📄 [FirebaseAuth] Obteniendo documento de Firestore...');
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const profileData = userSnap.data() as UserProfile;
        console.log('✅ [FirebaseAuth] Perfil encontrado:', {
          uid: profileData.uid,
          email: profileData.email,
          role: profileData.role,
          displayName: profileData.displayName
        });
        return profileData
      }
      
      console.warn('⚠️ [FirebaseAuth] No se encontró perfil para uid:', uid);
      return null
    } catch (error) {
      console.error('❌ [FirebaseAuth] Error obteniendo perfil:', error);
      throw new Error(`Error obteniendo perfil: ${error}`)
    }
  }

  // Estado de autenticación
  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback)
  }

  // Métodos privados
  private async createUserProfile(user: User, userData: RegisterData): Promise<void> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || `${userData.firstName} ${userData.lastName}`,
      photoURL: user.photoURL,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      medicalLicense: userData.medicalLicense,
      specialty: userData.specialty,
      yearsExperience: userData.yearsExperience,
      companyName: userData.companyName,
      companyType: userData.companyType,
      verified: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }

    const userRef = doc(db, 'users', user.uid)
    await setDoc(userRef, userProfile)
  }

  private async createOAuthUserProfile(user: User): Promise<void> {
    const [firstName, ...lastNameParts] = (user.displayName || '').split(' ')
    
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || '',
      photoURL: user.photoURL,
      role: 'patient', // Por defecto OAuth usuarios son pacientes
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      verified: user.emailVerified,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }

    const userRef = doc(db, 'users', user.uid)
    await setDoc(userRef, userProfile)
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      })
    } catch (error) {
      console.error('Error actualizando último login:', error)
    }
  }

  private handleAuthError(error: AuthError): Error {
    let message = 'Error de autenticación'
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No existe una cuenta con este email'
        break
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta'
        break
      case 'auth/email-already-in-use':
        message = 'El email ya está registrado'
        break
      case 'auth/weak-password':
        message = 'La contraseña es muy débil'
        break
      case 'auth/invalid-email':
        message = 'Email inválido'
        break
      case 'auth/user-disabled':
        message = 'Cuenta deshabilitada'
        break
      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Intenta más tarde'
        break
      case 'auth/popup-closed-by-user':
        message = 'Ventana cerrada por el usuario'
        break
      case 'auth/cancelled-popup-request':
        message = 'Solicitud cancelada'
        break
      default:
        message = error.message || 'Error desconocido'
    }
    
    return new Error(message)
  }
}

// Instancia singleton
export const firebaseAuth = new FirebaseAuthService()
export default firebaseAuth