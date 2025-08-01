"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngTuple } from "leaflet";

// Configurar iconos por defecto de Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

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

interface ClientMapComponentProps {
  doctors: MarketplaceDoctor[];
  companies?: MarketplaceCompany[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
}

// Contador único global
let mapIdCounter = 0;

const ClientMapComponent: React.FC<ClientMapComponentProps> = ({
  doctors,
  companies = [],
  center,
  showDoctors = true,
  showCompanies = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapId] = useState(() => `leaflet-map-${Date.now()}-${++mapIdCounter}`);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const mapCenter = center || [-23.0, -55.0];
  const zoom = 4;

  useEffect(() => {
    let mounted = true;
    let map: L.Map | null = null;

    const initMap = async () => {
      // Esperar un momento para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mounted || !mapContainerRef.current) return;

      try {
        // Limpiar cualquier mapa existente en el contenedor
        const container = mapContainerRef.current;
        if (container._leaflet_id) {
          delete (container as any)._leaflet_id;
        }
        container.innerHTML = '';

        // Verificar que el contenedor tenga dimensiones
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('Map container has no dimensions, waiting...');
          setTimeout(initMap, 200);
          return;
        }

        // Crear el mapa
        map = L.map(container, {
          center: mapCenter,
          zoom: zoom,
          zoomControl: true,
          attributionControl: true
        });

        // Guardar referencia
        mapInstanceRef.current = map;

        // Agregar capa de tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        // Agregar marcadores de doctores
        if (showDoctors && doctors.length > 0) {
          doctors.forEach((doctor) => {
            if (doctor.location?.coordinates) {
              try {
                const marker = L.marker(doctor.location.coordinates);
                marker.addTo(map);
                marker.bindPopup(`
                  <div style="padding: 8px; min-width: 200px;">
                    <h3 style="font-weight: 600; margin: 0 0 4px 0;">${doctor.name}</h3>
                    <p style="font-size: 0.875rem; color: #4b5563; margin: 0 0 4px 0;">${doctor.specialties.join(', ')}</p>
                    <p style="font-size: 0.875rem; margin: 0 0 4px 0;">${doctor.location.city}, ${doctor.location.country}</p>
                    <p style="font-size: 0.875rem; font-weight: 500; margin: 0;">$${doctor.hourlyRate}/hr</p>
                  </div>
                `);
              } catch (err) {
                console.warn('Error adding doctor marker:', err);
              }
            }
          });
        }

        // Agregar marcadores de empresas
        if (showCompanies && companies.length > 0) {
          companies.forEach((company) => {
            if (company.location?.coordinates) {
              try {
                const marker = L.marker(company.location.coordinates);
                marker.addTo(map);
                marker.bindPopup(`
                  <div style="padding: 8px; min-width: 200px;">
                    <h3 style="font-weight: 600; margin: 0 0 4px 0;">${company.name}</h3>
                    <p style="font-size: 0.875rem; color: #4b5563; margin: 0 0 4px 0;">${company.industry}</p>
                    <p style="font-size: 0.875rem; margin: 0 0 4px 0;">${company.location.city}, ${company.location.country}</p>
                    <p style="font-size: 0.875rem; font-weight: 500; margin: 0;">${company.activeJobs} trabajos activos</p>
                  </div>
                `);
              } catch (err) {
                console.warn('Error adding company marker:', err);
              }
            }
          });
        }

        // Forzar actualización del mapa
        setTimeout(() => {
          if (map && mounted) {
            map.invalidateSize();
          }
        }, 200);

        setIsInitializing(false);
        setError(null);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Error al inicializar el mapa');
        setIsInitializing(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      mounted = false;
      if (map) {
        try {
          map.off();
          map.remove();
        } catch (err) {
          console.warn('Error cleaning up map:', err);
        }
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (err) {
          console.warn('Error cleaning up map ref:', err);
        }
        mapInstanceRef.current = null;
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
      <div 
        ref={mapContainerRef}
        id={mapId}
        className="h-full w-full rounded-lg"
        style={{ 
          position: 'relative',
          zIndex: 1,
          backgroundColor: '#f3f4f6'
        }}
      />
      {isInitializing && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="text-sm font-medium text-gray-700">Renderizando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMapComponent;