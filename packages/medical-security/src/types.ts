// Tipos básicos para el sistema de seguridad médica

export interface SecurityConfig {
  encryptionKey: string;
  logRetentionDays: number;
  auditEnabled: boolean;
  hipaaCompliant: boolean;
}

export interface UserSession {
  userId: string;
  sessionId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  permissions: string[];
}

export interface AccessControl {
  userId: string;
  resourceType: string;
  resourceId: string;
  permission: 'READ' | 'WRITE' | 'DELETE' | 'ADMIN';
  grantedAt: string;
  expiresAt?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'LOGIN' | 'LOGOUT' | 'ACCESS_DENIED' | 'DATA_EXPORT' | 'CONFIG_CHANGE';
  userId: string;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
} 