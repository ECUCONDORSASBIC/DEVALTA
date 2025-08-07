/**
 * 🔗 B2C COMMUNICATION HOOKS - ALTAMEDICA
 * Hooks para comunicación Companies ↔ Doctors
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useEffect } from 'react'
// TODO: Import from @altamedica/types once these types are defined there
// import {
//   JobApplication,
//   Interview,
//   B2CNotification,
//   DoctorSearchFilters,
//   CompanySearchFilters,
//   UseCompanyDoctorCommunicationReturn,
//   ApplicationMessage
// } from '@altamedica/types'

// Temporary type definitions
interface JobApplication {
  id: string;
  jobOfferId: string;
  doctorId: string;
  status: 'pending' | 'reviewing' | 'interview_scheduled' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: Date;
  notes?: string;
}

interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: Date;
  interviewerIds: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface B2CNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface DoctorSearchFilters {
  specialty?: string;
  location?: string;
  experience?: number;
}

interface CompanySearchFilters {
  industry?: string;
  size?: string;
  location?: string;
}

interface ApplicationMessage {
  id: string;
  applicationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'interview_invite' | 'status_update' | 'document_request';
  sentAt: Date;
}

interface UseCompanyDoctorCommunicationReturn {
  applications: JobApplication[];
  interviews: Interview[];
  notifications: B2CNotification[];
  isLoading: boolean;
  error: Error | null;
  submitApplication: (application: Partial<JobApplication>) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: JobApplication['status']) => Promise<void>;
  scheduleInterview: (interview: Partial<Interview>) => Promise<void>;
  updateInterview: (interviewId: string, updates: Partial<Interview>) => Promise<void>;
  sendMessage: (applicationId: string, message: string, type?: ApplicationMessage['type']) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}
// TODO: Import from @altamedica/database once services are available
// import {
//   jobApplicationsService,
//   messagingService,
//   interviewsService,
//   notificationsService,
//   realtimeService
// } from '@altamedica/database'

// Stub implementations until real services are available
const jobApplicationsService = {
  getCompanyApplications: async (companyId: string) => [],
  submitApplication: async (application: Partial<JobApplication>) => ({ id: 'stub', ...application } as JobApplication),
  updateApplicationStatus: async (applicationId: string, status: string, notes?: string) => {},
  getDoctorApplications: async (doctorId: string) => [],
};

const messagingService = {
  sendMessage: async (applicationId: string, message: string, type?: string) => {},
  markMessageAsRead: async (applicationId: string, messageId: string) => {},
};

const interviewsService = {
  getCompanyInterviews: async (companyId: string) => [],
  scheduleInterview: async (interview: Partial<Interview>) => ({ id: 'stub', ...interview } as Interview),
  updateInterview: async (interviewId: string, updates: Partial<Interview>) => {},
  getDoctorInterviews: async (doctorId: string) => [],
};

const notificationsService = {
  getNotifications: async (userId: string, userType: string) => [],
  markAsRead: async (notificationId: string) => {},
};

const realtimeService = {
  subscribeToUpdates: (key: string, callback: (data: any) => void) => ({
    unsubscribe: () => {}
  }),
};

// =====================================
// QUERY KEYS
// =====================================

const QUERY_KEYS = {
  applications: (userId: string, userType: string) => ['b2c-applications', userId, userType],
  application: (applicationId: string) => ['b2c-application', applicationId],
  interviews: (userId: string, userType: string) => ['b2c-interviews', userId, userType],
  interview: (interviewId: string) => ['b2c-interview', interviewId],
  notifications: (userId: string, userType: string) => ['b2c-notifications', userId, userType],
  unreadNotifications: (userId: string, userType: string) => ['b2c-notifications-unread', userId, userType]
}

// =====================================
// COMPANIES SIDE HOOKS
// =====================================

/**
 * Hook principal para empresas - maneja toda la comunicación con doctores
 */
