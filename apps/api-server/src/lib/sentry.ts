// Implementación local de Sentry para ALTAMEDICA API Server
// Evita dependencias problemáticas del paquete shared

interface SentryConfig {
  service: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
}

interface MedicalUser {
  id: string;
  email: string;
  role: string;
  department?: string;
}

interface Breadcrumb {
  message: string;
  category: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

// Mock Sentry implementation for development
class MockSentry {
  private initialized = false;
  private user: MedicalUser | null = null;
  private breadcrumbs: Breadcrumb[] = [];

  init(config: SentryConfig) {
    this.initialized = true;
    console.log(`🔧 Sentry inicializado para: ${config.service}`);
    console.log(`📊 Traces Sample Rate: ${config.tracesSampleRate}`);
    console.log(`📈 Profiles Sample Rate: ${config.profilesSampleRate}`);
  }

  captureError(error: Error, context?: Record<string, any>) {
    console.error('🚨 Error capturado por Sentry:', {
      error: error.message,
      stack: error.stack,
      context,
      user: this.user,
      timestamp: new Date().toISOString()
    });
  }

  captureEvent(event: any) {
    console.log('📝 Evento capturado por Sentry:', {
      event,
      user: this.user,
      timestamp: new Date().toISOString()
    });
  }

  setMedicalUser(user: MedicalUser) {
    this.user = user;
    console.log('👤 Usuario médico establecido en Sentry:', user);
  }

  addMedicalBreadcrumb(breadcrumb: Breadcrumb) {
    this.breadcrumbs.push(breadcrumb);
    console.log('🍞 Breadcrumb médico agregado:', breadcrumb);
  }

  startMedicalTransaction(name: string, operation: string) {
    console.log('🔄 Transacción médica iniciada:', { name, operation });
    return {
      finish: () => console.log('✅ Transacción médica finalizada:', { name, operation }),
      setTag: (key: string, value: string) => console.log('🏷️ Tag establecido:', { key, value }),
      setData: (key: string, value: any) => console.log('📊 Data establecida:', { key, value })
    };
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    console.log(`💬 Mensaje capturado por Sentry [${level}]:`, message);
  }

  setUser(user: MedicalUser) {
    this.setMedicalUser(user);
  }

  addBreadcrumb(breadcrumb: Breadcrumb) {
    this.addMedicalBreadcrumb(breadcrumb);
  }

  startTransaction(name: string, operation: string) {
    return this.startMedicalTransaction(name, operation);
  }
}

// Instancia global de Sentry
const sentryInstance = new MockSentry();

/**
 * Initialize Sentry for API Server
 */
export function initSentry() {
  sentryInstance.init({
    service: 'altamedica-api-server',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

// Export medical-specific Sentry utilities
export const {
  captureError,
  captureEvent,
  setMedicalUser,
  addMedicalBreadcrumb,
  startMedicalTransaction,
} = sentryInstance;

// Legacy compatibility exports
export const captureMessage = sentryInstance.captureMessage.bind(sentryInstance);
export const setUser = sentryInstance.setUser.bind(sentryInstance);
export const addBreadcrumb = sentryInstance.addBreadcrumb.bind(sentryInstance);
export const startTransaction = sentryInstance.startTransaction.bind(sentryInstance);

// Re-export for backward compatibility
export const Sentry = sentryInstance;
