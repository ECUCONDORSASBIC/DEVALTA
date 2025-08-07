/**
 * @fileoverview Constantes para hooks de autenticación
 * @module @altamedica/hooks/auth/constants
 * @description Constantes, rutas y configuraciones para el sistema de autenticación
 */

import type { PermissionMatrix, Role, Permission } from './types';

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

/**
 * Rutas de autenticación por defecto
 */
export const AUTH_ROUTES = {
  // Rutas públicas
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  
  // Rutas protegidas
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Rutas específicas por tipo de usuario
  PATIENT_DASHBOARD: '/patient/dashboard',
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  COMPANY_DASHBOARD: '/company/dashboard',
  
  // Rutas de error
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  ACCESS_DENIED: '/access-denied'
} as const;

// ==========================================
// ROLES Y JERARQUÍA
// ==========================================

/**
 * Roles del sistema con jerarquía descendente
 */
export const USER_ROLES: Role[] = [
  'super_admin',
  'admin', 
  'medical_director',
  'doctor',
  'nurse',
  'specialist',
  'company_admin',
  'company_user',
  'patient',
  'guest'
];

/**
 * Jerarquía de roles - roles superiores incluyen permisos de roles inferiores
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  'super_admin': 10,
  'admin': 9,
  'medical_director': 8,
  'doctor': 7,
  'specialist': 6,
  'nurse': 5,
  'company_admin': 4,
  'company_user': 3,
  'patient': 2,
  'guest': 1
};

// ==========================================
// PERMISOS DEL SISTEMA
// ==========================================

/**
 * Todos los permisos disponibles en el sistema
 */
export const PERMISSIONS: Permission[] = [
  // Pacientes
  'read_patients',
  'write_patients',
  
  // Registros médicos
  'read_medical_records',
  'write_medical_records',
  
  // Medicamentos
  'prescribe_medications',
  
  // Citas
  'schedule_appointments',
  
  // Telemedicina
  'access_telemedicine',
  
  // Gestión de usuarios
  'manage_users',
  
  // Analíticas
  'view_analytics',
  
  // Facturación
  'billing_access',
  
  // Administración
  'system_admin',
  
  // Exportación de datos
  'export_data',
  
  // HIPAA
  'hipaa_access'
];

/**
 * Matriz de permisos por rol
 */
export const PERMISSION_MATRIX: PermissionMatrix = {
  'super_admin': [
    'read_patients',
    'write_patients',
    'read_medical_records',
    'write_medical_records',
    'prescribe_medications',
    'schedule_appointments',
    'access_telemedicine',
    'manage_users',
    'view_analytics',
    'billing_access',
    'system_admin',
    'export_data',
    'hipaa_access'
  ],
  
  'admin': [
    'read_patients',
    'write_patients',
    'read_medical_records',
    'write_medical_records',
    'schedule_appointments',
    'access_telemedicine',
    'manage_users',
    'view_analytics',
    'billing_access',
    'export_data',
    'hipaa_access'
  ],
  
  'medical_director': [
    'read_patients',
    'write_patients',
    'read_medical_records',
    'write_medical_records',
    'prescribe_medications',
    'schedule_appointments',
    'access_telemedicine',
    'view_analytics',
    'hipaa_access'
  ],
  
  'doctor': [
    'read_patients',
    'write_patients',
    'read_medical_records',
    'write_medical_records',
    'prescribe_medications',
    'schedule_appointments',
    'access_telemedicine',
    'hipaa_access'
  ],
  
  'specialist': [
    'read_patients',
    'write_patients',
    'read_medical_records',
    'write_medical_records',
    'prescribe_medications',
    'schedule_appointments',
    'access_telemedicine',
    'hipaa_access'
  ],
  
  'nurse': [
    'read_patients',
    'write_patients',
    'read_medical_records',
    'schedule_appointments',
    'access_telemedicine',
    'hipaa_access'
  ],
  
  'company_admin': [
    'read_patients',
    'schedule_appointments',
    'view_analytics',
    'billing_access',
    'manage_users'
  ],
  
  'company_user': [
    'read_patients',
    'schedule_appointments'
  ],
  
  'patient': [
    'read_medical_records', // Solo sus propios registros
    'schedule_appointments' // Solo sus propias citas
  ],
  
  'guest': []
};

