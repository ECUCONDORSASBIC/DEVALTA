// 👨‍⚕️ Hook para Gestión de Doctores
// Auto-generado - Conecta con API real sin mocks

import { useState, useEffect, useCallback } from 'react';
import { useApiBridge, ApiResponse, UseApiOptions } from './useApiBridge';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  phone?: string;
  schedule?: any[];
  reviews?: any[];
}

export function useDoctors(options: UseApiOptions = {}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { makeRequest, loading, error } = useApiBridge();

  const fetchDoctors = useCallback(async () => {
    const result = await makeRequest('/api/doctors', {
      token: options.token
    });
    
    if (result.success) {
      setDoctors(result.data || []);
      options.onSuccess?.(result.data);
    } else {
      options.onError?.(result.error || 'Error al cargar doctores');
    }
    
    return result;
  }, [makeRequest, options]);

  const getDoctorById = useCallback(async (id: string) => {
    const result = await makeRequest(`/api/doctors/${id}`, {
      token: options.token
    });
    
    return result;
  }, [makeRequest, options.token]);

  const searchDoctors = useCallback(async (filters: {
    specialty?: string;
    location?: string;
    available?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.location) params.append('location', filters.location);
    if (filters.available) params.append('available', 'true');

    const result = await makeRequest(`/api/doctors/search?${params.toString()}`, {
      token: options.token
    });
    
    return result;
  }, [makeRequest, options.token]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchDoctors();
    }
  }, [fetchDoctors, options.immediate]);

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    getDoctorById,
    searchDoctors,
    refresh: fetchDoctors
  };
}
