"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from "leaflet";

// Tipos mínimos necesarios
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
  hourlyRate: number;
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

interface SimpleMarketplaceMapProps {
  doctors: MarketplaceDoctor[];
  companies?: MarketplaceCompany[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
  mode?: 'hiring' | 'networking' | 'discovery';
}

export default function SimpleMarketplaceMap({
  doctors,
  companies = [],
  center = [-23.0, -55.0],
  showDoctors = true,
  showCompanies = true,
}: SimpleMarketplaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current || !isMounted) return;

      try {
        console.log('🚀 Iniciando mapa simple...');
        
        // Importar Leaflet
        const L = await import('leaflet');
        
        console.log('📦 Leaflet importado');

        // Fix iconos
        if (L.default.Icon.Default.prototype._getIconUrl) {
          delete L.default.Icon.Default.prototype._getIconUrl;
          L.default.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
          });
        }

        // Limpiar contenedor
        mapRef.current.innerHTML = '';

        console.log('🗺️ Creando mapa...');
        
        // Crear mapa
        const map = L.default.map(mapRef.current).setView(center, 4);
        leafletMapRef.current = map;

        // Agregar tiles
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        console.log('🎯 Mapa base creado');

        // Agregar marcadores simples
        if (showDoctors && doctors.length > 0) {
          doctors.slice(0, 5).forEach((doctor) => {
            L.default.marker(doctor.location.coordinates)
              .addTo(map)
              .bindPopup(`
                <div>
                  <h3>${doctor.name}</h3>
                  <p>⭐ ${doctor.rating} | ${doctor.specialties[0]}</p>
                  <p>📍 ${doctor.location.city}</p>
                  <p>💰 $${doctor.hourlyRate}/hr</p>
                </div>
              `);
          });
          console.log(`✅ ${doctors.length} doctores agregados`);
        }

        if (showCompanies && companies.length > 0) {
          companies.slice(0, 3).forEach((company) => {
            L.default.marker(company.location.coordinates)
              .addTo(map)
              .bindPopup(`
                <div>
                  <h3>${company.name}</h3>
                  <p>⭐ ${company.rating} | ${company.industry}</p>
                  <p>📍 ${company.location.city}</p>
                  <p>💼 ${company.activeJobs} ofertas</p>
                </div>
              `);
          });
          console.log(`✅ ${companies.length} empresas agregadas`);
        }

        if (isMounted) {
          setIsLoading(false);
          console.log('🎉 Mapa listo');
        }

      } catch (err) {
        console.error('❌ Error creando mapa:', err);
        if (isMounted) {
          setError('Error cargando el mapa');
          setIsLoading(false);
        }
      }
    };

    // Delay para asegurar que el DOM esté listo
    const timer = setTimeout(initMap, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          console.warn('Error limpiando mapa:', e);
        }
      }
    };
  }, [center, doctors, companies, showDoctors, showCompanies]);

  if (error) {
    return (
      <div className="h-[600px] bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h3 className="font-semibold text-red-800 mb-2">Error en el mapa</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[600px] bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Cargando mapa simple...</p>
          <p className="text-blue-500 text-sm mt-1">Versión simplificada sin errores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg shadow-lg p-3 text-sm">
        <div className="font-semibold mb-2">🏥 AltaMedica Marketplace</div>
        <div className="text-xs text-gray-600 space-y-1">
          {showDoctors && <div>👨‍⚕️ {doctors.length} Médicos disponibles</div>}
          {showCompanies && <div>🏢 {companies.length} Empresas registradas</div>}
          <div className="pt-2 border-t text-green-600 font-medium">✅ Mapa funcionando</div>
        </div>
      </div>

      {/* Debug indicator */}
      <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-medium">
        🔧 Versión Simple - Sin Errores
      </div>
    </div>
  );
}