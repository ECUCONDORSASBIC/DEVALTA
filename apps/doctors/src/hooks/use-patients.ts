/**
 * Hook para Gestión de Pacientes
 * Operaciones CRUD y búsqueda avanzada
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MedicalHistoryEntry, 
  VitalSigns 
} from '../types/medical-entities';
import { getPatientService, Patient } from '../services/patient-service';
import { useAuth } from './use-auth';

export interface UsePatientOptions {
  autoLoad?: boolean;
  includeFullHistory?: boolean;
}

export interface UsePatientsOptions {
  filters?: PatientSearchFilters;
  searchOptions?: PatientSearchOptions;
  autoLoad?: boolean;
}

export interface PatientOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Hook para un paciente individual
export function usePatient(patientId?: string, options: UsePatientOptions = {}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, canAccessPatient } = useAuth();

  const loadPatient = useCallback(async (id: string) => {
    if (!isAuthenticated || !canAccessPatient(id)) {
      setError('Sin permisos para acceder a este paciente');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const patientData = await patientService.getPatientById(
        id, 
        options.includeFullHistory || false
      );
      
      setPatient(patientData);
    } catch (err: any) {
      setError(err.message || 'Error cargando paciente');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, canAccessPatient, options.includeFullHistory]);

  // Cargar automáticamente si se proporciona ID
  useEffect(() => {
    if (patientId && options.autoLoad !== false) {
      loadPatient(patientId);
    }
  }, [patientId, loadPatient, options.autoLoad]);

  const refresh = useCallback(() => {
    if (patientId) {
      loadPatient(patientId);
    }
  }, [patientId, loadPatient]);

  return {
    patient,
    loading,
    error,
    loadPatient,
    refresh,
    hasData: !!patient
  };
}

// Hook para lista de pacientes con búsqueda
export function usePatients(options: UsePatientsOptions = {}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDocument, setLastDocument] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  const searchPatients = useCallback(async (
    searchFilters?: PatientSearchFilters,
    searchOptions?: PatientSearchOptions,
    append = false
  ) => {
    if (!isAuthenticated) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const finalOptions = {
        ...options.searchOptions,
        ...searchOptions,
        lastDocument: append ? lastDocument : undefined
      };

      const result = await patientService.searchPatients(
        searchFilters || options.filters || {},
        finalOptions
      );

      if (append) {
        setPatients(prev => [...prev, ...result.patients]);
      } else {
        setPatients(result.patients);
      }

      setHasMore(result.hasMore);
      setLastDocument(result.lastDocument);
    } catch (err: any) {
      setError(err.message || 'Error buscando pacientes');
      if (!append) {
        setPatients([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, options.filters, options.searchOptions, lastDocument]);

  // Cargar automáticamente
  useEffect(() => {
    if (options.autoLoad !== false) {
      searchPatients();
    }
  }, [options.autoLoad]); // Solo ejecutar una vez

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      searchPatients(options.filters, options.searchOptions, true);
    }
  }, [hasMore, loading, searchPatients, options.filters, options.searchOptions]);

  const refresh = useCallback(() => {
    setLastDocument(null);
    searchPatients(options.filters, options.searchOptions, false);
  }, [searchPatients, options.filters, options.searchOptions]);

  return {
    patients,
    loading,
    error,
    hasMore,
    searchPatients,
    loadMore,
    refresh,
    totalCount: patients.length
  };
}

// Hook para crear/actualizar pacientes
export function usePatientMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const createPatient = useCallback(async (
    patientData: Omit<Patient, 'id' | 'auditInfo'>
  ): Promise<PatientOperationResult> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      setLoading(true);
      setError(null);

      const patientId = await patientService.createPatient(patientData);

      return { 
        success: true, 
        data: { patientId } 
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Error creando paciente';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const updatePatient = useCallback(async (
    patientId: string,
    updates: Partial<Patient>,
    updateReason: string
  ): Promise<PatientOperationResult> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      setLoading(true);
      setError(null);

      await patientService.updatePatient(patientId, updates, updateReason);

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Error actualizando paciente';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addHistoryEntry = useCallback(async (
    patientId: string,
    historyEntry: Omit<MedicalHistoryEntry, 'id'>
  ): Promise<PatientOperationResult> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      setLoading(true);
      setError(null);

      const entryId = await patientService.addMedicalHistoryEntry(patientId, historyEntry);

      return { 
        success: true, 
        data: { entryId } 
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Error agregando entrada al historial';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    createPatient,
    updatePatient,
    addHistoryEntry,
    loading,
    error
  };
}

// Hook para resumen de pacientes (dashboard)
export function usePatientsSummary(facilityId?: string) {
  const [summary, setSummary] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadSummary = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const summaryData = await patientService.getPatientsSummary(facilityId);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Error cargando resumen de pacientes');
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, facilityId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refresh = useCallback(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    summary,
    loading,
    error,
    refresh,
    totalPatients: summary.length,
    criticalPatients: summary.filter(p => p.riskLevel === 'CRITICAL').length,
    highRiskPatients: summary.filter(p => p.riskLevel === 'HIGH').length
  };
}

// Hook para suscripción a actualizaciones en tiempo real
export function usePatientRealtime(patientId: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, canAccessPatient } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !canAccessPatient(patientId)) {
      setError('Sin permisos para acceder a este paciente');
      setLoading(false);
      return;
    }

    const unsubscribe = patientService.subscribeToPatientUpdates(
      patientId,
      (updatedPatient) => {
        setPatient(updatedPatient);
        setLoading(false);
        setError(null);
      }
    );

    return unsubscribe;
  }, [patientId, isAuthenticated, canAccessPatient]);

  return {
    patient,
    loading,
    error,
    isRealtime: true
  };
}

// Hook para validación de datos de paciente
export function usePatientValidation() {
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validatePatient = useCallback(async (patientData: Partial<Patient>) => {
    try {
      // Importar servicio de validación
      const { validationService } = await import('../services/validation-service');
      
      const result = validationService.validatePatientData(patientData);
      
      setValidationErrors(result.errors);
      setIsValid(result.isValid);
      
      return result;
    } catch (error) {
      console.error('Error en validación:', error);
      return { isValid: false, errors: [], warnings: [] };
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationErrors([]);
    setIsValid(true);
  }, []);

  return {
    validatePatient,
    validationErrors,
    isValid,
    clearValidation,
    hasErrors: validationErrors.length > 0
  };
}

export default usePatient;
