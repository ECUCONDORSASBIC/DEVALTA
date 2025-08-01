'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Activity,
  BarChart3,
  Briefcase,
  Search,
  Plus,
  Heart,
  Clock,
  ChartBar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

// Import data from external file
import { mockMetrics, type CompanyMetrics } from '@/data/dashboard-metrics';

export default function CompanyDashboard() {
  const [metrics] = useState<CompanyMetrics>(mockMetrics);
  const [selectedView, setSelectedView] = useState<'overview' | 'staff' | 'patients' | 'appointments' | 'analytics' | 'marketplace'>('overview');

  const navigationItems = [
    { id: 'overview', label: 'Vista General', icon: BarChart3 },
    { id: 'staff', label: 'Personal Médico', icon: UserCheck },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'analytics', label: 'Analíticas', icon: ChartBar },
    { id: 'marketplace', label: 'Marketplace', icon: Briefcase },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Hospital San Vicente</h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Oferta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id as typeof selectedView)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors
                  ${selectedView === item.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-sky-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
                      <p className="text-2xl font-bold text-sky-700">{metrics.activePatients.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">de {metrics.totalPatients.toLocaleString()} total</p>
                    </div>
                    <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-sky-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Médicos Activos</p>
                      <p className="text-2xl font-bold text-blue-700">{metrics.activeDoctors}</p>
                      <p className="text-xs text-gray-500">de {metrics.totalDoctors} total</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(metrics.monthlyRevenue)}</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12% vs mes anterior
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Citas del Mes</p>
                      <p className="text-2xl font-bold text-purple-700">{metrics.totalAppointments}</p>
                      <p className="text-xs text-purple-600">{metrics.completedAppointments} completadas</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">Satisfacción del Paciente</h3>
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-gray-900">{metrics.patientSatisfaction}</span>
                    <span className="text-sm text-gray-500 mb-1">/ 5.0</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-full rounded ${
                          i < Math.floor(metrics.patientSatisfaction) ? 'bg-yellow-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">Tiempo de Espera</h3>
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-gray-900">{metrics.averageWaitTime}</span>
                    <span className="text-sm text-gray-500 mb-1">minutos</span>
                  </div>
                  <Badge className={metrics.averageWaitTime < 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {metrics.averageWaitTime < 30 ? 'Óptimo' : 'Mejorable'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">Ocupación de Camas</h3>
                    <Activity className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-gray-900">{metrics.bedOccupancyRate}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${metrics.bedOccupancyRate}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Alertas y Notificaciones
                  </CardTitle>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    3 pendientes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Stock crítico de medicamentos</p>
                        <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Other views */}
        {selectedView !== 'overview' && (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">Vista "{selectedView}" en desarrollo</p>
          </div>
        )}
      </div>
    </div>
  );
}