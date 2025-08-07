import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false
        return failureCount < 2
      }
    }
  }
})

// Usar la variable de entorno correcta y consistente
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export class AltamedicaAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // CRÍTICO: No usar localStorage para tokens - vulnerabilidad XSS
    // Las cookies HttpOnly son manejadas automáticamente por el navegador
    
    const response = await fetch(`${API_BASE}/api/v1${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // CRÍTICO: Incluir cookies en todas las peticiones
      ...options,
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        // Redirigir al login en caso de no autorizado
        if (typeof window !== 'undefined') {
          // No necesitamos limpiar localStorage ya que usamos cookies HttpOnly
          window.location.href = '/login'
        }
      }
      
      // Intentar obtener mensaje de error del servidor
      let errorMessage = `API Error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      
      throw new Error(errorMessage)
    }
    
    return response.json()
  }
  
  // 🔐 Authentication APIs (5 endpoints)
  auth = {
    login: (data: { email: string; password: string }) => 
      this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => 
      this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => this.request('/auth/me'),
    logout: () => this.request('/auth/logout', { method: 'POST' }),
    refresh: () => this.request('/auth/refresh', { method: 'POST' })
  }
  
  // 👥 Patients APIs (5 endpoints)
  patients = {
    list: (params?: any) => this.request(`/patients${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/patients/${id}`),
    create: (data: any) => this.request('/patients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    appointments: (id: string) => this.request(`/patients/${id}/appointments`)
  }
  
  // 👨‍⚕️ Doctors APIs (5 endpoints)
  doctors = {
    list: (params?: any) => this.request(`/doctors${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/doctors/${id}`),
    create: (data: any) => this.request('/doctors', { method: 'POST', body: JSON.stringify(data) }),
    appointments: (id: string) => this.request(`/doctors/${id}/appointments`),
    availability: (id: string) => this.request(`/doctors/${id}/availability`)
  }
  
  // 📅 Appointments APIs (6 endpoints)
  appointments = {
    list: (params?: any) => this.request(`/appointments${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/appointments/${id}`),
    create: (data: any) => this.request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    cancel: (id: string) => this.request(`/appointments/${id}/cancel`, { method: 'POST' }),
    reschedule: (id: string, data: any) => this.request(`/appointments/${id}/reschedule`, { method: 'POST', body: JSON.stringify(data) })
  }
  
  // 💊 Prescriptions APIs (3 endpoints)
  prescriptions = {
    list: (params?: any) => this.request(`/prescriptions${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/prescriptions/${id}`),
    create: (data: any) => this.request('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  
  // 📋 Medical Records APIs (3 endpoints)
  medicalRecords = {
    list: (params?: any) => this.request(`/medical-records${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/medical-records/${id}`),
    create: (data: any) => this.request('/medical-records', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/medical-records/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  
  // 🏢 Companies APIs (3 endpoints)
  companies = {
    list: (params?: any) => this.request(`/companies${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/companies/${id}`),
    create: (data: any) => this.request('/companies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  
  // 💼 Job Listings APIs (3 endpoints)
  jobs = {
    list: (params?: any) => this.request(`/job-listings${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/job-listings/${id}`),
    create: (data: any) => this.request('/job-listings', { method: 'POST', body: JSON.stringify(data) }),
    applications: {
      list: (params?: any) => this.request(`/applications${params ? '?' + new URLSearchParams(params) : ''}`),
      create: (data: any) => this.request('/applications', { method: 'POST', body: JSON.stringify(data) }),
      get: (id: string) => this.request(`/applications/${id}`)
    }
  }
  
  // 💬 Messages APIs (2 endpoints)
  messages = {
    list: (params?: any) => this.request(`/messages${params ? '?' + new URLSearchParams(params) : ''}`),
    send: (data: any) => this.request('/messages', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => this.request(`/messages/${id}`)
  }
  
  // 🤖 AI APIs (1 endpoint)
  ai = {
    riskAssessment: (data: any) => this.request('/ai/risk-assessment', { method: 'POST', body: JSON.stringify(data) }),
    diagnosis: (data: any) => this.request('/ai/diagnosis', { method: 'POST', body: JSON.stringify(data) }),
    recommendations: (patientId: string) => this.request(`/ai/recommendations/${patientId}`)
  }
  
  // 📍 Location APIs (1 endpoint)
  locations = {
    medical: (params?: any) => this.request(`/medical-locations${params ? '?' + new URLSearchParams(params) : ''}`),
    nearby: (lat: number, lon: number, radius?: number) => 
      this.request(`/medical-locations/nearby?lat=${lat}&lon=${lon}&radius=${radius || 10}`)
  }
  
  // 🏥 Health APIs (1 endpoint)
  health = {
    status: () => this.request('/health'),
    version: () => this.request('/health/version'),
    metrics: () => this.request('/health/metrics')
  }
  
  // 📊 Analytics APIs (additional endpoints for medical analytics)
  analytics = {
    patientStats: (params?: any) => this.request(`/analytics/patients${params ? '?' + new URLSearchParams(params) : ''}`),
    appointmentStats: (params?: any) => this.request(`/analytics/appointments${params ? '?' + new URLSearchParams(params) : ''}`),
    revenue: (params?: any) => this.request(`/analytics/revenue${params ? '?' + new URLSearchParams(params) : ''}`)
  }
  
  // 🔔 Notifications APIs
  notifications = {
    list: (params?: any) => this.request(`/notifications${params ? '?' + new URLSearchParams(params) : ''}`),
    markRead: (id: string) => this.request(`/notifications/${id}/read`, { method: 'POST' }),
    preferences: () => this.request('/notifications/preferences'),
    updatePreferences: (data: any) => this.request('/notifications/preferences', { method: 'PUT', body: JSON.stringify(data) })
  }
}

export const api = new AltamedicaAPI()

// Helper para obtener token de autenticación
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

// Helper para verificar si está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Tipos TypeScript para las APIs
export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  address: string
  insuranceProvider?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory?: string[]
  allergies?: string[]
  currentMedications?: string[]
}

export interface Doctor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialization: string
  licenseNumber: string
  experience: number
  rating: number
  availability: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
  consultationFee: number
  languages: string[]
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  dateTime: string
  duration: number
  type: 'consultation' | 'follow-up' | 'emergency' | 'video-call'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  symptoms?: string[]
  diagnosis?: string
  prescription?: string[]
}

export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  appointmentId?: string
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }[]
  issuedDate: string
  validUntil: string
  status: 'active' | 'completed' | 'cancelled'
}
