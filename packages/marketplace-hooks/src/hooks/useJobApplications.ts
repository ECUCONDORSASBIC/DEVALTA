import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { JobApplication } from '../types/marketplace';

// Mock API functions
const mockApi = {
  async getApplications(doctorId: string): Promise<JobApplication[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock applications for a doctor
    return [
      {
        id: 'app-001',
        jobId: 'job-001',
        doctorId,
        doctorName: 'Dr. María González',
        doctorEmail: 'maria.gonzalez@email.com',
        doctorPhone: '+34 600 123 456',
        doctorSpecialization: 'Cardiología',
        doctorExperience: 8,
        coverLetter: 'Estimados señores, me dirijo a ustedes para expresar mi interés en la posición de Cardiólogo Senior...',
        resume: {
          url: '/documents/resume-maria-gonzalez.pdf',
          filename: 'CV_Maria_Gonzalez.pdf',
          uploadedAt: '2025-01-20T10:30:00Z'
        },
        expectedSalary: {
          amount: 95000,
          currency: 'EUR',
          type: 'yearly'
        },
        availabilityDate: '2025-03-01',
        status: 'shortlisted',
        appliedAt: '2025-01-20T10:30:00Z',
        updatedAt: '2025-01-25T14:20:00Z',
        notes: 'Perfil muy interesante con experiencia en UCI',
        interviewScheduled: {
          date: '2025-01-30T10:00:00Z',
          type: 'video',
          meetingLink: 'https://meet.google.com/abc-defg-hij'
        }
      },
      {
        id: 'app-002',
        jobId: 'job-002',
        doctorId,
        doctorName: 'Dr. María González',
        doctorEmail: 'maria.gonzalez@email.com',
        doctorSpecialization: 'Cardiología',
        doctorExperience: 8,
        coverLetter: 'Me complace aplicar para la posición de consulta en medicina familiar...',
        status: 'pending',
        appliedAt: '2025-01-22T15:45:00Z',
        updatedAt: '2025-01-22T15:45:00Z'
      }
    ];
  },

  async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock applications for a specific job
    return [
      {
        id: 'app-001',
        jobId,
        doctorId: 'doctor-001',
        doctorName: 'Dr. María González',
        doctorEmail: 'maria.gonzalez@email.com',
        doctorPhone: '+34 600 123 456',
        doctorSpecialization: 'Cardiología',
        doctorExperience: 8,
        coverLetter: 'Estimados señores, me dirijo a ustedes para expresar mi interés en la posición...',
        resume: {
          url: '/documents/resume-maria-gonzalez.pdf',
          filename: 'CV_Maria_Gonzalez.pdf',
          uploadedAt: '2025-01-20T10:30:00Z'
        },
        expectedSalary: {
          amount: 95000,
          currency: 'EUR',
          type: 'yearly'
        },
        status: 'shortlisted',
        appliedAt: '2025-01-20T10:30:00Z',
        updatedAt: '2025-01-25T14:20:00Z'
      },
      {
        id: 'app-002',
        jobId,
        doctorId: 'doctor-002',
        doctorName: 'Dr. Carlos Rodríguez',
        doctorEmail: 'carlos.rodriguez@email.com',
        doctorSpecialization: 'Cardiología',
        doctorExperience: 12,
        coverLetter: 'Tengo el honor de aplicar para la posición de Cardiólogo Senior...',
        status: 'reviewing',
        appliedAt: '2025-01-21T09:15:00Z',
        updatedAt: '2025-01-24T11:30:00Z'
      }
    ];
  },

  async getApplication(applicationId: string): Promise<JobApplication> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const applications = await this.getApplications('doctor-001');
    const application = applications.find(app => app.id === applicationId);
    if (!application) throw new Error('Application not found');
    return application;
  },

  async submitApplication(applicationData: Partial<JobApplication>): Promise<JobApplication> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newApplication: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: applicationData.jobId!,
      doctorId: applicationData.doctorId!,
      doctorName: applicationData.doctorName!,
      doctorEmail: applicationData.doctorEmail!,
      doctorPhone: applicationData.doctorPhone,
      doctorSpecialization: applicationData.doctorSpecialization!,
      doctorExperience: applicationData.doctorExperience!,
      coverLetter: applicationData.coverLetter!,
      resume: applicationData.resume,
      portfolio: applicationData.portfolio,
      expectedSalary: applicationData.expectedSalary,
      availabilityDate: applicationData.availabilityDate,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: applicationData.notes
    };

    return newApplication;
  },

  async updateApplicationStatus(
    applicationId: string, 
    status: JobApplication['status'],
    notes?: string
  ): Promise<JobApplication> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const application = await this.getApplication(applicationId);
    return {
      ...application,
      status,
      companyNotes: notes,
      updatedAt: new Date().toISOString()
    };
  },

  async withdrawApplication(applicationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Mock withdrawal logic
  },

  async scheduleInterview(
    applicationId: string, 
    interviewDetails: NonNullable<JobApplication['interviewScheduled']>
  ): Promise<JobApplication> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const application = await this.getApplication(applicationId);
    return {
      ...application,
      status: 'interviewed',
      interviewScheduled: interviewDetails,
      updatedAt: new Date().toISOString()
    };
  }
};

