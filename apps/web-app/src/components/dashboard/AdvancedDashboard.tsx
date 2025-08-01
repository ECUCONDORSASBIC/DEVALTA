/**
 * 📊 ADVANCED DASHBOARD - ALTAMEDICA
 * Comprehensive dashboard with real-time metrics, interactive charts, and custom reports
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Activity,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Stethoscope,
  Building,
  UserCheck,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

// Dashboard metrics
interface DashboardMetrics {
  patients: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  appointments: {
    total: number;
    today: number;
    completed: number;
    cancelled: number;
    growth: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    average: number;
  };
  doctors: {
    total: number;
    active: number;
    available: number;
    performance: number;
  };
  telemedicine: {
    sessions: number;
    active: number;
    quality: number;
    satisfaction: number;
  };
  system: {
    uptime: number;
    performance: number;
    errors: number;
    responseTime: number;
  };
}

// Chart data
interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Dashboard widget
interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  data: any;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  refreshInterval?: number;
  lastUpdated: Date;
}

// Main Advanced Dashboard Component
export const AdvancedDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter'>('month');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Initialize widgets
  useEffect(() => {
    if (metrics) {
      initializeWidgets();
    }
  }, [metrics]);

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/dashboard/analytics?period=${selectedPeriod}&realtime=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data.analytics);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      logger.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize dashboard widgets
   */
  const initializeWidgets = () => {
    if (!metrics) return;

    const newWidgets: DashboardWidget[] = [
      // Patient metrics widget
      {
        id: 'patient-metrics',
        title: 'Pacientes',
        type: 'metric',
        data: metrics.patients,
        size: 'medium',
        position: { x: 0, y: 0 },
        refreshInterval: 60000,
        lastUpdated: new Date()
      },
      // Appointment metrics widget
      {
        id: 'appointment-metrics',
        title: 'Citas',
        type: 'metric',
        data: metrics.appointments,
        size: 'medium',
        position: { x: 1, y: 0 },
        refreshInterval: 30000,
        lastUpdated: new Date()
      },
      // Revenue metrics widget
      {
        id: 'revenue-metrics',
        title: 'Ingresos',
        type: 'metric',
        data: metrics.revenue,
        size: 'medium',
        position: { x: 2, y: 0 },
        refreshInterval: 60000,
        lastUpdated: new Date()
      },
      // Doctor metrics widget
      {
        id: 'doctor-metrics',
        title: 'Médicos',
        type: 'metric',
        data: metrics.doctors,
        size: 'medium',
        position: { x: 3, y: 0 },
        refreshInterval: 60000,
        lastUpdated: new Date()
      },
      // Patient growth chart
      {
        id: 'patient-growth-chart',
        title: 'Crecimiento de Pacientes',
        type: 'chart',
        data: generatePatientGrowthData(),
        size: 'large',
        position: { x: 0, y: 1 },
        refreshInterval: 300000,
        lastUpdated: new Date()
      },
      // Appointment trends chart
      {
        id: 'appointment-trends-chart',
        title: 'Tendencias de Citas',
        type: 'chart',
        data: generateAppointmentTrendsData(),
        size: 'large',
        position: { x: 1, y: 1 },
        refreshInterval: 300000,
        lastUpdated: new Date()
      },
      // Revenue chart
      {
        id: 'revenue-chart',
        title: 'Análisis de Ingresos',
        type: 'chart',
        data: generateRevenueData(),
        size: 'large',
        position: { x: 0, y: 2 },
        refreshInterval: 300000,
        lastUpdated: new Date()
      },
      // Telemedicine metrics
      {
        id: 'telemedicine-metrics',
        title: 'Telemedicina',
        type: 'metric',
        data: metrics.telemedicine,
        size: 'medium',
        position: { x: 1, y: 2 },
        refreshInterval: 30000,
        lastUpdated: new Date()
      },
      // System performance
      {
        id: 'system-performance',
        title: 'Rendimiento del Sistema',
        type: 'metric',
        data: metrics.system,
        size: 'medium',
        position: { x: 2, y: 2 },
        refreshInterval: 15000,
        lastUpdated: new Date()
      },
      // Specialty distribution
      {
        id: 'specialty-distribution',
        title: 'Distribución por Especialidad',
        type: 'chart',
        data: generateSpecialtyData(),
        size: 'medium',
        position: { x: 3, y: 2 },
        refreshInterval: 600000,
        lastUpdated: new Date()
      }
    ];

    setWidgets(newWidgets);
  };

  /**
   * Generate patient growth data
   */
  const generatePatientGrowthData = (): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        name: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        patients: Math.floor(Math.random() * 50) + 100,
        newPatients: Math.floor(Math.random() * 10) + 5,
        activePatients: Math.floor(Math.random() * 30) + 80
      });
    }
    
    return data;
  };

  /**
   * Generate appointment trends data
   */
  const generateAppointmentTrendsData = (): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        name: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        appointments: Math.floor(Math.random() * 100) + 200,
        completed: Math.floor(Math.random() * 80) + 150,
        cancelled: Math.floor(Math.random() * 20) + 5,
        telemedicine: Math.floor(Math.random() * 40) + 30
      });
    }
    
    return data;
  };

  /**
   * Generate revenue data
   */
  const generateRevenueData = (): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = 12; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      data.push({
        name: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        revenue: Math.floor(Math.random() * 50000) + 100000,
        expenses: Math.floor(Math.random() * 30000) + 60000,
        profit: Math.floor(Math.random() * 20000) + 40000
      });
    }
    
    return data;
  };

  /**
   * Generate specialty data
   */
  const generateSpecialtyData = (): ChartData[] => {
    return [
      { name: 'Cardiología', value: 25, color: '#8884d8' },
      { name: 'Neurología', value: 18, color: '#82ca9d' },
      { name: 'Pediatría', value: 15, color: '#ffc658' },
      { name: 'Ginecología', value: 12, color: '#ff7300' },
      { name: 'Medicina General', value: 10, color: '#00ff00' },
      { name: 'Psiquiatría', value: 8, color: '#ff0000' },
      { name: 'Dermatología', value: 7, color: '#0000ff' },
      { name: 'Oftalmología', value: 5, color: '#800080' }
    ];
  };

  /**
   * Render metric widget
   */
  const renderMetricWidget = (widget: DashboardWidget) => {
    const data = widget.data as any;
    
    return (
      <motion.div
        key={widget.id}
        className="bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{widget.title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {widget.lastUpdated.toLocaleTimeString()}
            </span>
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  /**
   * Render chart widget
   */
  const renderChartWidget = (widget: DashboardWidget) => {
    const data = widget.data as ChartData[];
    
    return (
      <motion.div
        key={widget.id}
        className="bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{widget.title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {widget.lastUpdated.toLocaleTimeString()}
            </span>
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          {widget.id.includes('growth') || widget.id.includes('trends') ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="patients" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8" 
              />
              <Area 
                type="monotone" 
                dataKey="appointments" 
                stackId="1" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
              />
            </AreaChart>
          ) : widget.id.includes('revenue') ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
              <Bar dataKey="expenses" fill="#82ca9d" />
              <Bar dataKey="profit" fill="#ffc658" />
            </BarChart>
          ) : widget.id.includes('specialty') ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    );
  };

  /**
   * Render widget based on type
   */
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metric':
        return renderMetricWidget(widget);
      case 'chart':
        return renderChartWidget(widget);
      default:
        return null;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Avanzado</h1>
            <p className="text-gray-600">Métricas en tiempo real y análisis detallado</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Period selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="day">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
            </select>
            
            {/* View mode selector */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="overview">Vista general</option>
              <option value="detailed">Detallado</option>
              <option value="analytics">Analíticas</option>
            </select>
            
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>Auto-refresh</span>
            </button>
            
            {/* Manual refresh */}
            <button
              onClick={fetchDashboardData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`${
                widget.size === 'large' ? 'lg:col-span-2' : ''
              }`}
            >
              {renderWidget(widget)}
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center space-x-2 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
            <Download className="w-5 h-5" />
            <span>Exportar Reporte</span>
          </button>
          <button className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
            <BarChart3 className="w-5 h-5" />
            <span>Generar Análisis</span>
          </button>
          <button className="flex items-center space-x-2 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100">
            <Settings className="w-5 h-5" />
            <span>Configurar Dashboard</span>
          </button>
          <button className="flex items-center space-x-2 p-3 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100">
            <FileText className="w-5 h-5" />
            <span>Ver Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard; 