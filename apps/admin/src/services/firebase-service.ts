import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  getStorage, 
  Storage, 
  connectStorageEmulator,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

interface EmulatorConfig {
  auth?: { host: string; port: number };
  firestore?: { host: string; port: number };
  storage?: { host: string; port: number };
  functions?: { host: string; port: number };
}

interface SecurityConfig {
  enableAuditLogging: boolean;
  enforceEncryption: boolean;
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  requireMFA: boolean;
  enableIPWhitelisting: boolean;
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
  adminOnly: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'patient' | 'doctor' | 'company' | 'admin';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  permissions: string[];
  companyId?: string;
  doctorId?: string;
  patientId?: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  totalDoctors: number;
  totalPatients: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: string;
  activeSessions: number;
  pendingApprovals: number;
  securityAlerts: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'system_change';
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private storage: Storage | null = null;
  private securityConfig: SecurityConfig | null = null;
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  async initialize(
    config: FirebaseConfig,
    emulatorConfig?: EmulatorConfig,
    securityConfig?: SecurityConfig
  ): Promise<void> {
    try {
      // Inicializar Firebase App
      this.app = initializeApp(config);
      
      // Inicializar servicios
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      
      // Configurar emuladores en desarrollo
      if (emulatorConfig && process.env.NODE_ENV === 'development') {
        if (emulatorConfig.auth) {
          connectAuthEmulator(
            this.auth,
            `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`
          );
        }
        if (emulatorConfig.firestore) {
          connectFirestoreEmulator(
            this.db,
            emulatorConfig.firestore.host,
            emulatorConfig.firestore.port
          );
        }
        if (emulatorConfig.storage) {
          connectStorageEmulator(
            this.storage,
            emulatorConfig.storage.host,
            emulatorConfig.storage.port
          );
        }
      }

      // Configurar seguridad
      this.securityConfig = securityConfig || {
        enableAuditLogging: true,
        enforceEncryption: true,
        sessionTimeoutMinutes: 15,
        maxFailedAttempts: 3,
        requireMFA: false,
        enableIPWhitelisting: false,
        gdprCompliant: true,
        hipaaCompliant: true,
        adminOnly: false
      };

      // Configurar listener de estado de autenticación
      this.setupAuthStateListener();

      console.log('Firebase Service inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando Firebase Service:', error);
      throw error;
    }
  }

  private setupAuthStateListener(): void {
    if (!this.auth) return;

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(user));
      
      if (user) {
        this.logSecurityEvent({
          eventType: 'login_attempt',
          userId: user.uid,
          userEmail: user.email || '',
          ipAddress: 'unknown',
          userAgent: navigator.userAgent,
          details: 'Usuario autenticado',
          severity: 'low'
        });
      }
    });
  }

  // Autenticación
  async signIn(email: string, password: string): Promise<User> {
    if (!this.auth) throw new Error('Firebase Auth no inicializado');

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      this.logSecurityEvent({
        eventType: 'failed_login',
        userEmail: email,
        ipAddress: 'unknown',
        userAgent: navigator.userAgent,
        details: `Intento de login fallido: ${error}`,
        severity: 'medium'
      });
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!this.auth) throw new Error('Firebase Auth no inicializado');
    await signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Gestión de usuarios
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as UserProfile : null;
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      throw error;
    }
  }

  async getAllUsers(limit: number = 100): Promise<UserProfile[]> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      const usersQuery = query(
        collection(this.db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  async getUsersByType(userType: string): Promise<UserProfile[]> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      const usersQuery = query(
        collection(this.db, 'users'),
        where('userType', '==', userType),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error obteniendo usuarios por tipo:', error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      await updateDoc(doc(this.db, 'users', uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error actualizando perfil de usuario:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      await deleteDoc(doc(this.db, 'users', uid));
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Métricas del sistema
  async getSystemMetrics(): Promise<SystemMetrics> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      // Obtener métricas desde Firestore
      const metricsDoc = await getDoc(doc(this.db, 'system', 'metrics'));
      
      if (metricsDoc.exists()) {
        return metricsDoc.data() as SystemMetrics;
      }

      // Métricas por defecto si no existen
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCompanies: 0,
        totalDoctors: 0,
        totalPatients: 0,
        systemHealth: 'excellent',
        uptime: '100%',
        activeSessions: 0,
        pendingApprovals: 0,
        securityAlerts: 0
      };
    } catch (error) {
      console.error('Error obteniendo métricas del sistema:', error);
      throw error;
    }
  }

  // Eventos de seguridad
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      const securityEvent: SecurityEvent = {
        ...event,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(this.db, 'security_events'), securityEvent);
    } catch (error) {
      console.error('Error registrando evento de seguridad:', error);
    }
  }

  async getSecurityEvents(limit: number = 50): Promise<SecurityEvent[]> {
    if (!this.db) throw new Error('Firestore no inicializado');

    try {
      const eventsQuery = query(
        collection(this.db, 'security_events'),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(eventsQuery);
      return snapshot.docs.map(doc => doc.data() as SecurityEvent);
    } catch (error) {
      console.error('Error obteniendo eventos de seguridad:', error);
      throw error;
    }
  }

  // Gestión de archivos
  async uploadFile(file: File, path: string): Promise<string> {
    if (!this.storage) throw new Error('Firebase Storage no inicializado');

    try {
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.storage) throw new Error('Firebase Storage no inicializado');

    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  }

  // Utilidades
  isInitialized(): boolean {
    return this.app !== null && this.auth !== null && this.db !== null;
  }

  getSecurityConfig(): SecurityConfig | null {
    return this.securityConfig;
  }
}

// Instancia singleton
export const firebaseService = new FirebaseService(); 