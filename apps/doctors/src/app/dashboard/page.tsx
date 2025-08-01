'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@altamedica/ui';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  Settings,
  Plus,
  Briefcase,
  MapPin,
  Filter,
  Search,
  Share2,
  Bookmark,
  Send,
  Eye,
  ArrowLeft,
  List,
  Grid,
  Sliders,
  X,
  CheckCircle,
  Star,
  AlertCircle,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  UserX,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Database,
  ChartBar,
  Target,
  Shield,
  Zap,
  Thermometer,
  Pill,
  Syringe,
  Microscope,
  ActivitySquare,
  LineChart,
  PieChart as PieChartIcon,
  TrendingDown,
  Users2,
  UserPlus,
  CalendarDays,
  Clock3,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Monitor,
  Cpu,
  HardDrive,
  Wrench,
  Battery,
  Power,
  AlertCircle as AlertCircleIcon,
  Thermometer as ThermometerIcon,
  Droplets,
  Activity as ActivityIcon,
  Heart as HeartIcon,
  Brain as BrainIcon,
  Eye as EyeIcon,
  Ear,
  Bone,
  Scissors,
  Syringe as SyringeIcon,
  Pill as PillIcon,
  Microscope as MicroscopeIcon,
  TestTube,
  Beaker,
  Scale,
  Timer,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Lock,
  Unlock,
  Key,
  Settings as SettingsIcon,
  Cog,
  Package,
  Truck,
  Home,
  Building,
  MapPin as MapPinIcon,
  Navigation,
  Compass,
  Globe,
  Wifi as WifiIcon,
  Bluetooth,
  Radio,
  Satellite,
  Signal as SignalIcon,
  Battery as BatteryIcon,
  Power as PowerIcon,
  Plug,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Snowflake,
  Umbrella,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldOff,
  ShieldCheck as ShieldCheckIcon,
  ShieldX as ShieldXIcon,
  ShieldAlert as ShieldAlertIcon,
  ShieldOff as ShieldOffIcon
} from 'lucide-react';
import dynamic from "next/dynamic";
import Link from "next/link";
import { useDashboardData } from '@/hooks/useDashboardData';

// Componentes simples para reemplazar los que no existen en @altamedica/ui
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const Badge = ({ 
  children, 
  variant = "default", 
  className = "" 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline"; 
  className?: string;
}) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`h-px bg-gray-200 ${className}`} />
);

// Interfaces para el dashboard médico
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  primaryDiagnosis: string;
  comorbidities: string[];
  lastVisit: string;
  nextAppointment: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  insuranceProvider: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  medications: string[];
  allergies: string[];
  bloodType: string;
  height: number;
  weight: number;
  bmi: number;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'in_person' | 'telemedicine_video' | 'telemedicine_audio' | 'follow_up' | 'emergency';
  specialty: string;
  reason: string;
  duration: number;
  insuranceCovered: boolean;
  copay: number;
  notes: string;
  symptoms: string[];
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
    weight: number;
  };
}

interface TelemedicineSession {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: 'waiting' | 'active' | 'ended' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  type: 'video' | 'audio' | 'chat';
  notes: string;
  symptoms: string[];
  diagnosis?: string;
  prescription?: string[];
  followUpDate?: string;
}

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

