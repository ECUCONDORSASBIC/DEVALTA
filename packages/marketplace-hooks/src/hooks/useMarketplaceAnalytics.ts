import { useQuery } from '@tanstack/react-query';
import type { MarketplaceMetrics } from '../types/marketplace';
import type { MessageStats } from '../types/messaging';

interface AnalyticsMetrics {
  marketplace: MarketplaceMetrics;
  messaging: MessageStats;
  overview: {
    totalActiveUsers: number;
    dailyActiveUsers: number;
    conversionRate: number;
    averageTimeToHire: number; // in days
    satisfactionScore: number;
    platformGrowth: number; // percentage
  };
  trends: {
    jobPostings: { date: string; count: number }[];
    applications: { date: string; count: number }[];
    hires: { date: string; count: number }[];
    userRegistrations: { date: string; doctors: number; companies: number }[];
  };
  topPerformers: {
    companies: {
      id: string;
      name: string;
      jobsPosted: number;
      applicationsReceived: number;
      hiresCompleted: number;
    }[];
    doctors: {
      id: string;
      name: string;
      specialization: string;
      applicationsSuccess: number;
      profileViews: number;
      rating: number;
    }[];
  };
  geographics: {
    region: string;
    doctors: number;
    companies: number;
    jobs: number;
    applications: number;
  }[];
  specializations: {
    name: string;
    demand: number; // job postings
    supply: number; // available doctors
    averageSalary: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

// Mock API for analytics
const mockAnalyticsApi = {
  async getAnalytics(
    userType: 'company' | 'doctor' | 'admin',
    userId?: string,
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<AnalyticsMetrics> {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      marketplace: {
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
        applicationTrends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          applications: Math.floor(Math.random() * 20) + 15,
          views: Math.floor(Math.random() * 50) + 100
        }))
      },
      messaging: {
        totalConversations: 287,
        activeConversations: 198,
        totalMessages: 4521,
        unreadMessages: 34,
        averageResponseTime: 145, // minutes
        conversationsByStatus: {
          active: 198,
          archived: 89,
          blocked: 0
        },
        messagesByType: {
          text: 3891,
          file: 234,
          application: 198,
          interview: 123,
          offer: 56,
          system: 19
        },
        dailyMessageVolume: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sent: Math.floor(Math.random() * 30) + 20,
          received: Math.floor(Math.random() * 25) + 15
        }))
      },
      overview: {
        totalActiveUsers: 1247,
        dailyActiveUsers: 89,
        conversionRate: 12.5, // percentage of applications that lead to hires
        averageTimeToHire: 18, // days
        satisfactionScore: 4.6, // out of 5
        platformGrowth: 23.4 // percentage growth
      },
      trends: {
        jobPostings: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2025, i, 1).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 10
        })),
        applications: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2025, i, 1).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 80) + 40
        })),
        hires: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2025, i, 1).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 15) + 5
        })),
        userRegistrations: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2025, i, 1).toISOString().split('T')[0],
          doctors: Math.floor(Math.random() * 15) + 8,
          companies: Math.floor(Math.random() * 8) + 3
        }))
      },
      topPerformers: {
        companies: [
          {
            id: 'company-001',
            name: 'Hospital General Madrid',
            jobsPosted: 23,
            applicationsReceived: 156,
            hiresCompleted: 8
          },
          {
            id: 'company-002',
            name: 'Clínica San Rafael',
            jobsPosted: 18,
            applicationsReceived: 134,
            hiresCompleted: 12
          },
          {
            id: 'company-003',
            name: 'Centro Médico Barcelona',
            jobsPosted: 15,
            applicationsReceived: 98,
            hiresCompleted: 6
          }
        ],
        doctors: [
          {
            id: 'doctor-001',
            name: 'Dr. María González',
            specialization: 'Cardiología',
            applicationsSuccess: 85, // percentage
            profileViews: 234,
            rating: 4.9
          },
          {
            id: 'doctor-002',
            name: 'Dr. Carlos Rodríguez',
            specialization: 'Traumatología',
            applicationsSuccess: 78,
            profileViews: 189,
            rating: 4.7
          },
          {
            id: 'doctor-003',
            name: 'Dra. Ana López',
            specialization: 'Pediatría',
            applicationsSuccess: 92,
            profileViews: 167,
            rating: 4.8
          }
        ]
      },
      geographics: [
        { region: 'Madrid', doctors: 234, companies: 45, jobs: 67, applications: 234 },
        { region: 'Barcelona', doctors: 198, companies: 38, jobs: 52, applications: 189 },
        { region: 'Valencia', doctors: 145, companies: 29, jobs: 34, applications: 123 },
        { region: 'Sevilla', doctors: 112, companies: 23, jobs: 28, applications: 98 },
        { region: 'Bilbao', doctors: 89, companies: 18, jobs: 21, applications: 76 }
      ],
      specializations: [
        {
          name: 'Medicina General',
          demand: 45,
          supply: 123,
          averageSalary: 65000,
          trend: 'up'
        },
        {
          name: 'Cardiología',
          demand: 23,
          supply: 34,
          averageSalary: 95000,
          trend: 'stable'
        },
        {
          name: 'Pediatría',
          demand: 19,
          supply: 45,
          averageSalary: 72000,
          trend: 'up'
        },
        {
          name: 'Traumatología',
          demand: 16,
          supply: 28,
          averageSalary: 85000,
          trend: 'down'
        },
        {
          name: 'Ginecología',
          demand: 14,
          supply: 31,
          averageSalary: 78000,
          trend: 'stable'
        }
      ]
    };
  },

  async getCompanyAnalytics(companyId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      jobMetrics: {
        totalJobsPosted: 23,
        activeJobs: 18,
        completedJobs: 5,
        totalApplicationsReceived: 156,
        averageApplicationsPerJob: 6.8,
        hireRate: 15.4, // percentage
        timeToFill: 22 // average days
      },
      applicationMetrics: {
        byStatus: {
          pending: 23,
          reviewing: 18,
          shortlisted: 12,
          interviewed: 8,
          accepted: 5,
          rejected: 90
        },
        bySpecialization: [
          { specialization: 'Cardiología', count: 45 },
          { specialization: 'Medicina General', count: 34 },
          { specialization: 'Pediatría', count: 28 }
        ],
        qualityScore: 7.8 // out of 10
      },
      costMetrics: {
        costPerHire: 2340, // EUR
        totalSpent: 11700, // EUR
        budgetUtilization: 68, // percentage
        costTrends: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(2025, i, 1).toLocaleDateString('es-ES', { month: 'short' }),
          cost: Math.floor(Math.random() * 3000) + 1500
        }))
      },
      performanceMetrics: {
        responseTime: 4.2, // hours average
        candidateExperience: 4.5, // rating out of 5
        employerBrand: 4.3, // rating out of 5
        retention: 89 // percentage of hires still employed after 90 days
      }
    };
  },

  async getDoctorAnalytics(doctorId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      applicationMetrics: {
        totalApplications: 12,
        successfulApplications: 3,
        successRate: 25, // percentage
        averageResponseTime: 2.3, // days
        interviewsReceived: 5,
        offersReceived: 3
      },
      profileMetrics: {
        profileViews: 234,
        profileCompleteness: 95, // percentage
        endorsements: 12,
        rating: 4.7, // out of 5
        searchRanking: 15 // position in search results
      },
      marketValue: {
        estimatedSalary: {
          min: 75000,
          max: 95000,
          currency: 'EUR'
        },
        demandScore: 8.5, // out of 10
        competitiveness: 92, // percentage
        marketTrends: 'positive'
      },
      activityMetrics: {
        lastActive: '2025-01-29T10:30:00Z',
        messagesExchanged: 45,
        documentsShared: 8,
        interviewsCompleted: 3,
        networksExpanded: 23 // new connections
      },
      opportunities: {
        matchingJobs: 8,
        recommendedJobs: 15,
        potentialSalaryIncrease: 15000, // EUR
        skillGaps: ['Telemedicina', 'Gestión de equipos'],
        growthOpportunities: ['Especialización adicional', 'Liderazgo médico']
      }
    };
  }
};

