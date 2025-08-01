'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Clock, 
  Globe,
  Server,
  Database,
  Zap,
  AlertTriangle,
  Eye
} from 'lucide-react';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  requestCount: number;
  errorRate: number;
  lastUsed: Date;
  consumers: string[];
  category: 'medical' | 'notifications' | 'employment' | 'analytics';
}

interface APIMetrics {
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  uptime: number;
  activeEndpoints: number;
  totalConsumers: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL DEL DASHBOARD
// ============================================================================

const APIMonitorDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<APIMetrics>({
    totalRequests: 0,
    totalErrors: 0,
    averageResponseTime: 0,
    uptime: 99.9,
    activeEndpoints: 0,
    totalConsumers: 0
  });

  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);

  // Cargar datos reales del API
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/metrics?detailed=true');
      const data = await response.json();
      
      if (response.ok) {
        // Actualizar métricas del sistema
        setMetrics({
          totalRequests: data.systemMetrics.totalRequests,
          totalErrors: data.systemMetrics.totalErrors,
          averageResponseTime: data.systemMetrics.averageResponseTime,
          uptime: data.systemMetrics.uptime,
          activeEndpoints: data.systemMetrics.activeEndpoints,
          totalConsumers: data.systemMetrics.uniqueConsumers
        });
        
        // Convertir endpoints del API al formato del dashboard
        const convertedEndpoints: APIEndpoint[] = data.endpoints.map((ep: any, index: number) => {
          let category: 'medical' | 'notifications' | 'employment' | 'analytics' = 'medical';
          let name = ep.path;
          
          if (ep.path.includes('/doctors')) {
            category = 'medical';
            name = 'Gestión de Doctores';
          } else if (ep.path.includes('/patients')) {
            category = 'medical';
            name = 'Gestión de Pacientes';
          } else if (ep.path.includes('/appointments')) {
            category = 'medical';
            name = 'Citas Médicas';
          } else if (ep.path.includes('/notifications')) {
            category = 'notifications';
            name = ep.path.includes('/send') ? 'Enviar Notificación' : 'Historial Notificaciones';
          } else if (ep.path.includes('/jobs')) {
            category = 'employment';
            name = 'Ofertas Laborales';
          } else if (ep.path.includes('/analytics')) {
            category = 'analytics';
            name = 'Métricas de Uso';
          }
          
          return {
            id: index.toString(),
            name,
            path: ep.path,
            method: ep.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
            status: ep.status,
            responseTime: ep.averageResponseTime,
            requestCount: ep.totalRequests,
            errorRate: Number(ep.errorRate.toFixed(1)),
            lastUsed: new Date(ep.lastUsed),
            consumers: ep.consumers || [],
            category
          };
        });
        
        setEndpoints(convertedEndpoints);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };
  
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Refresh automático
  useEffect(() => {
    const interval = setInterval(() => {
      // Aquí se actualizarían los datos reales
      console.log('Refreshing API metrics...');
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return <Activity className="h-4 w-4" />;
      case 'notifications': return <Zap className="h-4 w-4" />;
      case 'employment': return <Users className="h-4 w-4" />;
      case 'analytics': return <TrendingUp className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const filteredEndpoints = selectedCategory === 'all' 
    ? endpoints 
    : endpoints.filter(ep => ep.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🩺 ALTAMEDICA API Monitor
        </h1>
        <p className="text-gray-600">
          Monitoreo en tiempo real de APIs y consumidores
        </p>
      </div>

      {/* Métricas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalRequests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Errores</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalErrors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageResponseTime}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.uptime}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Server className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Endpoints Activos</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeEndpoints}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Consumidores</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalConsumers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todas las APIs
          </button>
          <button
            onClick={() => setSelectedCategory('medical')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCategory === 'medical' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🩺 Médicas
          </button>
          <button
            onClick={() => setSelectedCategory('notifications')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCategory === 'notifications' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔔 Notificaciones
          </button>
          <button
            onClick={() => setSelectedCategory('employment')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCategory === 'employment' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            💼 Empleos
          </button>
          <button
            onClick={() => setSelectedCategory('analytics')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCategory === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Lista de Endpoints */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Endpoints de API ({filteredEndpoints.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumidores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Uso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEndpoints.map((endpoint) => (
                <tr key={endpoint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCategoryIcon(endpoint.category)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {endpoint.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {endpoint.method}
                          </span>
                          <span className="ml-2">{endpoint.path}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(endpoint.status)}`}>
                      {endpoint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.requestCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.responseTime}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${
                      endpoint.errorRate < 1 ? 'text-green-600' :
                      endpoint.errorRate < 3 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {endpoint.errorRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {endpoint.consumers.slice(0, 2).map((consumer, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {consumer}
                        </span>
                      ))}
                      {endpoint.consumers.length > 2 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                          +{endpoint.consumers.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {endpoint.lastUsed.toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer con configuración */}
      <div className="mt-8 flex justify-between items-center text-sm text-gray-500">
        <div>
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
        <div className="flex items-center space-x-4">
          <label>Actualizar cada:</label>
          <select 
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={5000}>5 segundos</option>
            <option value={10000}>10 segundos</option>
            <option value={30000}>30 segundos</option>
            <option value={60000}>1 minuto</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default APIMonitorDashboard;
