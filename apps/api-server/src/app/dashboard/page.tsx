'use client';

import { useState, useEffect } from 'react';
import APIDashboard from '@/components/dashboard/APIDashboard';
import RealTimeLogs from '@/components/dashboard/RealTimeLogs';
import APIEndpoints from '@/components/dashboard/APIEndpoints';
import SystemMetrics from '@/components/dashboard/SystemMetrics';
import HealthStatus from '@/components/dashboard/HealthStatus';
import MedicalCompliance from '@/components/dashboard/MedicalCompliance';
import SecurityMonitoring from '@/components/dashboard/SecurityMonitoring';
import PerformanceAnalytics from '@/components/dashboard/PerformanceAnalytics';
import IncidentManagement from '@/components/dashboard/IncidentManagement';
import MaintenanceTools from '@/components/dashboard/MaintenanceTools';
import UserActivity from '@/components/dashboard/UserActivity';
import DatabaseMonitoring from '@/components/dashboard/DatabaseMonitoring';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    overall: 'operational',
    lastUpdate: new Date(),
    criticalAlerts: 0,
    warnings: 0
  });

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando Panel de Control Médico...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Vista General', icon: '📊', description: 'Resumen ejecutivo del sistema' },
    { id: 'logs', name: 'Logs en Tiempo Real', icon: '📝', description: 'Registros detallados del sistema' },
    { id: 'endpoints', name: 'Endpoints API', icon: '🔗', description: 'Documentación y estado de APIs' },
    { id: 'metrics', name: 'Métricas del Sistema', icon: '📈', description: 'Performance y recursos' },
    { id: 'health', name: 'Estado de Salud', icon: '🏥', description: 'Health checks completos' },
    { id: 'compliance', name: 'Cumplimiento Médico', icon: '🛡️', description: 'HIPAA, GDPR, estándares médicos' },
    { id: 'security', name: 'Seguridad', icon: '🔒', description: 'Monitoreo de seguridad y amenazas' },
    { id: 'performance', name: 'Análisis de Performance', icon: '⚡', description: 'Optimización y bottlenecks' },
    { id: 'incidents', name: 'Gestión de Incidentes', icon: '🚨', description: 'Alertas y resolución de problemas' },
    { id: 'maintenance', name: 'Herramientas de Mantenimiento', icon: '🔧', description: 'Backup, limpieza, optimización' },
    { id: 'users', name: 'Actividad de Usuarios', icon: '👥', description: 'Sesiones y comportamiento' },
    { id: 'database', name: 'Monitoreo de Base de Datos', icon: '🗄️', description: 'Estado y performance de DB' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Expandido */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏥 Panel de Control Médico - ALTAMEDICA
              </h1>
              <p className="text-gray-600 mt-1">
                Sistema Integral de Monitoreo, Diagnóstico y Mantenimiento de APIs Médicas
              </p>
              <div className="flex items-center mt-2 space-x-4 text-sm">
                <span className="text-gray-500">Versión: 1.0.0</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">Puerto: 3001</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">Ambiente: {process.env.NODE_ENV || 'development'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Estado del Sistema */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">Operacional</span>
                  </div>
                  <p className="text-xs text-gray-500">Estado General</p>
                </div>
                {systemStatus.criticalAlerts > 0 && (
                  <div className="text-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium text-red-600">{systemStatus.criticalAlerts}</span>
                    </div>
                    <p className="text-xs text-gray-500">Alertas Críticas</p>
                  </div>
                )}
                {systemStatus.warnings > 0 && (
                  <div className="text-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium text-yellow-600">{systemStatus.warnings}</span>
                    </div>
                    <p className="text-xs text-gray-500">Advertencias</p>
                  </div>
                )}
              </div>
              
              {/* Información de Tiempo */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleTimeString('es-ES')}
                </div>
                <div className="text-xs text-gray-500">
                  Última actualización: {systemStatus.lastUpdate.toLocaleTimeString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Expandidos */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={tab.description}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <APIDashboard />}
        {activeTab === 'logs' && <RealTimeLogs />}
        {activeTab === 'endpoints' && <APIEndpoints />}
        {activeTab === 'metrics' && <SystemMetrics />}
        {activeTab === 'health' && <HealthStatus />}
        {activeTab === 'compliance' && <MedicalCompliance />}
        {activeTab === 'security' && <SecurityMonitoring />}
        {activeTab === 'performance' && <PerformanceAnalytics />}
        {activeTab === 'incidents' && <IncidentManagement />}
        {activeTab === 'maintenance' && <MaintenanceTools />}
        {activeTab === 'users' && <UserActivity />}
        {activeTab === 'database' && <DatabaseMonitoring />}
      </div>
    </div>
  );
} 