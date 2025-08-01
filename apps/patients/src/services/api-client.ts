/**
 * Cliente API para integración con Backend Dockerizado de Altamedica
 * Conecta el frontend con el API server en Docker (localhost:3001)
 */

import { API_CONFIG, buildApiUrl, getDefaultHeaders, API_TIMEOUT, API_RETRY_CONFIG } from '../config/api';
import { authService } from './auth-service';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  /**
   * Realizar petición HTTP con manejo de errores y reintentos
   */
  private async makeRequest<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      timeout = API_TIMEOUT,
      retries = API_RETRY_CONFIG.maxRetries,
      requireAuth = true
    } = config;

    let { headers = {} } = config;

    // Agregar token de autenticación si es requerido
    if (requireAuth) {
      const token = await authService.getToken();
      if (token) {
        headers = { ...headers, ...getDefaultHeaders(token) };
      } else {
        return {
          success: false,
          error: 'Token de autenticación requerido',
          status: 401
        };
      }
    } else {
      headers = { ...headers, ...getDefaultHeaders() };
    }

    const url = buildApiUrl(endpoint);
    
    // Configurar opciones de fetch
    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout)
    };

    // Agregar body si es necesario
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        fetchOptions.body = body;
        // No establecer Content-Type para FormData, el navegador lo hará automáticamente
        delete headers['Content-Type'];
      } else {
        fetchOptions.body = JSON.stringify(body);
      }
    }

    // Implementar lógica de reintentos
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 API Request: ${method} ${url} (attempt ${attempt + 1}/${retries + 1})`);
        
        const response = await fetch(url, fetchOptions);
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          // Intentar parsear el error del servidor
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }

          return {
            success: false,
            error: errorMessage,
            status: response.status
          };
        }

        // Parsear la respuesta
        let data: T;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text() as any;
        }

        console.log(`✅ API Success: ${method} ${url}`, data);

        return {
          success: true,
          data,
          status: response.status
        };

      } catch (error: any) {
        lastError = error;
        console.error(`❌ API Error (attempt ${attempt + 1}):`, error);

        // Si es el último intento, no esperar
        if (attempt === retries) break;
        
        // Esperar antes del siguiente intento
        const delay = API_RETRY_CONFIG.retryDelay * Math.pow(API_RETRY_CONFIG.backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    return {
      success: false,
      error: lastError?.message || 'Error de conexión con el servidor',
      status: 0
    };
  }

  /**
   * Realizar petición GET
   */
  async get<T>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * Realizar petición POST
   */
  async post<T>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * Realizar petición PUT
   */
  async put<T>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * Realizar petición DELETE
   */
  async delete<T>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Realizar petición PATCH
   */
  async patch<T>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  /**
   * Verificar conectividad con el backend
   */
  async checkHealth(): Promise<ApiResponse<any>> {
    return this.get('/api/health', { requireAuth: false });
  }

  /**
   * Verificar estado del backend dockerizado
   */
  async getServerStatus(): Promise<ApiResponse<any>> {
    return this.get('/api/metrics', { requireAuth: false });
  }
}

// Singleton del cliente API
export const apiClient = new ApiClient();

// Exportar como default también
export default apiClient;