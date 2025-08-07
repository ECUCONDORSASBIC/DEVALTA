/**
 * 🎣 USE PATIENTS NEW - HOOK MODERNIZADO CON SERVICIO CENTRALIZADO
 * Hook de React para gestión de pacientes usando @altamedica/patient-services
 */

import { useState, useEffect, useCallback } from 'react';
import { patientsService } from '../services/patients-service-new';
import type {
  Patient,
  PatientProfile,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientsResponse,
  ApiResponse
} from '../services/patients-service-new';

export interface UsePatientsNewOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export interface UsePatientsNewResult {
  // Estado
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
  totalPatients: number;
  
  // Acciones
  fetchPatients: (page?: number, limit?: number) => Promise<void>;
  fetchPatientById: (id: string) => Promise<void>;
  createPatient: (data: CreatePatientRequest) => Promise<boolean>;
  updatePatient: (id: string, data: UpdatePatientRequest) => Promise<boolean>;
  deletePatient: (id: string) => Promise<boolean>;
  searchPatients: (query: string) => Promise<void>;
  clearError: () => void;
  clearCurrentPatient: () => void;
}

export function usePatientsNew(options: UsePatientsNewOptions = {}): UsePatientsNewResult {
  const { page = 1, limit = 20, autoFetch = true } = options;
  
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

  // Crear nuevo paciente
  const createPatient = useCallback(async (data: CreatePatientRequest): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await patientsService.createPatient(data);
      const newPatient = handleApiResponse(response);
      
      if (newPatient) {
        setPatients(prev => [newPatient, ...prev]);
        setTotalPatients(prev => prev + 1);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Error al crear paciente');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse]);

  // Actualizar paciente
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

  // Eliminar paciente
  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await patientsService.deletePatient(id);
      const result = handleApiResponse(response);
      
      if (result && result.success) {
        setPatients(prev => prev.filter(patient => patient.id !== id));
        setTotalPatients(prev => prev - 1);
        
        if (currentPatient?.id === id) {
          setCurrentPatient(null);
        }
        
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar paciente');
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
      fetchPatients();
    }
  }, [autoFetch, fetchPatients]);

  return {
    // Estado
    patients,
    currentPatient,
    loading,
    error,
    totalPatients,
    
    // Acciones
    fetchPatients,
    fetchPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    clearError,
    clearCurrentPatient
  };
}

// Hook específico para un solo paciente
export function usePatientNew(patientId: string) {
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
