// 📅 HOOK ESPECIALIZADO DE CITAS MÉDICAS - ALTAMEDICA
// Gestión completa de citas con estados optimizados y validaciones
// CONSERVADOR: Complementa sistema existente, funcionalidad granular

import { useState, useEffect, useCallback, useMemo } from 'react';
import { medicalService } from '../services/MedicalService'; // Corrected import
import type { Appointment, PaginatedResponse } from '../types';
import type { AppointmentFilters } from '../services/MedicalService';

// ... (el resto del archivo permanece igual)


// 📝 TIPOS ESPECIALIZADOS PARA CITAS
export interface UseAppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
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

export interface UseAppointmentActions {
  searchAppointments: (filters?: AppointmentFilters) => Promise<void>;
  getAppointmentById: (id: string) => Promise<Appointment | null>;
  createAppointment: (data: Partial<Appointment>) => Promise<Appointment | null>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<Appointment | null>;
  cancelAppointment: (id: string, reason?: string) => Promise<boolean>;
  refreshAppointments: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

export interface UseAppointmentOptions {
  patientId?: string;
  doctorId?: string;
  initialFetch?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  defaultLimit?: number;
}

// 🎯 HOOK PRINCIPAL DE CITAS
export function useAppointments(options: UseAppointmentOptions = {}): UseAppointmentState & UseAppointmentActions {
  const {
    patientId,
    doctorId,
    initialFetch = false,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minuto
    defaultLimit = 10
  } = options;

  // 📊 ESTADO PRINCIPAL
  const [state, setState] = useState<UseAppointmentState>({
    appointments: [],
    currentAppointment: null,
    loading: false,
    error: null,
    pagination: null,
    lastFetch: null
  });

  // 🔄 FILTROS ACTUALES
  const [currentFilters, setCurrentFilters] = useState<AppointmentFilters>({
    ...(patientId && { patientId }),
    ...(doctorId && { doctorId }),
    limit: defaultLimit,
    page: 1
  });

  // 🔍 BÚSQUEDA DE CITAS
  const searchAppointments = useCallback(async (filters: AppointmentFilters = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const searchFilters = { ...currentFilters, ...filters };
      setCurrentFilters(searchFilters);

      const response: PaginatedResponse<Appointment> = await medicalService.getAppointments(searchFilters);
      
      setState(prev => ({
        ...prev,
        appointments: response.data,
        pagination: {
          page: searchFilters.page || 1,
          limit: searchFilters.limit || defaultLimit,
          total: response.total,
          totalPages: Math.ceil(response.total / (searchFilters.limit || defaultLimit)),
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
        error: error instanceof Error ? error.message : 'Error al buscar citas'
      }));
    }
  }, [currentFilters, defaultLimit]);

  // 📅 OBTENER CITA POR ID
  const getAppointmentById = useCallback(async (id: string): Promise<Appointment | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const appointment = await medicalService.getAppointmentById(id);
      
      setState(prev => ({
        ...prev,
        currentAppointment: appointment,
        loading: false
      }));

      return appointment;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al obtener cita'
      }));
      return null;
    }
  }, []);

  // ➕ CREAR NUEVA CITA
  const createAppointment = useCallback(async (data: Partial<Appointment>): Promise<Appointment | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newAppointment = await medicalService.createAppointment(data);
      
      setState(prev => ({
        ...prev,
        appointments: [newAppointment, ...prev.appointments],
        currentAppointment: newAppointment,
        loading: false
      }));

      return newAppointment;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear cita'
      }));
      return null;
    }
  }, []);

  // ✏️ ACTUALIZAR CITA
  const updateAppointment = useCallback(async (id: string, data: Partial<Appointment>): Promise<Appointment | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedAppointment = await medicalService.updateAppointment(id, data);
      
      setState(prev => ({
        ...prev,
        currentAppointment: prev.currentAppointment?.id === id ? updatedAppointment : prev.currentAppointment,
        appointments: prev.appointments.map(a => a.id === id ? updatedAppointment : a),
        loading: false
      }));

      return updatedAppointment;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar cita'
      }));
      return null;
    }
  }, []);

  // ❌ CANCELAR CITA
  const cancelAppointment = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await medicalService.cancelAppointment(id, reason);
      
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.filter(a => a.id !== id),
        currentAppointment: prev.currentAppointment?.id === id ? null : prev.currentAppointment,
        loading: false
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cancelar cita'
      }));
      return false;
    }
  }, []);

  // 🔄 REFRESCAR CITAS
  const refreshAppointments = useCallback(async () => {
    await searchAppointments(currentFilters);
  }, [searchAppointments, currentFilters]);

  // 🧹 LIMPIAR ERROR
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 🔄 RESETEAR ESTADO
  const resetState = useCallback(() => {
    setState({
      appointments: [],
      currentAppointment: null,
      loading: false,
      error: null,
      pagination: null,
      lastFetch: null
    });
    setCurrentFilters({
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      limit: defaultLimit,
      page: 1
    });
  }, [patientId, doctorId, defaultLimit]);

  // 🤖 AUTO-REFRESH (SI ESTÁ HABILITADO)
  useEffect(() => {
    if (autoRefresh && state.appointments.length > 0) {
      const interval = setInterval(refreshAppointments, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshAppointments, refreshInterval, state.appointments.length]);

  // 🚀 FETCH INICIAL (SI ESTÁ HABILITADO)
  useEffect(() => {
    if (initialFetch) {
      searchAppointments();
    }
  }, [initialFetch]); // Solo en el primer render

  // 📊 DATOS MEMOIZADOS CON UTILIDADES
  const memoizedState = useMemo(() => {
    const now = new Date();
    const upcomingAppointments = state.appointments.filter(
      apt => new Date(apt.date) > now && apt.status === 'scheduled'
    );
    const pastAppointments = state.appointments.filter(
      apt => new Date(apt.date) <= now
    );

    return {
      ...state,
      hasAppointments: state.appointments.length > 0,
      upcomingCount: upcomingAppointments.length,
      pastCount: pastAppointments.length,
      upcomingAppointments,
      pastAppointments,
      nextAppointment: upcomingAppointments
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null,
      isFirstPage: state.pagination?.page === 1,
      isLastPage: !state.pagination?.hasNextPage
    };
  }, [state]);

  return {
    ...memoizedState,
    searchAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    refreshAppointments,
    clearError,
    resetState
  };
}

// 🎯 HOOK ESPECIALIZADO PARA CITAS PRÓXIMAS
export function useUpcomingAppointments(patientId?: string, limit: number = 5) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: AppointmentFilters = {
        ...(patientId && { patientId }),
        status: 'scheduled',
        dateFrom: new Date().toISOString(),
        limit
      };

      const response = await medicalService.getAppointments(filters);
      
      // Ordenar por fecha más próxima
      const sortedAppointments = response.data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setAppointments(sortedAppointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener citas próximas');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [patientId, limit]);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  return {
    appointments,
    loading,
    error,
    refresh: fetchUpcoming,
    hasUpcoming: appointments.length > 0,
    nextAppointment: appointments[0] || null
  };
}

export default useAppointments;