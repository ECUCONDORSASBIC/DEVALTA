import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { JobFilters, MarketplaceCompany, MarketplaceDoctor, MarketplaceJob } from '../types/marketplace';

interface MarketplaceState {
  // Current user
  currentUser: {
    id: string;
    type: 'company' | 'doctor';
    profile?: MarketplaceCompany | MarketplaceDoctor;
  } | null;

  // Jobs state
  jobs: MarketplaceJob[];
  bookmarkedJobs: string[];
  activeFilters: JobFilters;
  searchQuery: string;
  isLoadingJobs: boolean;

  // Applications state
  applications: any[];
  isLoadingApplications: boolean;

  // Companies directory
  companies: MarketplaceCompany[];
  isLoadingCompanies: boolean;

  // Doctors directory
  doctors: MarketplaceDoctor[];
  isLoadingDoctors: boolean;

  // UI state
  sidebarOpen: boolean;
  notificationsOpen: boolean;
  searchResultsOpen: boolean;

  // Actions
  setCurrentUser: (user: MarketplaceState['currentUser']) => void;
  updateUserProfile: (updates: Partial<MarketplaceCompany | MarketplaceDoctor>) => void;
  
  // Jobs actions
  setJobs: (jobs: MarketplaceJob[]) => void;
  addJob: (job: MarketplaceJob) => void;
  updateJob: (jobId: string, updates: Partial<MarketplaceJob>) => void;
  removeJob: (jobId: string) => void;
  bookmarkJob: (jobId: string) => void;
  unbookmarkJob: (jobId: string) => void;
  setJobsLoading: (loading: boolean) => void;

  // Search and filters
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: JobFilters) => void;
  updateFilter: (key: keyof JobFilters, value: any) => void;
  clearFilters: () => void;

  // Applications actions
  setApplications: (applications: any[]) => void;
  addApplication: (application: any) => void;
  updateApplication: (applicationId: string, updates: any) => void;
  setApplicationsLoading: (loading: boolean) => void;

  // Directory actions
  setCompanies: (companies: MarketplaceCompany[]) => void;
  setDoctors: (doctors: MarketplaceDoctor[]) => void;
  setCompaniesLoading: (loading: boolean) => void;
  setDoctorsLoading: (loading: boolean) => void;

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setSearchResultsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleNotifications: () => void;
  toggleSearchResults: () => void;

  // Reset actions
  reset: () => void;
  resetJobs: () => void;
  resetApplications: () => void;
}

const initialState = {
  currentUser: null,
  jobs: [],
  bookmarkedJobs: [],
  activeFilters: {},
  searchQuery: '',
  isLoadingJobs: false,
  applications: [],
  isLoadingApplications: false,
  companies: [],
  isLoadingCompanies: false,
  doctors: [],
  isLoadingDoctors: false,
  sidebarOpen: true,
  notificationsOpen: false,
  searchResultsOpen: false,
};

export const useMarketplaceStore = create<MarketplaceState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // User actions
        setCurrentUser: (user) => set({ currentUser: user }),
        updateUserProfile: (updates) => set((state) => ({
          currentUser: state.currentUser ? {
            ...state.currentUser,
            profile: state.currentUser.profile ? { ...state.currentUser.profile, ...updates } : undefined
          } : null
        })),

        // Jobs actions
        setJobs: (jobs) => set({ jobs }),
        addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
        updateJob: (jobId, updates) => set((state) => ({
          jobs: state.jobs.map(job => job.id === jobId ? { ...job, ...updates } : job)
        })),
        removeJob: (jobId) => set((state) => ({
          jobs: state.jobs.filter(job => job.id !== jobId),
          bookmarkedJobs: state.bookmarkedJobs.filter(id => id !== jobId)
        })),
        bookmarkJob: (jobId) => set((state) => ({
          bookmarkedJobs: state.bookmarkedJobs.includes(jobId) 
            ? state.bookmarkedJobs 
            : [...state.bookmarkedJobs, jobId]
        })),
        unbookmarkJob: (jobId) => set((state) => ({
          bookmarkedJobs: state.bookmarkedJobs.filter(id => id !== jobId)
        })),
        setJobsLoading: (loading) => set({ isLoadingJobs: loading }),

        // Search and filters
        setSearchQuery: (query) => set({ searchQuery: query }),
        setActiveFilters: (filters) => set({ activeFilters: filters }),
        updateFilter: (key, value) => set((state) => ({
          activeFilters: { ...state.activeFilters, [key]: value }
        })),
        clearFilters: () => set({ activeFilters: {}, searchQuery: '' }),

        // Applications actions
        setApplications: (applications) => set({ applications }),
        addApplication: (application) => set((state) => ({ 
          applications: [application, ...state.applications] 
        })),
        updateApplication: (applicationId, updates) => set((state) => ({
          applications: state.applications.map(app => 
            app.id === applicationId ? { ...app, ...updates } : app
          )
        })),
        setApplicationsLoading: (loading) => set({ isLoadingApplications: loading }),

        // Directory actions
        setCompanies: (companies) => set({ companies }),
        setDoctors: (doctors) => set({ doctors }),
        setCompaniesLoading: (loading) => set({ isLoadingCompanies: loading }),
        setDoctorsLoading: (loading) => set({ isLoadingDoctors: loading }),

        // UI actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setNotificationsOpen: (open) => set({ notificationsOpen: open }),
        setSearchResultsOpen: (open) => set({ searchResultsOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),
        toggleSearchResults: () => set((state) => ({ searchResultsOpen: !state.searchResultsOpen })),

        // Reset actions
        reset: () => set(initialState),
        resetJobs: () => set({ 
          jobs: [], 
          bookmarkedJobs: [], 
          activeFilters: {}, 
          searchQuery: '', 
          isLoadingJobs: false 
        }),
        resetApplications: () => set({ 
          applications: [], 
          isLoadingApplications: false 
        }),
      }),
      {
        name: 'marketplace-storage',
        partialize: (state) => ({
          currentUser: state.currentUser,
          bookmarkedJobs: state.bookmarkedJobs,
          activeFilters: state.activeFilters,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'marketplace-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for better performance
export const useCurrentUser = () => useMarketplaceStore((state) => state.currentUser);
export const useJobs = () => useMarketplaceStore((state) => state.jobs);
export const useBookmarkedJobs = () => useMarketplaceStore((state) => state.bookmarkedJobs);
export const useActiveFilters = () => useMarketplaceStore((state) => state.activeFilters);
export const useSearchQuery = () => useMarketplaceStore((state) => state.searchQuery);
export const useApplications = () => useMarketplaceStore((state) => state.applications);
export const useUIState = () => useMarketplaceStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  notificationsOpen: state.notificationsOpen,
  searchResultsOpen: state.searchResultsOpen,
}));
export const useLoadingStates = () => useMarketplaceStore((state) => ({
  isLoadingJobs: state.isLoadingJobs,
  isLoadingApplications: state.isLoadingApplications,
  isLoadingCompanies: state.isLoadingCompanies,
  isLoadingDoctors: state.isLoadingDoctors,
}));
