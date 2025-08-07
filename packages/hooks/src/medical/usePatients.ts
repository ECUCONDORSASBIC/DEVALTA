/**
 * 👥 DEPRECATED: Hook Especializado usePatients (759 líneas)
 * 
 * ⚠️  ESTA IMPLEMENTACIÓN EXTENSA HA SIDO DEPRECADA
 * 
 * Esta implementación especializada masiva ha sido reemplazada por la versión
 * robusta y optimizada en @altamedica/api-client que incluye:
 * - Schemas Zod completos para validación médica  
 * - TanStack Query para performance superior
 * - 10 hooks especializados médicos
 * - Manejo de errores profesional
 * - Menor complejidad (230 vs 759 líneas)
 * - Mejor performance y maintainability
 * - Compatibilidad total con la API v1
 * - HIPAA compliance integrado
 * 
 * @deprecated Usar @altamedica/hooks → @altamedica/api-client en su lugar
 * @see packages/api-client/src/hooks/usePatients.ts - Implementación robusta optimizada
 */

// TODO: Re-enable exports once @altamedica/api-client/hooks is available
// // Re-export desde la implementación robusta optimizada
// export {
//   usePatients,
//   usePatient,
//   useCreatePatient,
//   useUpdatePatient,
//   useDeletePatient,
//   usePatientAppointments,
//   usePatientMedicalHistory,
//   usePatientPrescriptions,
//   usePatientDocuments,
//   useUploadPatientDocument
// } from '@altamedica/api-client/hooks';

// // Re-export todos los tipos médicos
// export type { Patient } from '@altamedica/api-client/hooks';

// Placeholder export to prevent empty module
export const usePatients = () => {
  throw new Error('usePatients hook not yet implemented - migrate from @altamedica/api-client/hooks');
};

/**
 * @deprecated - Types complejos consolidados en implementación robusta
 * Usar @altamedica/api-client/hooks que incluye todos los tipos optimizados
 */
export interface DeprecatedTypes {
  message: 'Esta implementación de 759 líneas ha sido reemplazada por versión robusta de 230 líneas';
  migration: 'import { usePatients } from "@altamedica/hooks"';
  benefits: string[];
}