// ==========================================
// CONFIGURACIONES POR DEFECTO
// ==========================================

/**
 * Configuración por defecto de tokens
 */
export const DEFAULT_TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutos
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 días
  AUTO_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes de expirar
  STORAGE_KEY_PREFIX: 'altamedica_auth_'
} as const;

/**
 * Configuración por defecto de sesión
 */
export const DEFAULT_SESSION_CONFIG = {
  TIMEOUT: 30 * 60 * 1000, // 30 minutos
  MAX_CONCURRENT_SESSIONS: 3,
  IDLE_TIMEOUT: 15 * 60 * 1000, // 15 minutos
  WARNING_TIME: 5 * 60 * 1000 // 5 minutos antes de expirar
} as const;

/**
 * Configuración por defecto de contraseñas
 */
export const DEFAULT_PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  DISALLOW_COMMON: true,
  HISTORY_COUNT: 5 // No reutilizar últimas 5 contraseñas
} as const;

// ==========================================
// PROVEEDORES SSO
// ==========================================

/**
 * Configuración de proveedores SSO
 */
export const SSO_PROVIDERS = {
  GOOGLE: {
    name: 'Google',
    icon: '🔍',
    scopes: ['openid', 'email', 'profile'],
    color: '#4285f4'
  },
  MICROSOFT: {
    name: 'Microsoft',
    icon: '🪟',
    scopes: ['openid', 'email', 'profile'],
    color: '#00a1f1'
  },
  APPLE: {
    name: 'Apple',
    icon: '🍎',
    scopes: ['name', 'email'],
    color: '#000000'
  },
  OKTA: {
    name: 'Okta',
    icon: '🔐',
    scopes: ['openid', 'email', 'profile'],
    color: '#007dc1'
  },
  AUTH0: {
    name: 'Auth0',
    icon: '🛡️',
    scopes: ['openid', 'email', 'profile'],
    color: '#eb5424'
  }
} as const;

// ==========================================
// EVENTOS DE AUDITORÍA
// ==========================================

/**
 * Eventos de auditoría HIPAA
 */
export const AUDIT_EVENTS = {
  // Autenticación
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Autorización
  ACCESS_GRANTED: 'ACCESS_GRANTED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  PERMISSION_ESCALATION: 'PERMISSION_ESCALATION',
  
  // Datos médicos
  PHI_ACCESSED: 'PHI_ACCESSED',
  PHI_MODIFIED: 'PHI_MODIFIED',
  PHI_EXPORTED: 'PHI_EXPORTED',
  MEDICAL_RECORD_VIEWED: 'MEDICAL_RECORD_VIEWED',
  
  // Administración
  USER_CREATED: 'USER_CREATED',
  USER_MODIFIED: 'USER_MODIFIED',
  USER_DELETED: 'USER_DELETED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  
  // Seguridad
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY'
} as const;

// ==========================================
// CONFIGURACIÓN MÉDICA ESPECÍFICA
// ==========================================

/**
 * Especialidades médicas
 */
export const MEDICAL_SPECIALTIES = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Neurología',
  'Oftalmología',
  'Oncología',
  'Ortopedia',
  'Pediatría',
  'Psiquiatría',
  'Radiología',
  'Urología',
  'Medicina General',
  'Medicina Interna',
  'Medicina Familiar',
  'Medicina de Emergencia',
  'Anestesiología',
  'Cirugía General',
  'Medicina Preventiva'
] as const;

/**
 * Tipos de certificaciones médicas
 */
export const MEDICAL_CERTIFICATIONS = [
  'Licencia Médica General',
  'Especialidad Médica',
  'Certificación BLS',
  'Certificación ACLS',
  'Certificación PALS',
  'Certificación HIPAA',
  'Certificación DEA',
  'Board Certification',
  'Fellowship',
  'Residencia Médica'
] as const;

