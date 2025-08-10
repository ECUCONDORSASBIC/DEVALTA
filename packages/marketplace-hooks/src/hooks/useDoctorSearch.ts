import { useQuery } from '@tanstack/react-query';

export interface DoctorSearchFilters {
  search?: string;
  specialties?: string[];
  minExperience?: number;
  maxRate?: number;
  location?: {
    city?: string;
    country?: string;
    radiusKm?: number;
  };
  availability?: 'now' | '24h' | 'week' | 'month';
}

export interface DoctorSummary {
  id: string;
  name: string;
  specialties: string[];
  rating?: number;
  hourlyRate?: number;
  location?: {
    city?: string;
    country?: string;
    coordinates?: [number, number];
  };
  isOnline?: boolean;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
}

export interface DoctorSearchResult {
  doctors: DoctorSummary[];
  total: number;
  hasMore: boolean;
}

const mockSearchApi = {
  async searchDoctors(filters: DoctorSearchFilters = {}): Promise<DoctorSearchResult> {
    await new Promise((r) => setTimeout(r, 300));
    const doctors: DoctorSummary[] = [
      {
        id: 'dr-martinez-001',
        name: 'Dr. Carlos Martínez',
        specialties: ['Cardiología'],
        rating: 4.8,
        hourlyRate: 120,
        location: { city: 'Buenos Aires', country: 'Argentina', coordinates: [-34.6037, -58.3816] },
        isOnline: true,
        verificationStatus: 'verified',
      },
      {
        id: 'dr-lopez-002',
        name: 'Dra. María López',
        specialties: ['Pediatría'],
        rating: 4.6,
        hourlyRate: 80,
        location: { city: 'Córdoba', country: 'Argentina', coordinates: [-31.4201, -64.1888] },
        isOnline: false,
        verificationStatus: 'pending',
      },
    ];

    const search = filters.search?.toLowerCase();
    const filtered = doctors.filter((d) =>
      !search || d.name.toLowerCase().includes(search) || d.specialties.some((s) => s.toLowerCase().includes(search))
    );

    return { doctors: filtered, total: filtered.length, hasMore: false };
  },
};

export function useDoctorSearch(filters: DoctorSearchFilters = {}) {
  return useQuery({
    queryKey: ['doctor-search', filters],
    queryFn: () => mockSearchApi.searchDoctors(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
