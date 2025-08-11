// 🚀 MIGRATED: Hook migrado para usar @altamedica/api-client
// Mantiene funcionalidad específica de doctors app

import { 
  usePatients as usePatientsBase,
  usePatient,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  usePatientAppointments,
  usePatientMedicalHistory,
  usePatientPrescriptions
} from '@altamedica/api-client/hooks';

import { useState, useCallback, useEffect } from 'react';
import type { Patient, PatientProfile } from '@altamedica/types';

export interface UsePatientsOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
  doctorId?: string; // Específico para filtrar pacientes del doctor
}

export interface UsePatientsResult {
  // Estado
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
  totalPatients: number;
  
  // Acciones
  fetchPatients: (page?: number, limit?: number) => Promise<void>;
  fetchMyPatients: (doctorId: string) => Promise<void>; // Específico para doctores
  fetchPatientById: (id: string) => Promise<void>;
  updatePatient: (id: string, data: any) => Promise<boolean>;
  searchPatients: (query: string) => Promise<void>;
  clearError: () => void;
  clearCurrentPatient: () => void;
}

// 🎯 HOOK ESPECIALIZADO PARA DOCTORS APP
export function usePatients(options: UsePatientsOptions = {}): UsePatientsResult {
  const { page = 1, limit = 20, autoFetch = true, doctorId } = options;
  
  // Usar hooks centralizados
  const baseQuery = usePatientsBase({
    doctorId,
    page,
    limit
  });

  const updateMutation = useUpdatePatient();
  const getPatientQuery = usePatient;

  // Estado local adicional
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // Acciones wrapper
  const fetchPatients = useCallback(async (pageOverride?: number, limitOverride?: number) => {
    await baseQuery.refetch();
  }, [baseQuery]);

  // 🔑 Función específica para doctores: obtener sus propios pacientes
  const fetchMyPatients = useCallback(async (doctorId: string) => {
    // Refetch con el doctorId específico
    // Nota: Esto podría requerir actualización en el hook base para soportar cambio dinámico de filtros
    await baseQuery.refetch();
  }, [baseQuery]);

  const fetchPatientById = useCallback(async (id: string) => {
    const result = await getPatientQuery(id);
    if (result.data) {
      setCurrentPatient(result.data);
    }
  }, []);

  const updatePatient = useCallback(async (id: string, data: any) => {
    try {
      const result = await updateMutation.mutateAsync({ id, data });
      if (result) {
        await baseQuery.refetch();
        if (currentPatient?.id === id) {
          setCurrentPatient(result);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [updateMutation, baseQuery, currentPatient]);

  const searchPatients = useCallback(async (query: string) => {
    // TODO: Implementar búsqueda con filtros en el hook base
    // Por ahora, refetch con los datos actuales
    await baseQuery.refetch();
  }, [baseQuery]);

  const clearError = useCallback(() => {
    // Los errores se manejan internamente en TanStack Query
  }, []);

  const clearCurrentPatient = useCallback(() => {
    setCurrentPatient(null);
  }, []);

  // Auto-fetch inicial
  useEffect(() => {
    if (autoFetch) {
      fetchPatients();
    }
  }, [autoFetch]);

  // Mapear datos al formato esperado
  return {
    // Estado
    patients: baseQuery.data?.patients || [],
    currentPatient,
    loading: baseQuery.isLoading || updateMutation.isPending,
    error: baseQuery.error?.message || updateMutation.error?.message || null,
    totalPatients: baseQuery.data?.total || 0,
    
    // Acciones
    fetchPatients,
    fetchMyPatients,
    fetchPatientById,
    updatePatient,
    searchPatients,
    clearError,
    clearCurrentPatient
  };
}

// Re-exportar hooks adicionales para conveniencia
export {
  usePatient,
  usePatientAppointments,
  usePatientMedicalHistory,
  usePatientPrescriptions
} from '@altamedica/api-client/hooks';

// Re-export types
export type { Patient, PatientProfile } from '@altamedica/types';