// Componente para mostrar ofertas del marketplace
const MarketplaceOfferCard = ({ offer, viewMode, onViewDetails, onApply, onSave, onShare }: {
  offer: MarketplaceOffer;
  viewMode: 'grid' | 'list';
  onViewDetails: (id: string) => void;
  onApply: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
}) => {
  const isGrid = viewMode === 'grid';
  
  return (
    <Card className={`${isGrid ? 'h-full' : ''} hover:shadow-lg transition-shadow duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                {offer.title}
              </CardTitle>
              {offer.urgent && (
                <Badge variant="destructive" className="text-xs">
                  Urgente
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Building className="w-4 h-4" />
              <span>{offer.company}</span>
              <span>•</span>
              <MapPin className="w-4 h-4" />
              <span>{offer.location}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">{offer.salary}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{offer.applications} aplicaciones</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{offer.rating}/5</span>
              </div>
            </div>
          </div>
          {offer.companyLogo && (
            <img 
              src={offer.companyLogo} 
              alt={offer.company}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {offer.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {offer.requirements.slice(0, 3).map((req, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {req}
            </Badge>
          ))}
          {offer.requirements.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{offer.requirements.length - 3} más
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Publicado {new Date(offer.postedDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => onSave(offer.id)}
              className="text-xs"
            >
              <Bookmark className="w-3 h-3 mr-1" />
              Guardar
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => onShare(offer.id)}
              className="text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Compartir
            </Button>
            <Button
              size="small"
              onClick={() => onApply(offer.id)}
              className="text-xs"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para mostrar sesiones de telemedicina
const TelemedicineSessionCard = ({ session, onJoin, onViewDetails }: {
  session: TelemedicineSession;
  onJoin: (sessionId: string) => void;
  onViewDetails: (sessionId: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'En espera';
      case 'active': return 'Activa';
      case 'ended': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {session.patientName}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {new Date(session.startTime).toLocaleString()}
            </p>
          </div>
          <Badge className={getStatusColor(session.status)}>
            {getStatusText(session.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Video className="w-4 h-4 text-blue-600" />
            <span className="capitalize">{session.type}</span>
            {session.duration && (
              <>
                <span>•</span>
                <span>{session.duration} min</span>
              </>
            )}
          </div>
          
          {session.symptoms.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Síntomas:</p>
              <div className="flex flex-wrap gap-1">
                {session.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {session.notes && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {session.notes}
            </p>
          )}
          
          <div className="flex items-center gap-2 pt-2">
            {session.status === 'waiting' && (
              <Button
                size="small"
                onClick={() => onJoin(session.id)}
                className="flex-1"
              >
                <Video className="w-4 h-4 mr-2" />
                Unirse
              </Button>
            )}
            <Button
              variant="secondary"
              size="small"
              onClick={() => onViewDetails(session.id)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver detalles
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DoctorsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'telemedicine' | 'patients' | 'appointments'>('overview');
  const [marketplaceViewMode, setMarketplaceViewMode] = useState<'grid' | 'list'>('grid');
  const [marketplaceFilters, setMarketplaceFilters] = useState<FilterState>({
    search: '',
    location: [],
    specialty: [],
    type: [],
    salaryRange: [0, 100000],
    experience: [],
    remote: null,
    urgent: false
  });
  const [marketplaceSort, setMarketplaceSort] = useState<SortOption>('recent');

  // Usar el hook personalizado para los datos
  const {
    patients,
    appointments,
    telemedicineSessions,
    marketplaceOffers,
    stats,
    loading,
    error,
    applyToOffer,
    createTelemedicineSession,
    updateTelemedicineSession,
    createAppointment
  } = useDashboardData();

  // Funciones para el marketplace
  const handleViewDetails = (id: string) => {
    console.log('Ver detalles de oferta:', id);
  };

  const handleApply = async (id: string) => {
    const result = await applyToOffer(id);
    if (result.success) {
      alert('Aplicación enviada exitosamente');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleSave = (id: string) => {
    console.log('Guardar oferta:', id);
  };

  const handleShare = (id: string) => {
    console.log('Compartir oferta:', id);
  };

  // Funciones para telemedicina
  const handleJoinSession = (sessionId: string) => {
    console.log('Unirse a sesión:', sessionId);
    // Redirigir a la sala de telemedicina específica
    window.location.href = `/telemedicine/session/${sessionId}`;
  };

  const handleStartTelemedicine = () => {
    // Redirigir a la lista de sesiones de telemedicina
    window.location.href = '/telemedicine';
  };

  const handleViewSessionDetails = (sessionId: string) => {
    console.log('Ver detalles de sesión:', sessionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Médico</h1>
              <p className="text-sm text-gray-600">Bienvenido, Dr. Carlos López</p>
            </div>
            <div className="flex items-center gap-4">
                          <Button variant="secondary" size="small">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button size="small">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cita
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'marketplace', label: 'Marketplace', icon: Briefcase },
              { id: 'telemedicine', label: 'Telemedicina', icon: Video },
              { id: 'patients', label: 'Pacientes', icon: Users },
              { id: 'appointments', label: 'Citas', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas Activas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingAppointments} pendientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sesiones Telemedicina</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.telemedicineSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    Activas ahora
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% desde el mes pasado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Próximas citas y sesiones activas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">{appointment.reason}</p>
                          <p className="text-xs text-gray-500">{appointment.date} a las {appointment.time}</p>
                        </div>
                        <Badge variant={appointment.type.includes('telemedicine') ? 'default' : 'secondary'}>
                          {appointment.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sesiones de Telemedicina</CardTitle>
                    <Button variant="secondary" size="small" onClick={handleStartTelemedicine}>
                      <Video className="w-4 h-4 mr-2" />
                      Ver Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {telemedicineSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{session.patientName}</p>
                          <p className="text-sm text-gray-600">{session.notes}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.startTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={session.status === 'waiting' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                          {session.status === 'waiting' && (
                            <Button size="small" onClick={() => handleJoinSession(session.id)}>
                              Unirse
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {telemedicineSessions.length === 0 && (
                      <div className="text-center py-4">
                        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No hay sesiones activas</p>
                        <Button size="small" onClick={handleStartTelemedicine} className="mt-2">
                          Iniciar Sesión
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            {/* Filtros del marketplace */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ofertas del Marketplace</CardTitle>
                  <div className="flex items-center gap-2">
                                <Button
              variant={marketplaceViewMode === 'grid' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setMarketplaceViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={marketplaceViewMode === 'list' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setMarketplaceViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketplaceOffers.map((offer) => (
                    <MarketplaceOfferCard
                      key={offer.id}
                      offer={offer}
                      viewMode={marketplaceViewMode}
                      onViewDetails={handleViewDetails}
                      onApply={handleApply}
                      onSave={handleSave}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'telemedicine' && (
          <div className="space-y-6">
            {/* Header con botón de inicio rápido */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Telemedicina</h2>
                <p className="text-gray-600">Gestiona tus sesiones de telemedicina</p>
              </div>
              <Button onClick={handleStartTelemedicine} className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Iniciar Nueva Sesión
              </Button>
            </div>

            {/* Estadísticas de telemedicina */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{telemedicineSessions.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Espera</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {telemedicineSessions.filter(s => s.status === 'waiting').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activas</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {telemedicineSessions.filter(s => s.status === 'active').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {telemedicineSessions.filter(s => s.status === 'ended').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de sesiones */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sesiones de Telemedicina</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="small" onClick={handleStartTelemedicine}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Sesión
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {telemedicineSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sesiones activas</h3>
                    <p className="text-gray-600 mb-4">Inicia una nueva sesión de telemedicina para comenzar</p>
                    <Button onClick={handleStartTelemedicine}>
                      <Video className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {telemedicineSessions.map((session) => (
                      <TelemedicineSessionCard
                        key={session.id}
                        session={session}
                        onJoin={handleJoinSession}
                        onViewDetails={handleViewSessionDetails}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patients.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <p className="text-sm text-gray-600">{patient.age} años • {patient.gender}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Diagnóstico Principal</p>
                            <p className="text-sm text-gray-600">{patient.primaryDiagnosis}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Próxima Cita</p>
                            <p className="text-sm text-gray-600">{patient.nextAppointment}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={patient.riskLevel === 'high' ? 'destructive' : patient.riskLevel === 'medium' ? 'default' : 'secondary'}>
                              Riesgo {patient.riskLevel}
                            </Badge>
                            <Badge variant="secondary">
                              Score: {patient.healthScore}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-gray-600">{appointment.reason}</p>
                            <p className="text-xs text-gray-500">{appointment.date} a las {appointment.time}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={appointment.type.includes('telemedicine') ? 'default' : 'secondary'}>
                              {appointment.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant={
                              appointment.status === 'scheduled' ? 'default' :
                              appointment.status === 'in_progress' ? 'secondary' :
                              appointment.status === 'completed' ? 'secondary' :
                              'destructive'
                            }>
                              {appointment.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="small" variant="secondary">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        {appointment.type.includes('telemedicine') && appointment.status === 'scheduled' && (
                          <Button size="small">
                            <Video className="w-4 h-4 mr-2" />
                            Iniciar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 