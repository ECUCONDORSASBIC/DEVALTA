/**
 * 🪝 MIGRATED HOOKS INDEX - AltaMedica Patients App
 * 
 * ⚠️ DEPRECATED: Esta carpeta está siendo migrada hacia paquetes centralizados
 * 
 * Nuevo patrón recomendado:
 * - Hooks genéricos: @altamedica/hooks
 * - Hooks de autenticación: @altamedica/auth  
 * - Hooks específicos de dominio médico: @altamedica/medical-hooks
 * 
 * Para migrar tu código:
 * 
 * ANTES:
 * import { useHydration, useAccessibility } from './hooks';
 * 
 * DESPUÉS:
 * import { useHydration, useAccessibility } from '@altamedica/hooks';
 */

// 🔐 Re-exportar desde paquetes centralizados
export { 
  useAuth, 
  useUser, 
  useIsAuthenticated, 
  usePermissions, 
  ProtectedRoute 
} from '@altamedica/auth';

export {
  useHydration,
  useAccessibility,
  useLocalStorage,
  useDebounce,
  useWindowSize,
  useMediaQuery
} from '@altamedica/hooks';

// export {
//   usePatients,
//   useAppointments,
//   useMedicalRecords,
//   usePrescriptions,
//   useTelemedicine
// } from '@altamedica/medical-hooks';

// Hooks locales que aún no están centralizados (serán migrados)
// export { useIntegratedServices } from './useIntegratedServices';
// export { useSpecializedHooks } from './useSpecializedHooks';

// Tipos re-exportados
export type {
  Patient,
  Appointment,
  MedicalRecord,
  Prescription
} from '@altamedica/types';

/**
 * @deprecated Usar hooks especializados de @altamedica/medical-hooks
 */
export function useLegacyPatientHooks() {
  console.warn('⚠️ useLegacyPatientHooks está deprecated. Migrar a @altamedica/medical-hooks');
  
  return {
    // Placeholder para evitar errores durante migración
    usePatients: () => ({ data: [], isLoading: false, error: null }),
    useAppointments: () => ({ data: [], isLoading: false, error: null })
  };
}

export default {
  // Re-exportaciones principales
  useAuth,
  // usePatients,
  // useAppointments,
  // useMedicalRecords,
  // useIntegratedServices,
  
  // Legacy compatibility
  useLegacyPatientHooks
};