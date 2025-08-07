'use client';

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Heart,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { lazy, Suspense, useState } from 'react';

// Importar componentes del package @altamedica/ui
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  HealthMetricCard,
  MedicalAIAssistant,
  VitalSignsChart
} from '@altamedica/ui';

// Lazy load charts
const Charts = lazy(() => import('@/components/DashboardCharts'));

interface CompanyMetrics {
  totalDoctors: number;
  activeDoctors: number;
  totalPatients: number;
  activePatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  patientSatisfaction: number;
  doctorSatisfaction: number;
  telemedicineSessions: number;
  emergencyCases: number;
  averageWaitTime: number;
  patientRetentionRate: number;
  bedOccupancyRate: number;
  staffUtilization: number;
  openJobOffers: number;
  pendingApplications: number;
}

const mockMetrics: CompanyMetrics = {
  totalDoctors: 48,
  activeDoctors: 42,
  totalPatients: 2847,
  activePatients: 1234,
  totalAppointments: 892,
  completedAppointments: 743,
  pendingAppointments: 149,
  monthlyRevenue: 185000,
  monthlyExpenses: 120000,
  patientSatisfaction: 4.6,
  doctorSatisfaction: 4.2,
  telemedicineSessions: 234,
  emergencyCases: 45,
  averageWaitTime: 22,
  patientRetentionRate: 87,
  bedOccupancyRate: 78,
  staffUtilization: 85,
  openJobOffers: 5,
  pendingApplications: 23,
};

