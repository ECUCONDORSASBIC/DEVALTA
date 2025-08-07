import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MarketplaceCompany } from '../types/marketplace';

// Mock API functions
const mockCompanyApi = {
  async getCompanyProfile(companyId: string): Promise<MarketplaceCompany> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      id: companyId,
      name: 'Hospital General Madrid',
      logo: '/logos/hospital-madrid.png',
      description: 'Hospital líder en Madrid con más de 50 años de experiencia en atención médica integral. Contamos con tecnología de vanguardia y un equipo médico altamente especializado.',
      website: 'https://hospitalgeneralmadrid.es',
      industry: 'Salud y Medicina',
      size: '500-1000 empleados',
      location: {
        city: 'Madrid',
        country: 'España',
        address: 'Calle Gran Vía 123, 28013 Madrid'
      },
      contactInfo: {
        email: 'rrhh@hospitalgeneralmadrid.es',
        phone: '+34 91 123 4567',
        contactPerson: 'Ana García - Directora de RRHH'
      },
      socialMedia: {
        linkedin: 'https://linkedin.com/company/hospital-general-madrid',
        twitter: 'https://twitter.com/HGMadrid',
        facebook: 'https://facebook.com/HospitalGeneralMadrid'
      },
      benefits: [
        'Seguro médico completo',
        'Formación continua',
        'Horarios flexibles',
        'Guardería en el centro',
        'Comedor subvencionado',
        'Parking gratuito',
        'Plan de carrera personalizado',
        'Becas de especialización'
      ],
      culture: [
        'Innovación constante',
        'Trabajo en equipo',
        'Excelencia médica',
        'Compromiso social',
        'Desarrollo profesional',
        'Equilibrio vida-trabajo'
      ],
      ratings: {
        overall: 4.5,
        workLifeBalance: 4.2,
        compensation: 4.7,
        culture: 4.6,
        management: 4.3,
        careerGrowth: 4.4
      },
      isVerified: true,
      isPremium: true,
      activeJobsCount: 23,
      totalApplicationsReceived: 456,
      joinedAt: '2023-03-15T10:00:00Z'
    };
  },

  async getCompanyJobs(companyId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'job-001',
        title: 'Cardiólogo Senior',
        department: 'Cardiología',
        type: 'full-time',
        location: 'Madrid',
        postedAt: '2025-01-20T10:00:00Z',
        applicationsCount: 12,
        status: 'active'
      },
      {
        id: 'job-002',
        title: 'Enfermero/a UCI',
        department: 'Cuidados Intensivos',
        type: 'full-time',
        location: 'Madrid',
        postedAt: '2025-01-18T14:30:00Z',
        applicationsCount: 8,
        status: 'active'
      },
      {
        id: 'job-003',
        title: 'Médico de Urgencias',
        department: 'Urgencias',
        type: 'part-time',
        location: 'Madrid',
        postedAt: '2025-01-15T09:15:00Z',
        applicationsCount: 15,
        status: 'paused'
      }
    ];
  },

  async getCompanyReviews(companyId: string) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    return [
      {
        id: 'review-001',
        reviewerId: 'doctor-001',
        reviewerName: 'Dr. María González',
        reviewerSpecialization: 'Cardiología',
        rating: 5,
        title: 'Excelente ambiente de trabajo',
        content: 'He trabajado aquí durante 3 años y puedo decir que es un lugar excepcional. La dirección valora mucho a los profesionales y hay muchas oportunidades de crecimiento.',
        pros: ['Excelente equipo médico', 'Tecnología avanzada', 'Buen ambiente laboral'],
        cons: ['Turnos de noche frecuentes'],
        wouldRecommend: true,
        isVerified: true,
        submittedAt: '2025-01-15T10:30:00Z'
      },
      {
        id: 'review-002',
        reviewerId: 'doctor-002',
        reviewerName: 'Dr. Carlos Rodríguez',
        reviewerSpecialization: 'Traumatología',
        rating: 4,
        title: 'Buen lugar para especializarse',
        content: 'Facilidades excelentes para la formación continua y especialización. Los casos son muy variados y se aprende mucho.',
        pros: ['Casos complejos interesantes', 'Formación continua', 'Buen salario'],
        cons: ['Mucha burocracia', 'Turnos largos'],
        wouldRecommend: true,
        isVerified: true,
        submittedAt: '2025-01-10T16:45:00Z'
      }
    ];
  },

  async updateCompanyProfile(companyId: string, updates: Partial<MarketplaceCompany>): Promise<MarketplaceCompany> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const currentProfile = await this.getCompanyProfile(companyId);
    return { ...currentProfile, ...updates };
  },

  async followCompany(companyId: string, doctorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock follow logic
  },

  async unfollowCompany(companyId: string, doctorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock unfollow logic
  },

  async getCompanyFollowers(companyId: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      total: 234,
      recent: [
        {
          id: 'doctor-001',
          name: 'Dr. María González',
          specialization: 'Cardiología',
          avatar: '/avatars/maria-gonzalez.jpg',
          followedAt: '2025-01-25T14:20:00Z'
        },
        {
          id: 'doctor-002',
          name: 'Dr. Carlos Rodríguez',
          specialization: 'Traumatología',
          avatar: '/avatars/carlos-rodriguez.jpg',
          followedAt: '2025-01-24T11:30:00Z'
        }
      ]
    };
  },

  async getCompanyInsights(companyId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      profileViews: {
        total: 1247,
        lastWeek: 89,
        trend: 'up'
      },
      jobViews: {
        total: 3456,
        lastWeek: 234,
        trend: 'up'
      },
      applications: {
        total: 456,
        lastWeek: 23,
        conversionRate: 6.8
      },
      followerGrowth: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) + 1
      })),
      topSkillsRequested: [
        { skill: 'Cardiología', count: 15 },
        { skill: 'Medicina Interna', count: 12 },
        { skill: 'Enfermería UCI', count: 10 },
        { skill: 'Cirugía General', count: 8 },
        { skill: 'Anestesiología', count: 6 }
      ],
      candidateSource: [
        { source: 'Búsqueda directa', count: 156, percentage: 45.2 },
        { source: 'Referencias', count: 89, percentage: 25.8 },
        { source: 'Recomendaciones', count: 67, percentage: 19.4 },
        { source: 'Otros', count: 33, percentage: 9.6 }
      ]
    };
  }
};

