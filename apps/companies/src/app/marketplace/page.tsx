'use client';

import {
    Briefcase,
    Clock,
    DollarSign,
    Eye,
    Grid,
    List,
    MapPin,
    MoreHorizontal,
    Plus,
    Search,
    TrendingUp,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Importar hooks del marketplace
import {
    useCompanyProfile,
    useDoctorSearch,
    useJobApplications,
    useMarketplaceJobs
} from '@altamedica/marketplace-hooks';

// === TIPOS TYPESCRIPT ===
interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  specialty: string;
  type: 'full-time' | 'part-time' | 'contract' | 'locum';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  postedDate: string;
  applications: number;
  views: number;
  status: 'active' | 'paused' | 'closed';
  urgent?: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  experience: string;
  schedule: string;
  remote?: boolean;
}

interface CompanyMarketplaceStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  averageRating: number;
  responseRate: number;
}

// === DATOS MOCK ===
const mockCompanyJobs: JobPosting[] = [
  {
    id: "1",
    title: "Cardiólogo Intervencionista",
    department: "Cardiología",
    location: "Buenos Aires, Argentina",
    specialty: "Cardiología",
    type: "full-time",
    salary: { min: 8000, max: 12000, currency: "USD" },
    postedDate: "2025-01-15",
    applications: 12,
    views: 145,
    status: "active",
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
    remote: false
  },
  {
    id: "2",
    title: "Oncólogo Médico",
    department: "Oncología",
    location: "Hospital Metropolitano",
    specialty: "Oncología",
    type: "full-time",
    salary: { min: 5000, max: 8000, currency: "USD" },
    postedDate: "2025-01-08",
    applications: 11,
    views: 98,
    status: "active",
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
    remote: false
  }
];

const mockStats: CompanyMarketplaceStats = {
  totalJobs: 15,
  activeJobs: 8,
  totalApplications: 89,
  totalViews: 1250,
  averageRating: 4.7,
  responseRate: 85
};

// === COMPONENTES ===
const StatCard = ({ icon: Icon, title, value, trend, color }: {
  icon: any;
  title: string;
  value: string | number;
  trend?: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              +{trend}% vs mes anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ job, onEdit, onView, onPause }: {
  job: JobPosting;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onPause: (id: string) => void;
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-neutral-900">{job.title}</h3>
            {job.urgent && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                Urgente
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              job.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : job.status === 'paused'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {job.status === 'active' ? 'Activa' : job.status === 'paused' ? 'Pausada' : 'Cerrada'}
            </span>
          </div>
          <p className="text-neutral-600 mb-2">{job.department}</p>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {job.schedule}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(job.id)}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(job.id)}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Users className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900">{job.applications}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Aplicaciones</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Eye className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900">{job.views}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Visualizaciones</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900">
              {Math.round((job.applications / job.views) * 100)}%
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Conversión</p>
        </div>
      </div>
    </div>
  );
};

// === COMPONENTE PRINCIPAL ===
export default function CompanyMarketplacePage() {
  const router = useRouter();
  
  // Hooks del marketplace
  const {
    company: companyProfile,
    isLoading: isProfileLoading
  } = useCompanyProfile('current-company-id');

  const {
    jobs: publishedJobs,
    isLoading: isJobsLoading,
    error: jobsError,
    createJob,
    updateJob,
    deleteJob
  } = useMarketplaceJobs();

  const {
    applications,
    isLoading: isApplicationsLoading
  } = useJobApplications('current-company-id');

  const {
    doctors: availableDoctors,
    searchDoctors
  } = useDoctorSearch();

  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'closed'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  // Usar datos del hook o mock data como fallback
  const displayJobs = publishedJobs || mockCompanyJobs;
  const stats = {
    totalJobs: displayJobs.length,
    activeJobs: displayJobs.filter(j => j.status === 'active').length,
    totalApplications: applications?.length || mockStats.totalApplications,
    totalViews: displayJobs.reduce((sum, job) => sum + job.views, 0),
    averageRating: mockStats.averageRating,
    responseRate: mockStats.responseRate
  };

  // Filtrar jobs según el término de búsqueda y filtros
  const filteredJobs = displayJobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateJob = () => {
    router.push('/marketplace/jobs/new');
  };

  const handleEditJob = (jobId: string) => {
    router.push(`/marketplace/jobs/${jobId}/edit`);
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/marketplace/jobs/${jobId}`);
  };

  const handlePauseJob = async (jobId: string) => {
    try {
      const job = displayJobs.find(j => j.id === jobId);
      if (job && updateJob) {
        await updateJob(jobId, {
          ...job,
          status: job.status === 'active' ? 'paused' : 'active'
        });
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Marketplace - Gestión de Ofertas</h1>
              <p className="text-sm text-neutral-600 mt-1">
                Gestiona tus ofertas laborales y encuentra los mejores profesionales médicos
              </p>
            </div>
            <button
              onClick={handleCreateJob}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Oferta
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Briefcase}
            title="Total de Ofertas"
            value={stats.totalJobs}
            trend={8}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Ofertas Activas"
            value={stats.activeJobs}
            trend={15}
            color="green"
          />
          <StatCard
            icon={Users}
            title="Aplicaciones Recibidas"
            value={stats.totalApplications}
            trend={22}
            color="purple"
          />
          <StatCard
            icon={Eye}
            title="Visualizaciones"
            value={stats.totalViews.toLocaleString()}
            trend={12}
            color="orange"
          />
        </div>

        {/* Filtros y Controles */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por título, especialidad o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="paused">Pausadas</option>
                <option value="closed">Cerradas</option>
              </select>

              {/* Vista */}
              <div className="flex items-center border border-neutral-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-neutral-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-neutral-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Ofertas */}
        {isJobsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-neutral-600 mt-4">Cargando ofertas...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
            <Briefcase className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No se encontraron ofertas</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera oferta laboral'}
            </p>
            <button
              onClick={handleCreateJob}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Oferta
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 lg:grid-cols-2' 
              : 'grid-cols-1'
          }`}>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEditJob}
                onView={handleViewJob}
                onPause={handlePauseJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
