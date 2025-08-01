"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';

// Componente wrapper que maneja la inicialización del mapa de forma más segura
const MapWrapper = dynamic(() => import('./MarketplaceMapDemo'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center border border-gray-200">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
        <p className="text-sm font-medium text-gray-700">Cargando mapa del marketplace...</p>
      </div>
    </div>
  )
});

export default MapWrapper;