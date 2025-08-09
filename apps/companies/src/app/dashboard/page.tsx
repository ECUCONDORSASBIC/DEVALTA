'use client';

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Heart,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { lazy, Suspense, useState } from 'react';

// Importar componentes del package @altamedica/ui
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@altamedica/ui';

// Importar componente de dashboard hospitalario
import HospitalNetworkDashboard from '@/components/dashboard/HospitalNetworkDashboard';

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
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Configuración para el dashboard de red hospitalaria
  const hospitalConfig = {
    whatsapp: { 
      enabled: true, 
      phoneNumber: '+57 310 123-4567', 
      apiKey: 'demo-whatsapp-key' 
    },
    api: { 
      enabled: true, 
      endpoint: 'https://api.hospital-demo.com', 
      apiKey: 'demo-api-key' 
    },
    iot: { 
      enabled: true, 
      devices: ['sensor-001', 'camera-002', 'beacon-003'] 
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del dashboard - Estilo Torre de Control */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">CENTRO DE CONTROL HOSPITALARIO</h1>
          <p className="text-slate-400 mt-2 text-lg">Monitoreo y Redistribución Inteligente en Tiempo Real</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 backdrop-blur">
            <Activity className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">Sistema Operativo</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLoading(!loading)}
            className="flex items-center gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Dashboard de Red Hospitalaria */}
      <HospitalNetworkDashboard 
        hospitalId="HOSP-DEMO-001"
        config={hospitalConfig}
      />

      {/* Métricas Empresariales - Estilo Torre de Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 hover:bg-slate-800/70 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PERSONAL MÉDICO</h3>
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-white">{metrics.activeDoctors}</span>
              <span className="text-sm text-slate-500">/ {metrics.totalDoctors}</span>
            </div>
            <div className="mb-3">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                  style={{ width: `${(metrics.activeDoctors / metrics.totalDoctors) * 100}%` }}
                />
              </div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">EN SERVICIO</Badge>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 hover:bg-slate-800/70 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">INGRESOS MENSUALES</h3>
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-white">{formatCurrency(metrics.monthlyRevenue)}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">+15% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 hover:bg-slate-800/70 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">CITAS PROGRAMADAS</h3>
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-white">{metrics.totalAppointments}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">{metrics.completedAppointments} completadas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Control Rápido - Estilo Torre de Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur border-blue-500/30 hover:bg-slate-800/70 hover:border-blue-400/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Building2 className="h-5 w-5" />
              RED HOSPITALARIA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Control central de hospitales conectados y monitoreo de capacidad en tiempo real
            </p>
            <Button className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30">
              ACCEDER AL CONTROL
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-green-500/30 hover:bg-slate-800/70 hover:border-green-400/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <UserPlus className="h-5 w-5" />
              CONTRATACIÓN ACTIVA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              <span className="text-2xl font-bold text-green-400">{metrics.pendingApplications}</span> aplicaciones en espera
            </p>
            <Button className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30">
              REVISAR CANDIDATOS
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-purple-500/30 hover:bg-slate-800/70 hover:border-purple-400/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <TrendingUp className="h-5 w-5" />
              ANALYTICS CENTER
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Centro de análisis avanzado y reportes de rendimiento hospitalario
            </p>
            <Button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30">
              ABRIR ANALYTICS
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Centro de Alertas - Estilo Torre de Control */}
      <Card className="bg-slate-800/50 backdrop-blur border-orange-500/30">
        <CardHeader className="bg-orange-900/20 border-b border-orange-500/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              CENTRO DE ALERTAS DEL SISTEMA
            </CardTitle>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
              2 ALERTAS ACTIVAS
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-700">
            <div className="p-4 hover:bg-slate-700/30 cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">ALERTA CRÍTICA: Hospital Las Américas</p>
                  <p className="text-xs text-slate-400 mt-1">95% de ocupación en urgencias - Activar protocolo de redistribución</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">Hace 15 minutos</span>
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">PRIORIDAD ALTA</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-slate-700/30 cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Notificación: Nuevas aplicaciones recibidas</p>
                  <p className="text-xs text-slate-400 mt-1">3 cardiólogos aplicaron a posiciones críticas</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">Hace 2 horas</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">RECLUTAMIENTO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
