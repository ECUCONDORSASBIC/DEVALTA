// 📅 Re-export del hook centralizado useAppointments
// MIGRADO: Usando implementación robusta desde @altamedica/hooks
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
