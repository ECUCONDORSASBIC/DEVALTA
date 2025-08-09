'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@altamedica/ui';
import {
    Activity,
    BarChart3,
    Calendar,
    DollarSign,
    Map,
    PieChart,
    Settings,
    Users
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { marketplaceDoctors, marketplaceCompanies } from '@/data/marketplaceData';

import { PageLoadingSpinner } from '@/components/layout/LoadingSpinner';

// Carga dinámica de componentes de analytics
const AnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard'),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner text="Cargando dashboard de analíticas..." />
  }
);

const AppointmentAnalytics = dynamic(
  () => import('@/components/analytics/AppointmentAnalytics'),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner text="Cargando analíticas de citas..." />
  }
);

const PatientAnalytics = dynamic(
  () => import('@/components/analytics/PatientAnalytics'),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner text="Cargando analíticas de pacientes..." />
  }
);

const FinancialAnalytics = dynamic(
  () => import('@/components/analytics/FinancialAnalytics'),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner text="Cargando analíticas financieras..." />
  }
);

const JobMarketplaceDashboard = dynamic(
  () => import('@/components/marketplace/JobMarketplaceDashboard'),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner text="Cargando marketplace de empleos..." />
  }
);

// Nuevo componente principal del mapa del marketplace
const MarketplaceMap = dynamic(
  () => import('@/components/MarketplaceMap'),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner text="Cargando mapa del marketplace..." />
  }
);

// Mapa simple para testing
const SimpleTestMap = dynamic(
  () => import('@/components/SimpleTestMap'),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner text="Cargando mapa de prueba..." />
  }
);

// Mapa debug simplificado
const DebugMarketplaceMap = dynamic(
  () => import('@/components/DebugMarketplaceMap'),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner text="Cargando mapa debug..." />
  }
);

// Datos de ejemplo para el dashboard principal
const quickStats = [
  {
    title: 'Citas de Hoy',
    value: '47',
    icon: Calendar,
    change: '+8 vs ayer',
    color: 'text-blue-600'
  },
  {
    title: 'Pacientes Activos',
    value: '1,234',
    icon: Users,
    change: '+12% este mes',
    color: 'text-green-600'
  },
  {
    title: 'Ingresos Mensuales',
    value: '$127,450',
    icon: DollarSign,
    change: '+15.3% vs mes anterior',
    color: 'text-purple-600'
  },
  {
    title: 'Eficiencia',
    value: '94.2%',
    icon: Activity,
    change: 'Excelente rendimiento',
    color: 'text-orange-600'
  },
];

export default function CompaniesMainPage() {
  const [activeTab, setActiveTab] = useState<string>('marketplace-map');
  const [statsOpen, setStatsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AltaMedica Marketplace
              </h1>
              <p className="text-gray-600 mt-1">
                Encuentra y contrata talento médico especializado en tiempo real
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats - Desplegable */}
      <div className="px-4 lg:px-8 py-4">
        <div className="container mx-auto">
          {/* Botón para mostrar/ocultar estadísticas */}
          <button
            onClick={() => setStatsOpen(!statsOpen)}
            className="w-full mb-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Estadísticas Rápidas</span>
              <span className="text-sm text-gray-500">
                ({quickStats.length} métricas disponibles)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {statsOpen ? 'Ocultar' : 'Mostrar'}
              </span>
              <div className={`transform transition-transform ${statsOpen ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Panel de estadísticas desplegable */}
          {statsOpen && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 animate-in slide-in-from-top-2 duration-300">
              {quickStats.map((stat, index) => (
                <Card key={stat.title} className="bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="marketplace-map" className="flex items-center space-x-2">
                <Map className="h-4 w-4" />
                <span>Mapa en Tiempo Real</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Citas</span>
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Pacientes</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Financiero</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center space-x-2">
                <PieChart className="h-4 w-4" />
                <span>Gestión</span>
              </TabsTrigger>
            </TabsList>

            {/* Mapa Principal del Marketplace */}
            <TabsContent value="marketplace-map" className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {/* Mapa de prueba simple */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">🔧 Debug: Mapa Simple</h3>
                  <SimpleTestMap />
                </div>
                
                {/* Mapa debug (versión intermedia) */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">🔧 Mapa Debug (Simplificado)</h3>
                  <div className="h-[400px]">
                    <DebugMarketplaceMap
                      doctors={marketplaceDoctors.map(doctor => ({
                        id: doctor.id,
                        name: doctor.name,
                        specialties: doctor.specialties,
                        coordinates: doctor.location.coordinates
                      }))}
                    />
                  </div>
                </div>
                
                {/* PRUEBA: Mapa original SIN controles */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">🔧 Test: Mapa SIN MapControls</h3>
                  <p className="text-sm text-gray-600 mb-2">Si esto funciona, confirmamos que MapControls es el problema</p>
                  <div className="h-[400px] bg-red-50 border-2 border-red-200 rounded-lg p-2">
                    <div className="h-full">
                      <MarketplaceMap
                        doctors={marketplaceDoctors}
                        companies={marketplaceCompanies}
                        center={[-34.6037, -58.3816]}
                        showDoctors={true}
                        showCompanies={true}
                        mode="hiring"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Dashboard General */}
            <TabsContent value="overview" className="space-y-4">
              <AnalyticsDashboard />
            </TabsContent>

            {/* Analytics de Citas */}
            <TabsContent value="appointments" className="space-y-4">
              <AppointmentAnalytics />
            </TabsContent>

            {/* Analytics de Pacientes */}
            <TabsContent value="patients" className="space-y-4">
              <PatientAnalytics />
            </TabsContent>

            {/* Analytics Financieros */}
            <TabsContent value="financial" className="space-y-4">
              <FinancialAnalytics />
            </TabsContent>

            {/* Marketplace */}
            <TabsContent value="marketplace" className="space-y-4">
              <JobMarketplaceDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}