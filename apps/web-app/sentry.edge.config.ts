import * as Sentry from '@sentry/nextjs';

/**
 * Configuración de Sentry para Edge Runtime de Altamedica Web App
 * Maneja error tracking en Edge Functions
 */

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION || '1.0.0',
  
  // Configuración de traces
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración de errores
  beforeSend(event, hint) {
    // Filtrar información sensible
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    
    return event;
  },
  
  // Configuración de contexto
  initialScope: {
    tags: {
      service: 'altamedica-web-app-edge',
      version: process.env.APP_VERSION || '1.0.0',
    },
    user: {
      id: 'system',
      ip_address: '{{auto}}',
    },
  },
  
  // Configuración de debug
  debug: process.env.NODE_ENV === 'development',
});

console.log('✅ Sentry inicializado para Web App (Edge)'); 