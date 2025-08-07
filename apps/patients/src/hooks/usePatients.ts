// 🏥 HOOK ESPECIALIZADO DE PACIENTES - ALTAMEDICA  
// Gestión granular de datos de pacientes con estado optimizado
// MIGRADO COMPLETAMENTE AL SERVICIO CENTRALIZADO @altamedica/patient-services

import { useState, useEffect, useCallback, useMemo } from 'react';
import { patientsService } from '../services/patients-service-new';
import type { 
  Patient, 
  PatientsResponse,
  CreatePatientRequest,
  UpdatePatientRequest
} from '../services/patients-service-new';

// 📝 TIPOS ESPECIALIZADOS PARA EL HOOK
export interface UsePatientState {
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  lastFetch: string | null;
}

export interface UsePatientActions {
  searchPatients: (params?: PatientSearchParams) => Promise<void>;
  getPatientById: (id: string) => Promise<Patient | null>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<Patient | null>;
  refreshPatients: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
  setCurrentPatient: (patient: Patient | null) => void;
}

export interface UsePatientOptions {
  initialFetch?: boolean;
  autoRefreshInterval?: number;
  cacheTimeout?: number;
  defaultLimit?: number;
}

// 🎯 HOOK PRINCIPAL DE PACIENTES
export function usePatients(options: UsePatientOptions = {}): UsePatientState & UsePatientActions {
  const {
    initialFetch = false,
    autoRefreshInterval = 0,
    cacheTimeout = 300000, // 5 minutos
    defaultLimit = 10
  } = options;

  // 📊 ESTADO PRINCIPAL
  const [state, setState] = useState<UsePatientState>({
    patients: [],
    currentPatient: null,
    loading: false,
    error: null,
    pagination: null,
    lastFetch: null
  });

  // 🔄 PARÁMETROS DE BÚSQUEDA ACTUALES
  const [currentParams, setCurrentParams] = useState<PatientSearchParams>({
    limit: defaultLimit,
    page: 1
  });

  // 🔍 BÚSQUEDA DE PACIENTES
  const searchPatients = useCallback(async (params: PatientSearchParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const searchParams = { ...currentParams, ...params };
      setCurrentParams(searchParams);

      const response: PaginatedResponse<Patient> = await medicalService.getPatients(searchParams);
      
      setState(prev => ({
        ...prev,
        patients: response.data,
        pagination: {
          page: searchParams.page || 1,
          limit: searchParams.limit || defaultLimit,
          total: response.total,
          totalPages: Math.ceil(response.total / (searchParams.limit || defaultLimit)),
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage
        },
        loading: false,
        lastFetch: new Date().toISOString()
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al buscar pacientes'
      }));
    }
  }, [currentParams, defaultLimit]);

  // 👤 OBTENER PACIENTE POR ID
  const getPatientById = useCallback(async (id: string): Promise<Patient | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const patient = await medicalService.getPatientById(id);
      
      setState(prev => ({
        ...prev,
        currentPatient: patient,
        loading: false
      }));

      return patient;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al obtener paciente'
      }));
      return null;
    }
  }, []);

  // ✏️ ACTUALIZAR PACIENTE
  const updatePatient = useCallback(async (id: string, data: Partial<Patient>): Promise<Patient | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedPatient = await medicalService.updatePatient(id, data);
      
      setState(prev => ({
        ...prev,
        currentPatient: prev.currentPatient?.id === id ? updatedPatient : prev.currentPatient,
        patients: prev.patients.map(p => p.id === id ? updatedPatient : p),
        loading: false
      }));

      return updatedPatient;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar paciente'
      }));
      return null;
    }
  }, []);

  // 🔄 REFRESCAR PACIENTES
  const refreshPatients = useCallback(async () => {
    await searchPatients(currentParams);
  }, [searchPatients, currentParams]);

  // 🧹 LIMPIAR ERROR
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 🔄 RESETEAR ESTADO
  const resetState = useCallback(() => {
    setState({
      patients: [],
      currentPatient: null,
      loading: false,
      error: null,
      pagination: null,
      lastFetch: null
    });
    setCurrentParams({ limit: defaultLimit, page: 1 });
  }, [defaultLimit]);

  // 👤 ESTABLECER PACIENTE ACTUAL
  const setCurrentPatient = useCallback((patient: Patient | null) => {
    setState(prev => ({ ...prev, currentPatient: patient }));
  }, []);

  // 🤖 AUTO-REFRESH (SI ESTÁ HABILITADO)
  useEffect(() => {
    if (autoRefreshInterval > 0 && state.patients.length > 0) {
      const interval = setInterval(refreshPatients, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, refreshPatients, state.patients.length]);

  // 🚀 FETCH INICIAL (SI ESTÁ HABILITADO)
  useEffect(() => {
    if (initialFetch) {
      searchPatients();
    }
  }, [initialFetch]); // Solo en el primer render

  // 📊 DATOS MEMOIZADOS PARA OPTIMIZACIÓN
  const memoizedState = useMemo(() => ({
    ...state,
    hasPatients: state.patients.length > 0,
    isFirstPage: state.pagination?.page === 1,
    isLastPage: !state.pagination?.hasNextPage,
    isCacheValid: state.lastFetch ? 
      (Date.now() - new Date(state.lastFetch).getTime()) < cacheTimeout : 
      false
  }), [state, cacheTimeout]);

  return {
    ...memoizedState,
    searchPatients,
    getPatientById,
    updatePatient,
    refreshPatients,
    clearError,
    resetState,
    setCurrentPatient
  };
}

// 🎯 HOOK ESPECIALIZADO PARA PACIENTE ÚNICO
export function usePatient(patientId: string | null) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedPatient = await medicalService.getPatientById(id);
      setPatient(fetchedPatient);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener paciente');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchPatient(patientId);
    } else {
      setPatient(null);
      setError(null);
    }
  }, [patientId, fetchPatient]);

  const updatePatient = useCallback(async (data: Partial<Patient>) => {
    if (!patientId) return null;

    try {
      setLoading(true);
      setError(null);
      
      const updated = await medicalService.updatePatient(patientId, data);
      setPatient(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar paciente');
      return null;
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  return {
    patient,
    loading,
    error,
    updatePatient,
    refreshPatient: () => patientId ? fetchPatient(patientId) : Promise.resolve(),
    clearError: () => setError(null)
  };
}

export default usePatients;