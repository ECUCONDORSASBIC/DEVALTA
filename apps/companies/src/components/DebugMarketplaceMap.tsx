'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from "leaflet";

// Importaciones dinámicas
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 flex items-center justify-center">Cargando mapa debug...</div>
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

interface SimpleDoctor {
  id: string;
  name: string;
  specialties: string[];
  coordinates: LatLngTuple;
}

interface DebugMapProps {
  doctors: SimpleDoctor[];
}

// 🧪 TEST: Componente CustomMarker simplificado
const TestCustomMarker: React.FC<{
  position: [number, number];
  doctor: SimpleDoctor;
}> = ({ position, doctor }) => {
  const getMarkerIcon = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const L = (window as any).L;
    if (!L) return null;
    
    return L.divIcon({
      className: 'custom-doctor-marker',
      html: `
        <div class="relative">
          <div class="w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white font-bold" 
               style="background: linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)">
            <span class="text-xl">👨‍⚕️</span>
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
    });
  }, []);

  const icon = getMarkerIcon();
  if (!icon) return null;

  return (
    <Marker
      position={position}
      icon={icon}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">{doctor.name}</h3>
          <p className="text-sm">{doctor.specialties.join(', ')}</p>
          <p className="text-xs text-gray-500 mt-1">🧪 Custom Marker Test</p>
        </div>
      </Popup>
    </Marker>
  );
};

export default function DebugMarketplaceMap({ doctors }: DebugMapProps) {
  // Fix para iconos de Leaflet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = (window as any).L;
      if (L) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      }
    }
  }, []);

  // 🧪 TEST: Agregar bounds geográficos como en el mapa original
  const GEOGRAPHIC_BOUNDS: [LatLngTuple, LatLngTuple] = [
    [-55.0, -110.0], // Southwest bound (Chile/Argentina sur, México oeste)
    [32.0, -30.0]     // Northeast bound (México norte, Brasil este)
  ];

  const [mapCenter] = useState<LatLngTuple>([-34.6037, -58.3816]);
  const [zoom] = useState(6);

  if (typeof window === "undefined") {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm font-medium text-gray-700">Cargando mapa debug...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full rounded-lg border border-gray-200"
        zoomControl={true}
        maxBounds={GEOGRAPHIC_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={3}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* 🧪 TEST: Marcadores personalizados */}
        {doctors.map((doctor) => (
          <TestCustomMarker
            key={doctor.id}
            position={doctor.coordinates as [number, number]}
            doctor={doctor}
          />
        ))}
      </MapContainer>
      
      {/* Debug info */}
      <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs">
        🔧 Debug + CustomMarkers - {doctors.length} médicos
      </div>
    </div>
  );
}