"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from "leaflet";

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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

interface SafeMapContainerProps {
  doctors: MarketplaceDoctor[];
  companies?: MarketplaceCompany[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
}

let mapCounter = 0;

export default function SafeMapContainer({
  doctors,
  companies = [],
  center,
  showDoctors = true,
  showCompanies = true
}: SafeMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapId] = useState(() => `safe-leaflet-map-${++mapCounter}`);
  const [error, setError] = useState<string | null>(null);
  
  const mapCenter = center || [-23.0, -55.0];
  const zoom = 4;

  useEffect(() => {
    if (!containerRef.current) return;

    // Función para crear el mapa
    const createMap = () => {
      try {
        // Verificar si ya existe un mapa
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Limpiar el contenedor
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Crear nuevo mapa
        const map = L.map(containerRef.current, {
          center: mapCenter,
          zoom: zoom,
          zoomControl: true
        });

        // Agregar capa de tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Agregar marcadores de doctores
        if (showDoctors) {
          doctors.forEach((doctor) => {
            const marker = L.marker(doctor.location.coordinates)
              .addTo(map)
              .bindPopup(`
                <div class="p-2">
                  <h3 class="font-semibold">${doctor.name}</h3>
                  <p class="text-sm text-gray-600">${doctor.specialties.join(', ')}</p>
                  <p class="text-sm">${doctor.location.city}, ${doctor.location.country}</p>
                  <p class="text-sm font-medium">$${doctor.hourlyRate}/hr</p>
                </div>
              `);
          });
        }

        // Agregar marcadores de empresas
        if (showCompanies) {
          companies.forEach((company) => {
            const marker = L.marker(company.location.coordinates)
              .addTo(map)
              .bindPopup(`
                <div class="p-2">
                  <h3 class="font-semibold">${company.name}</h3>
                  <p class="text-sm text-gray-600">${company.industry}</p>
                  <p class="text-sm">${company.location.city}, ${company.location.country}</p>
                  <p class="text-sm font-medium">${company.activeJobs} trabajos activos</p>
                </div>
              `);
          });
        }

        mapRef.current = map;
        setError(null);
      } catch (err) {
        console.error('Error creating map:', err);
        setError('Error al crear el mapa');
      }
    };

    // Crear el mapa con un pequeño retraso
    const timer = setTimeout(createMap, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (err) {
          console.warn('Error removing map:', err);
        }
      }
    };
  }, [doctors, companies, showDoctors, showCompanies, mapCenter, zoom]);

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
    <div 
      ref={containerRef}
      id={mapId}
      className="h-full w-full min-h-[600px] rounded-lg"
      style={{ position: 'relative', zIndex: 1 }}
    />
  );
}