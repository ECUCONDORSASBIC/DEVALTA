"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import type { LatLngTuple } from "leaflet";

// Lazy load del componente del mapa
const MarketplaceMapDemo = dynamic(
  () => import('./MarketplaceMapDemo'),
  { 
    loading: () => (
      <div className="h-[600px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm font-medium text-gray-700">Cargando mapa del marketplace...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

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

interface ClientSideMapProps {
  doctors: MarketplaceDoctor[];
  companies?: MarketplaceCompany[];
  center?: LatLngTuple;
  showDoctors?: boolean;
  showCompanies?: boolean;
}

export default function ClientSideMap(props: ClientSideMapProps) {
  return <MarketplaceMapDemo {...props} />;
}