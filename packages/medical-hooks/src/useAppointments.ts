/**
 * 📅 DEPRECATED: Hook Básico useAppointments
 * 
 * ⚠️  ESTA IMPLEMENTACIÓN HA SIDO DEPRECADA
 * 
 * Esta implementación básica (86 líneas) ha sido reemplazada por la versión
 * robusta y completa en @altamedica/hooks que incluye:
 * - Schemas Zod completos para validación
 * - TanStack Query para performance superior
 * - Manejo de errores profesional
 * - Compatibilidad total con la API v1
 * - Support completo para tipos médicos
 * 
 * @deprecated Usar @altamedica/hooks en su lugar
 * @see packages/api-client/src/hooks/useAppointments.ts - Implementación robusta
 */

// Re-export desde la implementación robusta para compatibilidad durante migración
export {
  useAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useConfirmAppointment,
  useRescheduleAppointment,
  useAvailableSlots,
  useCompleteAppointment
} from '@altamedica/api-client';

// Re-export tipos desde la implementación robusta
export type { Appointment } from '@altamedica/api-client';

/**
 * @deprecated - Interface básica reemplazada por implementación completa
 * Usar la implementación en @altamedica/hooks que incluye tipos completos
 */
export interface UseApiOptions {
  token?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}