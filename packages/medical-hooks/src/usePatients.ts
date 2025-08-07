/**
 * 👥 DEPRECATED: Hook Básico usePatients
 * 
 * ⚠️  ESTA IMPLEMENTACIÓN HA SIDO DEPRECADA
 * 
 * Esta implementación básica (108 líneas) ha sido reemplazada por la versión
 * robusta y completa en @altamedica/api-client que incluye:
 * - Schemas Zod completos para validación médica
 * - TanStack Query para performance superior
 * - 10 hooks especializados (vs 2 básicos)
 * - Manejo de errores profesional
 * - Tipos médicos completos
 * - Compatibilidad total con la API v1
 * 
 * @deprecated Usar @altamedica/hooks en su lugar
 * @see packages/api-client/src/hooks/usePatients.ts - Implementación robusta
 */

// Re-export desde la implementación robusta para compatibilidad
export {
  usePatients,
  usePatient,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  usePatientAppointments,
  usePatientMedicalHistory,
  usePatientPrescriptions,
  usePatientDocuments,
  useUploadPatientDocument
} from '@altamedica/api-client';

// Re-export tipos médicos robustos
export type { Patient } from '@altamedica/api-client';

/**
 * @deprecated - Interface básica reemplazada por implementación completa
 * Usar la implementación en @altamedica/hooks que incluye tipos médicos completos
 */
export interface UseApiOptions {
  token?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}