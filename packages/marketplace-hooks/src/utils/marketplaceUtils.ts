import type { JobFilters, MarketplaceDoctor, MarketplaceJob } from '../types/marketplace';

/**
 * Format salary range for display
 */
export const formatSalary = (
  min?: number,
  max?: number,
  currency: string = 'EUR',
  type: 'hourly' | 'monthly' | 'yearly' = 'yearly'
): string => {
  if (!min && !max) return 'Salario a negociar';
  
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const typeLabels = {
    hourly: '/hora',
    monthly: '/mes',
    yearly: '/año',
  };

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}${typeLabels[type]}`;
  }
  
  if (min) {
    return `Desde ${formatter.format(min)}${typeLabels[type]}`;
  }
  
  if (max) {
    return `Hasta ${formatter.format(max)}${typeLabels[type]}`;
  }

  return 'Salario a negociar';
};

/**
 * Calculate match score between a doctor and a job
 */
export const calculateMatchScore = (doctor: MarketplaceDoctor, job: MarketplaceJob): number => {
  let score = 0;
  let totalFactors = 0;

  // Specialization match (40% weight)
  totalFactors += 40;
  if (doctor.specialization === job.specialization) {
    score += 40;
  } else if (doctor.subSpecializations?.some(sub => 
    job.requirements?.specializations?.includes(sub)
  )) {
    score += 20;
  }

  // Experience match (25% weight)
  totalFactors += 25;
  if (job.requirements?.minExperience && doctor.experience >= job.requirements.minExperience) {
    if (doctor.experience >= job.requirements.minExperience + 2) {
      score += 25; // Exceeds requirements
    } else {
      score += 20; // Meets requirements
    }
  } else if (!job.requirements?.minExperience) {
    score += 15; // No specific requirement
  }

  // Location match (15% weight)
  totalFactors += 15;
  if (doctor.location?.city === job.location?.city) {
    score += 15;
  } else if (doctor.location?.country === job.location?.country) {
    score += 10;
  } else if (job.isRemote || doctor.workPreferences?.locationPreference === 'remote') {
    score += 12;
  }

  // Skills match (15% weight)
  totalFactors += 15;
  if (job.requirements?.skills && doctor.skills) {
    const matchingSkills = doctor.skills.filter(skill => 
      job.requirements?.skills?.some(reqSkill => 
        skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    const skillMatchPercentage = matchingSkills.length / job.requirements.skills.length;
    score += Math.round(skillMatchPercentage * 15);
  }

  // Languages match (5% weight)
  totalFactors += 5;
  if (job.requirements?.languages && doctor.languages) {
    const matchingLanguages = doctor.languages.filter(lang => 
      job.requirements?.languages?.includes(lang)
    );
    if (matchingLanguages.length > 0) {
      score += Math.min(5, matchingLanguages.length * 2);
    }
  }

  return Math.round((score / totalFactors) * 100);
};

/**
 * Format time ago string
 */
export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Hace unos segundos';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} semana${diffInWeeks !== 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `Hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`;
};

/**
 * Generate URL slug from string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

/**
 * Validate job filters
 */
export const validateJobFilters = (filters: JobFilters): JobFilters => {
  const validatedFilters: JobFilters = {};

  if (filters.specializations && filters.specializations.length > 0) {
    validatedFilters.specializations = filters.specializations;
  }

  if (filters.locations && filters.locations.length > 0) {
    validatedFilters.locations = filters.locations;
  }

  if (filters.employmentTypes && filters.employmentTypes.length > 0) {
    validatedFilters.employmentTypes = filters.employmentTypes;
  }

  if (filters.experienceLevel) {
    validatedFilters.experienceLevel = filters.experienceLevel;
  }

  if (filters.salaryRange && (filters.salaryRange.min || filters.salaryRange.max)) {
    validatedFilters.salaryRange = filters.salaryRange;
  }

  if (filters.isRemote !== undefined) {
    validatedFilters.isRemote = filters.isRemote;
  }

  if (filters.hasVisa !== undefined) {
    validatedFilters.hasVisa = filters.hasVisa;
  }

  if (filters.postedWithin) {
    validatedFilters.postedWithin = filters.postedWithin;
  }

  if (filters.companySize) {
    validatedFilters.companySize = filters.companySize;
  }

  return validatedFilters;
};

/**
 * Calculate job urgency level
 */
export const calculateJobUrgency = (job: MarketplaceJob): 'low' | 'medium' | 'high' | 'urgent' => {
  const now = new Date();
  const postedDate = new Date(job.postedAt);
  const daysSincePosted = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

  // Check for urgency keywords
  const urgentKeywords = ['urgente', 'inmediato', 'asap', 'cuanto antes'];
  const hasUrgentKeywords = urgentKeywords.some(keyword => 
    job.title.toLowerCase().includes(keyword) || 
    job.description.toLowerCase().includes(keyword)
  );

  if (hasUrgentKeywords) return 'urgent';

  // Check application deadline
  if (job.applicationDeadline) {
    const deadline = new Date(job.applicationDeadline);
    const daysUntilDeadline = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 3) return 'urgent';
    if (daysUntilDeadline <= 7) return 'high';
    if (daysUntilDeadline <= 14) return 'medium';
  }

  // Based on posting recency and application count
  if (daysSincePosted <= 1 && (job.applicationCount || 0) < 5) return 'high';
  if (daysSincePosted <= 3 && (job.applicationCount || 0) < 10) return 'medium';
  
  return 'low';
};

/**
 * Generate job sharing URL
 */
export const generateJobShareUrl = (job: MarketplaceJob, baseUrl: string = ''): string => {
  const slug = generateSlug(`${job.title} ${job.company.name}`);
  return `${baseUrl}/jobs/${job.id}/${slug}`;
};

/**
 * Extract keywords from job description
 */
export const extractJobKeywords = (description: string): string[] => {
  const text = description.toLowerCase();
  const commonKeywords = [
    'cardiología', 'traumatología', 'pediatría', 'ginecología', 'neurología',
    'oftalmología', 'dermatología', 'psiquiatría', 'radiología', 'anestesia',
    'cirugía', 'medicina general', 'medicina interna', 'emergencias',
    'cuidados intensivos', 'oncología', 'endocrinología', 'reumatología',
    'telemedicina', 'consulta', 'diagnóstico', 'tratamiento', 'seguimiento',
    'historia clínica', 'prescripción', 'ecografía', 'rayos x',
    'guardia', 'urgencias', 'hospitalización', 'ambulatorio'
  ];

  const foundKeywords = commonKeywords.filter(keyword => text.includes(keyword));
  
  // Add custom keywords from requirements
  const words = text.split(/\W+/).filter(word => word.length > 3);
  const medicalTerms = words.filter(word => 
    word.endsWith('logía') || 
    word.endsWith('ología') || 
    word.endsWith('iatría') ||
    word.startsWith('cardio') ||
    word.startsWith('neuro') ||
    word.startsWith('gastro')
  );

  return [...new Set([...foundKeywords, ...medicalTerms])].slice(0, 10);
};

/**
 * Format job requirements for display
 */
export const formatJobRequirements = (job: MarketplaceJob): string[] => {
  const requirements: string[] = [];

  if (job.requirements?.minExperience) {
    requirements.push(`${job.requirements.minExperience}+ años de experiencia`);
  }

  if (job.requirements?.education) {
    requirements.push(job.requirements.education);
  }

  if (job.requirements?.specializations?.length) {
    requirements.push(`Especialización: ${job.requirements.specializations.join(', ')}`);
  }

  if (job.requirements?.languages?.length) {
    requirements.push(`Idiomas: ${job.requirements.languages.join(', ')}`);
  }

  if (job.requirements?.skills?.length) {
    requirements.push(`Habilidades: ${job.requirements.skills.slice(0, 3).join(', ')}`);
  }

  if (job.requirements?.licenseRequired) {
    requirements.push('Licencia médica requerida');
  }

  return requirements;
};

/**
 * Calculate application success probability
 */
export const calculateApplicationSuccessProbability = (
  doctor: MarketplaceDoctor,
  job: MarketplaceJob
): number => {
  const matchScore = calculateMatchScore(doctor, job);
  const urgency = calculateJobUrgency(job);
  const applicationCount = job.applicationCount || 0;

  let probability = matchScore;

  // Adjust based on competition
  if (applicationCount < 5) probability += 10;
  else if (applicationCount < 15) probability += 5;
  else if (applicationCount > 50) probability -= 15;
  else if (applicationCount > 30) probability -= 10;

  // Adjust based on urgency
  switch (urgency) {
    case 'urgent':
      probability += 15;
      break;
    case 'high':
      probability += 10;
      break;
    case 'medium':
      probability += 5;
      break;
  }

  // Adjust based on doctor's profile completeness
  if (doctor.profileCompleteness >= 90) probability += 5;
  else if (doctor.profileCompleteness < 70) probability -= 10;

  // Adjust based on doctor's activity
  const lastActiveDate = new Date(doctor.lastActiveAt);
  const daysSinceActive = Math.floor((new Date().getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceActive <= 1) probability += 5;
  else if (daysSinceActive > 7) probability -= 5;

  return Math.max(0, Math.min(100, Math.round(probability)));
};

/**
 * Debounce function for search queries
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate mock data for development
 */
export const generateMockJobs = (count: number = 10): MarketplaceJob[] => {
  const specializations = ['Cardiología', 'Traumatología', 'Pediatría', 'Ginecología', 'Neurología'];
  const companies = ['Hospital General', 'Clínica San Rafael', 'Centro Médico Valencia', 'Hospital La Paz'];
  const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];

  return Array.from({ length: count }, (_, i) => ({
    id: `job-${i + 1}`,
    title: `${specializations[i % specializations.length]} - ${companies[i % companies.length]}`,
    company: {
      id: `company-${i + 1}`,
      name: companies[i % companies.length],
      logo: `/logos/company-${i + 1}.png`,
      location: `${cities[i % cities.length]}, España`,
      rating: 4.0 + Math.random(),
      verified: Math.random() > 0.3
    },
    specialization: specializations[i % specializations.length],
    description: `Buscamos ${specializations[i % specializations.length]} con experiencia...`,
    location: {
      city: cities[i % cities.length],
      country: 'España',
      remote: Math.random() > 0.7
    },
    salary: {
      min: 50000 + Math.floor(Math.random() * 30000),
      max: 70000 + Math.floor(Math.random() * 50000),
      currency: 'EUR',
      type: 'yearly' as const
    },
    employmentType: ['full-time', 'part-time', 'contract'][Math.floor(Math.random() * 3)] as any,
    requirements: {
      minExperience: Math.floor(Math.random() * 10) + 1,
      education: 'Grado en Medicina',
      specializations: [specializations[i % specializations.length]],
      skills: ['Diagnóstico', 'Tratamiento', 'Comunicación'],
      languages: ['Español'],
      licenseRequired: true
    },
    benefits: ['Seguro médico', 'Flexibilidad horaria', 'Formación continua'],
    schedule: {
      type: 'fixed' as const,
      hours: '40 horas/semana',
      shifts: ['day']
    },
    postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    applicationDeadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    applicationCount: Math.floor(Math.random() * 50),
    viewCount: Math.floor(Math.random() * 200),
    isUrgent: Math.random() > 0.8,
    isFeatured: Math.random() > 0.9,
    isRemote: Math.random() > 0.7,
    tags: ['Medicina', 'Salud'],
    status: 'active' as const
  }));
};
