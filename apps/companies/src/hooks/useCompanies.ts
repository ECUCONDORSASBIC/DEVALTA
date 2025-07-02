/**
 * 🏢 ALTAMEDICA COMPANIES - HOOKS DE GESTIÓN
 * Hooks personalizados para el manejo de estado de empresas
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
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
import { companyService } from '@/services/companyService'

// =====================================
// HOOKS DE EMPRESAS
// =====================================

export function useCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => companyService.getCompanies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getCompany(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCompanyData) => companyService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) =>
      companyService.updateCompany(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['company', id] })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => companyService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

// =====================================
// HOOKS DE DOCTORES EN EMPRESAS
// =====================================

export function useCompanyDoctors(companyId: string) {
  return useQuery({
    queryKey: ['company-doctors', companyId],
    queryFn: () => companyService.getCompanyDoctors(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAddDoctorToCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ companyId, doctorData }: { companyId: string; doctorData: Partial<CompanyDoctor> }) =>
      companyService.addDoctorToCompany(companyId, doctorData),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['company-doctors', companyId] })
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
    },
  })
}

export function useRemoveDoctorFromCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ companyId, doctorId }: { companyId: string; doctorId: string }) =>
      companyService.removeDoctorFromCompany(companyId, doctorId),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['company-doctors', companyId] })
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
    },
  })
}

// =====================================
// HOOKS DE OFERTAS DE TRABAJO
// =====================================

export function useJobOffers(companyId?: string) {
  return useQuery({
    queryKey: ['job-offers', companyId],
    queryFn: () => companyService.getJobOffers(companyId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useJobOffer(id: string) {
  return useQuery({
    queryKey: ['job-offer', id],
    queryFn: () => companyService.getJobOffer(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateJobOffer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<JobOffer>) => companyService.createJobOffer(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] })
      if (data.companyId) {
        queryClient.invalidateQueries({ queryKey: ['job-offers', data.companyId] })
      }
    },
  })
}

export function useUpdateJobOffer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobOffer> }) =>
      companyService.updateJobOffer(id, data),
    onSuccess: (result, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] })
      queryClient.invalidateQueries({ queryKey: ['job-offer', id] })
      if (data.companyId) {
        queryClient.invalidateQueries({ queryKey: ['job-offers', data.companyId] })
      }
    },
  })
}

// =====================================
// HOOKS DE APLICACIONES
// =====================================

export function useJobApplications(jobOfferId?: string) {
  return useQuery({
    queryKey: ['job-applications', jobOfferId],
    queryFn: () => companyService.getJobApplications(jobOfferId),
    enabled: !!jobOfferId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      companyService.updateApplicationStatus(applicationId, status),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
    },
  })
}

// =====================================
// HOOKS DE ANALÍTICAS
// =====================================

export function useCompanyAnalytics(companyId: string, period: string = 'monthly') {
  return useQuery({
    queryKey: ['company-analytics', companyId, period],
    queryFn: () => companyService.getCompanyAnalytics(companyId, period),
    enabled: !!companyId,
    staleTime: 15 * 60 * 1000, // 15 minutos
  })
}

// =====================================
// HOOKS DE BÚSQUEDA Y FILTROS
// =====================================

export function useCompanySearch() {
  const [filters, setFilters] = useState<CompanyFilters>({})
  const [debouncedFilters, setDebouncedFilters] = useState<CompanyFilters>({})

  // Debounce para búsquedas
  const updateFilters = useCallback((newFilters: Partial<CompanyFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Debounce de 500ms para la búsqueda
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(updatedFilters)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [filters])

  const {
    data: companies,
    isLoading,
    error,
    refetch
  } = useCompanies(debouncedFilters)

  return {
    companies,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch,
    clearFilters: () => {
      setFilters({})
      setDebouncedFilters({})
    }
  }
}

// =====================================
// HOOKS DE UBICACIÓN Y MAPAS
// =====================================

export function useNearbyCompanies(latitude: number, longitude: number, radius: number = 50) {
  return useQuery({
    queryKey: ['nearby-companies', latitude, longitude, radius],
    queryFn: () => companyService.getNearbyCompanies(latitude, longitude, radius),
    enabled: !!(latitude && longitude),
    staleTime: 10 * 60 * 1000,
  })
}

// =====================================
// HOOKS DE ESTADÍSTICAS GENERALES
// =====================================

export function useCompanyStats() {
  return useQuery({
    queryKey: ['company-stats'],
    queryFn: () => companyService.getCompanyStats(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  })
}

// =====================================
// HOOKS DE FAVORITOS
// =====================================

export function useFavoriteCompanies() {
  return useQuery({
    queryKey: ['favorite-companies'],
    queryFn: () => companyService.getFavoriteCompanies(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useToggleFavoriteCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (companyId: string) => companyService.toggleFavoriteCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-companies'] })
    },
  })
}

// =====================================
// HOOKS DE AUTENTICACIÓN Y PERMISOS
// =====================================

export function useCompanyPermissions(companyId: string) {
  return useQuery({
    queryKey: ['company-permissions', companyId],
    queryFn: () => companyService.getCompanyPermissions(companyId),
    enabled: !!companyId,
    staleTime: 15 * 60 * 1000,
  })
}

// =====================================
// HOOKS DE CARGA DE ARCHIVOS
// =====================================

export function useUploadCompanyLogo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ companyId, file }: { companyId: string; file: File }) =>
      companyService.uploadCompanyLogo(companyId, file),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
    },
  })
}

// =====================================
// HOOKS DE OPTIMISTIC UPDATES
// =====================================

export function useOptimisticCompanyUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) =>
      companyService.updateCompany(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['company', id] })
      
      // Snapshot the previous value
      const previousCompany = queryClient.getQueryData(['company', id])
      
      // Optimistically update
      queryClient.setQueryData(['company', id], (old: any) => ({
        ...old,
        ...data,
      }))
      
      return { previousCompany }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(['company', id], context?.previousCompany)
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['company', id] })
    },
  })
}

// =====================================
// HOOK PERSONALIZADO PARA PAGINACIÓN
// =====================================

export function usePaginatedCompanies(pageSize: number = 20) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<CompanyFilters>({})
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['paginated-companies', page, pageSize, filters],
    queryFn: () => companyService.getCompanies({ ...filters, page, limit: pageSize }),
    staleTime: 5 * 60 * 1000,
  })
  
  return {
    companies: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    page,
    setPage,
    filters,
    setFilters,
    refetch,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    hasNextPage: data?.pagination?.hasNext || false,
    hasPrevPage: data?.pagination?.hasPrev || false,
  }
}

// =====================================
// HOOK PARA GESTIÓN DE DASHBOARD
// =====================================

export function useCompanyDashboard(companyId: string) {
  const companyQuery = useCompany(companyId)
  const doctorsQuery = useCompanyDoctors(companyId)
  const jobOffersQuery = useJobOffers(companyId)
  const analyticsQuery = useCompanyAnalytics(companyId)
  
  return {
    company: companyQuery.data,
    doctors: doctorsQuery.data,
    jobOffers: jobOffersQuery.data,
    analytics: analyticsQuery.data,
    isLoading: companyQuery.isLoading || doctorsQuery.isLoading || jobOffersQuery.isLoading,
    error: companyQuery.error || doctorsQuery.error || jobOffersQuery.error,
    refetch: () => {
      companyQuery.refetch()
      doctorsQuery.refetch()
      jobOffersQuery.refetch()
      analyticsQuery.refetch()
    }
  }
}
