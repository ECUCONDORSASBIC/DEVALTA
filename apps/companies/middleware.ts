import { createSSOMiddleware, ssoMiddlewareConfig } from '@altamedica/shared/auth';

// Configuración del middleware SSO para companies-app
const middleware = createSSOMiddleware({
  appName: 'companies',
  publicPaths: [
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/public',
  ],
  loginPath: process.env.NODE_ENV === 'production' 
    ? 'https://altamedica.com/login' 
    : 'http://localhost:3000/login'
});

export default middleware;
export const config = ssoMiddlewareConfig;