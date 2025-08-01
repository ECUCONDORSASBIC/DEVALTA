'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngTuple } from 'leaflet';
import { Target, MapPin, Users, Building2, Star, Clock, Heart } from 'lucide-react';
import '../../styles/leaflet.css';

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

// Datos demo específicos para Latinoamérica
const latinAmericaDoctors = [
  {
    id: 'doc-argentina-1',
    name: 'Dr. Carlos Martínez',
    specialties: ['Cardiología', 'Medicina Interna'],
    location: {
      city: 'Buenos Aires',
      country: 'Argentina',
      coordinates: [-34.6037, -58.3816] as LatLngTuple,
    },
    rating: 4.8,
    experience: 12,
    hourlyRate: 85,
    availableForHiring: true,
    responseTime: 2,
    totalHires: 47,
    isUrgentAvailable: true,
    isOnline: true,
    workArrangement: 'hybrid' as const,
    languages: ['Español', 'Inglés'],
    verificationStatus: 'verified' as const,
  },
  {
    id: 'doc-brazil-1',
    name: 'Dra. Ana Rodrigues',
    specialties: ['Pediatría', 'Neonatología'],
    location: {
      city: 'São Paulo',
      country: 'Brasil',
      coordinates: [-23.5505, -46.6333] as LatLngTuple,
    },
    rating: 4.9,
    experience: 10,
    hourlyRate: 75,
    availableForHiring: true,
    responseTime: 1.5,
    totalHires: 52,
    isUrgentAvailable: false,
    isOnline: true,
    workArrangement: 'remote' as const,
    languages: ['Português', 'Español', 'Inglés'],
    verificationStatus: 'verified' as const,
  },
  {
    id: 'doc-mexico-1',
    name: 'Dr. Miguel Torres',
    specialties: ['Neurología', 'Neurocirugía'],
    location: {
      city: 'Ciudad de México',
      country: 'México',
      coordinates: [19.4326, -99.1332] as LatLngTuple,
    },
    rating: 4.7,
    experience: 15,
    hourlyRate: 120,
    availableForHiring: true,
    responseTime: 3,
    totalHires: 63,
    isUrgentAvailable: true,
    isOnline: false,
    workArrangement: 'on_site' as const,
    languages: ['Español', 'Inglés', 'Francés'],
    verificationStatus: 'verified' as const,
  },
  {
    id: 'doc-colombia-1',
    name: 'Dra. María Hernández',
    specialties: ['Oncología', 'Medicina Nuclear'],
    location: {
      city: 'Bogotá',
      country: 'Colombia',
      coordinates: [4.7110, -74.0721] as LatLngTuple,
    },
    rating: 4.8,
    experience: 11,
    hourlyRate: 95,
    availableForHiring: true,
    responseTime: 2.2,
    totalHires: 38,
    isUrgentAvailable: true,
    isOnline: true,
    workArrangement: 'hybrid' as const,
    languages: ['Español', 'Inglés'],
    verificationStatus: 'verified' as const,
  },
  {
    id: 'doc-chile-1',
    name: 'Dr. Roberto Silva',
    specialties: ['Traumatología', 'Medicina Deportiva'],
    location: {
      city: 'Santiago',
      country: 'Chile',
      coordinates: [-33.4489, -70.6693] as LatLngTuple,
    },
    rating: 4.6,
    experience: 8,
    hourlyRate: 70,
    availableForHiring: true,
    responseTime: 2.8,
    totalHires: 29,
    isUrgentAvailable: false,
    isOnline: true,
    workArrangement: 'flexible' as const,
    languages: ['Español', 'Inglés'],
    verificationStatus: 'verified' as const,
  },
  {
    id: 'doc-peru-1',
    name: 'Dra. Carmen López',
    specialties: ['Ginecología', 'Obstetricia'],
    location: {
      city: 'Lima',
      country: 'Perú',
      coordinates: [-12.0464, -77.0428] as LatLngTuple,
    },
    rating: 4.9,
    experience: 13,
    hourlyRate: 80,
    availableForHiring: true,
    responseTime: 1.8,
    totalHires: 45,
    isUrgentAvailable: true,
    isOnline: true,
    workArrangement: 'remote' as const,
    languages: ['Español', 'Quechua', 'Inglés'],
    verificationStatus: 'verified' as const,
  },
];