/**
 * Niveles de acceso HIPAA
 */
export const HIPAA_ACCESS_LEVELS = {
  NONE: {
    level: 'none',
    description: 'Sin acceso a PHI',
    permissions: []
  },
  BASIC: {
    level: 'basic',
    description: 'Acceso básico a PHI no sensible',
    permissions: ['read_basic_info']
  },
  FULL: {
    level: 'full',
    description: 'Acceso completo a PHI',
    permissions: ['read_patients', 'read_medical_records', 'hipaa_access']
  },
  RESTRICTED: {
    level: 'restricted',
    description: 'Acceso restringido con auditoría',
    permissions: ['read_patients', 'hipaa_access']
  }
} as const;

// ==========================================
// MENSAJES DE ERROR
// ==========================================

/**
 * Mensajes de error en español
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  TOKEN_EXPIRED: 'La sesión ha expirado, inicia sesión nuevamente',
  REFRESH_FAILED: 'No se pudo renovar la sesión',
  INSUFFICIENT_PERMISSIONS: 'No tienes permisos para realizar esta acción',
  ACCOUNT_SUSPENDED: 'Tu cuenta ha sido suspendida',
  MFA_REQUIRED: 'Se requiere autenticación de doble factor',
  EMAIL_NOT_VERIFIED: 'Debes verificar tu email antes de continuar',
  SESSION_EXPIRED: 'La sesión ha expirado por inactividad',
  RATE_LIMITED: 'Has excedido el límite de intentos, intenta más tarde',
  HIPAA_VIOLATION: 'Acceso denegado por violación a políticas HIPAA',
  NETWORK_ERROR: 'Error de conexión, verifica tu internet',
  SERVER_ERROR: 'Error del servidor, intenta más tarde',
  INVALID_EMAIL: 'El formato del email no es válido',
  WEAK_PASSWORD: 'La contraseña no cumple con los requisitos de seguridad',
  EMAIL_ALREADY_EXISTS: 'Ya existe una cuenta con este email',
  LICENSE_REQUIRED: 'Se requiere número de licencia médica válida'
} as const;

// ==========================================
// CONFIGURACIÓN DE DESARROLLO
// ==========================================

/**
 * URLs de desarrollo
 */
export const DEV_URLS = {
  API_BASE: 'http://localhost:3001',
  AUTH_CALLBACK: 'http://localhost:3000/auth/callback',
  WEBSOCKET: 'ws://localhost:8888'
} as const;

/**
 * URLs de producción
 */
export const PROD_URLS = {
  API_BASE: 'https://api.altamedica.com',
  AUTH_CALLBACK: 'https://app.altamedica.com/auth/callback',
  WEBSOCKET: 'wss://realtime.altamedica.com'
} as const;

// ==========================================
// UTILIDADES DE VALIDACIÓN
// ==========================================

/**
 * Regex para validaciones
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  LICENSE_NUMBER: /^[A-Z]{2}\d{6,8}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
} as const;

/**
 * Función para obtener URLs según el entorno
 */
export function getEnvironmentUrls() {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? DEV_URLS : PROD_URLS;
}

/**
 * Función para verificar si un rol tiene jerarquía suficiente
 */
export function hasRoleHierarchy(userRole: Role, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Función para obtener permisos de un rol
 */
export function getRolePermissions(role: Role): Permission[] {
  return PERMISSION_MATRIX[role] || [];
}

/**
 * Función para verificar si un rol tiene un permiso específico
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = getRolePermissions(role);
  return rolePermissions.includes(permission);
}

/**
 * Función para obtener todos los permisos de múltiples roles
 */
export function getCombinedPermissions(roles: Role[]): Permission[] {
  const allPermissions = new Set<Permission>();
  
  roles.forEach(role => {
    const rolePermissions = getRolePermissions(role);
    rolePermissions.forEach(permission => allPermissions.add(permission));
  });
  
  return Array.from(allPermissions);
}