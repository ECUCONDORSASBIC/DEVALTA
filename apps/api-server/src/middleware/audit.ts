import { Request, Response, NextFunction } from 'express';
import { HIPAAComplianceManager } from '@/lib/mock-medical';

// Instancia global del compliance manager
let complianceManager: HIPAAComplianceManager;

// Inicializar el compliance manager
export const initializeComplianceManager = (encryptionKey: string) => {
  complianceManager = new HIPAAComplianceManager(encryptionKey);
};

// Middleware de auditoría para endpoints médicos
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capturar información de la request
  const auditInfo = {
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous',
    action: req.method,
    resourceType: getResourceTypeFromPath(req.path),
    resourceId: getResourceIdFromPath(req.path) || 'unknown',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    path: req.path,
    query: req.query,
    bodySize: req.body ? JSON.stringify(req.body).length : 0,
    authorized: !!req.user,
    containsPHI: checkIfContainsPHI(req.body || req.query),
    transmissionType: 'encrypted' // Asumimos HTTPS en producción
  };

  // Log de auditoría
  if (complianceManager) {
    try {
      complianceManager.logPHIAccess(auditInfo);
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  }

  // Interceptar la respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log de respuesta
    console.log(`📊 API Audit: ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms - User: ${auditInfo.userId}`);
    
    // Log de errores
    if (res.statusCode >= 400) {
      console.error(`❌ API Error: ${req.method} ${req.path} - ${res.statusCode} - ${data}`);
    }
    
    return originalSend.call(this, data);
  };

  next();
};

// Middleware específico para endpoints de autenticación
export const authAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auditInfo = {
    timestamp: new Date().toISOString(),
    userId: 'anonymous',
    action: 'login_attempt',
    resourceType: 'Authentication',
    resourceId: 'login',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    path: req.path,
    authorized: false,
    containsPHI: false,
    transmissionType: 'encrypted'
  };

  // Log de intento de autenticación
  if (complianceManager) {
    try {
      complianceManager.logPHIAccess(auditInfo);
    } catch (error) {
      console.error('Error logging auth audit entry:', error);
    }
  }

  next();
};

// Middleware para endpoints de telemedicina
export const telemedicineAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auditInfo = {
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous',
    action: req.method,
    resourceType: 'Telemedicine',
    resourceId: getResourceIdFromPath(req.path) || 'session',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    path: req.path,
    authorized: !!req.user,
    containsPHI: true, // Telemedicina siempre contiene PHI
    transmissionType: 'encrypted'
  };

  // Log de telemedicina
  if (complianceManager) {
    try {
      complianceManager.logPHIAccess(auditInfo);
    } catch (error) {
      console.error('Error logging telemedicine audit entry:', error);
    }
  }

  next();
};

// Funciones auxiliares
function getResourceTypeFromPath(path: string): string {
  const pathParts = path.split('/');
  if (pathParts.length >= 2) {
    return pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1);
  }
  return 'Unknown';
}

function getResourceIdFromPath(path: string): string | null {
  const pathParts = path.split('/');
  if (pathParts.length >= 3 && pathParts[2] !== '') {
    return pathParts[2];
  }
  return null;
}

function checkIfContainsPHI(data: any): boolean {
  if (!data) return false;
  
  const phiFields = [
    'name', 'firstName', 'lastName', 'email', 'phone', 'ssn',
    'dateOfBirth', 'birthDate', 'address', 'medicalRecordNumber',
    'patientId', 'diagnosis', 'symptoms', 'medications'
  ];

  const dataString = JSON.stringify(data).toLowerCase();
  return phiFields.some(field => dataString.includes(field.toLowerCase()));
}

// Middleware para logging de rate limiting
export const rateLimitAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      const auditInfo = {
        timestamp: new Date().toISOString(),
        userId: req.user?.id || 'anonymous',
        action: 'rate_limit_exceeded',
        resourceType: 'Security',
        resourceId: req.path,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        path: req.path,
        authorized: !!req.user,
        containsPHI: false,
        transmissionType: 'encrypted'
      };

      // Log de rate limiting
      if (complianceManager) {
        try {
          complianceManager.logPHIAccess(auditInfo);
        } catch (error) {
          console.error('Error logging rate limit audit entry:', error);
        }
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Exportar todos los middlewares
export const auditMiddlewares = {
  general: auditMiddleware,
  auth: authAuditMiddleware,
  telemedicine: telemedicineAuditMiddleware,
  rateLimit: rateLimitAuditMiddleware
};

export default auditMiddlewares; 