const latinAmericaHospitals = [
  {
    id: 'hospital-argentina-1',
    name: 'Hospital San Vicente',
    location: {
      city: 'Buenos Aires',
      country: 'Argentina',
      coordinates: [-34.6037, -58.3816] as LatLngTuple,
    },
    rating: 4.8,
    activeJobs: 15,
    urgentJobs: 3,
    isActivelyHiring: true,
    totalHires: 127,
    companyType: 'hospital' as const,
  },
  {
    id: 'hospital-brazil-1',
    name: 'Hospital Sírio-Libanês',
    location: {
      city: 'São Paulo',
      country: 'Brasil',
      coordinates: [-23.5558, -46.6396] as LatLngTuple,
    },
    rating: 4.9,
    activeJobs: 12,
    urgentJobs: 2,
    isActivelyHiring: true,
    totalHires: 203,
    companyType: 'hospital' as const,
  },
  {
    id: 'hospital-mexico-1',
    name: 'Hospital ABC',
    location: {
      city: 'Ciudad de México',
      country: 'México',
      coordinates: [19.3910, -99.2837] as LatLngTuple,
    },
    rating: 4.7,
    activeJobs: 8,
    urgentJobs: 1,
    isActivelyHiring: true,
    totalHires: 89,
    companyType: 'hospital' as const,
  },
  {
    id: 'hospital-colombia-1',
    name: 'Fundación Santa Fe',
    location: {
      city: 'Bogotá',
      country: 'Colombia',
      coordinates: [4.6537, -74.0835] as LatLngTuple,
    },
    rating: 4.8,
    activeJobs: 10,
    urgentJobs: 2,
    isActivelyHiring: true,
    totalHires: 145,
    companyType: 'hospital' as const,
  },
];

interface MarketplaceDemoMapProps {
  height?: string;
  interactive?: boolean;
}

export default function MarketplaceDemoMap({ 
  height = '600px', 
  interactive = true 
}: MarketplaceDemoMapProps) {
  const mapRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  // Asegurar que el componente solo se renderice en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Configuración específica para Latinoamérica
  const latinAmericaCenter: LatLngTuple = [-15.0, -60.0]; // Centro geográfico de Sudamérica
  const zoomLevel = 4; // Zoom para mostrar toda Latinoamérica

  // Crear marcadores personalizados para React Leaflet
  const createDoctorIcon = (isOnline: boolean, isUrgent: boolean) => {
    if (typeof window === 'undefined') return null;
    
    const L = require('leaflet');
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="w-8 h-8 rounded-full flex items-center justify-center ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          } border-2 border-white shadow-lg">
            <span class="text-white text-xs">👨‍⚕️</span>
          </div>
          ${isUrgent ? `
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          ` : ''}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createHospitalIcon = () => {
    if (typeof window === 'undefined') return null;
    
    const L = require('leaflet');
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 border-2 border-white shadow-lg">
          <span class="text-white text-sm">🏥</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  if (typeof window === 'undefined') {
    // Placeholder para SSR
    return (
      <div 
        className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando mapa de Latinoamérica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg" style={{ height }}>
      {/* Controles del mapa */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{latinAmericaDoctors.filter(d => d.isOnline).length} En línea</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>{latinAmericaDoctors.filter(d => d.isUrgentAvailable).length} Urgentes</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3 text-blue-600" />
            <span>{latinAmericaHospitals.length} Hospitales</span>
          </div>
        </div>
      </div>

      {/* Estadísticas flotantes */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{latinAmericaDoctors.length}</div>
          <div className="text-xs text-gray-600">Médicos disponibles</div>
        </div>
      </div>

      {!isClient && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-600 font-medium">Inicializando mapa...</p>
          </div>
        </div>
      )}

      {isClient && (
        <MapContainer
          key="marketplace-demo-map"
          ref={mapRef}
          center={latinAmericaCenter}
          zoom={zoomLevel}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={interactive}
          dragging={interactive}
          touchZoom={interactive}
          doubleClickZoom={interactive}
          keyboard={interactive}
          boxZoom={interactive}
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Marcadores de médicos */}
        {latinAmericaDoctors.map((doctor) => (
          <Marker
            key={doctor.id}
            position={doctor.location.coordinates}
            icon={createDoctorIcon(doctor.isOnline, doctor.isUrgentAvailable)}
            eventHandlers={{
              click: () => setSelectedDoctor(doctor),
            }}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">👨‍⚕️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialties.join(', ')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{doctor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span>{doctor.responseTime}hrs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-green-500" />
                    <span>{doctor.totalHires} contratos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    <span>${doctor.hourlyRate}/hr</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {doctor.location.city}, {doctor.location.country}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${doctor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs">{doctor.isOnline ? 'En línea' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcadores de hospitales */}
        {latinAmericaHospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={hospital.location.coordinates}
            icon={createHospitalIcon()}
            eventHandlers={{
              click: () => setSelectedHospital(hospital),
            }}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🏥</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                    <p className="text-sm text-gray-600">{hospital.location.city}, {hospital.location.country}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <div className="font-bold text-blue-600">{hospital.activeJobs}</div>
                    <div className="text-gray-600">Ofertas activas</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded text-center">
                    <div className="font-bold text-red-600">{hospital.urgentJobs}</div>
                    <div className="text-gray-600">Urgentes</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs">{hospital.rating}/5</span>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {hospital.totalHires} contrataciones
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        </MapContainer>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <h4 className="font-semibold text-sm mb-2">Leyenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span>👨‍⚕️</span>
            <span>Médicos disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏥</span>
            <span>Hospitales contratando</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Disponible para urgencias</span>
          </div>
        </div>
      </div>

      {/* CSS personalizado para los marcadores */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}