import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type {
    JobFilters,
    JobSearchParams,
    MarketplaceJob,
    MarketplaceMetrics
} from '../types/marketplace';

// Mock API functions - replace with actual API calls
const mockApi = {
  async getJobs(params: JobSearchParams = {}): Promise<{ jobs: MarketplaceJob[]; total: number; hasMore: boolean }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data
    const mockJobs: MarketplaceJob[] = [
      {
        id: 'job-001',
        companyId: 'company-001',
        companyName: 'Hospital General Madrid',
        title: 'Cardiólogo Senior',
        description: 'Buscamos un cardiólogo experimentado para unirse a nuestro equipo...',
        requirements: ['Licencia médica válida', 'Especialización en cardiología', '+5 años experiencia'],
        benefits: ['Seguro médico completo', 'Horario flexible', 'Formación continua'],
        location: {
          type: 'onsite',
          city: 'Madrid',
          country: 'España',
          address: 'Calle Mayor 123'
        },
        employment: {
          type: 'full-time',
          schedule: 'Lunes a Viernes',
          hours: 40
        },
        compensation: {
          currency: 'EUR',
          min: 80000,
          max: 120000,
          type: 'yearly'
        },
        specializations: ['Cardiología'],
        experienceLevel: 'senior',
        urgency: 'medium',
        applicationDeadline: '2025-03-01',
        startDate: '2025-03-15',
        tags: ['hospital', 'cardiología', 'madrid'],
        status: 'active',
        postedAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-25T15:30:00Z',
        applicationsCount: 12,
        viewsCount: 156,
        isSponsored: true
      },
      {
        id: 'job-002',
        companyId: 'company-002',
        companyName: 'Clínica San Rafael',
        title: 'Pediatra - Medicina Familiar',
        description: 'Oportunidad para pediatra en clínica familiar establecida...',
        requirements: ['Residencia en pediatría', 'Experiencia mínima 3 años', 'Certificación vigente'],
        benefits: ['Consulta privada', 'Participación en beneficios', 'Vacaciones pagadas'],
        location: {
          type: 'hybrid',
          city: 'Barcelona',
          country: 'España'
        },
        employment: {
          type: 'part-time',
          schedule: 'Tardes',
          hours: 20
        },
        compensation: {
          currency: 'EUR',
          min: 45000,
          max: 65000,
          type: 'yearly'
        },
        specializations: ['Pediatría'],
        experienceLevel: 'mid',
        urgency: 'high',
        tags: ['clínica', 'pediatría', 'barcelona', 'medio-tiempo'],
        status: 'active',
        postedAt: '2025-01-22T14:20:00Z',
        updatedAt: '2025-01-26T09:15:00Z',
        applicationsCount: 8,
        viewsCount: 94,
        isSponsored: false
      }
    ];

    // Apply filters
    let filteredJobs = mockJobs;
    if (params.filters?.search) {
      const search = params.filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(search) ||
        job.description.toLowerCase().includes(search) ||
        job.companyName.toLowerCase().includes(search)
      );
    }

    if (params.filters?.specializations?.length) {
      filteredJobs = filteredJobs.filter(job =>
        job.specializations.some(spec => params.filters!.specializations!.includes(spec))
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return {
      jobs: paginatedJobs,
      total: filteredJobs.length,
      hasMore: endIndex < filteredJobs.length
    };
  },

  async getJobById(jobId: string): Promise<MarketplaceJob> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const { jobs } = await this.getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');
    return job;
  },

  async getMarketplaceMetrics(): Promise<MarketplaceMetrics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      totalJobs: 156,
      activeJobs: 134,
      totalApplications: 892,
      applicationsByStatus: {
        pending: 234,
        reviewing: 189,
        shortlisted: 156,
        interviewed: 98,
        accepted: 67,
        rejected: 148
      },
      averageApplicationsPerJob: 5.7,
      topSpecializations: [
        { specialization: 'Medicina General', count: 45 },
        { specialization: 'Cardiología', count: 23 },
        { specialization: 'Pediatría', count: 19 },
        { specialization: 'Ginecología', count: 16 },
        { specialization: 'Traumatología', count: 14 }
      ],
      jobsByUrgency: {
        low: 45,
        medium: 67,
        high: 34,
        urgent: 10
      },
      applicationTrends: [
        { date: '2025-01-20', applications: 45, views: 234 },
        { date: '2025-01-21', applications: 52, views: 298 },
        { date: '2025-01-22', applications: 38, views: 267 },
        { date: '2025-01-23', applications: 61, views: 345 },
        { date: '2025-01-24', applications: 49, views: 289 },
        { date: '2025-01-25', applications: 55, views: 312 },
        { date: '2025-01-26', applications: 47, views: 276 }
      ]
    };
  }
};

export const useMarketplaceJobs = (params: JobSearchParams = {}) => {
  const [searchParams, setSearchParams] = useState<JobSearchParams>(params);

  const query = useQuery({
    queryKey: ['marketplace-jobs', searchParams],
    queryFn: () => mockApi.getJobs(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const updateFilters = useCallback((filters: JobFilters) => {
    setSearchParams(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  }, []);

  const updateSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    setSearchParams(prev => ({ 
      ...prev, 
      sortBy: sortBy as any, 
      sortOrder,
      page: 1 
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchParams({ page: 1, limit: params.limit || 10 });
  }, [params.limit]);

  return {
    ...query,
    jobs: query.data?.jobs || [],
    total: query.data?.total || 0,
    hasMore: query.data?.hasMore || false,
    searchParams,
    updateFilters,
    updatePage,
    updateSort,
    clearFilters
  };
};

export const useMarketplaceJob = (jobId: string) => {
  return useQuery({
    queryKey: ['marketplace-job', jobId],
    queryFn: () => mockApi.getJobById(jobId),
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

export const useMarketplaceMetrics = () => {
  return useQuery({
    queryKey: ['marketplace-metrics'],
    queryFn: mockApi.getMarketplaceMetrics,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false
  });
};

export const useBookmarkJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, bookmarked }: { jobId: string; bookmarked: boolean }) => {
      // Mock bookmark API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return { jobId, bookmarked };
    },
    onSuccess: (data) => {
      // Update job in cache
      queryClient.setQueryData(['marketplace-job', data.jobId], (oldData: MarketplaceJob | undefined) => {
        if (oldData) {
          return { ...oldData, isBookmarked: data.bookmarked };
        }
        return oldData;
      });

      // Invalidate jobs list to reflect bookmark status
      queryClient.invalidateQueries({ queryKey: ['marketplace-jobs'] });
    }
  });
};

export const useReportJob = () => {
  return useMutation({
    mutationFn: async ({ jobId, reason, description }: { 
      jobId: string; 
      reason: string; 
      description?: string 
    }) => {
      // Mock report API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, reportId: `report-${Date.now()}` };
    }
  });
};

export const useJobSearch = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const addToHistory = useCallback((searchTerm: string) => {
    if (searchTerm.trim()) {
      setSearchHistory(prev => {
        const filtered = prev.filter(term => term !== searchTerm);
        return [searchTerm, ...filtered].slice(0, 10); // Keep last 10 searches
      });
    }
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory
  };
};
