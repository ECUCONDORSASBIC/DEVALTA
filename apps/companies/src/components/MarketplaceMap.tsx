"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { LatLngTuple } from "leaflet";
import { useMarketplaceNotifications } from "@/hooks/useMarketplaceNotifications";

// Importación dinámica para evitar problemas de SSR con Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

// Tipos específicos para el marketplace
interface MarketplaceDoctor {
  id: string;
  name: string;
  specialties: string[];
  location: {
    city: string;
    country: string;
    coordinates: LatLngTuple;
  };
  rating: number;
  experience: number;
  hourlyRate: number;
  availableForHiring: boolean;
  responseTime: number;
  totalHires: number;
  isUrgentAvailable: boolean;
  profileImage?: string;
  isOnline: boolean;
  lastActive: string;
  workArrangement: 'remote' | 'hybrid' | 'on_site' | 'flexible';
  languages: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

interface MarketplaceCompany {
  id: string;
  name: string;
  industry: string;
  location: {
    city: string;
    country: string;
    coordinates: LatLngTuple;
  };
  rating: number;
  size: string;
  activeJobs: number;
  urgentJobs: number;
  logo?: string;
  isActivelyHiring: boolean;
  averageResponseTime: number;
  totalHires: number;
  companyType: 'hospital' | 'clinic' | 'pharmacy' | 'insurance' | 'startup';
  jobs?: JobOffer[];
}

interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyId: string;
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
}