export function useCompanyToDoctorCommunication(companyId: string): UseCompanyDoctorCommunicationReturn {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // =====================================
  // APPLICATIONS MANAGEMENT
  // =====================================

  const {
    data: applications = [],
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications
  } = useQuery({
    queryKey: QUERY_KEYS.applications(companyId, 'company'),
    queryFn: () => jobApplicationsService.getCompanyApplications(companyId),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000 // 5 minutos
  })

  const submitApplicationMutation = useMutation({
    mutationFn: (application: Partial<JobApplication>) =>
      jobApplicationsService.submitApplication(application),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.applications(companyId, 'company') 
      })
    }
  })

  const updateApplicationStatusMutation = useMutation({
    mutationFn: ({ applicationId, status, notes }: { 
      applicationId: string
      status: JobApplication['status']
      notes?: string 
    }) =>
      jobApplicationsService.updateApplicationStatus(applicationId, status, companyId, notes),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.applications(companyId, 'company') 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.application(applicationId) 
      })
    }
  })

  // =====================================
  // INTERVIEWS MANAGEMENT
  // =====================================

  const {
    data: interviews = [],
    isLoading: interviewsLoading,
    error: interviewsError
  } = useQuery({
    queryKey: QUERY_KEYS.interviews(companyId, 'company'),
    queryFn: () => interviewsService.getCompanyInterviews(companyId),
    staleTime: 5 * 60 * 1000
  })

  const scheduleInterviewMutation = useMutation({
    mutationFn: (interview: Partial<Interview>) =>
      interviewsService.scheduleInterview({ ...interview, companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.interviews(companyId, 'company') 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.applications(companyId, 'company') 
      })
    }
  })

  const updateInterviewMutation = useMutation({
    mutationFn: ({ interviewId, updates }: { 
      interviewId: string
      updates: Partial<Interview> 
    }) => {
      // TODO: Implement updateInterview in service
      throw new Error('Not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.interviews(companyId, 'company') 
      })
    }
  })

  // =====================================
  // MESSAGING
  // =====================================

  const sendMessageMutation = useMutation({
    mutationFn: ({ 
      applicationId, 
      message, 
      type = 'text' 
    }: { 
      applicationId: string
      message: string
      type?: ApplicationMessage['type']
    }) =>
      messagingService.sendMessage(applicationId, companyId, 'company', message, type),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.application(applicationId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.applications(companyId, 'company') 
      })
    }
  })

  const markMessageAsReadMutation = useMutation({
    mutationFn: ({ applicationId, messageId }: { 
      applicationId: string
      messageId: string 
    }) =>
      messagingService.markMessageAsRead(applicationId, messageId),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.application(applicationId) 
      })
    }
  })

  // =====================================
  // NOTIFICATIONS
  // =====================================

  const {
    data: notifications = [],
    isLoading: notificationsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.notifications(companyId, 'company'),
    queryFn: () => notificationsService.getUserNotifications(companyId, 'company'),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000 // 2 minutos
  })

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.notifications(companyId, 'company') 
      })
    }
  })

  // =====================================
  // SEARCH FUNCTIONS
  // =====================================

  const searchDoctors = useCallback(async (filters: DoctorSearchFilters) => {
    // TODO: Implement doctor search in service
    throw new Error('Doctor search not implemented yet')
  }, [])

  const searchCompanies = useCallback(async (filters: CompanySearchFilters) => {
    // TODO: Implement company search in service  
    throw new Error('Company search not implemented yet')
  }, [])

  // =====================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================

  const subscribeToUpdates = useCallback((callback: (event: any) => void) => {
    // Subscribe to applications updates
    const unsubscribeApplications = realtimeService.subscribeToApplicationUpdates(
      companyId,
      'company',
      (updatedApplications) => {
        queryClient.setQueryData(
          QUERY_KEYS.applications(companyId, 'company'),
          updatedApplications
        )
        callback({ type: 'applications_updated', data: updatedApplications })
      }
    )

    // Subscribe to notifications
    const unsubscribeNotifications = realtimeService.subscribeToNotifications(
      companyId,
      'company',
      (updatedNotifications) => {
        queryClient.setQueryData(
          QUERY_KEYS.unreadNotifications(companyId, 'company'),
          updatedNotifications
        )
        callback({ type: 'notifications_updated', data: updatedNotifications })
      }
    )

    // Return cleanup function
    return () => {
      unsubscribeApplications()
      unsubscribeNotifications()
    }
  }, [companyId, queryClient])

  // =====================================
  // LOADING & ERROR STATES
  // =====================================

  const isLoadingState = isLoading || 
    applicationsLoading || 
    interviewsLoading || 
    notificationsLoading ||
    submitApplicationMutation.isPending ||
    updateApplicationStatusMutation.isPending ||
    scheduleInterviewMutation.isPending

  const errorState = error || 
    applicationsError || 
    interviewsError ||
    submitApplicationMutation.error ||
    updateApplicationStatusMutation.error ||
    scheduleInterviewMutation.error

  // =====================================
  // RETURN OBJECT
  // =====================================

  return {
    // Data
    applications,
    interviews,
    notifications,
    
    // Mutations
    submitApplication: submitApplicationMutation.mutate,
    updateApplicationStatus: (applicationId: string, status: JobApplication['status'], notes?: string) =>
      updateApplicationStatusMutation.mutate({ applicationId, status, notes }),
    
    scheduleInterview: scheduleInterviewMutation.mutate,
    updateInterview: (interviewId: string, updates: Partial<Interview>) =>
      updateInterviewMutation.mutate({ interviewId, updates }),
    
    sendMessage: (applicationId: string, message: string, type?: ApplicationMessage['type']) =>
      sendMessageMutation.mutate({ applicationId, message, type }),
    markMessageAsRead: (applicationId: string, messageId: string) =>
      markMessageAsReadMutation.mutate({ applicationId, messageId }),
    
    markNotificationAsRead: markNotificationAsReadMutation.mutate,
    
    // Search functions
    searchDoctors,
    searchCompanies,
    
    // Real-time updates
    subscribeToUpdates,
    
    // States
    isLoading: isLoadingState,
    isError: !!errorState,
    error: errorState as Error
  }
}

