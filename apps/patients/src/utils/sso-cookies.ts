/**
 * 🍪 DEPRECATED - SSO Cookie Utils
 * 
 * ⚠️ Este archivo ha sido migrado a @altamedica/auth/sso
 * 
 * Para migrar tu código:
 * 
 * ANTES:
 * import { getSSOUser, hasSSOToken } from './utils/sso-cookies';
 * 
 * DESPUÉS:
 * import { getSSOUser, hasSSOToken } from '@altamedica/auth/sso';
 */

console.warn('⚠️ /utils/sso-cookies está deprecated. Migrar a @altamedica/auth/sso');

// Re-exportar desde el paquete centralizado para compatibilidad temporal
export {
  getCookie,
  hasSSOToken,
  getSSOUser,
  isValidPatient,
  hasValidPatientSession,
  logSSOState
} from '@altamedica/auth/sso';

export type {
  SSOUser
} from '@altamedica/auth/sso';