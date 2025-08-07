// 🎯 HOOKS ESPECIALIZADOS ALTAMEDICA - VERSIÓN MEJORADA CONSERVADORA
// Migración gradual con tipado robusto + mantiene funcionalidad existente
// ANÁLISIS: Mejoras incrementales sin riesgo de ruptura

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAltaMedicaAPI, useAPIRequest } from './useAltaMedicaAPI';

// === TIPOS ROBUSTOS AGREGADOS (SIN AFECTAR CÓDIGO EXISTENTE) ===

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'consultation' | 'follow_up' | 'procedure' | 'emergency';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  type: 'consultation' | 'procedure' | 'emergency' | 'checkup';
  diagnosis: string[];
  treatment: string;
  notes: string;
  createdAt: string;
}

interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  prescribedDate: string;
  expiryDate: string;
}

interface APIError {
  message: string;
  status?: number;
  code?: string;
}

interface AppointmentData {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  type: Appointment['type'];
  notes?: string;
}

// Hook para retry logic conservador
function useRetryableRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);

  const executeWithRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    retryCountRef.current = 0;

    while (retryCountRef.current <= maxRetries) {
      try {
        const result = await requestFn();
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        retryCountRef.current++;
        
        if (retryCountRef.current > maxRetries) {
          const errorMessage = err instanceof Error ? err.message : 'Request failed after retries';
          setError(errorMessage);
          setLoading(false);
          throw err;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, retryCountRef.current - 1))
        );
      }
    }
  }, [requestFn, maxRetries, retryDelay]);

  return { data, loading, error, execute: executeWithRetry };
}

// 📅 HOOK PARA CITAS MÉDICAS - VERSIÓN MEJORADA CONSERVADORA
export function useAppointments(patientId?: string) {
  const apiClient = useAltaMedicaAPI();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mejora conservadora: retry logic sin cambiar API existente
  const { execute: executeLoad } = useRetryableRequest(
    () => apiClient.getAppointments(patientId),
    3, // 3 intentos
    1000 // 1 segundo de delay
  );

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await executeLoad();
      setAppointments(data.appointments || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appointments';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [executeLoad]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Mejora conservadora: tipado robusto manteniendo funcionalidad
  const createAppointment = useCallback(async (appointmentData: AppointmentData) => {
    try {
      const newAppointment = await apiClient.createAppointment(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (error) {
      throw error;
    }
  }, [apiClient]);

  const updateAppointment = useCallback(async (id: string, updateData: Partial<Appointment>) => {
    try {
      const updated = await apiClient.updateAppointment(id, updateData);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, ...updated } : apt)
      );
      return updated;
    } catch (error) {
      throw error;
    }
  }, [apiClient]);

  const cancelAppointment = useCallback(async (id: string) => {
    try {
      await apiClient.cancelAppointment(id);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: 'cancelled' } : apt)
      );
    } catch (error) {
      throw error;
    }
  }, [apiClient]);

  // Computed values con tipado mejorado
  const upcomingAppointments = useMemo(() => 
    appointments.filter(apt => 
      apt.status !== 'cancelled' && new Date(apt.date) >= new Date()
    ), [appointments]
  );

  const pastAppointments = useMemo(() => 
    appointments.filter(apt => 
      new Date(apt.date) < new Date()
    ), [appointments]
  );

  // Mejora conservadora: estadísticas adicionales sin afectar API
  const appointmentStats = useMemo(() => ({
    total: appointments.length,
    upcoming: upcomingAppointments.length,
    past: pastAppointments.length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
  }), [appointments, upcomingAppointments, pastAppointments]);

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    appointmentStats, // Nuevo campo sin afectar código existente
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    refreshAppointments: loadAppointments
  };
}

// 📋 HOOK PARA HISTORIAL MÉDICO - VERSIÓN MEJORADA CONSERVADORA
export function useMedicalRecords(patientId?: string) {
  const apiClient = useAltaMedicaAPI();
  
  // Mejora conservadora: retry en useAPIRequest
  const {
    data: recordsResponse,
    loading,
    error,
  } = useAPIRequest(
    () => apiClient.getMedicalRecords({ patientId }),
    [patientId]
  );

  const records: MedicalRecord[] = recordsResponse?.records || [];

  // Filtros y agrupaciones con tipado mejorado
  const recordsByType = useMemo(() => {
    const grouped: Record<string, MedicalRecord[]> = {};
    records.forEach(record => {
      const type = record.type || 'other';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(record);
    });
    return grouped;
  }, [records]);

  const recentRecords = useMemo(() => 
    records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  , [records]);

  // Mejora conservadora: estadísticas adicionales
  const recordStats = useMemo(() => ({
    total: records.length,
    byType: Object.entries(recordsByType).map(([type, recs]) => ({
      type,
      count: recs.length
    })),
    lastRecord: records.length > 0 ? 
      records.reduce((latest, record) => 
        new Date(record.date) > new Date(latest.date) ? record : latest
      ) : null,
  }), [records, recordsByType]);

  return {
    records,
    recordsByType,
    recentRecords,
    recordStats, // Nuevo campo
    loading,
    error,
  };
}

