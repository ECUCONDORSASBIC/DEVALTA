// Route constants for the companies application
export const AppRoutes = {
  // Main pages
  Home: '/',
  Dashboard: '/',
  
  // Job-related routes
  Listings: '/jobs',
  PostJob: '/jobs/post',
  
  // Doctor-related routes
  SearchDoctors: '/doctors',
  
  // Company-related routes
  Companies: '/companies',
  MyCompany: '/my-company',
  
  // Application and hiring routes
  Applications: '/applications',
  MyApplications: '/my-applications',
  
  // Analytics and metrics
  Metrics: '/metrics',
  Analytics: '/analytics',
  
  // Settings and profile
  Settings: '/settings',
  Profile: '/profile',
  
  // Auth routes
  Login: '/login',
  Register: '/register',
  ForgotPassword: '/forgot-password',
} as const;

// Helper functions for dynamic routes
export const AppRoutesHelpers = {
  JobDetails: (id: string) => `/jobs/${id}`,
  DoctorProfile: (id: string) => `/doctors/${id}`,
  CompanyProfile: (id: string) => `/companies/${id}`,
} as const;

export type AppRoute = typeof AppRoutes[keyof typeof AppRoutes];
