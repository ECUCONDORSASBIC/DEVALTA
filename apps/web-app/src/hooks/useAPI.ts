import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 🔗 API Base URL
const API_BASE_URL = 'http://localhost:3001/api/v1'

// 🛡️ API Client con manejo de errores
class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Manejar rate limiting
      if (response.status === 429) {
        const rateLimitData = await response.json()
        throw new Error(`Rate limit excedido. Intenta en ${rateLimitData.retryAfter} segundos.`)
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión con el servidor')
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options })
  }
}

const apiClient = new APIClient(API_BASE_URL)

// 📊 HOOKS PARA DASHBOARD

// Hook para obtener estadísticas del dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => apiClient.get('/dashboard'),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  })
}

// Hook para obtener métricas del día
export function useDailyMetrics() {
  return useQuery({
    queryKey: ['dailyMetrics'],
    queryFn: () => apiClient.get('/metrics'),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30000, // Auto-refresh cada 30 segundos
  })
}

// 👥 HOOKS PARA PACIENTES

// Hook para obtener lista de pacientes
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.get('/patients'),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para obtener paciente específico
export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => apiClient.get(`/patients/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// 👨‍⚕️ HOOKS PARA DOCTORES

// Hook para obtener lista de doctores
export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => apiClient.get('/doctors'),
    staleTime: 15 * 60 * 1000, // 15 minutos
  })
}

// Hook para obtener doctor específico
export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctors', id],
    queryFn: () => apiClient.get(`/doctors/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// 📅 HOOKS PARA CITAS

// Hook para obtener citas
export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => apiClient.get('/appointments'),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 60000, // Auto-refresh cada minuto
  })
}

// Hook para crear nueva cita
export function useCreateAppointment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (appointmentData: any) => 
      apiClient.post('/appointments', appointmentData),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

// 💊 HOOKS PARA PRESCRIPCIONES

// Hook para obtener prescripciones
export function usePrescriptions() {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => apiClient.get('/prescriptions'),
    staleTime: 10 * 60 * 1000,
  })
}

// Hook para crear prescripción
export function useCreatePrescription() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (prescriptionData: any) =>
      apiClient.post('/prescriptions', prescriptionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}

// 🔐 HOOKS PARA AUTENTICACIÓN

// Hook para login
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: { idToken: string }) =>
      apiClient.post('/auth/login', credentials),
  })
}

// Hook para registro
export function useRegister() {
  return useMutation({
    mutationFn: (userData: any) =>
      apiClient.post('/auth/register', userData),
  })
}

// Hook para obtener información del usuario actual
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.get('/auth/me'),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: false, // No reintentar si no está autenticado
  })
}

// 📊 HOOKS PARA ANALYTICS

// Hook para obtener analytics personalizados
export function useAnalytics(period: string = 'week') {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => apiClient.get(`/analytics/custom-reports?period=${period}`),
    staleTime: 10 * 60 * 1000,
  })
}

// 🤖 HOOKS PARA IA

// Hook para análisis de síntomas
export function useSymptomAnalysis() {
  return useMutation({
    mutationFn: (symptoms: any) =>
      apiClient.post('/ai/analyze-symptoms', symptoms),
  })
}

// Hook para soporte de diagnóstico
export function useDiagnosisSupport() {
  return useMutation({
    mutationFn: (diagnosticData: any) =>
      apiClient.post('/ai/diagnosis-support', diagnosticData),
  })
}

// 🏥 HOOKS PARA COMPANIES

// Hook para obtener información de la empresa
export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.get('/companies'),
    staleTime: 15 * 60 * 1000,
  })
}

// 🔍 HOOK GENÉRICO PARA BÚSQUEDA

// Hook para búsqueda global
export function useSearch(query: string, type?: string) {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => {
      const params = new URLSearchParams()
      params.append('q', query)
      if (type) params.append('type', type)
      return apiClient.get(`/search?${params.toString()}`)
    },
    enabled: query.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 5 * 60 * 1000,
  })
}

// 💡 HOOK PARA HEALTH CHECK

// Hook para verificar estado de la API
export function useHealthCheck() {
  return useQuery({
    queryKey: ['healthCheck'],
    queryFn: () => apiClient.get('/health'),
    refetchInterval: 30000, // Verificar cada 30 segundos
    staleTime: 0, // Siempre fresh
    retry: false,
  })
}

// Export del cliente para uso directo si es necesario
export { apiClient }