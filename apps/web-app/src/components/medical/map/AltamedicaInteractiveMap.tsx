"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { LatLngTuple } from "leaflet";
import { Star, MapPin, Clock, DollarSign, Users, Filter, Zap } from "lucide-react";

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
  responseTime: number; // en horas
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
  averageResponseTime: number; // en horas
  totalHires: number;
  companyType: 'hospital' | 'clinic' | 'pharmacy' | 'insurance' | 'startup';
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

// Crear iconos personalizados para el marketplace
const createDoctorIcon = (doctor: MarketplaceDoctor) => {
  const isUrgent = doctor.isUrgentAvailable;
  const isOnline = doctor.isOnline;
  const isVerified = doctor.verificationStatus === 'verified';
  
  const color = isUrgent ? '#ef4444' : 
                isOnline ? '#10b981' : 
                doctor.availableForHiring ? '#3b82f6' : '#6b7280';
                
  const pulseClass = isUrgent ? 'urgent-pulse' : isOnline ? 'online-pulse' : '';

  return L.divIcon({
    className: `doctor-marker ${pulseClass}`,
    html: `
      <div class="marker-container">
        <div class="marker-icon" style="background-color: ${color}; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ${isVerified ? '<div class="verification-badge">✓</div>' : ''}
          ${isUrgent ? '<div class="urgent-indicator">!</div>' : ''}
        </div>
        <div class="marker-tooltip">
          <div class="tooltip-content">
            <strong>${doctor.name}</strong><br/>
            ${doctor.specialties[0]}<br/>
            $${doctor.hourlyRate}/hr
          </div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const createCompanyIcon = (company: MarketplaceCompany) => {
  const hasUrgentJobs = company.urgentJobs > 0;
  const isActivelyHiring = company.isActivelyHiring;
  
  const color = hasUrgentJobs ? '#ef4444' : 
                isActivelyHiring ? '#10b981' : '#3b82f6';
                
  const pulseClass = hasUrgentJobs ? 'urgent-pulse' : '';

  return L.divIcon({
    className: `company-marker ${pulseClass}`,
    html: `
      <div class="marker-container">
        <div class="marker-icon" style="background-color: ${color}; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
          </svg>
          ${hasUrgentJobs ? '<div class="urgent-badge">' + company.urgentJobs + '</div>' : ''}
        </div>
        <div class="marker-tooltip">
          <div class="tooltip-content">
            <strong>${company.name}</strong><br/>
            ${company.activeJobs} trabajos activos
          </div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Componente para manejar eventos del mapa
function MapEventHandler({ onLocationChange }: { onLocationChange: (center: LatLngTuple, zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onLocationChange([center.lat, center.lng], zoom);
    },
  });

  return null;
}

// Componente para clusters de markers
function MarkerClusterGroup({ children }: { children: React.ReactNode }) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!clusterGroupRef.current) {
      const L = require('leaflet');
      require('leaflet.markercluster');
      
      clusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        disableClusteringAtZoom: 15,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
      });
      
      map.addLayer(clusterGroupRef.current);
    }

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map]);

  return null;
}

// Datos de ejemplo para el mapa
const mockDoctors: MarketplaceDoctor[] = [
  {
    id: "1",
    name: "Dr. Carlos Mendoza",
    specialties: ["Cardiología", "Medicina Interna"],
    location: {
      city: "Buenos Aires",
      country: "Argentina",
      coordinates: [-34.6037, -58.3816]
    },
    rating: 4.8,
    experience: 15,
    hourlyRate: 150,
    availableForHiring: true,
    responseTime: 2,
    totalHires: 87,
    isUrgentAvailable: true,
    isOnline: true,
    lastActive: "2024-01-15",
    workArrangement: 'hybrid',
    languages: ["Español", "Inglés"],
    verificationStatus: 'verified'
  },
  {
    id: "2",
    name: "Dra. María González",
    specialties: ["Pediatría", "Neonatología"],
    location: {
      city: "Córdoba",
      country: "Argentina",
      coordinates: [-31.4201, -64.1888]
    },
    rating: 4.9,
    experience: 12,
    hourlyRate: 120,
    availableForHiring: true,
    responseTime: 4,
    totalHires: 65,
    isUrgentAvailable: false,
    isOnline: true,
    lastActive: "2024-01-15",
    workArrangement: 'remote',
    languages: ["Español", "Portugués"],
    verificationStatus: 'verified'
  }
];

