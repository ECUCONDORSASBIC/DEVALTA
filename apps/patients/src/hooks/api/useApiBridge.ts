// 🌉 Base Hook para AltaMedica API Bridge
// Auto-generado - NO editar manualmente

import { useState, useEffect, useCallback } from 'react';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  url?: string;
}

export interface UseApiOptions {
  immediate?: boolean;
  token?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const BRIDGE_URL = 'http://localhost:9000';

// ✨ Hook base para comunicación con API Bridge
export function useApiBridge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async (
    endpoint: string,
    options: {
      method?: string;
      data?: any;
      token?: string;
    } = {}
  ): Promise<ApiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
      }

      const response = await fetch(`${BRIDGE_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.data ? JSON.stringify(options.data) : undefined,
      });

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        setError(result.error || 'Error desconocido');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        status: 500
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const proxyRequest = useCallback(async (
    service: string,
    endpoint: string,
    options: {
      method?: string;
      data?: any;
      token?: string;
    } = {}
  ): Promise<ApiResponse> => {
    return makeRequest('/proxy', {
      method: 'POST',
      data: {
        service,
        endpoint,
        method: options.method || 'GET',
        data: options.data
      },
      token: options.token
    });
  }, [makeRequest]);

  return {
    loading,
    error,
    makeRequest,
    proxyRequest
  };
}

// 🏥 Hook para verificar salud de servicios
export function useServiceHealth() {
  const [services, setServices] = useState<any>(null);
  const [healthyCount, setHealthyCount] = useState(0);
  const { makeRequest, loading, error } = useApiBridge();

  const checkHealth = useCallback(async () => {
    const result = await makeRequest('/health');
    if (result.success) {
      setServices(result.data.services);
      setHealthyCount(result.data.healthy_count);
    }
  }, [makeRequest]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    services,
    healthyCount,
    loading,
    error,
    refresh: checkHealth
  };
}