// Hook for doctors to view their applications
export const useMyApplications = (doctorId: string) => {
  return useQuery({
    queryKey: ['my-applications', doctorId],
    queryFn: () => mockApi.getApplications(doctorId),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Hook for companies to view applications for their jobs
export const useJobApplications = (jobId: string) => {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => mockApi.getApplicationsByJob(jobId),
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false
  });
};

// Hook to get a specific application
export const useApplication = (applicationId: string) => {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => mockApi.getApplication(applicationId),
    enabled: !!applicationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Hook for doctors to submit applications
export const useSubmitApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockApi.submitApplication,
    onSuccess: (newApplication) => {
      // Update doctor's applications cache
      queryClient.setQueryData(
        ['my-applications', newApplication.doctorId], 
        (oldData: JobApplication[] | undefined) => {
          return oldData ? [newApplication, ...oldData] : [newApplication];
        }
      );

      // Update job applications cache
      queryClient.setQueryData(
        ['job-applications', newApplication.jobId],
        (oldData: JobApplication[] | undefined) => {
          return oldData ? [newApplication, ...oldData] : [newApplication];
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['marketplace-jobs'] });
    }
  });
};

// Hook for companies to update application status
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      applicationId, 
      status, 
      notes 
    }: { 
      applicationId: string; 
      status: JobApplication['status']; 
      notes?: string;
    }) => mockApi.updateApplicationStatus(applicationId, status, notes),
    onSuccess: (updatedApplication) => {
      // Update specific application cache
      queryClient.setQueryData(
        ['application', updatedApplication.id], 
        updatedApplication
      );

      // Update job applications cache
      queryClient.setQueryData(
        ['job-applications', updatedApplication.jobId],
        (oldData: JobApplication[] | undefined) => {
          return oldData?.map(app => 
            app.id === updatedApplication.id ? updatedApplication : app
          ) || [];
        }
      );

      // Update doctor's applications cache
      queryClient.setQueryData(
        ['my-applications', updatedApplication.doctorId],
        (oldData: JobApplication[] | undefined) => {
          return oldData?.map(app => 
            app.id === updatedApplication.id ? updatedApplication : app
          ) || [];
        }
      );
    }
  });
};

// Hook for doctors to withdraw applications
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockApi.withdrawApplication,
    onSuccess: (_, applicationId) => {
      // Remove from all relevant caches
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.removeQueries({ queryKey: ['application', applicationId] });
    }
  });
};

// Hook for companies to schedule interviews
export const useScheduleInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      applicationId, 
      interviewDetails 
    }: { 
      applicationId: string; 
      interviewDetails: NonNullable<JobApplication['interviewScheduled']>;
    }) => mockApi.scheduleInterview(applicationId, interviewDetails),
    onSuccess: (updatedApplication) => {
      // Update caches similar to status update
      queryClient.setQueryData(
        ['application', updatedApplication.id], 
        updatedApplication
      );

      queryClient.setQueryData(
        ['job-applications', updatedApplication.jobId],
        (oldData: JobApplication[] | undefined) => {
          return oldData?.map(app => 
            app.id === updatedApplication.id ? updatedApplication : app
          ) || [];
        }
      );

      queryClient.setQueryData(
        ['my-applications', updatedApplication.doctorId],
        (oldData: JobApplication[] | undefined) => {
          return oldData?.map(app => 
            app.id === updatedApplication.id ? updatedApplication : app
          ) || [];
        }
      );
    }
  });
};

// Hook for application statistics
export const useApplicationStats = (doctorId?: string, companyId?: string) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interviewed: 0,
    accepted: 0,
    rejected: 0,
    successRate: 0
  });

  const { data: applications } = useQuery({
    queryKey: doctorId ? ['my-applications', doctorId] : ['company-applications', companyId],
    queryFn: () => doctorId ? mockApi.getApplications(doctorId) : Promise.resolve([]),
    enabled: !!(doctorId || companyId),
    onSuccess: (data) => {
      const statusCounts = data.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const total = data.length;
      const accepted = statusCounts.accepted || 0;
      const successRate = total > 0 ? (accepted / total) * 100 : 0;

      setStats({
        total,
        pending: statusCounts.pending || 0,
        reviewing: statusCounts.reviewing || 0,
        shortlisted: statusCounts.shortlisted || 0,
        interviewed: statusCounts.interviewed || 0,
        accepted,
        rejected: statusCounts.rejected || 0,
        successRate: Math.round(successRate * 100) / 100
      });
    }
  });

  return stats;
};
