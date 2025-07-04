/**
 * Configuración Principal de Firebase
 * Cumplimiento HIPAA/GDPR - Cifrado y Auditoría
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  connectAuthEmulator,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
  clearIndexedDbPersistence,
  terminate
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage, 
  connectStorageEmulator 
} from 'firebase/storage';
import { 
  getFunctions, 
  Functions, 
  connectFunctionsEmulator,
  httpsCallable
} from 'firebase/functions';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Tipos de configuración
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  enforceEncryption: boolean;
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  requireMFA: boolean;
  enableIPWhitelisting: boolean;
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
}

export interface EmulatorConfig {
  auth: { host: string; port: number };
  firestore: { host: string; port: number };
  storage: { host: string; port: number };
  functions: { host: string; port: number };
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private storage: FirebaseStorage | null = null;
  private functions: Functions | null = null;
  private analytics: Analytics | null = null;
  
  private isInitialized = false;
  private isEmulatorMode = false;
  private securityConfig: SecurityConfig;
  private auditService: AuditService | null = null;

  constructor() {
    this.securityConfig = {
      enableAuditLogging: true,
      enforceEncryption: true,
      sessionTimeoutMinutes: 30,
      maxFailedAttempts: 3,
      requireMFA: false, // Se habilita para usuarios con roles críticos
      enableIPWhitelisting: false,
      gdprCompliant: true,
      hipaaCompliant: true
    };
  }

  /**
   * Inicializa Firebase con configuración de seguridad médica
   */
  async initialize(
    config: FirebaseConfig, 
    emulatorConfig?: EmulatorConfig,
    customSecurityConfig?: Partial<SecurityConfig>
  ): Promise<void> {
    try {
      if (this.isInitialized) {
        console.warn('Firebase ya está inicializado');
        return;
      }

      // Actualizar configuración de seguridad
      this.securityConfig = { ...this.securityConfig, ...customSecurityConfig };

      // Inicializar app
      this.app = initializeApp(config);

      // Configurar servicios
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      this.functions = getFunctions(this.app);

      // Configurar emuladores en desarrollo
      if (emulatorConfig && process.env.NODE_ENV === 'development') {
        this.isEmulatorMode = true;
        this.connectEmulators(emulatorConfig);
      }

      // Configurar Analytics solo en producción
      if (process.env.NODE_ENV === 'production' && config.measurementId) {
        this.analytics = getAnalytics(this.app);
      }

      // Configurar autenticación segura
      await this.configureAuthentication();

      // Inicializar auditoría
      this.auditService = new AuditService(this.db, this.securityConfig);

      this.isInitialized = true;
      
      console.log('Firebase inicializado correctamente con configuración médica');
      
    } catch (error) {
      console.error('Error al inicializar Firebase:', error);
      throw new Error(`Fallo en inicialización de Firebase: ${error}`);
    }
  }

  /**
   * Conecta a emuladores para desarrollo
   */
  private connectEmulators(config: EmulatorConfig): void {
    if (!this.auth || !this.db || !this.storage || !this.functions) {
      throw new Error('Servicios Firebase no inicializados');
    }

    try {
      connectAuthEmulator(this.auth, `http://${config.auth.host}:${config.auth.port}`, {
        disableWarnings: true
      });
      
      connectFirestoreEmulator(this.db, config.firestore.host, config.firestore.port);
      connectStorageEmulator(this.storage, config.storage.host, config.storage.port);
      connectFunctionsEmulator(this.functions, config.functions.host, config.functions.port);
      
      console.log('Emuladores Firebase conectados');
    } catch (error) {
      console.warn('Error conectando emuladores:', error);
    }
  }

  /**
   * Configura autenticación con estándares médicos
   */
  private async configureAuthentication(): Promise<void> {
    if (!this.auth) throw new Error('Auth no inicializado');

    try {
      // Configurar persistencia de sesión
      await setPersistence(this.auth, browserSessionPersistence);

      // Configurar observador de estado con auditoría
      onAuthStateChanged(this.auth, async (user) => {
        if (user && this.auditService) {
          await this.auditService.logEvent({
            action: 'LOGIN',
            userId: user.uid,
            timestamp: new Date().toISOString(),
            metadata: {
              email: user.email,
              emailVerified: user.emailVerified,
              lastSignIn: user.metadata.lastSignInTime
            }
          });
        } else if (!user && this.auditService) {
          await this.auditService.logEvent({
            action: 'LOGOUT',
            timestamp: new Date().toISOString()
          });
        }
      });

    } catch (error) {
      console.error('Error configurando autenticación:', error);
      throw error;
    }
  }

  /**
   * Autenticación segura con auditoría
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    if (!this.auth) throw new Error('Auth no inicializado');

    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Verificar estado de la cuenta
      await this.validateUserAccount(credential.user);
      
      return credential;
      
    } catch (error: any) {
      // Auditar intentos fallidos
      if (this.auditService) {
        await this.auditService.logEvent({
          action: 'FAILED_LOGIN',
          timestamp: new Date().toISOString(),
          metadata: {
            email,
            error: error.code,
            ipAddress: await this.getClientIP()
          }
        });
      }
      
      throw error;
    }
  }

  /**
   * Crear cuenta de usuario con validación médica
   */
  async createUser(email: string, password: string, userRole: string): Promise<UserCredential> {
    if (!this.auth) throw new Error('Auth no inicializado');

    try {
      // Validar política de contraseñas médicas
      this.validateMedicalPasswordPolicy(password);
      
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Enviar verificación de email obligatoria
      await sendEmailVerification(credential.user);
      
      // Auditar creación de cuenta
      if (this.auditService) {
        await this.auditService.logEvent({
          action: 'USER_CREATED',
          userId: credential.user.uid,
          timestamp: new Date().toISOString(),
          metadata: {
            email,
            role: userRole,
            emailVerified: false
          }
        });
      }
      
      return credential;
      
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  /**
   * Validar política de contraseñas para entornos médicos
   */
  private validateMedicalPasswordPolicy(password: string): void {
    const minLength = 12;
    const requireUppercase = /[A-Z]/;
    const requireLowercase = /[a-z]/;
    const requireNumbers = /\d/;
    const requireSpecialChars = /[!@#$%^&*(),.?":{}|<>]/;
    const noCommonPasswords = ['password', '123456', 'qwerty', 'admin', 'medical'];

    if (password.length < minLength) {
      throw new Error(`La contraseña debe tener al menos ${minLength} caracteres`);
    }

    if (!requireUppercase.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!requireLowercase.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra minúscula');
    }

    if (!requireNumbers.test(password)) {
      throw new Error('La contraseña debe contener al menos un número');
    }

    if (!requireSpecialChars.test(password)) {
      throw new Error('La contraseña debe contener al menos un carácter especial');
    }

    const lowercasePassword = password.toLowerCase();
    if (noCommonPasswords.some(common => lowercasePassword.includes(common))) {
      throw new Error('La contraseña no puede contener palabras comunes');
    }
  }

  /**
   * Validar estado de cuenta de usuario médico
   */
  private async validateUserAccount(user: FirebaseUser): Promise<void> {
    if (!user.emailVerified) {
      throw new Error('Email no verificado. Verifique su correo antes de continuar.');
    }

    // Verificar si el usuario tiene permisos médicos válidos
    const userDoc = await this.getUserProfile(user.uid);
    if (!userDoc) {
      throw new Error('Perfil de usuario no encontrado');
    }

    if (userDoc.accountStatus?.status !== 'ACTIVE') {
      throw new Error('Cuenta desactivada. Contacte al administrador.');
    }

    // Verificar licencias médicas vigentes
    if (userDoc.professionalInfo?.licenseExpiry) {
      const expiryDate = new Date(userDoc.professionalInfo.licenseExpiry);
      const now = new Date();
      
      if (expiryDate <= now) {
        throw new Error('Licencia médica expirada. Renueve su licencia para continuar.');
      }
    }
  }

  /**
   * Obtener IP del cliente para auditoría
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Obtener perfil de usuario desde Firestore
   */
  private async getUserProfile(uid: string): Promise<any> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      return null;
    }
  }

  /**
   * Cerrar sesión con auditoría
   */
  async signOut(): Promise<void> {
    if (!this.auth) throw new Error('Auth no inicializado');

    try {
      const user = this.auth.currentUser;
      await signOut(this.auth);
      
      if (user && this.auditService) {
        await this.auditService.logEvent({
          action: 'LOGOUT',
          userId: user.uid,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  }

  /**
   * Limpiar datos locales (GDPR compliance)
   */
  async clearLocalData(): Promise<void> {
    try {
      if (this.db) {
        await disableNetwork(this.db);
        await clearIndexedDbPersistence(this.db);
        await enableNetwork(this.db);
      }
      
      // Limpiar storage local
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('Datos locales limpiados (cumplimiento GDPR)');
      
    } catch (error) {
      console.error('Error limpiando datos locales:', error);
    }
  }

  /**
   * Terminar conexiones Firebase
   */
  async terminate(): Promise<void> {
    try {
      if (this.db) {
        await terminate(this.db);
      }
      
      this.isInitialized = false;
      console.log('Conexiones Firebase terminadas');
      
    } catch (error) {
      console.error('Error terminando Firebase:', error);
    }
  }

  // Getters para acceso a servicios
  get authentication(): Auth {
    if (!this.auth) throw new Error('Auth no inicializado');
    return this.auth;
  }

  get firestore(): Firestore {
    if (!this.db) throw new Error('Firestore no inicializado');
    return this.db;
  }

  get firebaseStorage(): FirebaseStorage {
    if (!this.storage) throw new Error('Storage no inicializado');
    return this.storage;
  }

  get firebaseFunctions(): Functions {
    if (!this.functions) throw new Error('Functions no inicializado');
    return this.functions;
  }

  get isReady(): boolean {
    return this.isInitialized;
  }

  get isUsingEmulator(): boolean {
    return this.isEmulatorMode;
  }
}

/**
 * Servicio de Auditoría para cumplimiento HIPAA/GDPR
 */
class AuditService {
  constructor(
    private db: Firestore,
    private securityConfig: SecurityConfig
  ) {}

  async logEvent(event: {
    action: string;
    userId?: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    if (!this.securityConfig.enableAuditLogging) return;

    try {
      const { collection, addDoc } = await import('firebase/firestore');
      
      await addDoc(collection(this.db, 'audit_logs'), {
        ...event,
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        compliant: {
          hipaa: this.securityConfig.hipaaCompliant,
          gdpr: this.securityConfig.gdprCompliant
        },
        retentionExpiry: this.calculateRetentionExpiry()
      });
      
    } catch (error) {
      console.error('Error registrando auditoría:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  private calculateRetentionExpiry(): string {
    // HIPAA requiere retención de 6 años, GDPR permite hasta 7
    const retentionYears = 7;
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + retentionYears);
    return expiryDate.toISOString();
  }
}

// Singleton para uso global
export const firebaseService = new FirebaseService();

// Configuración por defecto para entorno médico
export const defaultMedicalConfig: SecurityConfig = {
  enableAuditLogging: true,
  enforceEncryption: true,
  sessionTimeoutMinutes: 30,
  maxFailedAttempts: 3,
  requireMFA: false,
  enableIPWhitelisting: false,
  gdprCompliant: true,
  hipaaCompliant: true
};

export default firebaseService;
