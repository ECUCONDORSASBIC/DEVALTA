'use client';

// Import Leaflet CSS
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet/dist/leaflet.css';

import {
  Building,
  Euro,
  Filter,
  Layers,
  MapPin,
  Minus,
  Plus,
  Search,
  Stethoscope,
  Target
} from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-600 transition-colors rounded-t-lg hover:text-blue-600 hover:bg-blue-50"
          title="Acercar"
          disabled={zoom >= 18}
        >
          <Plus className="w-4 h-4" />
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
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Controles adicionales */}
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg">
        <button
          onClick={onReset}
          className="p-2 text-gray-600 transition-colors rounded-t-lg hover:text-blue-600 hover:bg-blue-50"
          title="Restablecer vista"
        >
          <Target className="w-4 h-4" />
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
          <Filter className="w-4 h-4" />
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
          <Layers className="w-4 h-4" />
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
}> = ({ position, job, isSelected, onClick }) => {  const getMarkerIcon = useMemo(() => {    if (typeof window === 'undefined') return null;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (global as any).L || (window as any).L;
    
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
            <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
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
              <Building className="w-3 h-3 mr-2 text-blue-600" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-2 text-gray-400" />
              <span>{job.location.city}, {job.location.state}</span>
            </div>
            <div className="flex items-center">
              <Euro className="w-3 h-3 mr-2 text-green-600" />
              <span className="font-medium">{job.salary}</span>
            </div>
            <div className="flex items-center">
              <Stethoscope className="w-3 h-3 mr-2 text-purple-600" />
              <span>{job.specialty}</span>
            </div>
          </div>
          
          <div className="pt-2 mt-3 border-t border-gray-100">
            <button className="w-full px-3 py-2 text-xs text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">
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

  // Fix Leaflet default icons for SSR
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (global as any).L || (window as any).L;
    if (L) {
      // Fix default markers
      delete L.Icon.Default.prototype._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    }
  }, []);
  // Datos de trabajo más ricos y realistas
  const jobLocations: JobLocation[] = useMemo(() => [
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
      centerType: 'hospital',      requirements: ['Cirugía Ortopédica', 'Artroscopia', 'Trauma deportivo'],
      benefits: ['Cirugía robótica', 'Medicina deportiva', 'Formación avanzada'],
      postedDate: '2025-05-12'
    }
  ], []);

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
      {/* Header con controles principales */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 mr-3 bg-blue-100 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Mapa Interactivo de Oportunidades</h3>
            <p className="text-sm text-gray-600">{filteredLocations.length} de {jobLocations.length} posiciones disponibles</p>
          </div>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, empresa o ciudad..."
              className="py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Área principal del mapa */}
        <div className="lg:col-span-2">
          <div className="relative h-[500px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Panel de controles de capas */}
            {layersOpen && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Tipo de Mapa</h4>
                <div className="space-y-2">
                  {(['roadmap', 'satellite', 'terrain'] as const).map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="mapType"
                        checked={mapView === type}
                        onChange={() => setMapView(type)}
                        className="mr-2"
                      />
                      <span className="text-xs text-gray-700">
                        {{
                          roadmap: 'Mapa de Calles',
                          satellite: 'Vista Satélite',
                          terrain: 'Terreno'
                        }[type]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Panel de filtros */}
            {filtersOpen && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000] w-64">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Filtros</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">Urgencia</label>
                    <div className="space-y-1">
                      {['high', 'medium', 'low'].map((urgency) => (
                        <label key={urgency} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.urgency.includes(urgency)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({
                                  ...prev,
                                  urgency: [...prev.urgency, urgency]
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  urgency: prev.urgency.filter(u => u !== urgency)
                                }));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-xs text-gray-700">
                            {{high: 'Alta', medium: 'Media', low: 'Baja'}[urgency]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">Tipo de Centro</label>
                    <div className="space-y-1">
                      {['hospital', 'clinic', 'center'].map((centerType) => (
                        <label key={centerType} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.centerType.includes(centerType)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({
                                  ...prev,
                                  centerType: [...prev.centerType, centerType]
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  centerType: prev.centerType.filter(c => c !== centerType)
                                }));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-xs text-gray-700">
                            {{hospital: 'Hospital', clinic: 'Clínica', center: 'Centro'}[centerType]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mapa de Leaflet */}
            <MapContainer
              center={viewState.center}
              zoom={viewState.zoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url={getTileLayerUrl()}
                attribution={getTileLayerAttribution()}
              />
              
              {/* Marcadores de trabajos */}
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

            {/* Controles del mapa */}
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

            {/* Información de estadísticas */}
            <div className="absolute p-3 rounded-lg shadow-sm bottom-4 left-4 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-medium">{filteredLocations.length} oportunidades visibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral con listado */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-sm font-semibold text-gray-900">
              <Building className="w-4 h-4 mr-2 text-blue-600" />
              Oportunidades Disponibles
            </h3>
            {selectedLocation && (
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpiar selección
              </button>
            )}
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-96">
            {filteredLocations.map((job) => (
              <div
                key={job.id}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedLocation?.id === job.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                }`}
                onClick={() => setSelectedLocation(job)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Stethoscope className="w-4 h-4 mr-2 text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-900">{job.title}</h4>
                    </div>
                    <p className="mb-1 text-xs text-gray-600">{job.company}</p>
                    <div className="flex items-center mb-2">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {job.location.city}, {job.location.state}
                      </span>
                    </div>
                    <p className="mb-1 text-xs font-medium text-gray-700">{job.salary}</p>
                    <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">
                      {job.specialty}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`w-3 h-3 rounded-full mb-1 ${{
                      'high': 'bg-red-500',
                      'medium': 'bg-amber-500',
                      'low': 'bg-green-500'
                    }[job.urgency]}`} />
                    <span className={`text-xs font-medium ${{
                      'high': 'text-red-600',
                      'medium': 'text-amber-600',
                      'low': 'text-green-600'
                    }[job.urgency]}`}>
                      {{'high': 'Urgente', 'medium': 'Normal', 'low': 'Baja'}[job.urgency]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda y estadísticas */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="mb-3 text-xs font-semibold text-gray-900">Nivel de Prioridad</h4>
            <div className="space-y-2">
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 mr-3 bg-red-500 rounded-full" />
                <span className="text-gray-600">Alta prioridad ({jobLocations.filter(j => j.urgency === 'high').length})</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 mr-3 rounded-full bg-amber-500" />
                <span className="text-gray-600">Prioridad media ({jobLocations.filter(j => j.urgency === 'medium').length})</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 mr-3 bg-green-500 rounded-full" />
                <span className="text-gray-600">Baja prioridad ({jobLocations.filter(j => j.urgency === 'low').length})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