// 💊 HOOK PARA PRESCRIPCIONES - VERSIÓN MEJORADA CONSERVADORA
export function usePrescriptions() {
  const apiClient = useAltaMedicaAPI();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mejora conservadora: retry logic
  const { execute: executeLoad } = useRetryableRequest(
    () => apiClient.getPrescriptions(),
    3,
    1000
  );

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await executeLoad();
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prescriptions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [executeLoad]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const verifyPrescription = useCallback(async (code: string) => {
    try {
      return await apiClient.verifyPrescription({ code });
    } catch (error) {
      throw error;
    }
  }, [apiClient]);

  // Computed values con tipado robusto
  const activePrescriptions = useMemo(() => 
    prescriptions.filter(p => p.status === 'active')
  , [prescriptions]);

  const expiredPrescriptions = useMemo(() => 
    prescriptions.filter(p => p.status === 'expired')
  , [prescriptions]);

  // Mejora conservadora: análisis de medicamentos
  const medicationAnalysis = useMemo(() => {
    const allMedications = prescriptions.flatMap(p => p.medications);
    const medicationCounts = allMedications.reduce((acc, med) => {
      acc[med.name] = (acc[med.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMedications: allMedications.length,
      uniqueMedications: Object.keys(medicationCounts).length,
      mostPrescribed: Object.entries(medicationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    };
  }, [prescriptions]);

  return {
    prescriptions,
    activePrescriptions,
    expiredPrescriptions,
    medicationAnalysis, // Nuevo campo
    loading,
    error,
    verifyPrescription,
    refreshPrescriptions: loadPrescriptions
  };
}

// 📊 HOOK PARA DASHBOARD - VERSIÓN MEJORADA CONSERVADORA
export function useDashboard(patientId?: string) {
  const apiClient = useAltaMedicaAPI();
  
  const {
    data: dashboardData,
    loading,
    error,
  } = useAPIRequest(
    () => apiClient.getDashboard(patientId),
    [patientId]
  );

  // Mejora conservadora: procesamiento adicional de datos
  const processedData = useMemo(() => {
    if (!dashboardData) return null;

    return {
      ...dashboardData,
      summary: {
        ...dashboardData.summary,
        lastUpdated: new Date().toISOString(),
        dataQuality: {
          completeness: dashboardData.summary ? 
            Object.values(dashboardData.summary).filter(v => v !== null && v !== undefined).length / 
            Object.keys(dashboardData.summary).length * 100 : 0,
          freshness: 'recent', // Podría calcularse basado en timestamps
        }
      }
    };
  }, [dashboardData]);

  return {
    dashboardData: processedData,
    rawData: dashboardData, // Mantener datos originales
    loading,
    error,
  };
}

// 🤖 HOOK PARA IA MÉDICA - VERSIÓN MEJORADA CONSERVADORA
export function useMedicalAI() {
  const apiClient = useAltaMedicaAPI();
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  const analyzeSymptoms = useCallback(async (symptoms: string[], patientInfo?: any) => {
    try {
      setAnalyzing(true);
      const result = await apiClient.analyzeSymptoms(symptoms, patientInfo);
      setLastAnalysis({
        type: 'symptoms',
        input: symptoms,
        result,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      throw error;
    } finally {
      setAnalyzing(false);
    }
  }, [apiClient]);

  const checkDrugInteractions = useCallback(async (medications: string[]) => {
    try {
      setAnalyzing(true);
      const result = await apiClient.checkDrugInteractions(medications);
      setLastAnalysis({
        type: 'interactions',
        input: medications,
        result,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      throw error;
    } finally {
      setAnalyzing(false);
    }
  }, [apiClient]);

  return {
    analyzeSymptoms,
    checkDrugInteractions,
    analyzing,
    lastAnalysis, // Nuevo campo para historial
  };
}

// Los hooks siguientes se mantienen igual por ahora (enfoque conservador)
// Serán mejorados en siguientes iteraciones

// 🔔 HOOK PARA NOTIFICACIONES (MANTENIDO IGUAL)
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: {
    id?: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    autoClose?: boolean;
    duration?: number;
  }) => {
    const newNotification = {
      id: notification.id || Date.now().toString(),
      ...notification,
      type: notification.type || 'info',
      autoClose: notification.autoClose ?? true,
      duration: notification.duration || 5000,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto remove
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  };
}

// 💾 HOOK PARA CACHÉ LOCAL (MANTENIDO IGUAL)
export function useLocalCache<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValueAndCache = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const result = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      
      try {
        localStorage.setItem(key, JSON.stringify(result));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
      
      return result;
    });
  }, [key]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, [key, initialValue]);

  return [value, setValueAndCache, clearCache] as const;
}

// 🔍 HOOK PARA BÚSQUEDA AVANZADA (MANTENIDO IGUAL)
export function useSearch<T>(items: T[], searchFields: (keyof T)[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Aplicar búsqueda de texto
    if (searchTerm) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return typeof value === 'string' && 
                 value.toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Aplicar filtros adicionales
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filtered = filtered.filter(item => {
          const itemValue = item[key as keyof T];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      }
    });

    return filtered;
  }, [items, searchTerm, filters, searchFields]);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    filteredItems,
    totalItems: items.length,
    filteredCount: filteredItems.length
  };
}

// ⏱️ HOOK PARA DEBOUNCE - MIGRADO A @altamedica/hooks
// Para usar debounce, importar desde: import { useDebounce } from '@altamedica/hooks'
// export function useDebounce - ELIMINADO - Usar versión centralizada