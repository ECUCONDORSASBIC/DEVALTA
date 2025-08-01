// Middleware principal para el API Server de Altamedica
import { Request, Response, NextFunction } from 'express';

// Importar todos los middlewares
import rateLimitConfig from './rate-limiter';
import auditMiddlewares from './audit';
import securityMiddlewares from './security';

// Configuración de middlewares por tipo de endpoint
export const endpointConfigs = {
  // Endpoints de autenticación
  auth: [
    securityMiddlewares.sanitize,
    rateLimitConfig.auth,
    auditMiddlewares.auth,
    securityMiddlewares.timing
  ],
  
  // Endpoints de datos médicos críticos
  medicalData: [
    securityMiddlewares.sanitize,
    securityMiddlewares.jwt,
    requireMedicalRole(['doctor', 'nurse', 'admin']),
    rateLimitConfig.medicalData,
    auditMiddlewares.general,
    securityMiddlewares.timing
  ],
  
  // Endpoints de telemedicina
  telemedicine: [
    securityMiddlewares.sanitize,
    securityMiddlewares.jwt,
    requireMedicalRole(['doctor', 'nurse', 'patient']),
    rateLimitConfig.telemedicine,
    auditMiddlewares.telemedicine,
    securityMiddlewares.timing
  ],
  
  // Endpoints de creación de recursos
  createResource: [
    securityMiddlewares.sanitize,
    securityMiddlewares.jwt,
    requireMedicalRole(['doctor', 'nurse', 'admin']),
    rateLimitConfig.createResource,
    auditMiddlewares.general,
    securityMiddlewares.payload(1024 * 1024), // 1MB
    securityMiddlewares.timing
  ],
  
  // Endpoints de búsqueda
  search: [
    securityMiddlewares.sanitize,
    securityMiddlewares.jwt,
    rateLimitConfig.search,
    auditMiddlewares.general,
    securityMiddlewares.timing
  ],

  // Endpoints de marketplace
  marketplace: [
    securityMiddlewares.sanitize,
    securityMiddlewares.jwt,
    rateLimitConfig.general,
    auditMiddlewares.general,
    securityMiddlewares.timing
  ],
  
  // Endpoints generales
  general: [
    securityMiddlewares.sanitize,
    rateLimitConfig.general,
    auditMiddlewares.general,
    securityMiddlewares.timing
  ]
};

// Middleware para aplicar configuración según el tipo de endpoint
export const applyEndpointConfig = (endpointType: keyof typeof endpointConfigs) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middlewares = endpointConfigs[endpointType];
    
    // Aplicar middlewares en secuencia
    const applyMiddleware = (index: number) => {
      if (index >= middlewares.length) {
        return next();
      }
      
      const middleware = middlewares[index];
      middleware(req, res, (err?: any) => {
        if (err) {
          return next(err);
        }
        applyMiddleware(index + 1);
      });
    };
    
    applyMiddleware(0);
  };
};

// Middleware de roles médicos (re-exportado desde security)
export const requireMedicalRole = securityMiddlewares.requireMedicalRole;

// Configuración global de seguridad
export const globalSecurityConfig = [
  securityMiddlewares.headers,
  securityMiddlewares.cors,
  securityMiddlewares.logger,
  auditMiddlewares.rateLimit
];

// Función para inicializar todos los middlewares
export const initializeMiddlewares = (app: any, encryptionKey: string) => {
  // Inicializar compliance manager
  const { initializeComplianceManager } = require('./audit');
  initializeComplianceManager(encryptionKey);
  
  // Aplicar configuración global de seguridad
  globalSecurityConfig.forEach(middleware => {
    app.use(middleware);
  });
  
  console.log('✅ Middlewares de seguridad inicializados correctamente');
};

// Exportar configuraciones específicas
export const rateLimiters = rateLimitConfig;
export const auditors = auditMiddlewares;
export const security = securityMiddlewares;

export default {
  endpointConfigs,
  applyEndpointConfig,
  globalSecurityConfig,
  initializeMiddlewares,
  rateLimiters,
  auditors,
  security
}; 