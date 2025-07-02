'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePatientStats, useAppointmentStats } from '@/hooks/api-hooks'
import { BarChart3, TrendingUp, Users, Calendar, Heart, Activity, Clock, DollarSign, Download, Filter } from 'lucide-react'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedMetric, setSelectedMetric] = useState('patients')
  
  const { data: patientStats, isLoading: patientLoading } = usePatientStats({ period: selectedPeriod })
  const { data: appointmentStats, isLoading: appointmentLoading } = useAppointmentStats({ period: selectedPeriod })

  // Datos mock para visualización
  const mockMetrics = {
    patients: {
      total: 1247,
      growth: 12.5,
      new: 89,
      active: 1158
    },
    appointments: {
      total: 324,
      completed: 298,
      cancelled: 26,
      revenue: 485600
    },
    doctors: {
      active: 15,
      avgRating: 4.7,
      totalConsults: 324
    },
    financial: {
      revenue: 485600,
      growth: 8.3,
      avgConsult: 1500
    }
  }

  const chartData = {
    patients: [
      { name: 'Ene', value: 120 },
      { name: 'Feb', value: 135 },
      { name: 'Mar', value: 148 },
      { name: 'Apr', value: 162 },
      { name: 'May', value: 178 },
      { name: 'Jun', value: 189 }
    ],
    appointments: [
      { name: 'Lun', value: 45 },
      { name: 'Mar', value: 52 },
      { name: 'Mie', value: 48 },
      { name: 'Jue', value: 61 },
      { name: 'Vie', value: 55 },
      { name: 'Sab', value: 32 },
      { name: 'Dom', value: 28 }
    ],
    specialties: [
      { name: 'Cardiología', value: 85 },
      { name: 'Pediatría', value: 72 },
      { name: 'Neurología', value: 58 },
      { name: 'Ginecología', value: 45 },
      { name: 'Dermatología', value: 38 }
    ]
  }

  const periods = [
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'quarter', label: 'Este Trimestre' },
    { value: 'year', label: 'Este Año' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Métricas y reportes del sistema médico</p>
          </div>
          
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                  <p className="text-3xl font-bold text-gray-900">{mockMetrics.patients.total.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {formatPercentage(mockMetrics.patients.growth)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Citas Completadas</p>
                  <p className="text-3xl font-bold text-gray-900">{mockMetrics.appointments.completed}</p>
                  <div className="flex items-center mt-2">
                    <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {mockMetrics.appointments.total} total este mes
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(mockMetrics.financial.revenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {formatPercentage(mockMetrics.financial.growth)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                  <p className="text-3xl font-bold text-gray-900">{mockMetrics.doctors.avgRating}</p>
                  <div className="flex items-center mt-2">
                    <Heart className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      De {mockMetrics.doctors.active} doctores activos
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pacientes por mes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Nuevos Pacientes por Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {chartData.patients.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                      style={{ height: `${(item.value / 200) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Citas por día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Citas por Día de la Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {chartData.appointments.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600"
                      style={{ height: `${(item.value / 70) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top especialidades */}
          <Card>
            <CardHeader>
              <CardTitle>Top Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{specialty.name}</span>
                        <span className="text-sm text-gray-600">{specialty.value} citas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(specialty.value / 100) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas de tiempo */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Tiempo promedio de consulta</span>
                  </div>
                  <span className="font-semibold text-gray-900">42 min</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Tiempo de espera promedio</span>
                  </div>
                  <span className="font-semibold text-gray-900">8 min</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-600">Tasa de cancelación</span>
                  </div>
                  <span className="font-semibold text-gray-900">8.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicadores de satisfacción */}
          <Card>
            <CardHeader>
              <CardTitle>Satisfacción del Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">4.7/5</div>
                  <div className="text-sm text-gray-600">Rating promedio</div>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        {i < 4 ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Excelente</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Bueno</span>
                    <span>24%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Regular</span>
                    <span>8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
