/**
 * Hook integrado para gestión de citas médicas con backend dockerizado
 * Utiliza React Query para cache y el servicio de appointments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  appointmentsService, 
  Appointment, 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest, 
  CancelAppointmentRequest,
  Doctor,
  AvailabilityResponse
} from '../services/appointments-service';
import { useState } from 'react';

// Keys para queries de React Query
export const appointmentsQueryKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentsQueryKeys.all, 'list'] as const,
  list: (filters?: any) => [...appointmentsQueryKeys.lists(), { filters }] as const,
  details: () => [...appointmentsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentsQueryKeys.details(), id] as const,
  patient: (patientId: string) => [...appointmentsQueryKeys.all, 'patient', patientId] as const,
  doctor: (doctorId: string) => [...appointmentsQueryKeys.all, 'doctor', doctorId] as const,
  upcoming: (patientId: string) => [...appointmentsQueryKeys.all, 'upcoming', patientId] as const,
  history: (patientId: string) => [...appointmentsQueryKeys.all, 'history', patientId] as const,
  stats: () => [...appointmentsQueryKeys.all, 'stats'] as const,
  doctors: () => ['doctors'] as const,
  doctorDetail: (id: string) => [...appointmentsQueryKeys.doctors(), id] as const,
  availability: (doctorId: string, dates?: any) => [...appointmentsQueryKeys.doctors(), doctorId, 'availability', dates] as const,
};

/**
 * Hook para obtener lista de citas con filtros
 */
