"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLngTuple } from "leaflet";

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

interface MarketplaceMapProps {
  doctors: MarketplaceDoctor[];
  companies?: MarketplaceCompany[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
}

let globalMapCounter = 0;

export default function MarketplaceMapDemo({
  doctors,
  companies = [],
  center,
  showDoctors = true,
  showCompanies = true
}: MarketplaceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapId] = useState(() => `marketplace-leaflet-map-${Date.now()}-${++globalMapCounter}`);
  
  const mapCenter = center || [-23.0, -55.0];
  const zoom = 4;

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    let isMounted = true;
    
    const loadMap = async () => {
      try {
        // Importar Leaflet dinámicamente
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        
        if (!isMounted || !containerRef.current) return;

        // Configurar iconos
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Esperar a que el contenedor esté listo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted || !containerRef.current) return;

        // Limpiar contenedor
        containerRef.current.innerHTML = '';
        
        // Crear el mapa
        const map = L.map(containerRef.current, {
          center: mapCenter,
          zoom: zoom,
          zoomControl: true
        });

        // Agregar tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Agregar marcadores
        if (showDoctors) {
          doctors.forEach(doctor => {
            const marker = L.marker(doctor.location.coordinates);
            marker.addTo(map);
            marker.bindPopup(`
              <div style="padding: 8px;">
                <h3 style="font-weight: 600;">${doctor.name}</h3>
                <p style="color: #666; font-size: 14px;">${doctor.specialties.join(', ')}</p>
                <p style="font-size: 14px;">${doctor.location.city}, ${doctor.location.country}</p>
                <p style="font-weight: 500;">$${doctor.hourlyRate}/hr</p>
              </div>
            `);
          });
        }

        if (showCompanies) {
          companies.forEach(company => {
            const marker = L.marker(company.location.coordinates);
            marker.addTo(map);
            marker.bindPopup(`
              <div style="padding: 8px;">
                <h3 style="font-weight: 600;">${company.name}</h3>
                <p style="color: #666; font-size: 14px;">${company.industry}</p>
                <p style="font-size: 14px;">${company.location.city}, ${company.location.country}</p>
                <p style="font-weight: 500;">${company.activeJobs} trabajos activos</p>
              </div>
            `);
          });
        }

        mapRef.current = map;
        
        // Invalidar tamaño después de un momento
        setTimeout(() => {
          if (map && isMounted) {
            map.invalidateSize();
          }
        }, 300);
        
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('No se pudo cargar el mapa');
        setIsLoading(false);
      }
    };

    // Cargar el mapa con un pequeño delay
    const timer = setTimeout(loadMap, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      // Limpiar mapa
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
          mapRef.current = null;
        } catch (e) {
          console.warn('Error cleaning up map:', e);
        }
      }
    };
  }, []); // Solo ejecutar una vez

  if (error) {
    return (
      <div className="h-[600px] bg-gradient-to-br from-red-50 to-orange-100 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-4xl">⚠️</div>
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full">
      {/* Contenedor del mapa */}
      <div 
        ref={containerRef}
        id={mapId}
        className="h-full w-full rounded-lg bg-gray-100"
        style={{ position: 'relative', zIndex: 1 }}
      />
      
      {/* Overlay de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="text-sm font-medium text-gray-700">Cargando mapa del marketplace...</p>
          </div>
        </div>
      )}
      
      {/* Overlay de información */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs z-[1000]">
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