// =====================================
// DOCTORS SIDE HOOKS
// =====================================

/**
 * Hook principal para doctores - maneja toda la comunicación con empresas
 */
export function useDoctorToCompanyCommunication(doctorId: string) {
  const queryClient = useQueryClient()

  // Applications from doctor perspective
  const {
    data: applications = [],
    isLoading: applicationsLoading,
    error: applicationsError
  } = useQuery({
    queryKey: QUERY_KEYS.applications(doctorId, 'doctor'),
    queryFn: () => jobApplicationsService.getDoctorApplications(doctorId),
    staleTime: 2 * 60 * 1000
  })

  // Interviews from doctor perspective  
  const {
    data: interviews = [],
    isLoading: interviewsLoading,
    error: interviewsError
  } = useQuery({
    queryKey: QUERY_KEYS.interviews(doctorId, 'doctor'),
    queryFn: () => interviewsService.getDoctorInterviews(doctorId),
    staleTime: 5 * 60 * 1000
  })

  // Notifications for doctor
  const {
    data: notifications = [],
    isLoading: notificationsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.notifications(doctorId, 'doctor'),
    queryFn: () => notificationsService.getUserNotifications(doctorId, 'doctor'),
    staleTime: 1 * 60 * 1000
  })

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: (application: Partial<JobApplication>) =>
      jobApplicationsService.submitApplication({ ...application, doctorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.applications(doctorId, 'doctor') 
      })
    }
  })

  // Send message from doctor
  const sendMessageMutation = useMutation({
    mutationFn: ({ applicationId, message, type = 'text' }: { 
      applicationId: string
      message: string
      type?: ApplicationMessage['type']
    }) =>
      messagingService.sendMessage(applicationId, doctorId, 'doctor', message, type),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.application(applicationId) 
      })
    }
  })

  return {
    // Data
    applications,
    interviews,
    notifications,
    
    // Actions
    submitApplication: submitApplicationMutation.mutate,
    sendMessage: (applicationId: string, message: string, type?: ApplicationMessage['type']) =>
      sendMessageMutation.mutate({ applicationId, message, type }),
    
    // States
    isLoading: applicationsLoading || interviewsLoading || notificationsLoading,
    isError: !!(applicationsError || interviewsError),
    error: (applicationsError || interviewsError) as Error
  }
}

// =====================================
// UTILITY HOOKS
// =====================================

/**
 * Hook para obtener una aplicación específica con detalles completos
 */
export function useJobApplication(applicationId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.application(applicationId),
    queryFn: () => jobApplicationsService.getApplication(applicationId),
    enabled: !!applicationId,
    staleTime: 1 * 60 * 1000
  })
}

/**
 * Hook para contar notificaciones no leídas
 */
export function useUnreadNotificationsCount(userId: string, userType: 'company' | 'doctor') {
  const { data: notifications = [] } = useQuery({
    queryKey: QUERY_KEYS.unreadNotifications(userId, userType),
    queryFn: () => notificationsService.getUserNotifications(userId, userType, true),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000 // 1 minuto
  })

  return notifications.length
}

/**
 * Hook para auto-refresh de datos cada cierto tiempo
 */
export function useB2CAutoRefresh(userId: string, userType: 'company' | 'doctor', enabled: boolean = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      // Refetch applications
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.applications(userId, userType) 
      })
      
      // Refetch notifications  
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.notifications(userId, userType) 
      })
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [queryClient, userId, userType, enabled])
}