// Main company profile hook
export const useCompanyProfile = (companyId: string) => {
  return useQuery({
    queryKey: ['company-profile', companyId],
    queryFn: () => mockCompanyApi.getCompanyProfile(companyId),
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Company jobs hook
export const useCompanyJobs = (companyId: string) => {
  return useQuery({
    queryKey: ['company-jobs', companyId],
    queryFn: () => mockCompanyApi.getCompanyJobs(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Company reviews hook
export const useCompanyReviews = (companyId: string) => {
  return useQuery({
    queryKey: ['company-reviews', companyId],
    queryFn: () => mockCompanyApi.getCompanyReviews(companyId),
    enabled: !!companyId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false
  });
};

// Company followers hook
export const useCompanyFollowers = (companyId: string) => {
  return useQuery({
    queryKey: ['company-followers', companyId],
    queryFn: () => mockCompanyApi.getCompanyFollowers(companyId),
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Company insights hook (for company owners)
export const useCompanyInsights = (companyId: string) => {
  return useQuery({
    queryKey: ['company-insights', companyId],
    queryFn: () => mockCompanyApi.getCompanyInsights(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Update company profile hook
export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, updates }: { companyId: string; updates: Partial<MarketplaceCompany> }) =>
      mockCompanyApi.updateCompanyProfile(companyId, updates),
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(['company-profile', updatedProfile.id], updatedProfile);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['marketplace-jobs'] });
    }
  });
};

// Follow company hook
export const useFollowCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, doctorId, follow }: { companyId: string; doctorId: string; follow: boolean }) => {
      return follow 
        ? mockCompanyApi.followCompany(companyId, doctorId)
        : mockCompanyApi.unfollowCompany(companyId, doctorId);
    },
    onSuccess: (_, { companyId }) => {
      // Invalidate followers cache
      queryClient.invalidateQueries({ queryKey: ['company-followers', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company-insights', companyId] });
    }
  });
};

// Companies directory hook
export const useCompaniesDirectory = (filters: {
  industry?: string;
  size?: string;
  location?: string;
  search?: string;
  hasActiveJobs?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ['companies-directory', filters],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock companies directory
      const companies = [
        {
          id: 'company-001',
          name: 'Hospital General Madrid',
          logo: '/logos/hospital-madrid.png',
          industry: 'Salud y Medicina',
          size: '500-1000 empleados',
          location: 'Madrid, España',
          rating: 4.5,
          activeJobs: 23,
          isVerified: true,
          isPremium: true
        },
        {
          id: 'company-002',
          name: 'Clínica San Rafael',
          logo: '/logos/clinica-san-rafael.png',
          industry: 'Salud y Medicina',
          size: '100-500 empleados',
          location: 'Barcelona, España',
          rating: 4.3,
          activeJobs: 15,
          isVerified: true,
          isPremium: false
        },
        {
          id: 'company-003',
          name: 'Centro Médico Valencia',
          logo: '/logos/centro-valencia.png',
          industry: 'Salud y Medicina',
          size: '50-100 empleados',
          location: 'Valencia, España',
          rating: 4.7,
          activeJobs: 8,
          isVerified: false,
          isPremium: false
        }
      ];

      // Apply filters
      let filteredCompanies = companies;
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredCompanies = filteredCompanies.filter(company =>
          company.name.toLowerCase().includes(search) ||
          company.location.toLowerCase().includes(search)
        );
      }
      
      if (filters.industry) {
        filteredCompanies = filteredCompanies.filter(company =>
          company.industry === filters.industry
        );
      }
      
      if (filters.size) {
        filteredCompanies = filteredCompanies.filter(company =>
          company.size === filters.size
        );
      }
      
      if (filters.location) {
        filteredCompanies = filteredCompanies.filter(company =>
          company.location.includes(filters.location!)
        );
      }
      
      if (filters.hasActiveJobs) {
        filteredCompanies = filteredCompanies.filter(company =>
          company.activeJobs > 0
        );
      }

      return {
        companies: filteredCompanies,
        total: filteredCompanies.length,
        filters: {
          industries: ['Salud y Medicina', 'Investigación', 'Farmacéutica'],
          sizes: ['1-50 empleados', '50-100 empleados', '100-500 empleados', '500-1000 empleados', '1000+ empleados'],
          locations: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao']
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Company search suggestions hook
export const useCompanySearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['company-search-suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const suggestions = [
        'Hospital General Madrid',
        'Clínica San Rafael',
        'Centro Médico Valencia',
        'Hospital Universitario Barcelona',
        'Clínica Privada Sevilla'
      ];
      
      return suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false
  });
};
