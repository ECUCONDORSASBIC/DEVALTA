import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MarketplaceDoctor } from '../types/marketplace';

// Mock API functions
const mockDoctorApi = {
  async getDoctorProfile(doctorId: string): Promise<MarketplaceDoctor> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      id: doctorId,
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+34 600 123 456',
      avatar: '/avatars/maria-gonzalez.jpg',
      specialization: 'Cardiología',
      subSpecializations: ['Cardiología Intervencionista', 'Ecocardiografía'],
      licenseNumber: 'CRM-12345',
      experience: 8,
      location: {
        city: 'Madrid',
        country: 'España'
      },
      bio: 'Cardióloga con más de 8 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares. Especializada en cardiología intervencionista y ecocardiografía. Comprometida con la excelencia médica y la atención personalizada.',
      skills: [
        'Cateterismo cardíaco',
        'Ecocardiografía',
        'Holter',
        'Ergometría',
        'Cardiología preventiva',
        'Rehabilitación cardíaca'
      ],
      languages: ['Español', 'Inglés', 'Francés'],
      education: [
        {
          degree: 'Grado en Medicina',
          institution: 'Universidad Complutense de Madrid',
          year: 2015
        },
        {
          degree: 'Residencia en Cardiología',
          institution: 'Hospital Universitario La Paz',
          year: 2019
        },
        {
          degree: 'Máster en Cardiología Intervencionista',
          institution: 'Universidad Autónoma de Madrid',
          year: 2021
        }
      ],
      certifications: [
        {
          name: 'Certificación en Cardiología Intervencionista',
          issuer: 'Sociedad Española de Cardiología',
          year: 2021,
          expiryYear: 2026
        },
        {
          name: 'Certificación en Ecocardiografía',
          issuer: 'Sociedad Europea de Cardiología',
          year: 2020,
          expiryYear: 2025
        },
        {
          name: 'Soporte Vital Avanzado',
          issuer: 'Consejo Español de RCP',
          year: 2023,
          expiryYear: 2025
        }
      ],
      workPreferences: {
        employmentTypes: ['full-time', 'part-time'],
        locationPreference: 'hybrid',
        expectedSalary: {
          min: 75000,
          max: 95000,
          currency: 'EUR',
          type: 'yearly'
        },
        availabilityDate: '2025-03-01'
      },
      portfolio: [
        {
          title: 'Investigación en Cardiología Preventiva',
          description: 'Estudio sobre factores de riesgo cardiovascular en población española',
          url: 'https://pubmed.ncbi.nlm.nih.gov/12345678',
          type: 'research'
        },
        {
          title: 'Publicación en Revista Española de Cardiología',
          description: 'Artículo sobre nuevas técnicas en cardiología intervencionista',
          url: 'https://revespcardiol.org/es/articulo/12345',
          type: 'publication'
        },
        {
          title: 'Premio a la Excelencia Médica 2023',
          description: 'Reconocimiento por contribución destacada en cardiología',
          type: 'award'
        }
      ],
      isActivelyLooking: true,
      lastActiveAt: '2025-01-29T10:30:00Z',
      profileCompleteness: 95,
      applicationsSent: 12,
      applicationsAccepted: 3,
      rating: 4.8
    };
  },

  async getDoctorApplications(doctorId: string) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    return [
      {
        id: 'app-001',
        jobId: 'job-001',
        companyName: 'Hospital General Madrid',
        jobTitle: 'Cardiólogo Senior',
        status: 'shortlisted',
        appliedAt: '2025-01-20T10:30:00Z',
        lastUpdate: '2025-01-25T14:20:00Z'
      },
      {
        id: 'app-002',
        jobId: 'job-002',
        companyName: 'Clínica San Rafael',
        jobTitle: 'Cardiólogo',
        status: 'pending',
        appliedAt: '2025-01-22T15:45:00Z',
        lastUpdate: '2025-01-22T15:45:00Z'
      },
      {
        id: 'app-003',
        jobId: 'job-003',
        companyName: 'Centro Médico Valencia',
        jobTitle: 'Especialista en Cardiología',
        status: 'accepted',
        appliedAt: '2025-01-15T11:20:00Z',
        lastUpdate: '2025-01-28T16:30:00Z'
      }
    ];
  },

  async getDoctorReviews(doctorId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'review-001',
        reviewerId: 'company-001',
        reviewerName: 'Hospital General Madrid',
        rating: 5,
        title: 'Excelente profesional',
        content: 'La Dra. González demostró un conocimiento excepcional y un trato excelente con los pacientes durante su tiempo con nosotros.',
        strengths: ['Conocimiento técnico', 'Trato al paciente', 'Trabajo en equipo'],
        areasForImprovement: [],
        wouldHireAgain: true,
        isVerified: true,
        submittedAt: '2024-12-15T10:30:00Z'
      },
      {
        id: 'review-002',
        reviewerId: 'company-002',
        reviewerName: 'Clínica San Rafael',
        rating: 4,
        title: 'Muy competente',
        content: 'Profesional muy preparada con gran capacidad de diagnóstico. Muy recomendable.',
        strengths: ['Diagnóstico preciso', 'Puntualidad', 'Profesionalismo'],
        areasForImprovement: ['Comunicación interdisciplinaria'],
        wouldHireAgain: true,
        isVerified: true,
        submittedAt: '2024-11-20T14:15:00Z'
      }
    ];
  },

  async updateDoctorProfile(doctorId: string, updates: Partial<MarketplaceDoctor>): Promise<MarketplaceDoctor> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const currentProfile = await this.getDoctorProfile(doctorId);
    return { ...currentProfile, ...updates };
  },

  async getDoctorInsights(doctorId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      profileViews: {
        total: 234,
        lastWeek: 15,
        trend: 'up'
      },
      searchAppearances: {
        total: 89,
        lastWeek: 8,
        averagePosition: 12
      },
      applicationMetrics: {
        sent: 12,
        responseRate: 75, // percentage
        successRate: 25, // percentage
        averageResponseTime: 3.2 // days
      },
      marketPosition: {
        salaryPercentile: 78, // your salary expectations vs market
        experienceLevel: 'Senior',
        demandScore: 8.5, // out of 10
        competitivenessRating: 'High'
      },
      skillsDemand: [
        { skill: 'Cardiología Intervencionista', demand: 95, yourLevel: 90 },
        { skill: 'Ecocardiografía', demand: 85, yourLevel: 95 },
        { skill: 'Holter', demand: 70, yourLevel: 80 },
        { skill: 'Ergometría', demand: 65, yourLevel: 75 },
        { skill: 'Rehabilitación Cardíaca', demand: 60, yourLevel: 70 }
      ],
      recommendedActions: [
        {
          type: 'skill_improvement',
          title: 'Actualizar certificación en Ecocardiografía',
          description: 'Tu certificación expira pronto. Renovarla aumentará tu competitividad.',
          priority: 'high',
          estimatedImpact: 'Aumento del 15% en visualizaciones del perfil'
        },
        {
          type: 'profile_optimization',
          title: 'Añadir más casos clínicos al portfolio',
          description: 'Los perfiles con casos clínicos reciben 40% más interés.',
          priority: 'medium',
          estimatedImpact: 'Mejora en ranking de búsqueda'
        },
        {
          type: 'networking',
          title: 'Conectar con más especialistas',
          description: 'Ampliar tu red profesional puede generar más oportunidades.',
          priority: 'low',
          estimatedImpact: 'Acceso a oportunidades no publicadas'
        }
      ],
      monthlyActivity: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('es-ES', { month: 'short' }),
        profileViews: Math.floor(Math.random() * 50) + 20,
        applications: Math.floor(Math.random() * 5) + 1,
        interviews: Math.floor(Math.random() * 3),
        offers: Math.floor(Math.random() * 2)
      }))
    };
  },

  async searchDoctors(filters: {
    specialization?: string;
    experience?: string;
    location?: string;
    availability?: string;
    search?: string;
  } = {}) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const doctors = [
      {
        id: 'doctor-001',
        firstName: 'María',
        lastName: 'González',
        specialization: 'Cardiología',
        experience: 8,
        location: 'Madrid, España',
        avatar: '/avatars/maria-gonzalez.jpg',
        rating: 4.8,
        skills: ['Cardiología Intervencionista', 'Ecocardiografía'],
        isActivelyLooking: true,
        profileCompleteness: 95,
        lastActive: '2025-01-29T10:30:00Z'
      },
      {
        id: 'doctor-002',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        specialization: 'Traumatología',
        experience: 12,
        location: 'Barcelona, España',
        avatar: '/avatars/carlos-rodriguez.jpg',
        rating: 4.6,
        skills: ['Cirugía Ortopédica', 'Artroscopia'],
        isActivelyLooking: false,
        profileCompleteness: 88,
        lastActive: '2025-01-28T14:20:00Z'
      },
      {
        id: 'doctor-003',
        firstName: 'Ana',
        lastName: 'López',
        specialization: 'Pediatría',
        experience: 6,
        location: 'Valencia, España',
        avatar: '/avatars/ana-lopez.jpg',
        rating: 4.9,
        skills: ['Neonatología', 'Cuidados Intensivos Pediátricos'],
        isActivelyLooking: true,
        profileCompleteness: 92,
        lastActive: '2025-01-29T09:15:00Z'
      }
    ];

    // Apply filters
    let filteredDoctors = doctors;
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredDoctors = filteredDoctors.filter(doctor =>
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(search) ||
        doctor.specialization.toLowerCase().includes(search) ||
        doctor.skills.some(skill => skill.toLowerCase().includes(search))
      );
    }

    if (filters.specialization) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.specialization === filters.specialization
      );
    }

    if (filters.location) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.location.includes(filters.location!)
      );
    }

    if (filters.availability === 'available') {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.isActivelyLooking
      );
    }

    return {
      doctors: filteredDoctors,
      total: filteredDoctors.length,
      filters: {
        specializations: ['Cardiología', 'Traumatología', 'Pediatría', 'Medicina General', 'Ginecología'],
        locations: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
        experienceLevels: ['1-3 años', '3-5 años', '5-10 años', '10+ años']
      }
    };
  }
};

