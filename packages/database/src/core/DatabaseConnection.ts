/**
 * 🏥 ALTAMEDICA DATABASE CONNECTION
 * Singleton pattern para manejo unificado de Firebase/Firestore
 * con optimizaciones para aplicaciones médicas y compliance HIPAA
 */

import admin from '@altamedica/firebase-admin';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

interface DatabaseConfig {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  storageBucket?: string;
  environment: 'development' | 'staging' | 'production';
}

export interface ConnectionMetrics {
  connectionsCount: number;
  lastConnectionTime: Date;
  totalQueries: number;
  avgQueryTime: number;
  errors: number;
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private app: App | null = null;
  private firestore: Firestore | null = null;
  private auth: Auth | null = null;
  private storage: Storage | null = null;
  private logger: winston.Logger;
  private metrics: ConnectionMetrics;
  private config: DatabaseConfig;

  private constructor() {
    this.metrics = {
      connectionsCount: 0,
      lastConnectionTime: new Date(),
      totalQueries: 0,
      avgQueryTime: 0,
      errors: 0
    };

    this.config = this.loadConfig();
    this.logger = this.setupLogger();
    this.logger.info('🔥 DatabaseConnection instance created');
  }

  /**
   * Obtiene la instancia singleton de DatabaseConnection
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Carga la configuración desde variables de entorno
   */
  private loadConfig(): DatabaseConfig {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      environment: (process.env.NODE_ENV as any) || 'development'
    };
  }

  /**
   * Configura el logger con rotación diaria
   */
  private setupLogger(): winston.Logger {
    const logger = winston.createLogger({
      level: this.config.environment === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/database-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          auditFile: 'logs/database-audit.json'
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });

    return logger;
  }

  /**
   * Obtiene las credenciales de Firebase de múltiples fuentes
   */
  private getFirebaseCredentials(): ServiceAccount | null {
    // Intenta primero con JSON completo
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        return {
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key
        };
      } catch (error) {
        this.logger.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
      }
    }

    // Fallback a variables individuales
    if (this.config.projectId && this.config.clientEmail && this.config.privateKey) {
      return {
        projectId: this.config.projectId,
        clientEmail: this.config.clientEmail,
        privateKey: this.config.privateKey
      };
    }

    return null;
  }

  /**
   * Inicializa Firebase Admin SDK de manera optimizada
   */
  private async initializeFirebase(): Promise<App | null> {
    if (this.app) return this.app;

    // Verificar si ya existe una app inicializada
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0];
      this.logger.info('✅ Using existing Firebase app');
      return this.app;
    }

    try {
      const credentials = this.getFirebaseCredentials();
      
      if (credentials) {
        this.app = initializeApp({
          credential: cert(credentials),
          storageBucket: this.config.storageBucket
        });
        this.logger.info('✅ Firebase Admin initialized with credentials');
      } else {
        // Usa Application Default Credentials (ADC)
        this.app = initializeApp({
          storageBucket: this.config.storageBucket
        });
        this.logger.info('✅ Firebase Admin initialized with ADC');
      }

      this.metrics.connectionsCount++;
      this.metrics.lastConnectionTime = new Date();
      
      return this.app;
    } catch (error) {
      this.logger.error('❌ Firebase initialization failed:', error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Obtiene la instancia de Firestore con configuración optimizada
   */
  public async getFirestore(): Promise<Firestore | null> {
    if (this.firestore) return this.firestore;

    const app = await this.initializeFirebase();
    if (!app) return null;

    try {
      this.firestore = getFirestore(app);

      // Configuración optimizada para aplicaciones médicas
      const firestoreSettings: Settings = {
        ignoreUndefinedProperties: true,
        ...(this.config.environment === 'production' && {
          preferRest: true, // REST API para mejor compatibilidad serverless
          ssl: true
        })
      };

      this.firestore.settings(firestoreSettings);
      this.logger.info('✅ Firestore configured successfully');
      
      return this.firestore;
    } catch (error) {
      this.logger.error('❌ Firestore setup failed:', error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Obtiene la instancia de Firebase Auth
   */
  public async getAuth(): Promise<Auth | null> {
    if (this.auth) return this.auth;

    const app = await this.initializeFirebase();
    if (!app) return null;

    try {
      this.auth = getAuth(app);
      this.logger.info('✅ Firebase Auth configured successfully');
      return this.auth;
    } catch (error) {
      this.logger.error('❌ Firebase Auth setup failed:', error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Obtiene la instancia de Firebase Storage
   */
  public async getStorage(): Promise<Storage | null> {
    if (this.storage) return this.storage;

    const app = await this.initializeFirebase();
    if (!app) return null;

    try {
      this.storage = getStorage(app);
      this.logger.info('✅ Firebase Storage configured successfully');
      return this.storage;
    } catch (error) {
      this.logger.error('❌ Firebase Storage setup failed:', error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Verifica la conectividad de la base de datos
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: {
      firestore: boolean;
      auth: boolean;
      storage: boolean;
    };
    metrics: ConnectionMetrics;
    timestamp: Date;
  }> {
    const results = {
      status: 'healthy' as 'healthy' | 'unhealthy',
      services: {
        firestore: false,
        auth: false,
        storage: false
      },
      metrics: { ...this.metrics },
      timestamp: new Date()
    };

    try {
      // Test Firestore
      const firestore = await this.getFirestore();
      if (firestore) {
        await firestore.collection('_health').doc('connection_test').get();
        results.services.firestore = true;
      }

      // Test Auth
      const auth = await this.getAuth();
      if (auth) {
        await auth.listUsers(1); // Test básico
        results.services.auth = true;
      }

      // Test Storage
      const storage = await this.getStorage();
      if (storage) {
        storage.bucket(); // Test básico
        results.services.storage = true;
      }

      const healthyServices = Object.values(results.services).filter(Boolean).length;
      results.status = healthyServices >= 2 ? 'healthy' : 'unhealthy';

      this.logger.info('🏥 Health check completed', {
        status: results.status,
        services: results.services
      });

    } catch (error) {
      results.status = 'unhealthy';
      this.logger.error('❌ Health check failed:', error);
      this.metrics.errors++;
    }

    return results;
  }

  /**
   * Registra métricas de query para monitoreo
   */
  public recordQuery(queryName: string, duration: number, success: boolean): void {
    this.metrics.totalQueries++;
    this.metrics.avgQueryTime = 
      (this.metrics.avgQueryTime * (this.metrics.totalQueries - 1) + duration) / this.metrics.totalQueries;

    if (!success) {
      this.metrics.errors++;
    }

    // Log de queries lentas (> 1 segundo)
    if (duration > 1000) {
      this.logger.warn('🐌 Slow query detected', {
        queryName,
        duration,
        success
      });
    }

    this.logger.debug('📊 Query recorded', {
      queryName,
      duration,
      success,
      totalQueries: this.metrics.totalQueries
    });
  }

  /**
   * Obtiene métricas de la conexión
   */
  public getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Limpia las instancias (útil para testing)
   */
  public cleanup(): void {
    this.app = null;
    this.firestore = null;
    this.auth = null;
    this.storage = null;
    
    this.logger.info('🧹 Database connection cleaned up');
  }

  /**
   * Reinicia la conexión (en caso de errores críticos)
   */
  public async reconnect(): Promise<boolean> {
    this.logger.info('🔄 Reconnecting to database...');
    
    this.cleanup();
    
    const app = await this.initializeFirebase();
    if (app) {
      this.logger.info('✅ Database reconnection successful');
      return true;
    } else {
      this.logger.error('❌ Database reconnection failed');
      return false;
    }
  }
}

// Instancia global para fácil acceso
export const dbConnection = DatabaseConnection.getInstance();

// Aliases convenientes para mantener compatibilidad
export const getFirestoreDB = () => dbConnection.getFirestore();
export const getAuthAdmin = () => dbConnection.getAuth();
export const getStorageAdmin = () => dbConnection.getStorage();