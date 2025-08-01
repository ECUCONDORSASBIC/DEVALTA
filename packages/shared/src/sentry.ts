import * as Sentry from '@sentry/node';
import type { NodeOptions } from '@sentry/node';

interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  service?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
}

/**
 * Initialize Sentry for Node.js applications
 * @param config Configuration options for Sentry
 */
export function initSentry(config: SentryConfig = {}) {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.NODE_ENV || 'development',
    release = process.env.APP_VERSION || '1.0.0',
    service = 'altamedica-service',
    tracesSampleRate = environment === 'production' ? 0.1 : 1.0,
    profilesSampleRate = environment === 'production' ? 0.1 : 1.0,
  } = config;

  if (!dsn) {
    console.log('⚠️ Sentry DSN not configured - Error tracking disabled');
    return;
  }

  const sentryOptions: NodeOptions = {
    dsn,
    environment,
    release,
    
    // Performance monitoring
    tracesSampleRate,
    profilesSampleRate,
    
    // Integrations
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Console(),
    ],
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter sensitive information
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // Filter development errors
      if (environment === 'development' && hint.originalException instanceof Error) {
        if (hint.originalException.message.includes('ECONNREFUSED')) {
          return null; // Don't send connection errors in development
        }
      }
      
      return event;
    },
    
    // Medical data sanitization
    beforeSendTransaction(event) {
      // Sanitize medical data from transaction context
      if (event.contexts?.trace?.data) {
        event.contexts.trace.data = sanitizeMedicalData(event.contexts.trace.data);
      }
      return event;
    },
    
    // Initial scope
    initialScope: {
      tags: {
        service,
        version: release,
        compliance: 'HIPAA',
      },
      user: {
        id: 'system',
        ip_address: '{{auto}}',
      },
    },
  };

  Sentry.init(sentryOptions);
  console.log(`✅ Sentry initialized for ${service}`);
}

/**
 * Sanitize medical data from objects
 * @param data The data to sanitize
 * @returns Sanitized data
 */
function sanitizeMedicalData(data: any): any {
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeMedicalData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  return data;
}

/**
 * Check if a field contains sensitive medical information
 * @param fieldName The field name to check
 * @returns True if the field is sensitive
 */
function isSensitiveField(fieldName: string): boolean {
  const sensitiveFields = [
    'ssn', 'socialSecurityNumber', 'dateOfBirth', 'birthDate',
    'phone', 'telephone', 'email', 'address', 'zipCode',
    'medicalRecordNumber', 'patientId', 'diagnosis', 'treatment',
    'medication', 'prescription', 'symptoms', 'allergies',
    'password', 'token', 'secret', 'key', 'auth'
  ];
  return sensitiveFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
}

/**
 * Medical-specific Sentry utilities
 */
export const medicalSentry = {
  /**
   * Capture medical error with HIPAA compliance
   */
  captureError: (error: Error, context?: any) => {
    if (!process.env.SENTRY_DSN) {
      console.error('Medical error captured (Sentry not available):', error);
      return;
    }

    Sentry.captureException(error, {
      extra: sanitizeMedicalData(context),
      tags: {
        source: 'medical-error',
        compliance: 'HIPAA',
      },
    });
  },

  /**
   * Capture medical event
   */
  captureEvent: (message: string, level: Sentry.SeverityLevel = 'info', context?: any) => {
    if (!process.env.SENTRY_DSN) {
      console.log(`[${level.toUpperCase()}] Medical event: ${message}`, context);
      return;
    }

    Sentry.captureMessage(message, {
      level,
      extra: sanitizeMedicalData(context),
      tags: {
        source: 'medical-event',
        compliance: 'HIPAA',
      },
    });
  },

  /**
   * Set medical user context
   */
  setMedicalUser: (user: { id: string; email?: string; role?: string; facilityId?: string }) => {
    if (!process.env.SENTRY_DSN) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.email,
      ip_address: '{{auto}}',
    });

    Sentry.setTags({
      'user.role': user.role,
      'user.facilityId': user.facilityId,
      'compliance': 'HIPAA',
    });
  },

  /**
   * Add medical breadcrumb
   */
  addMedicalBreadcrumb: (breadcrumb: Omit<Sentry.Breadcrumb, 'data'> & { data?: any }) => {
    if (!process.env.SENTRY_DSN) return;

    Sentry.addBreadcrumb({
      ...breadcrumb,
      data: sanitizeMedicalData(breadcrumb.data),
    });
  },

  /**
   * Start medical transaction
   */
  startMedicalTransaction: (name: string, operation: string, metadata?: any) => {
    if (!process.env.SENTRY_DSN) return null;

    const transaction = Sentry.startTransaction({
      name,
      op: operation,
      data: sanitizeMedicalData(metadata),
    });

    transaction.setTag('compliance', 'HIPAA');
    return transaction;
  },
};

export default Sentry;
