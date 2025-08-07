/**
 * 🎣 USE PATIENTS - DOCTORS APP
 * Hook para gestión de pacientes en la aplicación de doctores
 */

import { useState, useEffect, useCallback } from 'react';
import { patientsService } from '../services/patients-service';
import type {
  Patient,
  PatientProfile,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientsResponse,
  ApiResponse
} from '../services/patients-service';

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
  updatePatient: (id: string, data: UpdatePatientRequest) => Promise<boolean>;
  searchPatients: (query: string) => Promise<void>;
  clearError: () => void;
  clearCurrentPatient: () => void;
}

export function usePatients(options: UsePatientsOptions = {}): UsePatientsResult {
  const { page = 1, limit = 20, autoFetch = true, doctorId } = options;
  
  // Estado
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPatients, setTotalPatients] = useState<number>(0);

  // Función helper para manejar respuestas de API
  const handleApiResponse = useCallback(<T>(response: ApiResponse<T>): T | null => {
    if (response.success && response.data) {
      setError(null);
      return response.data;
    } else {
      setError(response.error || 'Error desconocido');
      return null;
    }
  }, []);

  // Obtener lista de pacientes
  const fetchPatients = useCallback(async (pageNum = page, limitNum = limit) => {
    setLoading(true);
    try {
      const response = await patientsService.getPatients(pageNum, limitNum);
      const data = handleApiResponse(response);
      
      if (data) {
        setPatients(data.patients || []);
        setTotalPatients(data.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener pacientes');
    } finally {
      setLoading(false);
    }
  }, [page, limit, handleApiResponse]);

  // Obtener pacientes específicos del doctor (funcionalidad extendida)
  const fetchMyPatients = useCallback(async (doctorId: string) => {
    setLoading(true);
    try {
      // Esta es una llamada personalizada que podríamos añadir al servicio más adelante
      // Por ahora usamos la búsqueda general y filtramos
      const response = await patientsService.getPatients(1, 100);
      const data = handleApiResponse(response);
      
      if (data) {
        // Aquí filtrarías por los pacientes asignados al doctor
        // Por ahora mostramos todos
        setPatients(data.patients || []);
        setTotalPatients(data.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener mis pacientes');
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse]);

  // Obtener paciente por ID
  const fetchPatientById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await patientsService.getPatientById(id);
      const data = handleApiResponse(response);
      
      if (data) {
        setCurrentPatient(data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener paciente');
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse]);

  // Actualizar paciente (los doctores no crean pacientes, solo los actualizan)
  const updatePatient = useCallback(async (id: string, data: UpdatePatientRequest): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await patientsService.updatePatient(id, data);
      const updatedPatient = handleApiResponse(response);
      
      if (updatedPatient) {
        setPatients(prev => 
          prev.map(patient => 
            patient.id === id ? updatedPatient : patient
          )
        );
        
        if (currentPatient?.id === id) {
          setCurrentPatient(updatedPatient);
        }
        
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar paciente');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentPatient, handleApiResponse]);

  // Buscar pacientes
  const searchPatients = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const response = await patientsService.searchPatients(query);
      const data = handleApiResponse(response);
      
      if (data) {
        setPatients(data);
        setTotalPatients(data.length);
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar pacientes');
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Limpiar paciente actual
  const clearCurrentPatient = useCallback(() => {
    setCurrentPatient(null);
  }, []);

  // Efecto para carga automática
  useEffect(() => {
    if (autoFetch) {
      if (doctorId) {
        fetchMyPatients(doctorId);
      } else {
        fetchPatients();
      }
    }
  }, [autoFetch, doctorId, fetchPatients, fetchMyPatients]);

  return {
    // Estado
    patients,
    currentPatient,
    loading,
    error,
    totalPatients,
    
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

// Hook específico para un solo paciente con perfil completo
export function usePatient(patientId: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const [patientResponse, profileResponse] = await Promise.all([
        patientsService.getPatientById(patientId),
        patientsService.getPatientProfile(patientId)
      ]);

      if (patientResponse.success && patientResponse.data) {
        setPatient(patientResponse.data);
      }

      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al obtener paciente');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  return {
    patient,
    profile,
    loading,
    error,
    refetch: fetchPatient
  };
}
