import * as Sentry from '@sentry/node';

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️ Sentry DSN no configurado - Error tracking deshabilitado');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });

  console.log('✅ Sentry inicializado');
}

export function captureError(error: Error, context?: any) {
  if (!process.env.SENTRY_DSN) {
    console.error('Error capturado (Sentry no disponible):', error);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

export default Sentry;
