"use client";

import { useEffect, useRef, useState } from "react";

interface MapProps {
  doctors: any[];
  companies?: any[];
  center?: [number, number];
  showDoctors?: boolean;
  showCompanies?: boolean;
}

export default function SimpleMap({
  doctors,
  companies = [],
  center = [-23.0, -55.0],
  showDoctors = true,
  showCompanies = true
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let map: any = null;
    
    const initMap = async () => {
      try {
        // Verificar si el contenedor existe
        if (!mapRef.current) {
          console.log('No hay contenedor para el mapa');
          return;
        }

        console.log('Iniciando carga del mapa...');
        
        // Importar Leaflet
        const L = (await import('leaflet')).default;
        
        // Limpiar contenedor
        mapRef.current.innerHTML = '';
        
        // Crear mapa
        map = L.map(mapRef.current).setView(center, 4);
        
        // Agregar tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Configurar iconos por defecto
        const defaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        L.Marker.prototype.options.icon = defaultIcon;
        
        // Agregar marcadores
        if (showDoctors) {
          doctors.forEach(doctor => {
            L.marker(doctor.location.coordinates)
              .addTo(map)
              .bindPopup(`<b>${doctor.name}</b><br>${doctor.specialties.join(', ')}`);
          });
        }
        
        if (showCompanies) {
          companies.forEach(company => {
            L.marker(company.location.coordinates)
              .addTo(map)
              .bindPopup(`<b>${company.name}</b><br>${company.industry}`);
          });
        }
        
        console.log('Mapa cargado exitosamente');
        setIsLoaded(true);
        setHasError(false);
        
        // Forzar redimensionamiento
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 100);
        
      } catch (error) {
        console.error('Error al cargar el mapa:', error);
        setHasError(true);
        setIsLoaded(true);
      }
    };
    
    // Inicializar con delay
    const timer = setTimeout(initMap, 100);
    
    return () => {
      clearTimeout(timer);
      if (map) {
        try {
          map.remove();
        } catch (e) {
          console.log('Error al limpiar mapa:', e);
        }
      }
    };
  }, []);

  if (hasError) {
    return (
      <div className="h-[600px] bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">Error al cargar el mapa</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full">
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-lg bg-gray-100"
        style={{ zIndex: 1 }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Cargando mapa...</p>
          </div>
        </div>
      )}
      
      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs" style={{ zIndex: 1000 }}>
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