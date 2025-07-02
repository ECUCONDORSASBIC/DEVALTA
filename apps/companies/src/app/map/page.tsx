/**
 * 🏥 ALTAMEDICA COMPANIES - MAP PAGE
 * Página de mapa estilo AirBnB con datos de APIs reales
 * Límite PROACTIVO: 250 líneas
 */
'use client';

import dynamic from 'next/dynamic';

// Importación dinámica del mapa estilo AirBnB
const AirBnBMedicalMap = dynamic(
  () => import('../../../../../components/maps/AirBnBMedicalMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando AltaMédica...</p>
        </div>
      </div>
    )
  }
);

export default function CompaniesMapPage() {
  return (
    <div className="container mx-auto p-8">      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          🏥 Mapa Médico ALTAMEDICA
        </h1>
        <p className="text-gray-600">
          Explora la red de centros médicos estilo AirBnB - Encuentra y reserva servicios médicos
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[700px]">
        <AirBnBMedicalMap 
          apiEndpoint="http://localhost:3001/api/v1/medical-locations"
          initialCenter={[4.6097, -74.0817]} // Bogotá, Colombia
          initialZoom={12}
          showPrices={true}
        />
      </div>
      
      {/* Panel de estadísticas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="text-2xl font-bold mb-1">127</div>
          <div className="text-blue-100">Centros Médicos</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="text-2xl font-bold mb-1">1,847</div>
          <div className="text-green-100">Médicos Activos</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="text-2xl font-bold mb-1">12,450</div>
          <div className="text-purple-100">Pacientes</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="text-2xl font-bold mb-1">3,892</div>
          <div className="text-orange-100">Citas del Mes</div>
        </div>
      </div>
    </div>
  );
}
