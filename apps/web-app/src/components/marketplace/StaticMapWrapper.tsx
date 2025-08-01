"use client";

import { useEffect, useState } from "react";
import type { LatLngTuple } from "leaflet";

interface Doctor {
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

interface Company {
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

interface StaticMapWrapperProps {
  doctors: Doctor[];
  companies?: Company[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
}

export default function StaticMapWrapper({
  doctors,
  companies = [],
  center = [-23.0, -55.0],
  showDoctors = true,
  showCompanies = true
}: StaticMapWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    let map: any = null;
    let isCleanedUp = false;

    const loadLeafletMap = async () => {
      try {
        console.log('StaticMapWrapper: Starting map load...');
        
        // Import Leaflet
        const L = (await import('leaflet')).default;
        
        // Import CSS
        await import('leaflet/dist/leaflet.css');
        
        // Check if already cleaned up
        if (isCleanedUp) return;
        
        // Get map container
        const container = document.getElementById('static-map-container');
        if (!container) {
          console.error('StaticMapWrapper: Container not found');
          setMapError('Contenedor del mapa no encontrado');
          return;
        }

        // Clear any existing content
        container.innerHTML = '';
        
        // Configure default icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Create map
        map = L.map(container, {
          center: center,
          zoom: 4,
          scrollWheelZoom: false
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Add markers for doctors
        if (showDoctors && doctors.length > 0) {
          doctors.forEach(doctor => {
            const marker = L.marker(doctor.location.coordinates);
            marker.addTo(map);
            marker.bindPopup(`
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 5px 0; font-weight: bold;">${doctor.name}</h3>
                <p style="margin: 0; color: #666;">${doctor.specialties.join(', ')}</p>
                <p style="margin: 5px 0;">${doctor.location.city}, ${doctor.location.country}</p>
                <p style="margin: 0; font-weight: bold; color: #2563eb;">$${doctor.hourlyRate}/hr</p>
              </div>
            `);
          });
        }

        // Add markers for companies
        if (showCompanies && companies.length > 0) {
          companies.forEach(company => {
            const marker = L.marker(company.location.coordinates);
            marker.addTo(map);
            marker.bindPopup(`
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 5px 0; font-weight: bold;">${company.name}</h3>
                <p style="margin: 0; color: #666;">${company.industry}</p>
                <p style="margin: 5px 0;">${company.location.city}, ${company.location.country}</p>
                <p style="margin: 0; font-weight: bold; color: #10b981;">${company.activeJobs} trabajos activos</p>
              </div>
            `);
          });
        }

        // Force size recalculation
        setTimeout(() => {
          if (map && !isCleanedUp) {
            map.invalidateSize();
          }
        }, 100);

        console.log('StaticMapWrapper: Map loaded successfully');
        setMapLoaded(true);
        setMapError(null);
        
      } catch (error) {
        console.error('StaticMapWrapper: Error loading map:', error);
        setMapError('Error al cargar el mapa');
      }
    };

    // Start loading with a small delay
    const timer = setTimeout(() => {
      loadLeafletMap();
    }, 100);

    return () => {
      isCleanedUp = true;
      clearTimeout(timer);
      
      if (map) {
        try {
          map.off();
          map.remove();
        } catch (e) {
          console.warn('StaticMapWrapper: Error cleaning up map:', e);
        }
      }
    };
  }, [mounted, doctors, companies, center, showDoctors, showCompanies]);

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Leaflet CSS */}
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      
      {/* Map container */}
      <div 
        id="static-map-container" 
        className="h-full w-full rounded-lg"
        style={{ zIndex: 1 }}
      />
      
      {/* Loading overlay */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Cargando mapa del marketplace...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {mapError && (
        <div className="absolute inset-0 bg-red-50 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">{mapError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      )}
      
      {/* Info overlay */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs" style={{ zIndex: 1000 }}>
          <p className="text-xs text-gray-600 mb-2">
            <strong>Marketplace Médico</strong> - {doctors.length} médicos, {companies.length} hospitales
          </p>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Médicos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Hospitales
            </span>
          </div>
        </div>
      )}
    </div>
  );
}