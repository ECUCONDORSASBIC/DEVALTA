// 🌉 Base Hook para AltaMedica API Bridge
// Centralizado desde apps individuales

import { useState, useCallback } from 'react';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ✨ Hook base para comunicación con API Server
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

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  return {
    loading,
    error,
    makeRequest
  };
}