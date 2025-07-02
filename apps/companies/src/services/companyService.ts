/**
 * 🌐 ALTAMEDICA COMPANIES - SERVICIO API
 * Servicio para comunicación con backend de empresas
 */
import {
  Company,
  CompanyFilters,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyDoctor,
  JobOffer,
  JobApplication,
  CompanyAnalytics,
  APIResponse,
  PaginatedResponse
} from '@/types'

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Utilidad para requests con tipos
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

export const companyService = {
  // =====================================
  // GESTIÓN DE EMPRESAS
  // =====================================

  async getCompanies(filters?: CompanyFilters): Promise<PaginatedResponse<Company[]>> {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }
    
    const endpoint = `/companies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiRequest<Company[]>(endpoint)
  },

  async getCompany(id: string): Promise<APIResponse<Company>> {
    return apiRequest<Company>(`/companies/${id}`)
  },

  async createCompany(data: CreateCompanyData): Promise<APIResponse<Company>> {
    return apiRequest<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateCompany(id: string, data: UpdateCompanyData): Promise<APIResponse<Company>> {
    return apiRequest<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteCompany(id: string): Promise<APIResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/companies/${id}`, {
      method: 'DELETE',
    })
  },

  // =====================================
  // GESTIÓN DE DOCTORES
  // =====================================

  async getCompanyDoctors(companyId: string): Promise<APIResponse<CompanyDoctor[]>> {
    return apiRequest<CompanyDoctor[]>(`/companies/${companyId}/doctors`)
  },

  async addDoctorToCompany(
    companyId: string,
    doctorData: Partial<CompanyDoctor>
  ): Promise<APIResponse<CompanyDoctor>> {
    return apiRequest<CompanyDoctor>(`/companies/${companyId}/doctors`, {
      method: 'POST',
      body: JSON.stringify(doctorData),
    })
  },

  async removeDoctorFromCompany(
    companyId: string,
    doctorId: string
  ): Promise<APIResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/companies/${companyId}/doctors/${doctorId}`, {
      method: 'DELETE',
    })
  },

  async updateDoctorInCompany(
    companyId: string,
    doctorId: string,
    data: Partial<CompanyDoctor>
  ): Promise<APIResponse<CompanyDoctor>> {
    return apiRequest<CompanyDoctor>(`/companies/${companyId}/doctors/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // =====================================
  // GESTIÓN DE OFERTAS DE TRABAJO
  // =====================================

  async getJobOffers(companyId?: string): Promise<APIResponse<JobOffer[]>> {
    const endpoint = companyId ? `/companies/${companyId}/job-offers` : '/job-offers'
    return apiRequest<JobOffer[]>(endpoint)
  },

  async getJobOffer(id: string): Promise<APIResponse<JobOffer>> {
    return apiRequest<JobOffer>(`/job-offers/${id}`)
  },

  async createJobOffer(data: Partial<JobOffer>): Promise<APIResponse<JobOffer>> {
    return apiRequest<JobOffer>('/job-offers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateJobOffer(id: string, data: Partial<JobOffer>): Promise<APIResponse<JobOffer>> {
    return apiRequest<JobOffer>(`/job-offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteJobOffer(id: string): Promise<APIResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/job-offers/${id}`, {
      method: 'DELETE',
    })
  },

  // =====================================
  // GESTIÓN DE APLICACIONES
  // =====================================

  async getJobApplications(jobOfferId?: string): Promise<APIResponse<JobApplication[]>> {
    const endpoint = jobOfferId ? `/job-offers/${jobOfferId}/applications` : '/job-applications'
    return apiRequest<JobApplication[]>(endpoint)
  },

  async updateApplicationStatus(
    applicationId: string,
    status: string
  ): Promise<APIResponse<JobApplication>> {
    return apiRequest<JobApplication>(`/job-applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  // =====================================
  // ANALÍTICAS Y REPORTES
  // =====================================

  async getCompanyAnalytics(
    companyId: string,
    period: string = 'monthly'
  ): Promise<APIResponse<CompanyAnalytics>> {
    return apiRequest<CompanyAnalytics>(`/companies/${companyId}/analytics?period=${period}`)
  },

  async getCompanyStats(): Promise<APIResponse<{
    totalCompanies: number
    totalDoctors: number
    totalJobOffers: number
    totalApplications: number
    averageRating: number
    topSpecialties: string[]
    companiesByType: Record<string, number>
    companiesByRegion: Record<string, number>
  }>> {
    return apiRequest('/companies/stats')
  },

  // =====================================
  // BÚSQUEDA Y UBICACIÓN
  // =====================================

  async getNearbyCompanies(
    latitude: number,
    longitude: number,
    radius: number = 50
  ): Promise<APIResponse<Company[]>> {
    return apiRequest<Company[]>(
      `/companies/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
    )
  },

  async searchCompanies(query: string): Promise<APIResponse<Company[]>> {
    return apiRequest<Company[]>(`/companies/search?q=${encodeURIComponent(query)}`)
  },

  // =====================================
  // FAVORITOS Y PREFERENCIAS
  // =====================================

  async getFavoriteCompanies(): Promise<APIResponse<Company[]>> {
    return apiRequest<Company[]>('/companies/favorites')
  },

  async toggleFavoriteCompany(companyId: string): Promise<APIResponse<{ isFavorite: boolean }>> {
    return apiRequest<{ isFavorite: boolean }>(`/companies/${companyId}/favorite`, {
      method: 'POST',
    })
  },

  // =====================================
  // PERMISOS Y AUTENTICACIÓN
  // =====================================

  async getCompanyPermissions(companyId: string): Promise<APIResponse<{
    canEdit: boolean
    canDelete: boolean
    canManageDoctors: boolean
    canManageJobOffers: boolean
    canViewAnalytics: boolean
    role: string
  }>> {
    return apiRequest(`/companies/${companyId}/permissions`)
  },

  // =====================================
  // CARGA DE ARCHIVOS
  // =====================================

  async uploadCompanyLogo(companyId: string, file: File): Promise<APIResponse<{ logoUrl: string }>> {
    const formData = new FormData()
    formData.append('logo', file)

    return apiRequest<{ logoUrl: string }>(`/companies/${companyId}/logo`, {
      method: 'POST',
      body: formData,
      headers: {}, // Dejar que el browser establezca el Content-Type para FormData
    })
  },

  async uploadCompanyImages(
    companyId: string,
    files: File[]
  ): Promise<APIResponse<{ imageUrls: string[] }>> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`image_${index}`, file)
    })

    return apiRequest<{ imageUrls: string[] }>(`/companies/${companyId}/images`, {
      method: 'POST',
      body: formData,
      headers: {},
    })
  },

  // =====================================
  // VERIFICACIÓN Y VALIDACIÓN
  // =====================================

  async verifyCompany(companyId: string): Promise<APIResponse<{ isVerified: boolean }>> {
    return apiRequest<{ isVerified: boolean }>(`/companies/${companyId}/verify`, {
      method: 'POST',
    })
  },

  async validateCompanyData(data: CreateCompanyData | UpdateCompanyData): Promise<APIResponse<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }>> {
    return apiRequest('/companies/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // =====================================
  // INTEGRACIONES EXTERNAS
  // =====================================

  async syncWithExternalSystem(
    companyId: string,
    system: string
  ): Promise<APIResponse<{ success: boolean; lastSync: Date }>> {
    return apiRequest<{ success: boolean; lastSync: Date }>(
      `/companies/${companyId}/sync/${system}`,
      { method: 'POST' }
    )
  },

  async getExternalSystemStatus(companyId: string): Promise<APIResponse<{
    systems: Array<{
      name: string
      connected: boolean
      lastSync: Date | null
      error?: string
    }>
  }>> {
    return apiRequest(`/companies/${companyId}/integrations/status`)
  },

  // =====================================
  // REPORTES Y EXPORTACIÓN
  // =====================================

  async exportCompanyData(
    companyId: string,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/companies/${companyId}/export?format=${format}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`)
    }

    return response.blob()
  },

  async generateCompanyReport(
    companyId: string,
    reportType: 'analytics' | 'performance' | 'financial'
  ): Promise<APIResponse<{ reportUrl: string; expiresAt: Date }>> {
    return apiRequest<{ reportUrl: string; expiresAt: Date }>(
      `/companies/${companyId}/reports/${reportType}`,
      { method: 'POST' }
    )
  }
}

// =====================================
// HOOKS DE UTILIDAD PARA SSR/SSG
// =====================================

export const companySSRUtils = {
  async getServerSideCompanies(filters?: CompanyFilters) {
    try {
      return await companyService.getCompanies(filters)
    } catch (error) {
      console.error('SSR: Error fetching companies:', error)
      return { data: [], pagination: { page: 1, limit: 20, total: 0 } }
    }
  },

  async getServerSideCompany(id: string) {
    try {
      return await companyService.getCompany(id)
    } catch (error) {
      console.error('SSR: Error fetching company:', error)
      return null
    }
  }
}

export default companyService