// Main doctor profile hook
export const useDoctorProfile = (doctorId: string) => {
  return useQuery({
    queryKey: ['doctor-profile', doctorId],
    queryFn: () => mockDoctorApi.getDoctorProfile(doctorId),
    enabled: !!doctorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Doctor applications hook
export const useDoctorApplications = (doctorId: string) => {
  return useQuery({
    queryKey: ['doctor-applications', doctorId],
    queryFn: () => mockDoctorApi.getDoctorApplications(doctorId),
    enabled: !!doctorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false
  });
};

// Doctor reviews hook
export const useDoctorReviews = (doctorId: string) => {
  return useQuery({
    queryKey: ['doctor-reviews', doctorId],
    queryFn: () => mockDoctorApi.getDoctorReviews(doctorId),
    enabled: !!doctorId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false
  });
};

// Doctor insights hook (for doctor's own dashboard)
export const useDoctorInsights = (doctorId: string) => {
  return useQuery({
    queryKey: ['doctor-insights', doctorId],
    queryFn: () => mockDoctorApi.getDoctorInsights(doctorId),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Update doctor profile hook
export const useUpdateDoctorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, updates }: { doctorId: string; updates: Partial<MarketplaceDoctor> }) =>
      mockDoctorApi.updateDoctorProfile(doctorId, updates),
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(['doctor-profile', updatedProfile.id], updatedProfile);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['doctor-insights', updatedProfile.id] });
    }
  });
};

