// 🏥 SERVICIO API BASE ROBUSTO ALTAMEDICA
// Arquitectura empresarial con manejo avanzado de errores y configuración
// CONSERVADOR: Mantiene compatibilidad, agrega robustez gradualmente

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  requiresAuth?: boolean;
}

// 🔧 CONFIGURACIÓN EMPRESARIAL
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000, // 30 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo
  enableLogging: process.env.NODE_ENV === 'development'
};

// 🛡️ CLASE BASE ROBUSTA
export class ApiService {
  private config: ApiConfig;
  private baseURL: string;
  private token: string | null = null;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseURL = `${this.config.baseURL}/api/v1`;
    this.loadToken();
  }

  // 🔐 GESTIÓN DE TOKEN SEGURA
  private loadToken(): void {
    try {
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('altamedica_token') || 
                     sessionStorage.getItem('altamedica_token');
      }
    } catch (error) {
      this.log('Error loading token:', error);
    }
  }

  public setToken(token: string, persist: boolean = true): void {
    this.token = token;
    try {
      if (typeof window !== 'undefined') {
        if (persist) {
          localStorage.setItem('altamedica_token', token);
        } else {
          sessionStorage.setItem('altamedica_token', token);
        }
      }
    } catch (error) {
      this.log('Error saving token:', error);
    }
  }

  public clearToken(): void {
    this.token = null;
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('altamedica_token');
        sessionStorage.removeItem('altamedica_token');
      }
    } catch (error) {
      this.log('Error clearing token:', error);
    }
  }

  // 📋 CONSTRUCCIÓN DE HEADERS ROBUSTA
  private buildHeaders(config: RequestConfig = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers
    };

    // Agregar token de autenticación si está disponible y es requerido
    if (config.requiresAuth !== false && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // 📝 LOGGING INTELIGENTE
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[ApiService] ${message}`, ...args);
    }
  }

  // ⏱️ MANEJO DE TIMEOUT ROBUSTO
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  // 🔄 SISTEMA DE RETRY INTELIGENTE
  private async withRetry<T>(
    operation: () => Promise<T>,
    attempts: number = this.config.retryAttempts
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        this.log(`Attempt ${i + 1} failed:`, error);
        
        // No reintentar en errores de cliente (4xx)
        if (error instanceof Error && error.message.includes('4')) {
          throw error;
        }

        // Último intento, propagar error
        if (i === attempts - 1) {
          throw error;
        }

        // Esperar antes del siguiente intento
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * (i + 1))
        );
      }
    }
    
    throw new Error('Max retry attempts exceeded');
  }

  // 🚀 MÉTODO PRINCIPAL DE REQUEST
  private async request<T>(
    endpoint: string,
    options: RequestInit & RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = options.timeout || this.config.timeout;
    
    const requestConfig: RequestInit = {
      ...options,
      headers: this.buildHeaders(options),
    };

    this.log(`${options.method || 'GET'} ${url}`, requestConfig);

    return this.withRetry(async () => {
      const fetchPromise = fetch(url, requestConfig);
      const timeoutPromise = this.createTimeoutPromise(timeout);

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw this.createApiError(errorData, response.status);
      }

      return this.parseSuccessResponse<T>(response);
    }, options.retryAttempts);
  }

  // 🔍 PARSEO DE RESPUESTAS EXITOSAS
  private async parseSuccessResponse<T>(response: Response): Promise<T> {
    try {
      const text = await response.text();
      
      // Manejar respuestas vacías
      if (!text) {
        return {} as T;
      }

      const data = JSON.parse(text);
      this.log('Response data:', data);
      
      return data;
    } catch (error) {
      this.log('Error parsing response:', error);
      throw new Error('Invalid JSON response from server');
    }
  }

  // ⚠️ PARSEO DE ERRORES ROBUSTO
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      const text = await response.text();
      if (!text) {
        return { message: response.statusText || 'Unknown error' };
      }
      
      return JSON.parse(text);
    } catch (error) {
      return { message: response.statusText || 'Unknown error' };
    }
  }

  // 🏗️ CREACIÓN DE ERRORES ESTRUCTURADOS
  private createApiError(errorData: any, status: number): ApiError {
    const apiError: ApiError = {
      message: errorData.message || errorData.error || 'Unknown API error',
      status,
      code: errorData.code,
      details: errorData.details,
      timestamp: new Date().toISOString()
    };

    this.log('API Error:', apiError);
    return apiError;
  }

  // 📡 MÉTODOS HTTP PRINCIPALES
  public async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { 
      method: 'GET', 
      ...config 
    });
  }

  public async post<T>(
    endpoint: string, 
    data?: any, 
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config
    });
  }

  public async put<T>(
    endpoint: string, 
    data?: any, 
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config
    });
  }

  public async patch<T>(
    endpoint: string, 
    data?: any, 
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...config
    });
  }

  public async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...config
    });
  }

  // 🔧 MÉTODOS DE CONFIGURACIÓN
  public updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.baseURL = `${this.config.baseURL}/api/v1`;
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  // 🔍 MÉTODO DE DIAGNÓSTICO
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.get<{ status: string }>('/health');
      return {
        status: response.status || 'ok',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.log('Health check failed:', error);
      throw error;
    }
  }
}

// 🎯 INSTANCIA SINGLETON
export const apiService = new ApiService();

export default ApiService;