'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Filter, 
  Building, 
  Stethoscope,
  Search,
  Layers,
  Plus,
  Minus,
  Hospital,
  Heart,
  UserCheck,
  Clock,
  Euro,
  Navigation,
  Target,
  } from 'lucide-react';

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
const useMap = dynamic(() => import('react-leaflet').then((mod) => mod.useMap), {
  ssr: false,
});

interface JobLocation {
  id: string;
  title: string;
  company: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    address?: string;
  };
  salary: string;
  type: 'full-time' | 'part-time' | 'contract';
  specialty: string;
  urgency: 'low' | 'medium' | 'high';
  centerType: 'hospital' | 'clinic' | 'center';
  requirements?: string[];
  benefits?: string[];
  postedDate: string;
}

interface MapFilters {
  specialty: string[];
  urgency: string[];
  type: string[];
  centerType: string[];
  salaryRange: [number, number];
}

interface MapViewState {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];
}

// Componente personalizado para controles del mapa
const MapControls: React.FC<{
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFilters: () => void;
  onToggleLayers: () => void;
  filtersOpen: boolean;
  layersOpen: boolean;
}> = ({ zoom, onZoomIn, onZoomOut, onReset, onToggleFilters, onToggleLayers, filtersOpen, layersOpen }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
      {/* Controles de Zoom */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg transition-colors"
          title="Acercar"
          disabled={zoom >= 18}
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="px-2 py-1 text-xs text-gray-500 border-t border-b border-gray-100 text-center min-w-[40px]">
          {zoom}
        </div>
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-b-lg transition-colors"
          title="Alejar"
          disabled={zoom <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Controles adicionales */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
        <button
          onClick={onReset}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg transition-colors"
          title="Restablecer vista"
        >
          <Target className="h-4 w-4" />
        </button>
        <button
          onClick={onToggleFilters}
          className={`p-2 transition-colors border-t border-gray-100 ${
            filtersOpen 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title="Filtros"
        >
          <Filter className="h-4 w-4" />
        </button>
        <button
          onClick={onToggleLayers}
          className={`p-2 transition-colors border-t border-gray-100 rounded-b-lg ${
            layersOpen 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title="Capas"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Componente para marcadores personalizados
const CustomMarker: React.FC<{
  position: [number, number];
  job: JobLocation;
  isSelected: boolean;
  onClick: () => void;
}> = ({ position, job, isSelected, onClick }) => {
  const getMarkerIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    const L = require('leaflet');
    
    // Configurar iconos personalizados basados en urgencia y tipo
    const getIconColor = () => {
      switch (job.urgency) {
        case 'high': return '#ef4444'; // red-500
        case 'medium': return '#f59e0b'; // amber-500
        case 'low': return '#10b981'; // emerald-500
        default: return '#6b7280'; // gray-500
      }
    };

    const getIconSymbol = () => {
      switch (job.centerType) {
        case 'hospital': return '🏥';
        case 'clinic': return '🏥';
        case 'center': return '🏢';
        default: return '📍';
      }
    };

    const iconColor = getIconColor();
    const iconSymbol = getIconSymbol();
    const isUrgent = job.urgency === 'high';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative">
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold transition-all duration-200 ${
            isSelected ? 'scale-125 ring-2 ring-blue-400' : ''
          } ${isUrgent ? 'animate-pulse' : ''}" 
               style="background-color: ${iconColor}">
            <span class="text-xs">${iconSymbol}</span>
          </div>
          ${isUrgent ? `
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-ping"></div>
          ` : ''}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, [job, isSelected]);

  if (!getMarkerIcon) return null;

  return (
    <Marker
      position={position}
      icon={getMarkerIcon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup className="custom-popup">
        <div className="p-2 min-w-[250px]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${{
              'high': 'bg-red-100 text-red-700',
              'medium': 'bg-amber-100 text-amber-700',
              'low': 'bg-green-100 text-green-700'
            }[job.urgency]}`}>
              {{'high': 'Urgente', 'medium': 'Normal', 'low': 'Baja'}[job.urgency]}
            </span>
          </div>
          
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center">
              <Building className="h-3 w-3 mr-2 text-blue-600" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-2 text-gray-400" />
              <span>{job.location.city}, {job.location.state}</span>
            </div>
            <div className="flex items-center">
              <Euro className="h-3 w-3 mr-2 text-green-600" />
              <span className="font-medium">{job.salary}</span>
            </div>
            <div className="flex items-center">
              <Stethoscope className="h-3 w-3 mr-2 text-purple-600" />
              <span>{job.specialty}</span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-md transition-colors">
              Ver Detalles Completos
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Componente principal del mapa
export default function InteractiveMap() {
  const [selectedLocation, setSelectedLocation] = useState<JobLocation | null>(null);
  const [mapView, setMapView] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [viewState, setViewState] = useState<MapViewState>({
    center: [40.4168, -3.7038], // Madrid, España
    zoom: 6,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MapFilters>({
    specialty: [],
    urgency: [],
    type: [],
    centerType: [],
    salaryRange: [30000, 100000],
  });

  // Datos de trabajo más ricos y realistas
  const jobLocations: JobLocation[] = [
    {
      id: '1',
      title: 'Cardiólogo/a Senior',
      company: 'Hospital Universitario La Paz',
      location: { 
        lat: 40.4792, 
        lng: -3.6909, 
        city: 'Madrid', 
        state: 'Madrid',
        address: 'Paseo de la Castellana, 261'
      },
      salary: '€65,000 - €85,000',
      type: 'full-time',
      specialty: 'Cardiología',
      urgency: 'high',
      centerType: 'hospital',
      requirements: ['Especialista en Cardiología', '5+ años experiencia', 'Disponibilidad guardias'],
      benefits: ['Seguro médico privado', 'Formación continuada', 'Investigación'],
      postedDate: '2025-05-28'
    },
    {
      id: '2',
      title: 'Médico/a de Urgencias',
      company: 'Hospital Clínic Barcelona',
      location: { 
        lat: 41.3888, 
        lng: 2.1519, 
        city: 'Barcelona', 
        state: 'Cataluña',
        address: 'Carrer de Villarroel, 170'
      },
      salary: '€55,000 - €75,000',
      type: 'full-time',
      specialty: 'Medicina de Urgencias',
      urgency: 'high',
      centerType: 'hospital',
      requirements: ['Especialista MIR', 'Experiencia en urgencias', 'Trabajo en equipo'],
      benefits: ['Horario flexible', 'Desarrollo profesional', 'Ambiente internacional'],
      postedDate: '2025-05-25'
    },
    {
      id: '3',
      title: 'Médico/a de Familia',
      company: 'Centro de Salud Malvarrosa',
      location: { 
        lat: 39.4828, 
        lng: -0.3251, 
        city: 'Valencia', 
        state: 'Valencia',
        address: 'Avinguda de Malvarrosa, 12'
      },
      salary: '€45,000 - €60,000',
      type: 'full-time',
      specialty: 'Medicina Familiar',
      urgency: 'medium',
      centerType: 'center',
      requirements: ['Medicina Familiar y Comunitaria', 'Atención primaria', 'Comunicación eficaz'],
      benefits: ['Consulta asignada', 'Conciliación familiar', 'Formación MIR'],
      postedDate: '2025-05-20'
    },
    {
      id: '4',
      title: 'Pediatra Especialista',
      company: 'Hospital Virgen del Rocío',
      location: { 
        lat: 37.3586, 
        lng: -5.9898, 
        city: 'Sevilla', 
        state: 'Andalucía',
        address: 'Avenida Manuel Siurot, s/n'
      },
      salary: '€50,000 - €70,000',
      type: 'full-time',
      specialty: 'Pediatría',
      urgency: 'high',
      centerType: 'hospital',
      requirements: ['Especialista en Pediatría', 'Experiencia neonatos', 'Idiomas valorable'],
      benefits: ['Hospital universitario', 'Investigación', 'Guardias compensadas'],
      postedDate: '2025-05-22'
    },
    {
      id: '5',
      title: 'Neurólogo/a',
      company: 'Clínica Universidad de Navarra',
      location: { 
        lat: 42.8025, 
        lng: -1.6440, 
        city: 'Pamplona', 
        state: 'Navarra',
        address: 'Avenida Pío XII, 36'
      },
      salary: '€65,000 - €90,000',
      type: 'full-time',
      specialty: 'Neurología',
      urgency: 'medium',
      centerType: 'clinic',
      requirements: ['Neurología clínica', 'Técnicas diagnósticas', 'Publicaciones científicas'],
      benefits: ['Centro de excelencia', 'Tecnología avanzada', 'Carrera académica'],
      postedDate: '2025-05-15'
    },
    {
      id: '6',
      title: 'Anestesiólogo/a',
      company: 'Hospital Gregorio Marañón',
      location: { 
        lat: 40.4321, 
        lng: -3.6721, 
        city: 'Madrid', 
        state: 'Madrid',
        address: 'Calle del Dr. Esquerdo, 46'
      },
      salary: '€58,000 - €78,000',
      type: 'full-time',
      specialty: 'Anestesiología',
      urgency: 'high',
      centerType: 'hospital',
      requirements: ['Anestesiología y Reanimación', 'Quirófano experiencia', 'Disponibilidad'],
      benefits: ['Hospital de referencia', 'Tecnología puntera', 'Plan carrera'],
      postedDate: '2025-05-30'
    },
    {
      id: '7',
      title: 'Ginecólogo/a',
      company: 'Hospital del Mar',
      location: { 
        lat: 41.3837, 
        lng: 2.1973, 
        city: 'Barcelona', 
        state: 'Cataluña',
        address: 'Passeig Marítim, 25-29'
      },
      salary: '€52,000 - €72,000',
      type: 'part-time',
      specialty: 'Ginecología',
      urgency: 'medium',
      centerType: 'hospital',
      requirements: ['Ginecología y Obstetricia', 'Cirugía laparoscópica', 'Catalán valorable'],
      benefits: ['Hospital marítimo', 'Horario reducido', 'Especialización'],
      postedDate: '2025-05-18'
    },
    {
      id: '8',
      title: 'Traumatólogo/a',
      company: 'Hospital La Fe',
      location: { 
        lat: 39.4845, 
        lng: -0.3425, 
        city: 'Valencia', 
        state: 'Valencia',
        address: 'Avinguda de Fernando Abril Martorell, 106'
      },
      salary: '€60,000 - €80,000',
      type: 'full-time',
      specialty: 'Traumatología',
      urgency: 'low',
      centerType: 'hospital',
      requirements: ['Cirugía Ortopédica', 'Artroscopia', 'Trauma deportivo'],
      benefits: ['Cirugía robótica', 'Medicina deportiva', 'Formación avanzada'],
      postedDate: '2025-05-12'
    }
  ];

  // Filtrar ubicaciones basándose en filtros activos
  const filteredLocations = useMemo(() => {
    return jobLocations.filter(job => {
      // Filtro por búsqueda de texto
      if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !job.company.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !job.location.city.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filtros específicos
      if (filters.specialty.length > 0 && !filters.specialty.includes(job.specialty)) return false;
      if (filters.urgency.length > 0 && !filters.urgency.includes(job.urgency)) return false;
      if (filters.type.length > 0 && !filters.type.includes(job.type)) return false;
      if (filters.centerType.length > 0 && !filters.centerType.includes(job.centerType)) return false;

      return true;
    });
  }, [jobLocations, searchQuery, filters]);

  // Funciones de control del mapa
  const handleZoomIn = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 1) }));
  }, []);

  const handleReset = useCallback(() => {
    setViewState({
      center: [40.4168, -3.7038],
      zoom: 6,
    });
    setSelectedLocation(null);
  }, []);

  // Función para obtener la URL del tile layer según el tipo de mapa
  const getTileLayerUrl = () => {
    switch (mapView) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default: // roadmap
        return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }
  };

  const getTileLayerAttribution = () => {
    switch (mapView) {
      case 'satellite':
        return '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'terrain':
        return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }
  };

  return (
    <div className="w-full h-full">
      {/* Header con controles y búsqueda */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Mapa de Oportunidades Médicas</h3>
            <p className="text-sm text-gray-600">
              {filteredLocations.length} de {jobLocations.length} posiciones disponibles
            </p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por puesto, empresa o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="relative h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        {/* Mapa principal */}
        <MapContainer
          center={viewState.center}
          zoom={viewState.zoom}
          className="h-full w-full z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url={getTileLayerUrl()}
            attribution={getTileLayerAttribution()}
          />
          
          {/* Marcadores */}
          {filteredLocations.map((job) => (
            <CustomMarker
              key={job.id}
              position={[job.location.lat, job.location.lng]}
              job={job}
              isSelected={selectedLocation?.id === job.id}
              onClick={() => setSelectedLocation(job)}
            />
          ))}
        </MapContainer>

        {/* Controles personalizados del mapa */}
        <MapControls
          zoom={viewState.zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
          onToggleLayers={() => setLayersOpen(!layersOpen)}
          filtersOpen={filtersOpen}
          layersOpen={layersOpen}
        />

        {/* Panel de capas */}
        {layersOpen && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-[1000] min-w-[200px]">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Capas del Mapa</h4>
            <div className="space-y-2">
              {['roadmap', 'satellite', 'terrain'].map((type) => (
                <label key={type} className="flex items-center text-sm">
                  <input
                    type="radio"
                    name="mapType"
                    value={type}
                    checked={mapView === type}
                    onChange={(e) => setMapView(e.target.value as 'satellite' | 'terrain' | 'roadmap')}
                    className="mr-2"
                  />
                  <span className="capitalize">
                    {{
                      roadmap: 'Calles',
                      satellite: 'Satélite',
                      terrain: 'Terreno'
                    }[type]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Información de la ubicación actual */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm z-[1000]">
          <div className="flex items-center text-sm text-gray-700">
            <Navigation className="h-4 w-4 text-blue-600 mr-2" />
            <span className="font-medium">España - Vista Nacional</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Zoom: {viewState.zoom} | Centro: {viewState.center[0].toFixed(4)}, {viewState.center[1].toFixed(4)}
          </div>
        </div>
      </div>

      {/* Panel de información de la ubicación seleccionada */}
      {selectedLocation && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Hospital className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedLocation.title}</h4>
                <p className="text-gray-600">{selectedLocation.company}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span>{selectedLocation.location.city}, {selectedLocation.location.state}</span>
            </div>
            <div className="flex items-center text-sm">
              <Euro className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium">{selectedLocation.salary}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-blue-600 mr-2" />
              <span>{selectedLocation.type === 'full-time' ? 'Tiempo completo' : 
                     selectedLocation.type === 'part-time' ? 'Tiempo parcial' : 'Contrato'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Requisitos</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedLocation.requirements?.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <UserCheck className="h-3 w-3 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Beneficios</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedLocation.benefits?.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Heart className="h-3 w-3 text-red-600 mr-2 mt-1 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Publicado: {new Date(selectedLocation.postedDate).toLocaleDateString('es-ES')}
            </span>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">
                Guardar
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                Aplicar Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