// Doctors directory/search hook
export const useDoctorsDirectory = (filters: {
  specialization?: string;
  experience?: string;
  location?: string;
  availability?: string;
  search?: string;
} = {}) => {
  return useQuery({
    queryKey: ['doctors-directory', filters],
    queryFn: () => mockDoctorApi.searchDoctors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Doctor search suggestions hook
export const useDoctorSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['doctor-search-suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const suggestions = [
        'Cardiología',
        'Traumatología',
        'Pediatría',
        'Medicina General',
        'Ginecología',
        'Dr. María González',
        'Dr. Carlos Rodríguez',
        'Cardiología Intervencionista',
        'Ecocardiografía'
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

// Doctor recommendation hook (for companies)
export const useDoctorRecommendations = (companyId: string, jobId?: string) => {
  return useQuery({
    queryKey: ['doctor-recommendations', companyId, jobId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock recommendations based on company/job requirements
      return [
        {
          id: 'doctor-001',
          firstName: 'María',
          lastName: 'González',
          specialization: 'Cardiología',
          matchScore: 95,
          reasons: [
            'Especialización exacta requerida',
            'Experiencia superior a lo solicitado',
            'Ubicación geográfica ideal',
            'Excelentes referencias'
          ],
          avatar: '/avatars/maria-gonzalez.jpg',
          experience: 8,
          rating: 4.8,
          isActivelyLooking: true
        },
        {
          id: 'doctor-004',
          firstName: 'Luis',
          lastName: 'Martínez',
          specialization: 'Cardiología',
          matchScore: 88,
          reasons: [
            'Especialización requerida',
            'Experiencia adecuada',
            'Disponibilidad inmediata',
            'Certificaciones actualizadas'
          ],
          avatar: '/avatars/luis-martinez.jpg',
          experience: 6,
          rating: 4.5,
          isActivelyLooking: true
        }
      ];
    },
    enabled: !!companyId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false
  });
};

// Doctor availability hook
export const useDoctorAvailability = (doctorId: string) => {
  return useQuery({
    queryKey: ['doctor-availability', doctorId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        isActivelyLooking: true,
        availabilityDate: '2025-03-01',
        preferredEmploymentTypes: ['full-time', 'part-time'],
        locationPreference: 'hybrid',
        salaryExpectation: {
          min: 75000,
          max: 95000,
          currency: 'EUR',
          type: 'yearly'
        },
        workSchedulePreference: {
          shiftWork: true,
          weekends: false,
          nights: true,
          emergencies: true
        },
        lastUpdated: '2025-01-29T10:30:00Z'
      };
    },
    enabled: !!doctorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};
