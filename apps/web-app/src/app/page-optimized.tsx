"use client";

import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from "react";

// Importación dinámica para evitar problemas de SSR con Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

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
  jobs?: any[];
}

// Props para el componente del mapa
interface MarketplaceMapProps {
  doctors: MarketplaceDoctor[];
  companies: MarketplaceCompany[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
  mode?: 'hiring' | 'networking' | 'discovery';
}

// Props para la página de Next.js
interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

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
              
              <div className="pt-3 mt-3 border-t border-gray-100">
                <div className="text-center text-sm text-gray-500">
                  Demo interactiva - AltaMedica Marketplace
                </div>
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
              </div>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

// Componente del mapa renombrado
function MarketplaceMap({
  doctors,
  companies,
  center,
  showDoctors = true,
  showCompanies = true,
}: MarketplaceMapProps) {
  const mapRef = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(center || [-23.0, -55.0]);
  const [zoom, setZoom] = useState(4);
  const [selectedDoctor, setSelectedDoctor] = useState<MarketplaceDoctor | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<MarketplaceCompany | null>(null);

  // Fix Leaflet default icons
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapInitialized) {
      const L = (window as any).L;
      if (L) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      }
      setMapInitialized(true);
    }
  }, [mapInitialized]);

  const handleDoctorSelect = useCallback((doctor: MarketplaceDoctor) => {
    setSelectedDoctor(doctor);
    setSelectedCompany(null);
  }, []);

  const handleCompanySelect = useCallback((company: MarketplaceCompany) => {
    setSelectedCompany(company);
    setSelectedDoctor(null);
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    };
  }, []);

  if (typeof window === "undefined" || !mapInitialized) {
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
    <div className="relative h-full">
      <MapContainer
        key={`map-${mapInitialized}`}
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        />
        
        {showDoctors && doctors.map((doctor) => (
          <CustomMarker
            key={doctor.id}
            position={doctor.location.coordinates}
            entity={doctor}
            type="doctor"
            isSelected={selectedDoctor?.id === doctor.id}
            onClick={() => handleDoctorSelect(doctor)}
          />
        ))}
        
        {showCompanies && companies.map((company) => (
          <CustomMarker
            key={company.id}
            position={company.location.coordinates}
            entity={company}
            type="company"
            isSelected={selectedCompany?.id === company.id}
            onClick={() => handleCompanySelect(company)}
          />
        ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-xs text-gray-600 mb-2">
          <strong>Demo Interactiva</strong> - Explora el marketplace médico
        </p>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Disponible
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            En línea
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            Urgente
          </span>
        </div>
      </div>
    </div>
  );
}

// Nuevo componente de página de exportación por defecto
export default function OptimizedHomepage({ searchParams }: PageProps) {
  // Los datos de demostración se definen aquí para que el componente del mapa sea puro
  const mockDoctors: MarketplaceDoctor[] = [
    { id: 'doc1', name: 'Dr. Elena Rodriguez', specialties: ['Cardiología'], location: { city: 'Buenos Aires', country: 'Argentina', coordinates: [-34.6037, -58.3816] }, rating: 4.9, experience: 15, hourlyRate: 120, availableForHiring: true, responseTime: 2, totalHires: 50, isUrgentAvailable: true, isOnline: true, lastActive: 'now', workArrangement: 'remote', languages: ['Español', 'Inglés'], verificationStatus: 'verified' },
    { id: 'doc2', name: 'Dr. João Silva', specialties: ['Neurología', 'Pediatría'], location: { city: 'São Paulo', country: 'Brasil', coordinates: [-23.5505, -46.6333] }, rating: 4.8, experience: 10, hourlyRate: 100, availableForHiring: true, responseTime: 4, totalHires: 35, isUrgentAvailable: false, isOnline: true, lastActive: '5m ago', workArrangement: 'hybrid', languages: ['Portugués', 'Inglés'], verificationStatus: 'verified' },
    { id: 'doc3', name: 'Dr. Sofia Martinez', specialties: ['Dermatología'], location: { city: 'Ciudad de México', country: 'México', coordinates: [19.4326, -99.1332] }, rating: 4.9, experience: 8, hourlyRate: 90, availableForHiring: false, responseTime: 24, totalHires: 60, isUrgentAvailable: false, isOnline: false, lastActive: '2h ago', workArrangement: 'on_site', languages: ['Español'], verificationStatus: 'pending' },
    { id: 'doc4', name: 'Dr. Carlos Gomez', specialties: ['Oncología'], location: { city: 'Bogotá', country: 'Colombia', coordinates: [4.7110, -74.0721] }, rating: 5.0, experience: 20, hourlyRate: 150, availableForHiring: true, responseTime: 1, totalHires: 42, isUrgentAvailable: true, isOnline: false, lastActive: '1d ago', workArrangement: 'flexible', languages: ['Español', 'Inglés'], verificationStatus: 'verified' },
  ];

  const mockCompanies: MarketplaceCompany[] = [
      { id: 'comp1', name: 'Hospital Central de Lima', industry: 'Salud', location: { city: 'Lima', country: 'Perú', coordinates: [-12.0464, -77.0428] }, rating: 4.7, size: '1000+', activeJobs: 15, urgentJobs: 3, isActivelyHiring: true, averageResponseTime: 48, totalHires: 200, companyType: 'hospital' },
      { id: 'comp2', name: 'Clínica Andes Salud', industry: 'Atención Médica', location: { city: 'Santiago', country: 'Chile', coordinates: [-33.4489, -70.6693] }, rating: 4.8, size: '501-1000', activeJobs: 8, urgentJobs: 1, isActivelyHiring: true, averageResponseTime: 24, totalHires: 150, companyType: 'clinic' },
  ];

  return (
    <MarketplaceMap 
      doctors={mockDoctors}
      companies={mockCompanies}
    />
  );
}