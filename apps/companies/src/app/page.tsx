'use client';

import { Button } from '@altamedica/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@altamedica/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@altamedica/ui/tabs';
import {
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  PieChart,
  Settings,
  Users
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Carga dinámica de componentes de analytics
const AnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

const AppointmentAnalytics = dynamic(
  () => import('@/components/analytics/AppointmentAnalytics'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

const PatientAnalytics = dynamic(
  () => import('@/components/analytics/PatientAnalytics'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

const FinancialAnalytics = dynamic(
  () => import('@/components/analytics/FinancialAnalytics'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

const JobMarketplaceDashboard = dynamic(
  () => import('@/components/marketplace/JobMarketplaceDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
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
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AltaMedica Companies Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Centro de comando para gestión clínica avanzada
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

      {/* Quick Stats */}
      <div className="px-4 lg:px-8 py-6">
        <div className="container mx-auto">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard General</span>
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
                <span>Marketplace</span>
              </TabsTrigger>
            </TabsList>

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