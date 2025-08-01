/**
 * Hook integrado para gestión de pacientes con backend dockerizado
 * Utiliza React Query para cache y los nuevos servicios API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService, Patient, CreatePatientRequest, UpdatePatientRequest, PatientProfile } from '../services/patients-service';
import { useState } from 'react';

// Keys para queries de React Query
export const patientsQueryKeys = {
  all: ['patients'] as const,
  lists: () => [...patientsQueryKeys.all, 'list'] as const,
  list: (filters?: any) => [...patientsQueryKeys.lists(), { filters }] as const,
  details: () => [...patientsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientsQueryKeys.details(), id] as const,
  profile: (id: string) => [...patientsQueryKeys.all, 'profile', id] as const,
  search: (query: string) => [...patientsQueryKeys.all, 'search', query] as const,
  stats: () => [...patientsQueryKeys.all, 'stats'] as const,
};

/**
 * Hook para obtener lista de pacientes con paginación
 */
export function usePatients(page?: number, limit?: number) {
  return useQuery({
    queryKey: patientsQueryKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await patientsService.getPatients(page, limit);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener pacientes');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener lista simple de pacientes (sin paginación)
 */
export function usePatientsSimple() {
  return useQuery({
    queryKey: [...patientsQueryKeys.all, 'simple'],
    queryFn: async () => {
      const response = await patientsService.getPatientsSimple();
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener pacientes');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos para datos menos cambiantes
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

/**
 * Hook para obtener un paciente específico por ID
 */
export function usePatient(patientId: string | undefined | null) {
  return useQuery({
    queryKey: patientsQueryKeys.detail(patientId!),
    queryFn: async () => {
      const response = await patientsService.getPatientById(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener paciente');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener el perfil completo de un paciente
 */
export function usePatientProfile(patientId: string | undefined | null) {
  return useQuery({
    queryKey: patientsQueryKeys.profile(patientId!),
    queryFn: async () => {
      const response = await patientsService.getPatientProfile(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener perfil del paciente');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para búsqueda dinámica de pacientes
 */
export function usePatientSearch() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const query = useQuery({
    queryKey: patientsQueryKeys.search(searchQuery),
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const response = await patientsService.searchPatients(searchQuery);
      if (!response.success) {
        throw new Error(response.error || 'Error en la búsqueda');
      }
      return response.data;
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30 * 1000, // 30 segundos para búsquedas
    gcTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    ...query,
    searchQuery,
    setSearchQuery,
    clearSearch: () => setSearchQuery(''),
    hasQuery: searchQuery.length >= 2,
  };
}

/**
 * Hook para estadísticas de pacientes
 */
export function usePatientsStats() {
  return useQuery({
    queryKey: patientsQueryKeys.stats(),
    queryFn: async () => {
      const response = await patientsService.getPatientsStats();
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener estadísticas');
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos para estadísticas
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para crear un nuevo paciente
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patientData: CreatePatientRequest) => {
      const response = await patientsService.createPatient(patientData);
      if (!response.success) {
        throw new Error(response.error || 'Error al crear paciente');
      }
      return response.data;
    },
    onSuccess: (newPatient) => {
      // Invalidar las listas de pacientes
      queryClient.invalidateQueries({ queryKey: patientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientsQueryKeys.stats() });
      
      // Agregar el nuevo paciente al cache de la lista simple si existe
      queryClient.setQueryData([...patientsQueryKeys.all, 'simple'], (oldData: Patient[] | undefined) => {
        if (oldData) {
          return [newPatient, ...oldData];
        }
        return [newPatient];
      });
    },
    onError: (error) => {
      console.error('Error creating patient:', error);
    },
  });
}

/**
 * Hook para actualizar información de un paciente
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ patientId, updates }: { patientId: string; updates: UpdatePatientRequest }) => {
      const response = await patientsService.updatePatient(patientId, updates);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar paciente');
      }
      return response.data;
    },
    onSuccess: (updatedPatient, variables) => {
      const { patientId } = variables;
      
      // Actualizar el cache específico del paciente
      queryClient.setQueryData(patientsQueryKeys.detail(patientId), updatedPatient);
      
      // Invalidar el perfil del paciente para que se recargue
      queryClient.invalidateQueries({ queryKey: patientsQueryKeys.profile(patientId) });
      
      // Actualizar las listas si el paciente está presente
      queryClient.setQueryData([...patientsQueryKeys.all, 'simple'], (oldData: Patient[] | undefined) => {
        if (oldData) {
          return oldData.map(patient => 
            patient.id === patientId ? updatedPatient : patient
          );
        }
        return oldData;
      });
      
      // Invalidar las listas paginadas para refrescar
      queryClient.invalidateQueries({ queryKey: patientsQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
    },
  });
}

/**
 * Hook para eliminar un paciente
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patientId: string) => {
      const response = await patientsService.deletePatient(patientId);
      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar paciente');
      }
      return { patientId, ...response.data };
    },
    onSuccess: (result) => {
      const { patientId } = result;
      
      // Remover del cache específico
      queryClient.removeQueries({ queryKey: patientsQueryKeys.detail(patientId) });
      queryClient.removeQueries({ queryKey: patientsQueryKeys.profile(patientId) });
      
      // Actualizar listas removiendo el paciente
      queryClient.setQueryData([...patientsQueryKeys.all, 'simple'], (oldData: Patient[] | undefined) => {
        if (oldData) {
          return oldData.filter(patient => patient.id !== patientId);
        }
        return oldData;
      });
      
      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: patientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientsQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Error deleting patient:', error);
    },
  });
}

/**
 * Hook para obtener historial médico de un paciente
 */
export function usePatientMedicalRecords(patientId: string | undefined | null) {
  return useQuery({
    queryKey: [...patientsQueryKeys.detail(patientId!), 'medical-records'],
    queryFn: async () => {
      const response = await patientsService.getPatientMedicalRecords(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener historial médico');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener citas de un paciente
 */
export function usePatientAppointments(patientId: string | undefined | null) {
  return useQuery({
    queryKey: [...patientsQueryKeys.detail(patientId!), 'appointments'],
    queryFn: async () => {
      const response = await patientsService.getPatientAppointments(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener citas');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutos para datos más dinámicos
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener próximas citas del paciente
 */
export function useUpcomingAppointments(patientId: string | undefined | null) {
  return useQuery({
    queryKey: [...patientsQueryKeys.detail(patientId!), 'upcoming-appointments'],
    queryFn: async () => {
      const response = await patientsService.getUpcomingAppointments(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener próximas citas');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos muy actuales
    gcTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos automáticamente
  });
}

/**
 * Hook para actualizar preferencias de comunicación
 */
export function useUpdateCommunicationPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ patientId, preferences }: { 
      patientId: string; 
      preferences: { email: boolean; sms: boolean; phone: boolean } 
    }) => {
      const response = await patientsService.updateCommunicationPreferences(patientId, preferences);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar preferencias');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      const { patientId } = variables;
      // Invalidar el perfil del paciente para reflejar los cambios
      queryClient.invalidateQueries({ queryKey: patientsQueryKeys.profile(patientId) });
    },
    onError: (error) => {
      console.error('Error updating communication preferences:', error);
    },
  });
}

/**
 * Hook combinado para gestión completa de pacientes
 * Proporciona todas las operaciones CRUD y estados en un solo lugar
 */
export function usePatientsManager() {
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const updatePreferences = useUpdateCommunicationPreferences();

  return {
    // Operaciones de mutación
    createPatient,
    updatePatient,
    deletePatient,
    updatePreferences,
    
    // Estados de carga
    isCreating: createPatient.isPending,
    isUpdating: updatePatient.isPending,
    isDeleting: deletePatient.isPending,
    isUpdatingPreferences: updatePreferences.isPending,
    
    // Estados de éxito
    createSuccess: createPatient.isSuccess,
    updateSuccess: updatePatient.isSuccess,
    deleteSuccess: deletePatient.isSuccess,
    preferencesSuccess: updatePreferences.isSuccess,
    
    // Errores
    createError: createPatient.error,
    updateError: updatePatient.error,
    deleteError: deletePatient.error,
    preferencesError: updatePreferences.error,
    
    // Funciones de reset
    resetCreateState: createPatient.reset,
    resetUpdateState: updatePatient.reset,
    resetDeleteState: deletePatient.reset,
    resetPreferencesState: updatePreferences.reset,
    
    // Datos de respuesta
    createdPatient: createPatient.data,
    updatedPatient: updatePatient.data,
    deletedResult: deletePatient.data,
    preferencesResult: updatePreferences.data,
  };
}

/**
 * Hook optimizado para dashboard - obtiene datos esenciales
 */
export function usePatientsDashboard() {
  const stats = usePatientsStats();
  const recentPatients = useQuery({
    queryKey: [...patientsQueryKeys.lists(), 'recent', { limit: 5 }],
    queryFn: async () => {
      const response = await patientsService.getPatients(1, 5);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener pacientes recientes');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,
  });

  return {
    stats: stats.data,
    recentPatients: recentPatients.data,
    isLoadingStats: stats.isLoading,
    isLoadingRecent: recentPatients.isLoading,
    error: stats.error || recentPatients.error,
    isLoading: stats.isLoading || recentPatients.isLoading,
    refetch: () => {
      stats.refetch();
      recentPatients.refetch();
    },
  };
}