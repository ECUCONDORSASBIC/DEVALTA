'use client';

import 'leaflet/dist/leaflet.css';
import {
  Building,
  Filter,
  Heart,
  Layers,
  MapPin,
  Minus,
  Plus,
  Search,
  Stethoscope,
  Target,
  User,
  Phone,
  Star
} from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface DoctorLocation {
  id: string;
  name: string;
  specialty: string;
  company: string;
  location: { lat: number; lng: number; city: string; state: string; };
  status: 'active' | 'busy' | 'offline';
  rating: number;
  experience: string;
  languages: string[];
  urgency: 'low' | 'medium' | 'high';
  centerType: 'hospital' | 'clinic' | 'center';
  services?: string[];
  consultationFee?: string;
  availability?: string;
  phone?: string;
}

const AltamedicaMapControls: React.FC<{
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFilters: () => void;
  onToggleLayers: () => void;
  filtersOpen: boolean;
  layersOpen: boolean;
}> = ({ zoom, onZoomIn, onZoomOut, onReset, onToggleFilters, onToggleLayers, filtersOpen, layersOpen }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-3 z-[1000]">
      <div className="bg-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
        <button 
          onClick={onZoomIn} 
          className="p-3 text-gray-600 transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center" 
          title="Acercar" 
          disabled={zoom >= 18}
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="px-3 py-2 text-sm font-semibold text-blue-600 border-t border-b border-blue-100 text-center bg-blue-50 min-w-[50px]">
          {zoom}
        </div>
        <button 
          onClick={onZoomOut} 
          className="p-3 text-gray-600 transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center" 
          title="Alejar" 
          disabled={zoom <= 1}
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col bg-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
        <button 
          onClick={onReset} 
          className="p-3 text-gray-600 transition-all duration-200 hover:text-blue-600 hover:bg-blue-50" 
          title="Restablecer vista"
        >
          <Target className="w-5 h-5" />
        </button>
        <button 
          onClick={onToggleFilters} 
          className={`p-3 transition-all duration-200 border-t border-blue-100 ${
            filtersOpen 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`} 
          title="Filtros"
        >
          <Filter className="w-5 h-5" />
        </button>
        <button 
          onClick={onToggleLayers} 
          className={`p-3 transition-all duration-200 border-t border-blue-100 ${
            layersOpen 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`} 
          title="Capas"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const AltamedicaInteractiveMap: React.FC = () => {
  const [zoom, setZoom] = useState(13);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    specialty: '',
    status: '',
    urgency: '',
    centerType: ''
  });

  // Datos de ejemplo de doctores
  const doctorLocations: DoctorLocation[] = useMemo(() => [
    {
      id: '1',
      name: 'Dr. María González',
      specialty: 'Cardiología',
      company: 'Hospital Central',
      location: { lat: -34.6037, lng: -58.3816, city: 'Buenos Aires', state: 'CABA' },
      status: 'active',
      rating: 4.8,
      experience: '15 años',
      languages: ['Español', 'Inglés'],
      urgency: 'high',
      centerType: 'hospital',
      services: ['Consulta', 'Ecocardiograma', 'Holter'],
      consultationFee: '$5000',
      availability: 'Lun-Vie 9:00-17:00',
      phone: '+54 11 1234-5678'
    },
    {
      id: '2',
      name: 'Dr. Carlos Méndez',
      specialty: 'Neurología',
      company: 'Clínica San Juan',
      location: { lat: -34.6118, lng: -58.3960, city: 'Buenos Aires', state: 'CABA' },
      status: 'busy',
      rating: 4.6,
      experience: '12 años',
      languages: ['Español', 'Portugués'],
      urgency: 'medium',
      centerType: 'clinic',
      services: ['Consulta', 'EEG', 'Resonancia'],
      consultationFee: '$4500',
      availability: 'Mar-Sáb 10:00-18:00',
      phone: '+54 11 2345-6789'
    }
  ], []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 1, 18));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 1, 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(13);
  }, []);

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[-34.6037, -58.3816]}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {doctorLocations.map((doctor) => (
          <Marker key={doctor.id} position={[doctor.location.lat, doctor.location.lng]}>
            <Popup>
              <div className="p-4 max-w-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{doctor.name}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span>{doctor.company}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{doctor.location.city}, {doctor.location.state}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{doctor.rating} ⭐ ({doctor.experience})</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Solicitar Consulta
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <AltamedicaMapControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        onToggleLayers={() => setLayersOpen(!layersOpen)}
        filtersOpen={filtersOpen}
        layersOpen={layersOpen}
      />
      
      {/* Panel de búsqueda */}
      <div className="absolute top-4 left-4 bg-white border-2 border-blue-200 rounded-xl shadow-lg p-4 z-[1000] max-w-sm">
        <div className="flex items-center space-x-3 mb-3">
          <Search className="w-5 h-5 text-blue-600" />
          <input
            type="text"
            placeholder="Buscar doctores o especialidades..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {filtersOpen && (
          <div className="space-y-3 border-t border-gray-200 pt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todas</option>
                <option value="cardiologia">Cardiología</option>
                <option value="neurologia">Neurología</option>
                <option value="pediatria">Pediatría</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todos</option>
                <option value="active">Disponible</option>
                <option value="busy">Ocupado</option>
                <option value="offline">Fuera de línea</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AltamedicaInteractiveMap;