'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from "leaflet";

// Importaciones dinámicas simples
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 flex items-center justify-center">Cargando mapa...</div>
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

export default function SimpleTestMap() {
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

  const center: LatLngTuple = [-34.6037, -58.3816];

  if (typeof window === "undefined") {
    return (
      <div className="h-[400px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm font-medium text-gray-700">Inicializando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <MapContainer
        center={center}
        zoom={10}
        className="h-full w-full rounded-lg border border-gray-200"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Test Marker</h3>
              <p className="text-sm">Buenos Aires, Argentina</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}