export function useAppointments(filters?: {
  page?: number;
  limit?: number;
  status?: string;
  patientId?: string;
  doctorId?: string;
}) {
  return useQuery({
    queryKey: appointmentsQueryKeys.list(filters),
    queryFn: async () => {
      const response = await appointmentsService.getAppointments(
        filters?.page,
        filters?.limit,
        filters?.status,
        filters?.patientId,
        filters?.doctorId
      );
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener citas');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener una cita específica por ID
 */
export function useAppointment(appointmentId: string | undefined | null) {
  return useQuery({
    queryKey: appointmentsQueryKeys.detail(appointmentId!),
    queryFn: async () => {
      const response = await appointmentsService.getAppointmentById(appointmentId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener cita');
      }
      return response.data;
    },
    enabled: !!appointmentId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener próximas citas de un paciente
 */
export function useUpcomingAppointments(patientId: string | undefined | null) {
  return useQuery({
    queryKey: appointmentsQueryKeys.upcoming(patientId!),
    queryFn: async () => {
      const response = await appointmentsService.getUpcomingAppointments(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener próximas citas');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos actuales
    gcTime: 3 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refrescar cada 2 minutos
  });
}

/**
 * Hook para obtener historial de citas de un paciente
 */
export function useAppointmentHistory(patientId: string | undefined | null, limit?: number) {
  return useQuery({
    queryKey: appointmentsQueryKeys.history(patientId!),
    queryFn: async () => {
      const response = await appointmentsService.getAppointmentHistory(patientId!, limit);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener historial de citas');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener estadísticas de citas
 */
export function useAppointmentStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...appointmentsQueryKeys.stats(), { startDate, endDate }],
    queryFn: async () => {
      const response = await appointmentsService.getAppointmentStats(startDate, endDate);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener estadísticas de citas');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos para estadísticas
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Hook para obtener lista de doctores
 */
export function useDoctors() {
  return useQuery({
    queryKey: appointmentsQueryKeys.doctors(),
    queryFn: async () => {
      const response = await appointmentsService.getDoctors();
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener doctores');
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook para obtener información de un doctor específico
 */
export function useDoctor(doctorId: string | undefined | null) {
  return useQuery({
    queryKey: appointmentsQueryKeys.doctorDetail(doctorId!),
    queryFn: async () => {
      const response = await appointmentsService.getDoctorById(doctorId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener información del doctor');
      }
      return response.data;
    },
    enabled: !!doctorId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Hook para obtener disponibilidad de un doctor
 */
export function useDoctorAvailability(
  doctorId: string | undefined | null,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: appointmentsQueryKeys.availability(doctorId!, { startDate, endDate }),
    queryFn: async () => {
      const response = await appointmentsService.getDoctorAvailability(doctorId!, startDate, endDate);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener disponibilidad del doctor');
      }
      return response.data;
    },
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutos para disponibilidad
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para búsqueda de doctores
 */
export function useDoctorSearch() {
  const [searchParams, setSearchParams] = useState<{
    specialty?: string;
    location?: string;
    rating?: number;
  }>({});

  const query = useQuery({
    queryKey: [...appointmentsQueryKeys.doctors(), 'search', searchParams],
    queryFn: async () => {
      const response = await appointmentsService.searchDoctors(
        searchParams.specialty,
        searchParams.location,
        searchParams.rating
      );
      if (!response.success) {
        throw new Error(response.error || 'Error en la búsqueda de doctores');
      }
      return response.data;
    },
    enabled: !!(searchParams.specialty || searchParams.location || searchParams.rating),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    ...query,
    searchParams,
    setSearchParams,
    clearSearch: () => setSearchParams({}),
    hasSearchParams: !!(searchParams.specialty || searchParams.location || searchParams.rating),
  };
}

/**
 * Hook para crear una nueva cita
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData: CreateAppointmentRequest) => {
      const response = await appointmentsService.createAppointment(appointmentData);
      if (!response.success) {
        throw new Error(response.error || 'Error al crear cita');
      }
      return response.data;
    },
    onSuccess: (newAppointment, variables) => {
      // Invalidar listas de citas
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.lists() });
      
      // Invalidar citas del paciente específico
      queryClient.invalidateQueries({ 
        queryKey: appointmentsQueryKeys.upcoming(variables.patientId) 
      });
      
      // Invalidar disponibilidad del doctor
      queryClient.invalidateQueries({ 
        queryKey: appointmentsQueryKeys.availability(variables.doctorId, {}) 
      });
      
      // Invalidar estadísticas
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
    },
  });
}

/**
 * Hook para actualizar una cita
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, updates }: { 
      appointmentId: string; 
      updates: UpdateAppointmentRequest 
    }) => {
      const response = await appointmentsService.updateAppointment(appointmentId, updates);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar cita');
      }
      return response.data;
    },
    onSuccess: (updatedAppointment, variables) => {
      const { appointmentId } = variables;
      
      // Actualizar cache específico de la cita
      queryClient.setQueryData(appointmentsQueryKeys.detail(appointmentId), updatedAppointment);
      
      // Invalidar listas y citas del paciente
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.lists() });
      
      if (updatedAppointment.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentsQueryKeys.upcoming(updatedAppointment.patientId) 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating appointment:', error);
    },
  });
}

/**
 * Hook para cancelar una cita
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, cancelData }: { 
      appointmentId: string; 
      cancelData: CancelAppointmentRequest 
    }) => {
      const response = await appointmentsService.cancelAppointment(appointmentId, cancelData);
      if (!response.success) {
        throw new Error(response.error || 'Error al cancelar cita');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      const { appointmentId } = variables;
      
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.detail(appointmentId) });
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Error canceling appointment:', error);
    },
  });
}

/**
 * Hook para confirmar una cita
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await appointmentsService.confirmAppointment(appointmentId);
      if (!response.success) {
        throw new Error(response.error || 'Error al confirmar cita');
      }
      return response.data;
    },
    onSuccess: (updatedAppointment, appointmentId) => {
      // Actualizar cache específico
      queryClient.setQueryData(appointmentsQueryKeys.detail(appointmentId), updatedAppointment);
      
      // Invalidar listas relevantes
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.lists() });
      
      if (updatedAppointment.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentsQueryKeys.upcoming(updatedAppointment.patientId) 
        });
      }
    },
    onError: (error) => {
      console.error('Error confirming appointment:', error);
    },
  });
}

/**
 * Hook para reprogramar una cita
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      appointmentId, 
      newDate, 
      newTime, 
      reason 
    }: { 
      appointmentId: string; 
      newDate: string; 
      newTime: string; 
      reason?: string 
    }) => {
      const response = await appointmentsService.rescheduleAppointment(
        appointmentId, 
        newDate, 
        newTime, 
        reason
      );
      if (!response.success) {
        throw new Error(response.error || 'Error al reprogramar cita');
      }
      return response.data;
    },
    onSuccess: (updatedAppointment, variables) => {
      const { appointmentId } = variables;
      
      // Actualizar cache específico
      queryClient.setQueryData(appointmentsQueryKeys.detail(appointmentId), updatedAppointment);
      
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.lists() });
      
      if (updatedAppointment.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentsQueryKeys.upcoming(updatedAppointment.patientId) 
        });
      }
      
      // Invalidar disponibilidad del doctor
      if (updatedAppointment.doctorId) {
        queryClient.invalidateQueries({ 
          queryKey: appointmentsQueryKeys.availability(updatedAppointment.doctorId, {}) 
        });
      }
    },
    onError: (error) => {
      console.error('Error rescheduling appointment:', error);
    },
  });
}

/**
 * Hook para iniciar sesión de video
 */
export function useStartVideoSession() {
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await appointmentsService.startVideoSession(appointmentId);
      if (!response.success) {
        throw new Error(response.error || 'Error al iniciar sesión de video');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Error starting video session:', error);
    },
  });
}

/**
 * Hook combinado para gestión completa de citas
 */
export function useAppointmentsManager() {
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();
  const confirmAppointment = useConfirmAppointment();
  const rescheduleAppointment = useRescheduleAppointment();
  const startVideoSession = useStartVideoSession();

  return {
    // Operaciones de mutación
    createAppointment,
    updateAppointment,
    cancelAppointment,
    confirmAppointment,
    rescheduleAppointment,
    startVideoSession,
    
    // Estados de carga
    isCreating: createAppointment.isPending,
    isUpdating: updateAppointment.isPending,
    isCanceling: cancelAppointment.isPending,
    isConfirming: confirmAppointment.isPending,
    isRescheduling: rescheduleAppointment.isPending,
    isStartingVideo: startVideoSession.isPending,
    
    // Estados de éxito
    createSuccess: createAppointment.isSuccess,
    updateSuccess: updateAppointment.isSuccess,
    cancelSuccess: cancelAppointment.isSuccess,
    confirmSuccess: confirmAppointment.isSuccess,
    rescheduleSuccess: rescheduleAppointment.isSuccess,
    videoStartSuccess: startVideoSession.isSuccess,
    
    // Errores
    createError: createAppointment.error,
    updateError: updateAppointment.error,
    cancelError: cancelAppointment.error,
    confirmError: confirmAppointment.error,
    rescheduleError: rescheduleAppointment.error,
    videoError: startVideoSession.error,
    
    // Datos de respuesta
    createdAppointment: createAppointment.data,
    updatedAppointment: updateAppointment.data,
    cancelResult: cancelAppointment.data,
    confirmedAppointment: confirmAppointment.data,
    rescheduledAppointment: rescheduleAppointment.data,
    videoSessionData: startVideoSession.data,
    
    // Funciones de reset
    resetCreateState: createAppointment.reset,
    resetUpdateState: updateAppointment.reset,
    resetCancelState: cancelAppointment.reset,
    resetConfirmState: confirmAppointment.reset,
    resetRescheduleState: rescheduleAppointment.reset,
    resetVideoState: startVideoSession.reset,
  };
}