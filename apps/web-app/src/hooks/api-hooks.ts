import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api, Patient, Doctor, Appointment, Prescription } from '@/lib/api-client'

// Auth types
interface AuthResponse {
  token: string
  user: any
}

// 🔐 Auth Hooks
export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: api.auth.me,
    retry: false,
    staleTime: Infinity
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data: any) => {
      localStorage.setItem('authToken', data.token)
      queryClient.setQueryData(['auth', 'me'], data.user)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      localStorage.removeItem('authToken')
      queryClient.clear()
      window.location.href = '/auth/login'
    }
  })
}

// 👥 Patients Hooks
export function usePatients(params?: any) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => api.patients.list(params),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => api.patients.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Patient>) => api.patients.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    }
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => 
      api.patients.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients', id] })
    }
  })
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'appointments'],
    queryFn: () => api.patients.appointments(patientId),
    enabled: !!patientId
  })
}

// 👨‍⚕️ Doctors Hooks
export function useDoctors(params?: any) {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: () => api.doctors.list(params),
    staleTime: 10 * 60 * 1000 // 10 minutes - doctors change less frequently
  })
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctors', id],
    queryFn: () => api.doctors.get(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  })
}

export function useDoctorAvailability(id: string) {
  return useQuery({
    queryKey: ['doctors', id, 'availability'],
    queryFn: () => api.doctors.availability(id),
    enabled: !!id,
    staleTime: 30 * 1000 // 30 seconds - availability changes frequently
  })
}

export function useDoctorAppointments(doctorId: string) {
  return useQuery({
    queryKey: ['doctors', doctorId, 'appointments'],
    queryFn: () => api.doctors.appointments(doctorId),
    enabled: !!doctorId,
    staleTime: 1 * 60 * 1000 // 1 minute
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Doctor>) => api.doctors.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    }
  })
}

// 📅 Appointments Hooks
export function useAppointments(params?: any) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => api.appointments.list(params),
    staleTime: 1 * 60 * 1000 // 1 minute - appointments change frequently
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => api.appointments.get(id),
    enabled: !!id,
    staleTime: 30 * 1000 // 30 seconds
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Appointment>) => api.appointments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    }
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => 
      api.appointments.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments', id] })
    }
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.appointments.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    }
  })
}

// 💊 Prescriptions Hooks
export function usePrescriptions(params?: any) {
  return useQuery({
    queryKey: ['prescriptions', params],
    queryFn: () => api.prescriptions.list(params),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function usePrescription(id: string) {
  return useQuery({
    queryKey: ['prescriptions', id],
    queryFn: () => api.prescriptions.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export function useCreatePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Prescription>) => api.prescriptions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    }
  })
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Prescription> }) => 
      api.prescriptions.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['prescriptions', id] })
    }
  })
}

// 📋 Medical Records Hooks
export function useMedicalRecords(params?: any) {
  return useQuery({
    queryKey: ['medical-records', params],
    queryFn: () => api.medicalRecords.list(params),
    staleTime: 10 * 60 * 1000 // 10 minutes - medical records are stable
  })
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: ['medical-records', id],
    queryFn: () => api.medicalRecords.get(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  })
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.medicalRecords.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
    }
  })
}

// 🏢 Companies Hooks
export function useCompanies(params?: any) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => api.companies.list(params),
    staleTime: 30 * 60 * 1000 // 30 minutes - companies are stable
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => api.companies.get(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000
  })
}

// 💼 Jobs Hooks
export function useJobs(params?: any) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => api.jobs.list(params),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useJobApplications(params?: any) {
  return useQuery({
    queryKey: ['job-applications', params],
    queryFn: () => api.jobs.applications.list(params),
    staleTime: 5 * 60 * 1000
  })
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.jobs.applications.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
    }
  })
}

// 💬 Messages Hooks
export function useMessages(params?: any) {
  return useQuery({
    queryKey: ['messages', params],
    queryFn: () => api.messages.list(params),
    staleTime: 30 * 1000, // 30 seconds - messages change frequently
    refetchInterval: 30 * 1000 // Auto-refresh every 30 seconds
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.messages.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  })
}

// 🤖 AI Hooks
export function useAIRiskAssessment() {
  return useMutation({
    mutationFn: (data: any) => api.ai.riskAssessment(data)
  })
}

export function useAIDiagnosis() {
  return useMutation({
    mutationFn: (data: any) => api.ai.diagnosis(data)
  })
}

export function useAIRecommendations(patientId: string) {
  return useQuery({
    queryKey: ['ai', 'recommendations', patientId],
    queryFn: () => api.ai.recommendations(patientId),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

// 📍 Location Hooks
export function useMedicalLocations(params?: any) {
  return useQuery({
    queryKey: ['medical-locations', params],
    queryFn: () => api.locations.medical(params),
    staleTime: 60 * 60 * 1000 // 1 hour - locations are stable
  })
}

export function useNearbyMedicalLocations(lat: number, lon: number, radius?: number) {
  return useQuery({
    queryKey: ['medical-locations', 'nearby', lat, lon, radius],
    queryFn: () => api.locations.nearby(lat, lon, radius),
    enabled: !!(lat && lon),
    staleTime: 30 * 60 * 1000 // 30 minutes
  })
}

// 🏥 Health Status Hooks
export function useHealthStatus() {
  return useQuery({
    queryKey: ['health', 'status'],
    queryFn: api.health.status,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000 // Check every minute
  })
}

// 📊 Analytics Hooks
export function usePatientStats(params?: any) {
  return useQuery({
    queryKey: ['analytics', 'patients', params],
    queryFn: () => api.analytics.patientStats(params),
    staleTime: 15 * 60 * 1000 // 15 minutes
  })
}

export function useAppointmentStats(params?: any) {
  return useQuery({
    queryKey: ['analytics', 'appointments', params],
    queryFn: () => api.analytics.appointmentStats(params),
    staleTime: 15 * 60 * 1000
  })
}

// 🔔 Notifications Hooks
export function useNotifications(params?: any) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => api.notifications.list(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000 // Check every minute
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

// 🔄 Real-time hooks with optimistic updates
export function useOptimisticAppointmentUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => 
      api.appointments.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['appointments', id] })
      
      // Snapshot the previous value
      const previousAppointment = queryClient.getQueryData(['appointments', id])
      
      // Optimistically update
      queryClient.setQueryData(['appointments', id], (old: any) => ({
        ...old,
        ...data
      }))
      
      return { previousAppointment }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(['appointments', id], context?.previousAppointment)
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['appointments', id] })
    }
  })
}

// Custom hook para manejar paginación
export function usePaginatedQuery<T>(
  queryKey: string[],
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  limit = 20
) {
  const [page, setPage] = useState(1)
  
  const query = useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => queryFn(page, limit),
    placeholderData: (previousData: any) => previousData
  })
  
  return {
    ...query,
    page,
    setPage,
    nextPage: () => setPage((p: number) => p + 1),
    prevPage: () => setPage((p: number) => Math.max(1, p - 1)),
    hasNextPage: (query.data as any)?.hasMore ?? false,
    hasPreviousPage: page > 1
  }
}