export default function DashboardOverview() {
  const [metrics] = useState<CompanyMetrics>(mockMetrics);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-primary-100">
      <div className="container-altamedica py-8 space-y-8">
        {/* Header con branding AltaMedica mejorado */}
        <div className="companies-hero animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-altamedica">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Empresarial</h1>
                <p className="text-primary-100 text-lg">Gestión completa de clínicas y hospitales con IA avanzada</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="glass rounded-lg p-3">
                <div className="flex items-center space-x-2 text-white">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Sistema Activo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principales con HealthMetricCard mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="companies-metric-card animate-scale-in hover-lift">
            <HealthMetricCard
              icon={<Users className="w-6 h-6 text-blue-600" />}
              title="Pacientes Activos"
              value={metrics.activePatients.toLocaleString()}
              status="excellent"
              trend="up"
              description="Pacientes que han tenido actividad reciente"
            />
          </div>

          <div className="companies-metric-card animate-scale-in hover-lift" style={{animationDelay: '0.1s'}}>
            <HealthMetricCard
              icon={<UserCheck className="w-6 h-6 text-green-600" />}
              title="Médicos Activos"
              value={metrics.activeDoctors.toString()}
              status="excellent"
              trend="stable"
              description="Profesionales médicos disponibles"
            />
          </div>

          <div className="companies-metric-card animate-scale-in hover-lift" style={{animationDelay: '0.2s'}}>
            <HealthMetricCard
              icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
              title="Ingresos Mensuales"
              value={formatCurrency(metrics.monthlyRevenue)}
              status="excellent"
              trend="up"
              description="Ingresos del mes actual"
            />
          </div>

          <div className="companies-metric-card animate-scale-in hover-lift" style={{animationDelay: '0.3s'}}>
            <HealthMetricCard
              icon={<Calendar className="w-6 h-6 text-purple-600" />}
              title="Citas del Mes"
              value={metrics.totalAppointments.toString()}
              status="normal"
              trend="stable"
              description="Citas programadas este mes"
            />
          </div>
        </div>

        {/* Métricas de Rendimiento mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Satisfacción del Paciente</h3>
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">{metrics.patientSatisfaction}</span>
                <span className="text-sm text-gray-500 mb-2">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded transition-all duration-300 ${
                      i < Math.floor(metrics.patientSatisfaction) 
                        ? 'bg-green-500 shadow-sm' 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <Badge className="bg-green-100 text-green-800">Excelente</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Tiempo de Espera</h3>
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">{metrics.averageWaitTime}</span>
                <span className="text-sm text-gray-500 mb-2">minutos</span>
              </div>
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((30 - metrics.averageWaitTime) / 30 * 100, 100)}%` }}
                  />
                </div>
              </div>
              <Badge className={metrics.averageWaitTime < 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {metrics.averageWaitTime < 30 ? 'Óptimo' : 'Mejorable'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Ocupación de Camas</h3>
                <Activity className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">{metrics.bedOccupancyRate}%</span>
              </div>
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${metrics.bedOccupancyRate}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Estable</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Sección Avanzada: Herramientas Médicas con IA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Asistente de IA Médica */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-sky-600">🤖</span>
                Sistema de Gestión Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MedicalAIAssistant
                patient={{ 
                  id: 'demo',
                  firstName: 'Sistema',
                  lastName: 'Empresarial',
                  dateOfBirth: '2024-01-01',
                  gender: 'other' as const,
                  dni: '00000000',
                  email: 'demo@altamedica.com',
                  phone: '000000000',
                  bloodType: 'O+' as const,
                  allergies: [],
                  chronicConditions: [],
                  currentMedications: [],
                  emergencyContact: {
                    name: 'Soporte Técnico',
                    relationship: 'Corporativo',
                    phone: '+57 1 234-5678'
                  },
                  insurance: {
                    provider: 'AltaMedica Empresarial',
                    planNumber: 'CORP-001'
                  },
                  vitals: {
                    heartRate: 70,
                    bloodPressure: { systolic: 120, diastolic: 80 },
                    temperature: 36.5,
                    oxygenSaturation: 98,
                    weight: 70,
                    height: 170,
                    bmi: 24.2,
                    lastUpdated: new Date().toISOString()
                  },
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: new Date().toISOString(),
                  lastVisit: new Date().toISOString()
                }}
                symptoms={[]}
                onSuggestDiagnosis={() => {/* Optimización empresarial */}}
                onRecommendTreatment={() => {/* Recomendación corporativa */}}
              />
            </CardContent>
          </Card>

          {/* Gráficos de Rendimiento */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-green-500">📈</span>
                Rendimiento en Tiempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VitalSignsChart
                data={[
                  { 
                    timestamp: new Date(Date.now() - 45 * 60 * 1000), 
                    heartRate: metrics.patientSatisfaction * 20, 
                    bloodPressure: { systolic: metrics.bedOccupancyRate + 40, diastolic: metrics.bedOccupancyRate + 20 },
                    temperature: metrics.averageWaitTime + 10 
                  },
                  { 
                    timestamp: new Date(Date.now() - 30 * 60 * 1000), 
                    heartRate: (metrics.patientSatisfaction * 20) + 5, 
                    bloodPressure: { systolic: metrics.bedOccupancyRate + 42, diastolic: metrics.bedOccupancyRate + 22 },
                    temperature: metrics.averageWaitTime + 8 
                  },
                  { 
                    timestamp: new Date(Date.now() - 15 * 60 * 1000), 
                    heartRate: (metrics.patientSatisfaction * 20) - 2, 
                    bloodPressure: { systolic: metrics.bedOccupancyRate + 38, diastolic: metrics.bedOccupancyRate + 18 },
                    temperature: metrics.averageWaitTime + 12 
                  },
                  { 
                    timestamp: new Date(), 
                    heartRate: (metrics.patientSatisfaction * 20) + 3, 
                    bloodPressure: { systolic: metrics.bedOccupancyRate + 41, diastolic: metrics.bedOccupancyRate + 21 },
                    temperature: metrics.averageWaitTime + 9 
                  }
                ]}
                metrics={['heartRate', 'bloodPressure']}
                timeRange="1h"
              />
            </CardContent>
          </Card>
        </div>

        {/* Gráficos con Lazy Loading */}
        <Suspense fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-96 animate-pulse bg-gray-100" />
            <Card className="h-96 animate-pulse bg-gray-100" />
          </div>
        }>
          <Charts />
        </Suspense>

        {/* Alertas y Notificaciones */}
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Alertas y Notificaciones
              </CardTitle>
              <Badge className="bg-orange-100 text-orange-800">
                3 pendientes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Stock crítico de medicamentos</p>
                    <p className="text-xs text-gray-500 mt-1">El inventario de antibióticos está por debajo del nivel mínimo</p>
                    <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                  </div>
                </div>
              </div>
              <div className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Mantenimiento programado</p>
                    <p className="text-xs text-gray-500 mt-1">El equipo de resonancia magnética requiere mantenimiento preventivo</p>
                    <p className="text-xs text-gray-400 mt-1">Hace 5 horas</p>
                  </div>
                </div>
              </div>
              <div className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Nuevas aplicaciones recibidas</p>
                    <p className="text-xs text-gray-500 mt-1">5 nuevos candidatos aplicaron a las ofertas de trabajo</p>
                    <p className="text-xs text-gray-400 mt-1">Hoy, 09:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner de Funcionalidades Premium */}
        <div className="bg-gradient-altamedica rounded-xl p-6 text-white shadow-altamedica-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🎆 Dashboard Empresarial Mejorado</h3>
              <p className="text-primary-100">Ahora con gestión avanzada, IA integrada y análisis predictivos para clínicas</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors hover-lift">
                Ver Marketplace →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