// Main analytics hook
export const useMarketplaceAnalytics = (
  userType: 'company' | 'doctor' | 'admin',
  userId?: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
) => {
  return useQuery({
    queryKey: ['marketplace-analytics', userType, userId, timeRange],
    queryFn: () => mockAnalyticsApi.getAnalytics(userType, userId, timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Company-specific analytics
export const useCompanyAnalytics = (companyId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d') => {
  return useQuery({
    queryKey: ['company-analytics', companyId, timeRange],
    queryFn: () => mockAnalyticsApi.getCompanyAnalytics(companyId, timeRange),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Doctor-specific analytics
export const useDoctorAnalytics = (doctorId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d') => {
  return useQuery({
    queryKey: ['doctor-analytics', doctorId, timeRange],
    queryFn: () => mockAnalyticsApi.getDoctorAnalytics(doctorId, timeRange),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Real-time metrics hook
export const useRealTimeMetrics = (userType: 'company' | 'doctor' | 'admin', userId?: string) => {
  return useQuery({
    queryKey: ['realtime-metrics', userType, userId],
    queryFn: async () => {
      // Mock real-time data
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        activeUsers: Math.floor(Math.random() * 50) + 20,
        onlineNow: Math.floor(Math.random() * 15) + 5,
        messagesLastHour: Math.floor(Math.random() * 25) + 10,
        applicationsLastHour: Math.floor(Math.random() * 8) + 2,
        systemLoad: Math.floor(Math.random() * 30) + 40, // percentage
        responseTime: Math.floor(Math.random() * 100) + 150 // ms
      };
    },
    refetchInterval: 30 * 1000, // Update every 30 seconds
    staleTime: 0, // Always fresh
    refetchOnWindowFocus: false
  });
};

// Custom metrics hook for flexible analytics
export const useCustomMetrics = (
  metricType: string,
  filters: Record<string, any> = {},
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
) => {
  return useQuery({
    queryKey: ['custom-metrics', metricType, filters, timeRange],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock custom metrics based on type
      switch (metricType) {
        case 'conversion-funnel':
          return {
            steps: [
              { name: 'Visitantes', count: 1247, percentage: 100 },
              { name: 'Registrados', count: 892, percentage: 71.5 },
              { name: 'Perfiles Completos', count: 734, percentage: 58.9 },
              { name: 'Primera Aplicación', count: 456, percentage: 36.6 },
              { name: 'Entrevista', count: 234, percentage: 18.8 },
              { name: 'Contratado', count: 89, percentage: 7.1 }
            ]
          };
        
        case 'salary-distribution':
          return {
            ranges: [
              { range: '40k-50k', count: 45, percentage: 15.2 },
              { range: '50k-70k', count: 89, percentage: 30.1 },
              { range: '70k-90k', count: 78, percentage: 26.4 },
              { range: '90k-120k', count: 56, percentage: 18.9 },
              { range: '120k+', count: 28, percentage: 9.5 }
            ]
          };
        
        case 'user-engagement':
          return {
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              sessions: Math.floor(Math.random() * 50) + 20,
              pageViews: Math.floor(Math.random() * 200) + 100,
              timeOnSite: Math.floor(Math.random() * 300) + 180 // seconds
            }))
          };
        
        default:
          return { message: `No data available for metric type: ${metricType}` };
      }
    },
    enabled: !!metricType,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false
  });
};
