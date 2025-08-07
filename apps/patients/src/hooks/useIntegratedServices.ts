/**
 * Archivo central de exportación para todos los hooks integrados
 * Proporciona acceso unificado a todos los servicios del backend dockerizado
 */

// Hooks de Pacientes - MIGRADO A CENTRALIZED
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
} from '@altamedica/hooks';

// Hooks locales que aún no están centralizados
export {
  usePatientsSimple,
  usePatientProfile,
  usePatientSearch,
  usePatientsStats,
  usePatientMedicalRecords,
  useUpcomingAppointments,
  useUpdateCommunicationPreferences,
  usePatientsManager,
  usePatientsDashboard,
  patientsQueryKeys,
} from './usePatientsIntegrated';

// Hooks de Citas - MIGRADO A CENTRALIZED
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

// Hooks locales que aún no están centralizados
export {
  useUpcomingAppointments as useUpcomingAppointmentsFromService,
  useAppointmentHistory,
  useAppointmentStats,
  useDoctors,
  useDoctor,
  useDoctorAvailability,
  useDoctorSearch,
  useStartVideoSession,
  useAppointmentsManager,
  appointmentsQueryKeys,
} from './useAppointmentsIntegrated';

// Hooks de Registros Médicos
export {
  useMedicalRecords,
  useMedicalRecord,
  usePatientMedicalRecords as usePatientMedicalRecordsFromService,
  useMedicalRecordSearch,
  useMedicalSummary,
  usePrescriptions,
  usePatientPrescriptions,
  useActivePrescriptions,
  useVitalSigns,
  usePatientAllergies,
  useCurrentMedications,
  useRecordAttachments,
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
  useCreatePrescription,
  useUpdatePrescriptionStatus,
  useRecordVitalSigns,
  useUploadAttachment,
  useMedicalRecordsManager,
  medicalRecordsQueryKeys,
} from './useMedicalRecordsIntegrated';

// Hooks de Telemedicina
export {
  useTelemedicineSessions,
  useTelemedicineSession,
  usePatientSessionHistory,
  useDoctorActiveSessions,
  useWebRTCConfig,
  useChatMessages,
  useJoinTelemedicineSession,
  useJoinExistingSession,
  useEndTelemedicineSession,
  useUpdateSessionStatus,
  useSendChatMessage,
  useReportSessionQuality,
  useScreenShare,
  useSessionRecording,
  useTelemedicineManager,
  useWebRTCSignaling,
  telemedicineQueryKeys,
} from './useTelemedicineIntegrated';

// Tipos exportados para uso en componentes
export type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientProfile,
} from '../services/patients-service';

export type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  CancelAppointmentRequest,
  Doctor,
  AvailabilityResponse,
} from '../services/appointments-service';

export type {
  MedicalRecord,
  Prescription,
  VitalSigns,
  CreateMedicalRecordRequest,
  CreatePrescriptionRequest,
  FileAttachment,
} from '../services/medical-records-service';

export type {
  TelemedicineSession,
  JoinSessionRequest,
  SessionJoinResponse,
  WebRTCConfig,
} from '../services/telemedicine-service';

/**
 * Hook maestro que combina funcionalidades de todos los servicios
 * Útil para dashboards y vistas complejas que requieren múltiples servicios
 */
export function useIntegratedDashboard(patientId?: string) {
  // Datos de paciente
  const patient = usePatient(patientId);
  const patientProfile = usePatientProfile(patientId);
  
  // Citas próximas
  const upcomingAppointments = useUpcomingAppointments(patientId);
  const appointmentHistory = useAppointmentHistory(patientId, 5);
  
  // Registros médicos recientes
  const medicalRecords = usePatientMedicalRecords(patientId);
  const activePrescriptions = useActivePrescriptions(patientId);
  const medicalSummary = useMedicalSummary(patientId);
  
  // Sesiones de telemedicina
  const sessionHistory = usePatientSessionHistory(patientId);
  
  // Estados consolidados
  const isLoading = 
    patient.isLoading || 
    patientProfile.isLoading || 
    upcomingAppointments.isLoading || 
    medicalRecords.isLoading || 
    medicalSummary.isLoading;
  
  const hasError = 
    patient.error || 
    patientProfile.error || 
    upcomingAppointments.error || 
    medicalRecords.error || 
    medicalSummary.error;
  
  const refetchAll = () => {
    patient.refetch();
    patientProfile.refetch();
    upcomingAppointments.refetch();
    appointmentHistory.refetch();
    medicalRecords.refetch();
    activePrescriptions.refetch();
    medicalSummary.refetch();
    sessionHistory.refetch();
  };
  
  return {
    // Datos del paciente
    patient: patient.data,
    patientProfile: patientProfile.data,
    
    // Citas
    upcomingAppointments: upcomingAppointments.data,
    appointmentHistory: appointmentHistory.data,
    
    // Registros médicos
    medicalRecords: medicalRecords.data,
    activePrescriptions: activePrescriptions.data,
    medicalSummary: medicalSummary.data,
    
    // Telemedicina
    sessionHistory: sessionHistory.data,
    
    // Estados
    isLoading,
    hasError,
    error: hasError,
    
    // Acciones
    refetchAll,
    
    // Queries individuales para acceso granular
    queries: {
      patient,
      patientProfile,
      upcomingAppointments,
      appointmentHistory,
      medicalRecords,
      activePrescriptions,
      medicalSummary,
      sessionHistory,
    },
  };
}

/**
 * Hook para validar conectividad con el backend
 * MIGRADO: Ahora usa @altamedica/api-client
 */
export function useBackendConnectivity() {
  const { useApiClient } = require('@altamedica/api-client');
  const apiClient = useApiClient();
  
  const healthCheck = useQuery({
    queryKey: ['backend', 'health'],
    queryFn: async () => {
      const response = await apiClient.get('/health');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // Verificar cada minuto
    retry: 3,
  });
  
  const serverStatus = useQuery({
    queryKey: ['backend', 'status'],
    queryFn: async () => {
      const response = await apiClient.get('/metrics');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    retry: 2,
  });
  
  return {
    isHealthy: healthCheck.isSuccess,
    healthData: healthCheck.data,
    serverStatus: serverStatus.data,
    isCheckingHealth: healthCheck.isLoading,
    isCheckingStatus: serverStatus.isLoading,
    healthError: healthCheck.error,
    statusError: serverStatus.error,
    refetchHealth: healthCheck.refetch,
    refetchStatus: serverStatus.refetch,
  };
}

// Re-exportar funciones de query caching para uso avanzado
export { useQueryClient } from '@altamedica/hooks';