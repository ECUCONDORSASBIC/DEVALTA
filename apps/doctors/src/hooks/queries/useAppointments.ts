/**
 * 📅 MIGRADO A CENTRALIZED: useAppointments
 * 
 * Esta implementación local (284 líneas) ha sido reemplazada por la versión
 * centralizada y robusta de @altamedica/hooks que incluye:
 * - Schemas Zod completos
 * - TanStack Query optimizado  
 * - Manejo de errores profesional
 * - Compatibilidad total con la API
 * 
 * @deprecated Usar @altamedica/hooks en su lugar
 */

// Re-export de todos los hooks de appointments desde la versión centralizada
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
} from '@altamedica/hooks';

// Para compatibilidad, mantener los query keys similares
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: string) => [...appointmentKeys.lists(), { filters }] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  today: () => [...appointmentKeys.all, 'today'] as const,
  upcoming: () => [...appointmentKeys.all, 'upcoming'] as const,
};