export interface MarketplaceJob {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: {
    type: 'remote' | 'hybrid' | 'onsite';
    city?: string;
    country?: string;
    address?: string;
  };
  employment: {
    type: 'full-time' | 'part-time' | 'contract' | 'temporary';
    schedule?: string;
    hours?: number;
  };
  compensation: {
    currency: string;
    min?: number;
    max?: number;
    type: 'hourly' | 'monthly' | 'yearly';
    benefits?: string[];
  };
  specializations: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'expert';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  applicationDeadline?: string;
  startDate?: string;
  tags: string[];
  status: 'active' | 'paused' | 'closed' | 'draft';
  postedAt: string;
  updatedAt: string;
  applicationsCount: number;
  viewsCount: number;
  isSponsored?: boolean;
  contactInfo?: {
    email?: string;
    phone?: string;
    contactPerson?: string;
  };
}

export interface JobApplication {
  id: string;
  jobId: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone?: string;
  doctorSpecialization: string;
  doctorExperience: number;
  coverLetter: string;
  resume?: {
    url: string;
    filename: string;
    uploadedAt: string;
  };
  portfolio?: {
    url: string;
    description: string;
  }[];
  expectedSalary?: {
    amount: number;
    currency: string;
    type: 'hourly' | 'monthly' | 'yearly';
  };
  availabilityDate?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  companyNotes?: string;
  interviewScheduled?: {
    date: string;
    type: 'phone' | 'video' | 'in-person';
    location?: string;
    meetingLink?: string;
  };
  feedback?: {
    rating: number;
    comments: string;
    reviewer: string;
    reviewedAt: string;
  };
}

export interface MarketplaceMetrics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationsByStatus: {
    pending: number;
    reviewing: number;
    shortlisted: number;
    interviewed: number;
    accepted: number;
    rejected: number;
  };
  averageApplicationsPerJob: number;
  topSpecializations: {
    specialization: string;
    count: number;
  }[];
  jobsByUrgency: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  applicationTrends: {
    date: string;
    applications: number;
    views: number;
  }[];
}

export interface JobFilters {
  search?: string;
  specializations?: string[];
  location?: {
    type?: 'remote' | 'hybrid' | 'onsite';
    cities?: string[];
    countries?: string[];
  };
  employment?: {
    types?: ('full-time' | 'part-time' | 'contract' | 'temporary')[];
  };
  compensation?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  experienceLevel?: ('junior' | 'mid' | 'senior' | 'expert')[];
  urgency?: ('low' | 'medium' | 'high' | 'urgent')[];
  postedAfter?: string;
  isSponsored?: boolean;
  companyIds?: string[];
}

export interface JobSearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'salary' | 'applications';
  sortOrder?: 'asc' | 'desc';
  filters?: JobFilters;
}

export interface MarketplaceCompany {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  industry: string;
  size: string;
  location: {
    city: string;
    country: string;
    address?: string;
  };
  contactInfo: {
    email: string;
    phone?: string;
    contactPerson?: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  benefits: string[];
  culture: string[];
  ratings?: {
    overall: number;
    workLifeBalance: number;
    compensation: number;
    culture: number;
    management: number;
    careerGrowth: number;
  };
  isVerified: boolean;
  isPremium: boolean;
  activeJobsCount: number;
  totalApplicationsReceived: number;
  joinedAt: string;
}

export interface MarketplaceDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialization: string;
  subSpecializations?: string[];
  licenseNumber: string;
  experience: number;
  location: {
    city: string;
    country: string;
  };
  bio: string;
  skills: string[];
  languages: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: number;
    expiryYear?: number;
  }[];
  workPreferences: {
    employmentTypes: ('full-time' | 'part-time' | 'contract' | 'temporary')[];
    locationPreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
    expectedSalary?: {
      min: number;
      max: number;
      currency: string;
      type: 'hourly' | 'monthly' | 'yearly';
    };
    availabilityDate?: string;
  };
  portfolio?: {
    title: string;
    description: string;
    url?: string;
    type: 'research' | 'publication' | 'project' | 'award';
  }[];
  isActivelyLooking: boolean;
  lastActiveAt: string;
  profileCompleteness: number;
  applicationsSent: number;
  applicationsAccepted: number;
  rating?: number;
}
