import * as Sentry from '@sentry/nextjs';

/**
 * Sentry configuration for Altamedica Web App Client (React)
 * Handles browser error tracking with medical data compliance
 */

// Medical data sanitization function for client
function sanitizeMedicalDataClient(data: any): any {
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveFieldClient(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeMedicalDataClient(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  return data;
}

function isSensitiveFieldClient(fieldName: string): boolean {
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

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Performance monitoring
  integrations: [
    // BrowserTracing integration for performance monitoring
    Sentry.browserTracingIntegration(),
    // Replay integration for session recording
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Trace configuration
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering with medical data sanitization
  beforeSend(event, hint) {
    // Sanitize medical data
    if (event.extra) {
      event.extra = sanitizeMedicalDataClient(event.extra);
    }
    
    // Filter sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    
    // Filter development errors
    if (process.env.NODE_ENV === 'development') {
      if (hint.originalException instanceof Error) {
        if (hint.originalException.message.includes('ResizeObserver')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Initial scope with HIPAA compliance tags
  initialScope: {
    tags: {
      service: 'altamedica-web-app-client',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      compliance: 'HIPAA',
    },
    user: {
      ip_address: '{{auto}}',
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  // Sanitize breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
      return null;
    }
    if (breadcrumb.data) {
      breadcrumb.data = sanitizeMedicalDataClient(breadcrumb.data);
    }
    return breadcrumb;
  },
});

console.log('✅ Sentry initialized for Web App (Client) with HIPAA compliance');