export default function AltamedicaInteractiveMap() {
  const doctors = mockDoctors;
  const companies: MarketplaceCompany[] = [];
  const center: LatLngTuple = [-34.6037, -58.3816];
  const showDoctors = true;
  const showCompanies = false;
  const filters = undefined;
  const mode = 'hiring' as const;
  const mapRef = useRef<L.Map | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(center || [-34.6037, -58.3816]);
  const [zoom, setZoom] = useState(5);
  const [selectedDoctor, setSelectedDoctor] = useState<MarketplaceDoctor | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<MarketplaceCompany | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const { sendNotification } = useMarketplaceNotifications();

  // Filtrar doctores según los filtros aplicados
  const filteredDoctors = doctors.filter(doctor => {
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

  // Manejar cambio de ubicación del mapa
  const handleLocationChange = useCallback((newCenter: LatLngTuple, newZoom: number) => {
    setMapCenter(newCenter);
    setZoom(newZoom);
  }, []);

  // Manejar selección de doctor
  const handleDoctorSelect = useCallback(async (doctor: MarketplaceDoctor) => {
    setSelectedDoctor(doctor);
    // onDoctorSelect?.(doctor);

    // Registrar visualización del perfil (comentado por ahora)
    console.log('Doctor seleccionado:', doctor.name);
  }, []);

  // Manejar selección de empresa
  const handleCompanySelect = useCallback((company: MarketplaceCompany) => {
    setSelectedCompany(company);
    // onCompanySelect?.(company);
  }, []);

  // Contactar doctor
  const handleContactDoctor = useCallback(async (doctor: MarketplaceDoctor) => {
    setIsLoading(true);
    try {
      // Enviar notificación de contacto (comentado por ahora)

      // Aquí iría la lógica para iniciar una conversación
      console.log('Iniciando contacto con:', doctor.name);
    } catch (error) {
      console.error('Error contacting doctor:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      {/* Estilos para los marcadores del marketplace */}
      <style jsx global>{`
        .doctor-marker, .company-marker {
          background: transparent;
          border: none;
        }
        
        .marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .marker-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .marker-icon:hover {
          transform: scale(1.1);
        }
        
        .urgent-pulse {
          animation: urgentPulse 1s infinite;
        }
        
        .online-pulse {
          animation: onlinePulse 2s infinite;
        }
        
        @keyframes urgentPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        
        @keyframes onlinePulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        
        .verification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          font-size: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }
        
        .urgent-indicator {
          position: absolute;
          top: -2px;
          left: -2px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }
        
        .urgent-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
          border: 2px solid white;
        }
        
        .marker-tooltip {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          white-space: nowrap;
          z-index: 1000;
        }
        
        .marker-container:hover .marker-tooltip {
          opacity: 1;
        }
        
        .tooltip-content {
          text-align: center;
        }
        
        .leaflet-popup-content {
          margin: 12px 16px;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        
        .marketplace-popup {
          min-width: 280px;
        }
        
        .popup-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .popup-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #6b7280;
        }
        
        .popup-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        
        .popup-info p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }
        
        .popup-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin: 12px 0;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .popup-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .btn-primary:hover {
          background: #2563eb;
        }
        
        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-secondary:hover {
          background: #f9fafb;
          color: #374151;
        }
      `}</style>

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-[600px] w-full rounded-lg border border-gray-200"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        dragging={true}
        touchZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler onLocationChange={handleLocationChange} />
        
        {/* Renderizar doctores */}
        {showDoctors && filteredDoctors.map((doctor) => (
          <Marker
            key={doctor.id}
            position={doctor.location.coordinates}
            icon={createDoctorIcon(doctor)}
            eventHandlers={{
              click: () => handleDoctorSelect(doctor),
            }}
          >
            <Popup className="marketplace-popup">
              <div className="popup-header">
                <div className="popup-avatar">
                  {doctor.profileImage ? (
                    <img 
                      src={doctor.profileImage} 
                      alt={doctor.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </div>
                <div className="popup-info">
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialties.join(', ')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      <span className="text-xs">{doctor.rating}</span>
                    </div>
                    {doctor.isOnline && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-1">
                        En línea
                      </span>
                    )}
                    {doctor.isUrgentAvailable && (
                      <span className="text-xs bg-red-50 text-red-700 border border-red-200 rounded px-2 py-1">
                        Urgente
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="popup-stats">
                <div className="stat-item">
                  <DollarSign className="w-3 h-3" />
                  <span>${doctor.hourlyRate}/hr</span>
                </div>
                <div className="stat-item">
                  <Clock className="w-3 h-3" />
                  <span>{doctor.experience} años</span>
                </div>
                <div className="stat-item">
                  <Users className="w-3 h-3" />
                  <span>{doctor.totalHires} contrataciones</span>
                </div>
                <div className="stat-item">
                  <Zap className="w-3 h-3" />
                  <span>Responde en {doctor.responseTime}h</span>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-3">
                <div>Modalidad: {doctor.workArrangement}</div>
                <div>Idiomas: {doctor.languages.join(', ')}</div>
                <div>Ubicación: {doctor.location.city}, {doctor.location.country}</div>
              </div>
              
              <div className="popup-actions">
                <button 
                  className="btn-primary"
                  onClick={() => handleContactDoctor(doctor)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Contactando...' : 'Contactar'}
                </button>
                <button className="btn-secondary">
                  Ver perfil
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Renderizar empresas */}
        {showCompanies && companies.map((company) => (
          <Marker
            key={company.id}
            position={company.location.coordinates}
            icon={createCompanyIcon(company)}
            eventHandlers={{
              click: () => handleCompanySelect(company),
            }}
          >
            <Popup className="marketplace-popup">
              <div className="popup-header">
                <div className="popup-avatar">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    company.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="popup-info">
                  <h3>{company.name}</h3>
                  <p>{company.industry}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      <span className="text-xs">{company.rating}</span>
                    </div>
                    {company.isActivelyHiring && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-1">
                        Contratando
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="popup-stats">
                <div className="stat-item">
                  <Users className="w-3 h-3" />
                  <span>{company.activeJobs} trabajos activos</span>
                </div>
                <div className="stat-item">
                  <Zap className="w-3 h-3" />
                  <span>{company.urgentJobs} urgentes</span>
                </div>
                <div className="stat-item">
                  <Clock className="w-3 h-3" />
                  <span>Responde en {company.averageResponseTime}h</span>
                </div>
                <div className="stat-item">
                  <MapPin className="w-3 h-3" />
                  <span>{company.size}</span>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-3">
                <div>Tipo: {company.companyType}</div>
                <div>Ubicación: {company.location.city}, {company.location.country}</div>
                <div>Total contrataciones: {company.totalHires}</div>
              </div>
              
              <div className="popup-actions">
                <button className="btn-primary">
                  Ver trabajos
                </button>
                <button className="btn-secondary">
                  Ver empresa
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Panel de información del doctor seleccionado */}
      {selectedDoctor && (
        <div className="absolute top-4 right-4 w-80 bg-white shadow-lg z-[1000] rounded-lg border border-gray-200">
          <div className="p-4 pb-3 border-b border-gray-200">
            <h3 className="text-lg flex items-center justify-between font-semibold">
              {selectedDoctor.name}
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">{selectedDoctor.rating} • {selectedDoctor.experience} años de experiencia</span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedDoctor.specialties.join(', ')}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">${selectedDoctor.hourlyRate}/hora</span>
                <span className="text-gray-500">Responde en {selectedDoctor.responseTime}h</span>
              </div>
              <button 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => handleContactDoctor(selectedDoctor)}
                disabled={isLoading}
              >
                {isLoading ? 'Contactando...' : 'Contactar Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}