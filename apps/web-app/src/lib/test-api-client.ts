// Cliente API especial para testing - NO redirige automáticamente al login

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3008'

export class TestAltamedicaAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}/api/v1${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Incluir cookies
      ...options,
    })
    
    if (!response.ok) {
      // NO redirigir automáticamente - solo lanzar error para testing
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
  
  // 🔐 Authentication APIs (usando endpoints de testing)
  auth = {
    login: (data: { email: string; password: string }) => 
      this.request('/auth/test-login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => 
      this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => this.request('/auth/test-me'),
    logout: () => this.request('/auth/logout', { method: 'POST' }),
    refresh: () => this.request('/auth/refresh', { method: 'POST' })
  }
  
  // 👨‍⚕️ Doctors APIs
  doctors = {
    list: (params?: any) => this.request(`/doctors${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/doctors/${id}`),
    create: (data: any) => this.request('/doctors', { method: 'POST', body: JSON.stringify(data) }),
    appointments: (id: string) => this.request(`/doctors/${id}/appointments`),
    availability: (id: string) => this.request(`/doctors/${id}/availability`)
  }
  
  // 👥 Patients APIs
  patients = {
    list: (params?: any) => this.request(`/patients${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/patients/${id}`),
    create: (data: any) => this.request('/patients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    appointments: (id: string) => this.request(`/patients/${id}/appointments`)
  }
  
  // 🏢 Companies APIs
  companies = {
    list: (params?: any) => this.request(`/companies${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/companies/${id}`),
    create: (data: any) => this.request('/companies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  
  // 📅 Appointments APIs
  appointments = {
    list: (params?: any) => this.request(`/appointments${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => this.request(`/appointments/${id}`),
    create: (data: any) => this.request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    cancel: (id: string) => this.request(`/appointments/${id}/cancel`, { method: 'POST' }),
    reschedule: (id: string, data: any) => this.request(`/appointments/${id}/reschedule`, { method: 'POST', body: JSON.stringify(data) })
  }
  
  // 🏥 Health APIs
  health = {
    status: () => this.request('/health'),
    version: () => this.request('/health/version'),
    metrics: () => this.request('/health/metrics')
  }
}

export const testApi = new TestAltamedicaAPI()