'use client';

import { useEffect, useRef, useState } from 'react';

interface Doctor {
  id: string;
  name: string;
  specialties: string[];
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
  };
  rating: number;
  experience: number;
  hourlyRate: number;
  isOnline: boolean;
  isUrgentAvailable: boolean;
  verificationStatus: string;
}

interface Hospital {
  id: string;
  name: string;
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
  };
  type: string;
  totalHires: number;
  urgentJobs: number;
  rating: number;
}

interface LeafletMapCoreProps {
  doctors: Doctor[];
  hospitals: Hospital[];
  interactive: boolean;
}

export function LeafletMapCore({ doctors, hospitals, interactive }: LeafletMapCoreProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        // Importar Leaflet dinámicamente
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix para los iconos de Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (!isMounted || !mapRef.current) return;

        // Crear el mapa
        const map = L.map(mapRef.current, {
          center: [-15.0, -60.0], // Centro de Latinoamérica
          zoom: 4,
          scrollWheelZoom: interactive,
          dragging: interactive,
          touchZoom: interactive,
          doubleClickZoom: interactive,
          keyboard: interactive,
          boxZoom: interactive,
        });

        // Agregar tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Crear iconos personalizados para médicos
        const createDoctorIcon = (doctor: Doctor) => {
          const color = doctor.isUrgentAvailable ? '#dc2626' : 
                       doctor.isOnline ? '#10b981' : '#6b7280';
          
          return L.divIcon({
            className: 'custom-doctor-marker',
            html: `
              <div style="
                width: 40px; 
                height: 40px; 
                background: ${color}; 
                border: 3px solid white; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                position: relative;
              ">
                <span style="color: white; font-size: 18px;">👨‍⚕️</span>
                ${doctor.isOnline ? '<div style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: #10b981; border: 2px solid white; border-radius: 50%;"></div>' : ''}
                ${doctor.verificationStatus === 'verified' ? '<div style="position: absolute; top: -3px; right: -3px; width: 16px; height: 16px; background: #3b82f6; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white;">✓</div>' : ''}
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
          });
        };

        // Crear iconos personalizados para hospitales
        const createHospitalIcon = (hospital: Hospital) => {
          const color = hospital.urgentJobs > 0 ? '#dc2626' : '#7c3aed';
          
          return L.divIcon({
            className: 'custom-hospital-marker',
            html: `
              <div style="
                width: 50px; 
                height: 50px; 
                background: ${color}; 
                border: 3px solid white; 
                border-radius: 12px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 2px 15px rgba(0,0,0,0.3);
                position: relative;
              ">
                <span style="color: white; font-size: 24px;">🏥</span>
                ${hospital.urgentJobs > 0 ? `<div style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; background: #dc2626; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: bold;">${hospital.urgentJobs}</div>` : ''}
              </div>
            `,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25],
          });
        };

        // Agregar marcadores de médicos
        doctors.forEach(doctor => {
          const marker = L.marker(doctor.location.coordinates, {
            icon: createDoctorIcon(doctor)
          }).addTo(map);

          marker.bindPopup(`
            <div style="min-width: 250px; padding: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${doctor.name}</h3>
                ${doctor.verificationStatus === 'verified' ? '<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px;">VERIFICADO</span>' : ''}
              </div>
              <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                ${doctor.specialties.join(', ')}
              </div>
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
                <span style="color: #f59e0b;">⭐</span>
                <span style="font-weight: 600; color: #1f2937;">${doctor.rating}</span>
                <span style="color: #6b7280; font-size: 12px;">(${doctor.experience} años exp.)</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <div style="color: #059669; font-weight: 600;">USD $${doctor.hourlyRate}/hora</div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  ${doctor.isOnline ? '<div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div><span style="color: #10b981; font-size: 12px;">En línea</span>' : '<span style="color: #6b7280; font-size: 12px;">Desconectado</span>'}
                </div>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                📍 ${doctor.location.city}, ${doctor.location.country}
              </div>
            </div>
          `);
        });

        // Agregar marcadores de hospitales
        hospitals.forEach(hospital => {
          const marker = L.marker(hospital.location.coordinates, {
            icon: createHospitalIcon(hospital)
          }).addTo(map);

          marker.bindPopup(`
            <div style="min-width: 250px; padding: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${hospital.name}</h3>
                <span style="background: #7c3aed; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px;">${hospital.type.toUpperCase()}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
                <span style="color: #f59e0b;">⭐</span>
                <span style="font-weight: 600; color: #1f2937;">${hospital.rating}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                <div style="color: #059669; font-size: 12px;">${hospital.totalHires} contrataciones</div>
                ${hospital.urgentJobs > 0 ? `<div style="color: #dc2626; font-weight: 600; font-size: 12px;">${hospital.urgentJobs} urgentes</div>` : ''}
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                📍 ${hospital.location.city}, ${hospital.location.country}
              </div>
            </div>
          `);
        });

        leafletMapRef.current = map;
        
        if (isMounted) {
          setIsMapReady(true);
        }

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [doctors, hospitals, interactive]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}
    />
  );
}