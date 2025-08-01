"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from "leaflet";

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
  activeJobs: number;
}

interface RobustMarketplaceMapProps {
  doctors: MarketplaceDoctor[];
  companies?: MarketplaceCompany[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
}

export default function RobustMarketplaceMap({
  doctors,
  companies = [],
  center,
  showDoctors = true,
  showCompanies = true
}: RobustMarketplaceMapProps) {
  const [isReady, setIsReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const mapCenter = center || [-23.0, -55.0];
  const zoom = 4;

  // Función de limpieza completa
  const cleanupMap = useCallback(() => {
    if (containerRef.current) {
      const leafletContainers = containerRef.current.querySelectorAll('.leaflet-container');
      leafletContainers.forEach((container) => {
        if ((container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
        }
        container.remove();
      });
      containerRef.current.innerHTML = '';
    }
  }, []);

  // Reinicializar mapa
  const reinitializeMap = useCallback(() => {
    setHasError(false);
    setIsReady(false);
    cleanupMap();
    
    setMapKey(prev => prev + 1);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsReady(true);
    }, 300);
  }, [cleanupMap]);

  // Inicialización
  useEffect(() => {
    if (typeof window !== 'undefined') {
      timeoutRef.current = setTimeout(() => {
        setIsReady(true);
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanupMap();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cleanupMap]);

  // Manejo de errores global
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Map container is already initialized')) {
        console.warn('Map initialization error caught, reinitializing...');
        event.preventDefault();
        setHasError(true);
        setTimeout(reinitializeMap, 100);
        return false;
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [reinitializeMap]);

  // Estados de carga y error
  if (typeof window === "undefined" || !isReady) {
    return (
      <div className="h-[600px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm font-medium text-gray-700">Cargando mapa del marketplace...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-[600px] bg-gradient-to-br from-red-50 to-orange-100 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-4xl">⚠️</div>
          <p className="text-sm font-medium text-red-700">Error al cargar el mapa</p>
          <button 
            onClick={reinitializeMap}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full" ref={containerRef}>
      <MapContainer
        key={`robust-map-${mapKey}`}
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
        whenCreated={(map) => {
          // Configuración adicional del mapa si es necesario
          console.log('Mapa creado exitosamente');
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        />
        
        {/* Marcadores de doctores */}
        {showDoctors && doctors.map((doctor) => (
          <Marker
            key={`doctor-${doctor.id}-${mapKey}`}
            position={doctor.location.coordinates}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialties.join(', ')}</p>
                <p className="text-sm">{doctor.location.city}, {doctor.location.country}</p>
                <p className="text-sm font-medium">${doctor.hourlyRate}/hr</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcadores de empresas */}
        {showCompanies && companies.map((company) => (
          <Marker
            key={`company-${company.id}-${mapKey}`}
            position={company.location.coordinates}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{company.name}</h3>
                <p className="text-sm text-gray-600">{company.industry}</p>
                <p className="text-sm">{company.location.city}, {company.location.country}</p>
                <p className="text-sm font-medium">{company.activeJobs} trabajos activos</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay de información */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-xs text-gray-600 mb-2">
          <strong>Demo Interactiva</strong> - Marketplace médico
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