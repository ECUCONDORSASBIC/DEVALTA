/**
 * 🏥 ALTAMEDICA API CLIENT
 * Cliente API TypeScript para conectar frontend con 47 endpoints backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

class AltamedicaAPIClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Obtener token de autenticación (Firebase Auth)
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('authToken') 
      : null

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    return response.json()
  }

  // 🔐 AUTHENTICATION ENDPOINTS
  auth = {
    login: (idToken: string) => 
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ idToken })
      }),
    
    me: () => this.request('/auth/me'),
    
    logout: () => 
      this.request('/auth/logout', { method: 'POST' }),
    
    refresh: () => 
      this.request('/auth/refresh', { method: 'POST' })
  }

  // 👥 PATIENTS ENDPOINTS
  patients = {
    list: (params?: { 
      page?: number; 
      limit?: number; 
      search?: string;
      companyId?: string;
    }) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : ''
      return this.request(`/patients${query}`)
    },
    
    get: (id: string) => this.request(`/patients/${id}`),
    
    create: (data: any) =>
      this.request('/patients', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    update: (id: string, data: any) =>
      this.request(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    
    delete: (id: string) =>
      this.request(`/patients/${id}`, { method: 'DELETE' }),

    appointments: (id: string) =>
      this.request(`/patients/${id}/appointments`)
  }

  // 👨‍⚕️ DOCTORS ENDPOINTS  
  doctors = {
    list: (params?: {
      page?: number;
      limit?: number;
      specialization?: string;
      location?: string;
    }) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : ''
      return this.request(`/doctors${query}`)
    },
    
    get: (id: string) => this.request(`/doctors/${id}`),
    
    create: (data: any) =>
      this.request('/doctors', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    update: (id: string, data: any) =>
      this.request(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    appointments: (id: string) =>
      this.request(`/doctors/${id}/appointments`),
    
    availability: (id: string) =>
      this.request(`/doctors/${id}/availability`)
  }

  // 📅 APPOINTMENTS ENDPOINTS
  appointments = {
    list: (params?: {
      patientId?: string;
      doctorId?: string;
      status?: string;
      date?: string;
    }) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : ''
      return this.request(`/appointments${query}`)
    },
    
    get: (id: string) => this.request(`/appointments/${id}`),
    
    create: (data: any) =>
      this.request('/appointments', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    update: (id: string, data: any) =>
      this.request(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    
    cancel: (id: string) =>
      this.request(`/appointments/${id}/cancel`, { method: 'POST' })
  }

  // 💊 PRESCRIPTIONS ENDPOINTS
  prescriptions = {
    list: (params?: { patientId?: string; doctorId?: string }) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : ''
      return this.request(`/prescriptions${query}`)
    },
    
    get: (id: string) => this.request(`/prescriptions/${id}`),
    
    create: (data: any) =>
      this.request('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    update: (id: string, data: any) =>
      this.request(`/prescriptions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  }

  // 📋 MEDICAL RECORDS ENDPOINTS
  medicalRecords = {
    list: (patientId?: string) => {
      const query = patientId ? `?patientId=${patientId}` : ''
      return this.request(`/medical-records${query}`)
    },
    
    get: (id: string) => this.request(`/medical-records/${id}`),
    
    create: (data: any) =>
      this.request('/medical-records', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    update: (id: string, data: any) =>
      this.request(`/medical-records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  }

  // 🏢 COMPANIES ENDPOINTS
  companies = {
    list: () => this.request('/companies'),
    get: (id: string) => this.request(`/companies/${id}`),
    create: (data: any) =>
      this.request('/companies', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }

  // 💬 MESSAGES ENDPOINTS
  messages = {
    list: (params?: { conversationId?: string }) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : ''
      return this.request(`/messages${query}`)
    },
    
    send: (data: any) =>
      this.request('/messages', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }

  // 🤖 AI ENDPOINTS
  ai = {
    riskAssessment: (data: any) =>
      this.request('/ai/risk-assessment', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }

  // 📍 LOCATIONS ENDPOINTS
  locations = {
    medical: () => this.request('/medical-locations')
  }

  // ❤️ HEALTH CHECK
  health = {
    check: () => this.request('/health')
  }
}

// Singleton instance
export const api = new AltamedicaAPIClient()
