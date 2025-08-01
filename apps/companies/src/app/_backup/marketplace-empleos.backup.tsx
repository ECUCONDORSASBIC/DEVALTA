// BACKUP DEL MARKETPLACE ORIGINAL DE EMPLEOS
// Este código fue reemplazado por el marketplace de productos médicos
// Fecha de backup: ${new Date().toISOString()}

interface MarketplaceOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  specialty: string;
  type: 'job' | 'contract' | 'consultation' | 'partnership';
  salary: string;
  postedDate: string;
  applications: number;
  rating: number;
  urgent?: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  experience: string;
  schedule: string;
  remote?: boolean;
  companyLogo?: string;
  companySize: string;
  companyIndustry: string;
}

interface FilterState {
  search: string;
  location: string[];
  specialty: string[];
  type: string[];
  salaryRange: [number, number];
  experience: string[];
  remote: boolean | null;
  urgent: boolean;
}

type SortOption = 'recent' | 'salary' | 'applications' | 'rating';

const ALL_OFFERS: MarketplaceOffer[] = [
  {
    id: "1",
    title: "Cardiólogo Intervencionista",
    company: "Hospital Italiano de Buenos Aires",
    location: "Buenos Aires, Argentina",
    specialty: "Cardiología",
    type: "job",
    salary: "USD 8,000 - 12,000",
    postedDate: "2025-01-15",
    applications: 12,
    rating: 4.9,
    urgent: true,
    description: "Buscamos cardiólogo especializado en procedimientos intervencionistas para nuestro departamento de cardiología.",
    requirements: [
      "Especialidad en Cardiología",
      "Experiencia mínima 5 años",
      "Certificación en procedimientos intervencionistas"
    ],
    benefits: [
      "Seguro médico familiar",
      "Capacitación continua",
      "Horario flexible"
    ],
    experience: "5-10 años",
    schedule: "Tiempo completo",
    companySize: "2500+ empleados",
    companyIndustry: "Medicina General",
    remote: false
  },
  {
    id: "2",
    title: "Oncólogo Médico",
    company: "Hospital Metropolitano",
    location: "Quito, Ecuador",
    specialty: "Oncología",
    type: "job",
    salary: "USD 5,000 - 8,000",
    postedDate: "2025-01-08",
    applications: 11,
    rating: 4.8,
    description: "Oncólogo para nuestro departamento de oncología con experiencia en tratamientos innovadores.",
    requirements: [
      "Especialidad en Oncología",
      "Experiencia en tratamientos innovadores",
      "Certificación internacional"
    ],
    benefits: [
      "Equipamiento de última generación",
      "Capacitación internacional",
      "Investigación clínica"
    ],
    experience: "3-7 años",
    schedule: "Tiempo completo",
    companySize: "1800+ empleados",
    companyIndustry: "Medicina Integral",
    remote: true
  }
];

const SPECIALTIES = [
  "Cardiología", "Oncología", "Neurología", "Pediatría", "Cirugía", 
  "Ginecología", "Traumatología", "Dermatología", "Psiquiatría"
];

const LOCATIONS = [
  "Buenos Aires, Argentina", "Quito, Ecuador", "Porto Alegre, Brasil",
  "Santiago, Chile", "Lima, Perú", "Bogotá, Colombia"
];

const EXPERIENCES = [
  "0-2 años", "3-5 años", "5-10 años", "10+ años"
];

const CONTRACT_TYPES = [
  { value: 'job', label: 'Empleo' },
  { value: 'contract', label: 'Contrato' },
  { value: 'consultation', label: 'Consulta' },
  { value: 'partnership', label: 'Alianza' }
];

// El resto del código del marketplace de empleos estaba aquí...
// Se puede restaurar copiando desde el archivo backup original si es necesario