interface MarketplaceMapProps {
  doctors: MarketplaceDoctor[];
  companies?: MarketplaceCompany[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
  onDoctorSelect?: (doctor: MarketplaceDoctor) => void;
  onCompanySelect?: (company: MarketplaceCompany) => void;
  filters?: {
    specialties?: string[];
    maxHourlyRate?: number;
    minRating?: number;
    workArrangement?: string[];
    urgentOnly?: boolean;
    verifiedOnly?: boolean;
  };
  mode?: 'hiring' | 'networking' | 'discovery';
}

// Componente personalizado para controles del mapa
const MapControls: React.FC<{
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
}> = ({ zoom, onZoomIn, onZoomOut, onReset, onToggleFilters, filtersOpen }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
      {/* Controles de Zoom */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-600 transition-colors rounded-t-lg hover:text-blue-600 hover:bg-blue-50"
          title="Acercar"
          disabled={zoom >= 18}
        >
          ➕
        </button>
        <div className="px-2 py-1 text-xs text-gray-500 border-t border-b border-gray-100 text-center min-w-[40px]">
          {zoom}
        </div>
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-600 transition-colors rounded-b-lg hover:text-blue-600 hover:bg-blue-50"
          title="Alejar"
          disabled={zoom <= 1}
        >
          ➖
        </button>
      </div>

      {/* Controles adicionales */}
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg">
        <button
          onClick={onReset}
          className="p-2 text-gray-600 transition-colors rounded-t-lg hover:text-blue-600 hover:bg-blue-50"
          title="Restablecer vista"
        >
          🎯
        </button>
        <button
          onClick={onToggleFilters}
          className={`p-2 transition-colors border-t border-gray-100 rounded-b-lg ${
            filtersOpen 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title="Filtros"
        >
          🔍
        </button>
      </div>
    </div>
  );
};

// Componente para marcadores personalizados
const CustomMarker: React.FC<{
  position: [number, number];
  entity: MarketplaceDoctor | MarketplaceCompany;
  type: 'doctor' | 'company';
  isSelected: boolean;
  onClick: () => void;
}> = ({ position, entity, type, isSelected, onClick }) => {
  const getMarkerIcon = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const L = (window as any).L;
    if (!L) return null;
    
    if (type === 'doctor') {
      const doctor = entity as MarketplaceDoctor;
      const color = doctor.isUrgentAvailable ? '#dc2626' : 
                    doctor.isOnline ? '#16a34a' : 
                    doctor.availableForHiring ? '#2563eb' : '#6b7280';
      
      return L.divIcon({
        className: 'custom-doctor-marker',
        html: `
          <div class="relative">
            <div class="w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white font-bold transition-all duration-200 ${
              isSelected ? 'scale-125 ring-4 ring-blue-400' : ''
            } ${doctor.isUrgentAvailable ? 'animate-pulse' : ''}" 
                 style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%)">
              <span class="text-xl">👨‍⚕️</span>
            </div>
            ${doctor.verificationStatus === 'verified' ? '<div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md">✓</div>' : ''}
            ${doctor.isUrgentAvailable ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>' : ''}
            ${doctor.isOnline ? '<div class="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>' : ''}
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -24],
      });
    } else {
      const company = entity as MarketplaceCompany;
      const color = company.urgentJobs > 0 ? '#dc2626' : 
                    company.isActivelyHiring ? '#7c3aed' : '#1e40af';
      const icon = company.companyType === 'hospital' ? '🏥' : 
                   company.companyType === 'clinic' ? '🏥' : '🏢';
      
      return L.divIcon({
        className: 'custom-company-marker',
        html: `
          <div class="relative">
            <div class="w-16 h-16 rounded-xl border-3 border-white shadow-2xl flex items-center justify-center text-white font-bold transition-all duration-200 ${
              isSelected ? 'scale-125 ring-4 ring-purple-400' : ''
            } ${company.urgentJobs > 0 ? 'animate-pulse' : ''}" 
                 style="background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%); box-shadow: 0 4px 20px ${color}66">
              <span class="text-2xl">${icon}</span>
            </div>
            ${company.urgentJobs > 0 ? `<div class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg">${company.urgentJobs}</div>` : ''}
            ${company.isActivelyHiring ? '<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">CONTRATANDO</div>' : ''}
          </div>
        `,
        iconSize: [64, 64],
        iconAnchor: [32, 32],
        popupAnchor: [0, -32],
      });
    }
  }, [entity, type, isSelected]);

  const icon = getMarkerIcon();
  if (!icon) return null;

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup className="custom-popup">
        <div className="p-3 min-w-[280px]">
          {type === 'doctor' ? (
            // Popup para doctor
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">{(entity as MarketplaceDoctor).name}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium">{(entity as MarketplaceDoctor).rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-base mr-2">🩺</span>
                  <span>{(entity as MarketplaceDoctor).specialties.join(', ')}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-base mr-2">📍</span>
                  <span>{(entity as MarketplaceDoctor).location.city}, {(entity as MarketplaceDoctor).location.country}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-base mr-2">💰</span>
                  <span className="font-medium">${(entity as MarketplaceDoctor).hourlyRate}/hr</span>
                </div>
                <div className="flex items-center">
                  <span className="text-base mr-2">⏰</span>
                  <span>{(entity as MarketplaceDoctor).experience} años experiencia</span>
                </div>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Match Score</span>
                  <div className="flex items-center gap-1">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-xs font-bold text-green-600">85%</span>
                  </div>
                </div>
                <button 
                  onClick={() => console.log('Iniciar proceso de match')}
                  className="w-full px-4 py-2 text-sm text-white transition-colors bg-gradient-to-r from-blue-600 to-blue-700 rounded-md hover:from-blue-700 hover:to-blue-800 font-medium shadow-md"
                >
                  🎯 Iniciar Proceso de Match
                </button>
                <button className="w-full px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors">
                  💬 Chat Directo
                </button>
              </div>
            </div>
          ) : (
            // Popup para empresa
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">{(entity as MarketplaceCompany).name}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium">{(entity as MarketplaceCompany).rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-base mr-2">🏢</span>
                  <span>{(entity as MarketplaceCompany).industry}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-base mr-2">📍</span>
                  <span>{(entity as MarketplaceCompany).location.city}, {(entity as MarketplaceCompany).location.country}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-base mr-2">💼</span>
                  <span className="font-medium">{(entity as MarketplaceCompany).activeJobs} ofertas activas</span>
                </div>
                {(entity as MarketplaceCompany).urgentJobs > 0 && (
                  <div className="flex items-center text-red-600">
                    <span className="text-base mr-2">🚨</span>
                    <span className="font-medium">{(entity as MarketplaceCompany).urgentJobs} urgentes</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-base mr-2">⭐</span>
                  <span className="font-medium">{(entity as MarketplaceCompany).rating}/5 • {(entity as MarketplaceCompany).totalHires} contrataciones</span>
                </div>
              </div>
              
              {/* Botones de acción para empresas */}
              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                <button 
                  onClick={() => console.log('Ver ofertas disponibles', entity)}
                  className="w-full px-4 py-2 text-sm text-white transition-colors bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 font-medium shadow-md"
                >
                  🏥 Ver Ofertas Disponibles
                </button>
                <button className="w-full px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors">
                  📊 Perfil de la Empresa
                </button>
                {(entity as MarketplaceCompany).urgentJobs > 0 && (
                  <button className="w-full px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors font-medium">
                    🚨 Ver Ofertas Urgentes ({(entity as MarketplaceCompany).urgentJobs})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default function MarketplaceMap({
  doctors,
  companies = [],
  center,
  showDoctors = true,
  showCompanies = true,
  onDoctorSelect,
  onCompanySelect,
  filters,
  mode = 'hiring'
}: MarketplaceMapProps) {
  const mapRef = useRef<any>(null);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(center || [-34.6037, -58.3816]);
  const [zoom, setZoom] = useState(5);
  const [selectedDoctor, setSelectedDoctor] = useState<MarketplaceDoctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapView, setMapView] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchStep, setMatchStep] = useState<'offer' | 'interview' | 'contract' | 'payment'>('offer');
  const { sendNotification } = useMarketplaceNotifications();

  // Hospital San Vicente - Datos por defecto
  const hospitalSanVicente: MarketplaceCompany = {
    id: 'hospital-san-vicente-001',
    name: 'Hospital San Vicente',
    industry: 'Salud y Medicina',
    location: {
      city: 'Buenos Aires',
      country: 'Argentina',
      coordinates: [-34.6037, -58.3816] as LatLngTuple,
    },
    rating: 4.8,
    size: 'Grande (500+ empleados)',
    activeJobs: 15,
    urgentJobs: 3,
    logo: '/hospital-san-vicente-logo.png',
    isActivelyHiring: true,
    averageResponseTime: 2.4,
    totalHires: 127,
    companyType: 'hospital',
    jobs: [
      {
        id: 'hsv-cardio-001',
        title: 'Cardiólogo Intervencionista Senior',
        company: 'Hospital San Vicente',
        companyId: 'hospital-san-vicente-001',
        location: 'Buenos Aires, Argentina',
        specialty: 'Cardiología',
        type: 'job',
        salary: 'USD 12,000 - 18,000 mensual',
        postedDate: '2025-07-28',
        applications: 23,
        rating: 4.9,
        urgent: true,
        description: 'Buscamos cardiólogo intervencionista con amplia experiencia en cateterismo cardíaco y angioplastias.',
        requirements: ['Especialización en Cardiología', '8+ años experiencia', 'Certificación en Hemodinamia'],
        benefits: ['Obra social premium', 'Capacitación continua', 'Horarios flexibles'],
        experience: 'Senior (8+ años)',
        schedule: 'Tiempo completo con guardias',
        remote: false
      },
      {
        id: 'hsv-pediatra-002',
        title: 'Pediatra - Telemedicina',
        company: 'Hospital San Vicente',
        companyId: 'hospital-san-vicente-001',
        location: 'Buenos Aires, Argentina (Remoto)',
        specialty: 'Pediatría',
        type: 'contract',
        salary: 'USD 4,500 - 6,500 mensual',
        postedDate: '2025-07-29',
        applications: 41,
        rating: 4.7,
        urgent: false,
        description: 'Oportunidad de telemedicina para atención pediátrica virtual.',
        requirements: ['Especialización en Pediatría', '3+ años experiencia', 'Experiencia en telemedicina'],
        benefits: ['Trabajo remoto', 'Tecnología de punta', 'Flexibilidad horaria'],
        experience: 'Semi-senior (3-7 años)',
        schedule: 'Flexible',
        remote: true
      },
      {
        id: 'hsv-neurologia-003',
        title: 'Neurólogo - Urgencias',
        company: 'Hospital San Vicente',
        companyId: 'hospital-san-vicente-001',
        location: 'Buenos Aires, Argentina',
        specialty: 'Neurología',
        type: 'job',
        salary: 'USD 10,000 - 14,000 mensual',
        postedDate: '2025-07-30',
        applications: 8,
        rating: 4.8,
        urgent: true,
        description: 'Neurólogo para área de emergencias con disponibilidad inmediata.',
        requirements: ['Especialización en Neurología', '5+ años experiencia', 'Disponibilidad guardias'],
        benefits: ['Excelente remuneración', 'Equipo multidisciplinario', 'Tecnología avanzada'],
        experience: 'Senior (5+ años)',
        schedule: 'Guardias rotativas',
        remote: false
      }
    ]
  };

  // Agregar Hospital San Vicente a las empresas si no está ya incluido
  const companiesWithHospital = companies.find(c => c.id === hospitalSanVicente.id) 
    ? companies 
    : [...companies, hospitalSanVicente];

  // Fix Leaflet default icons for SSR
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = (window as any).L;
      if (L) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      }
    }
  }, []);

  // Filtrar doctores según los filtros aplicados
  const filteredDoctors = doctors.filter(doctor => {
    if (searchQuery && !doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !doctor.location.city.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters?.specialties?.length && !filters.specialties.some(s => doctor.specialties.includes(s))) {
      return false;
    }
    if (filters?.maxHourlyRate && doctor.hourlyRate > filters.maxHourlyRate) {
      return false;
    }
    if (filters?.minRating && doctor.rating < filters.minRating) {
      return false;
    }
    if (filters?.workArrangement?.length && !filters.workArrangement.includes(doctor.workArrangement)) {
      return false;
    }
    if (filters?.urgentOnly && !doctor.isUrgentAvailable) {
      return false;
    }
    if (filters?.verifiedOnly && doctor.verificationStatus !== 'verified') {
      return false;
    }
    return true;
  });

  // Filtrar empresas según búsqueda (incluyendo Hospital San Vicente)
  const filteredCompanies = companiesWithHospital.filter(company => {
    if (searchQuery && !company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !company.location.city.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Funciones de control del mapa
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 1, 18));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 1, 1));
  }, []);

  const handleReset = useCallback(() => {
    setMapCenter(center || [-34.6037, -58.3816]);
    setZoom(5);
    setSelectedDoctor(null);
  }, [center]);

  // Manejar selección de doctor
  const handleDoctorSelect = useCallback(async (doctor: MarketplaceDoctor) => {
    setSelectedDoctor(doctor);
    onDoctorSelect?.(doctor);

    // TODO: Implementar notificaciones una vez que el tipo esté correcto
    console.log('Doctor profile viewed:', doctor.id);
  }, [onDoctorSelect, sendNotification]);


  // Función para obtener la URL del tile layer - usando CartoDB Positron para un mapa más limpio
  const getTileLayerUrl = () => {
    switch (mapView) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default: // mapa limpio sin detalles
        return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }
  };

  if (typeof window === "undefined") {
    return (
      <div className="h-[600px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm font-medium text-gray-700">Cargando mapa del marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Barra de búsqueda superior estilo Airbnb */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
        <div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2 min-w-[400px]">
          <input
            type="text"
            placeholder="Buscar médicos o empresas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 outline-none text-sm"
          />
          <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            🔍
          </button>
        </div>
      </div>
      
      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">👨‍⚕️</span>
            <span className="text-gray-600">Médicos ({filteredDoctors.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🏥</span>
            <span className="text-gray-600">Hospitales ({filteredCompanies.filter(c => c.companyType === 'hospital').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🏢</span>
            <span className="text-gray-600">Clínicas ({filteredCompanies.filter(c => c.companyType === 'clinic').length})</span>
          </div>
          
          {/* Hospital San Vicente - Destacado */}
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 p-2 rounded-md border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-base animate-pulse">🏥</span>
                <div>
                  <span className="text-gray-800 font-semibold text-sm">Hospital San Vicente</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-600 font-medium text-xs">Activo</span>
                    <span className="text-gray-500 text-xs">• 15 ofertas</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  3 URGENTES
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Panel de filtros mejorado */}
      {filtersOpen && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[1000] w-72">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Filtros del Mapa</h4>
            <button 
              onClick={() => setFiltersOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Qué mostrar */}
            <div>
              <label className="block mb-2 text-xs font-medium text-gray-700 uppercase">Mostrar en el mapa</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showDoctors}
                    onChange={(e) => {/* toggle doctors */}}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">👨‍⚕️ Médicos disponibles</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showCompanies}
                    onChange={(e) => {/* toggle companies */}}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">🏥 Empresas contratando</span>
                </label>
              </div>
            </div>
            
            {/* Filtros para médicos */}
            <div className="border-t pt-3">
              <label className="block mb-2 text-xs font-medium text-gray-700 uppercase">Filtrar médicos</label>
              <div className="space-y-2">
                <select className="w-full px-3 py-2 text-sm border rounded-lg">
                  <option>Todas las especialidades</option>
                  <option>Cardiología</option>
                  <option>Pediatría</option>
                  <option>Oncología</option>
                  <option>Neurología</option>
                </select>
                <select className="w-full px-3 py-2 text-sm border rounded-lg">
                  <option>Cualquier experiencia</option>
                  <option>2+ años</option>
                  <option>5+ años</option>
                  <option>10+ años</option>
                </select>
              </div>
            </div>
            
            {/* Filtros adicionales */}
            <div className="border-t pt-3 space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Solo verificados ✅</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Con ofertas urgentes 🚨</span>
              </label>
            </div>
            
            {/* Botón de aplicar */}
            <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Mapa de Leaflet */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-[600px] w-full rounded-lg border border-gray-200"
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={getTileLayerUrl()}
        />
        
        {/* Renderizar doctores */}
        {showDoctors && filteredDoctors.map((doctor) => (
          <CustomMarker
            key={doctor.id}
            position={doctor.location.coordinates as [number, number]}
            entity={doctor}
            type="doctor"
            isSelected={selectedDoctor?.id === doctor.id}
            onClick={() => handleDoctorSelect(doctor)}
          />
        ))}
        
        {/* Renderizar empresas */}
        {showCompanies && filteredCompanies.map((company) => (
          <CustomMarker
            key={company.id}
            position={company.location.coordinates as [number, number]}
            entity={company}
            type="company"
            isSelected={false}
            onClick={() => onCompanySelect?.(company)}
          />
        ))}
      </MapContainer>

      {/* Controles del mapa */}
      <MapControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        filtersOpen={filtersOpen}
      />


      {/* Panel de información del candidato seleccionado */}
      {selectedDoctor && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-auto md:top-20 md:w-96 bg-white rounded-lg shadow-xl z-[1000] border border-gray-200">
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-sky-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedDoctor.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {selectedDoctor.verificationStatus === 'verified' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verificado</span>
                  )}
                  {selectedDoctor.isOnline && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">● En línea</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Información clave */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">Especialidad</p>
                <p className="text-sm font-medium">{selectedDoctor.specialties.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Experiencia</p>
                <p className="text-sm font-medium">{selectedDoctor.experience} años</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Tarifa por hora</p>
                <p className="text-sm font-medium text-green-600">${selectedDoctor.hourlyRate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Calificación</p>
                <p className="text-sm font-medium flex items-center">
                  <span className="text-yellow-400 mr-1">⭐</span> {selectedDoctor.rating}
                </p>
              </div>
            </div>
            
            {/* Detalles adicionales */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">📍 Ubicación</span>
                <span className="font-medium">{selectedDoctor.location.city}, {selectedDoctor.location.country}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">💼 Modalidad</span>
                <span className="font-medium">
                  {selectedDoctor.workArrangement === 'remote' ? 'Remoto' : 
                   selectedDoctor.workArrangement === 'hybrid' ? 'Híbrido' : 
                   selectedDoctor.workArrangement === 'on_site' ? 'Presencial' : 'Flexible'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">🌐 Idiomas</span>
                <span className="font-medium">{selectedDoctor.languages.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">⚡ Tiempo respuesta</span>
                <span className="font-medium">{selectedDoctor.responseTime}h promedio</span>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="space-y-2 pt-3">
              <button 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" 
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : '📧 Invitar a aplicar a una posición'}
              </button>
              <button 
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                👁️ Ver perfil completo
              </button>
              <button 
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                📎 Guardar candidato
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Proceso de Match y Contratación */}
      {showMatchModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Proceso de Match con {selectedDoctor.name}</h2>
                  <p className="text-blue-100">Complete los pasos para finalizar la contratación</p>
                </div>
                <button 
                  onClick={() => { setShowMatchModal(false); setMatchStep('offer'); }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                {[
                  { id: 'offer', label: 'Oferta', icon: '📝' },
                  { id: 'interview', label: 'Entrevista', icon: '🎤' },
                  { id: 'contract', label: 'Contrato', icon: '📄' },
                  { id: 'payment', label: 'Pago', icon: '💳' }
                ].map((step, index) => (
                  <div key={step.id} className="flex-1 relative">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                        matchStep === step.id ? 'bg-blue-600 text-white' : 
                        ['offer', 'interview', 'contract', 'payment'].indexOf(matchStep) > index ? 'bg-green-500 text-white' : 
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {step.icon}
                      </div>
                      {index < 3 && (
                        <div className={`flex-1 h-1 ${
                          ['offer', 'interview', 'contract', 'payment'].indexOf(matchStep) > index ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                    <p className="text-xs mt-1 text-center font-medium">{step.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {matchStep === 'offer' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">📝 Enviar Oferta de Trabajo</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 mb-2">Match Score: 85% - Alta compatibilidad</p>
                    <p className="text-xs text-blue-600">Este candidato cumple con la mayoría de requisitos para tu posición</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Posición</label>
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option>Cardiólogo Intervencionista</option>
                        <option>Pediatra - Telemedicina</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Salario Ofrecido</label>
                      <input type="text" placeholder="USD 8,000 - 12,000" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mensaje Personalizado</label>
                    <textarea 
                      rows={3} 
                      placeholder="Estimado Dr. [Nombre], nos gustaría invitarlo a formar parte de nuestro equipo..."
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setShowMatchModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => setMatchStep('interview')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Enviar Oferta
                    </button>
                  </div>
                </div>
              )}
              
              {matchStep === 'interview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">🎤 Programar Entrevista</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">✅ El candidato ha aceptado tu oferta inicial</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo de Entrevista</label>
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option>Videollamada (Zoom)</option>
                        <option>Presencial</option>
                        <option>Telemedicina (Plataforma)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha y Hora</label>
                      <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setMatchStep('offer')}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Atrás
                    </button>
                    <button 
                      onClick={() => setMatchStep('contract')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Confirmar Entrevista
                    </button>
                  </div>
                </div>
              )}
              
              {matchStep === 'contract' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">📄 Generar y Firmar Contrato</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">✅ Entrevista completada exitosamente</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-4">Arrastra el contrato aquí o</p>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      📎 Subir Contrato
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <label className="text-sm text-gray-600">
                      Confirmo que el contrato cumple con las regulaciones laborales y ha sido firmado por ambas partes
                    </label>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setMatchStep('interview')}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Atrás
                    </button>
                    <button 
                      onClick={() => setMatchStep('payment')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Confirmar Contrato
                    </button>
                  </div>
                </div>
              )}
              
              {matchStep === 'payment' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">💳 Pago de Comisión AltaMedica</h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Salario Anual Acordado:</span>
                      <span className="text-lg font-bold">USD 120,000</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Comisión AltaMedica (10%):</span>
                      <span className="text-lg font-bold text-purple-600">USD 12,000</span>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-xs text-gray-600">Pago en 2 cuotas: 50% ahora, 50% a los 3 meses</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Método de Pago</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white">
                        <input type="radio" name="payment" defaultChecked />
                        <img src="/mercadopago.png" alt="MercadoPago" className="h-6" />
                        <span className="text-sm">MercadoPago (ARS/USD)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white">
                        <input type="radio" name="payment" />
                        <span className="text-sm">💳 Tarjeta de Crédito (Stripe)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white">
                        <input type="radio" name="payment" />
                        <span className="text-sm">🏦 Transferencia Bancaria</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">✨ Beneficios Post-Match</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Garantía de 90 días (reembolso si no funciona)</li>
                      <li>• Soporte HR gratuito durante onboarding</li>
                      <li>• Analytics de rendimiento del empleado</li>
                      <li>• Descuento 5% en próximas contrataciones</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setMatchStep('contract')}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Atrás
                    </button>
                    <button 
                      onClick={() => {
                        alert('¡Match exitoso! Pago procesado. El candidato ha sido notificado.');
                        setShowMatchModal(false);
                        setMatchStep('offer');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium shadow-lg"
                    >
                      Pagar USD 6,000 (Primera Cuota)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}