'use client';

import React from 'react';
import Link from 'next/link';
import { AppRoutes } from '../../lib/routes';
import { MOCK_LISTINGS, MOCK_COMPANIES, MOCK_DOCTORS } from '../../lib/mock-data';
import { ArrowLeft, TrendingUp, Users, Briefcase, Building, BarChart3 } from 'lucide-react';

export default function MetricsPage() {
  // Calculate some basic metrics from mock data
  const totalJobs = MOCK_LISTINGS.length;
  const totalCompanies = MOCK_COMPANIES.length;
  const totalDoctors = MOCK_DOCTORS.length;
  const avgApplicationsPerJob = Math.floor(Math.random() * 15) + 5; // Random for demo

  const metrics = [
    {
      title: 'Ofertas Activas',
      value: totalJobs,
      icon: Briefcase,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Empresas Registradas',
      value: totalCompanies,
      icon: Building,
      color: 'green',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Médicos en Plataforma',
      value: totalDoctors,
      icon: Users,
      color: 'purple',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Promedio Postulaciones',
      value: avgApplicationsPerJob,
      icon: TrendingUp,
      color: 'orange',
      change: '+5%',
      trend: 'up'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href={AppRoutes.Home}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Métricas y Analytics</h1>
        <p className="text-gray-600 mt-2">
          Análisis detallado del rendimiento de la plataforma
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
                <span className={`text-sm font-medium text-${metric.trend === 'up' ? 'green' : 'red'}-600`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Job Categories Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Distribución por Especialidad
          </h3>
          <div className="space-y-4">
            {['Medicina General', 'Cardiología', 'Pediatría', 'Enfermería', 'Radiología'].map((specialty, index) => {
              const percentage = Math.floor(Math.random() * 30) + 10;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{specialty}</span>
                    <span className="text-gray-500">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nueva oferta publicada</p>
                <p className="text-xs text-gray-500">Hospital Central - Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nuevo médico registrado</p>
                <p className="text-xs text-gray-500">Dr. María González - Hace 5 horas</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Building className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nueva empresa registrada</p>
                <p className="text-xs text-gray-500">Clínica San José - Hace 1 día</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
