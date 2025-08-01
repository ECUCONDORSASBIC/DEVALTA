"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Share2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Stethoscope,
  Pill,
  Activity,
  TrendingUp,
  Heart,
  Shield,
  X
} from "lucide-react";

interface MedicalRecord {
  id: string;
  date: string;
  type: 'consultation' | 'lab_result' | 'prescription' | 'vaccination' | 'surgery' | 'emergency';
  title: string;
  description: string;
  doctor: string;
  specialty: string;
  status: 'completed' | 'pending' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  attachments?: string[];
  notes?: string;
  medications?: string[];
  results?: any;
}

interface HealthMetric {
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  normalRange: string;
  status: 'normal' | 'warning' | 'critical';
}

export default function MedicalHistoryPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'calendar'>('timeline');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Métricas de salud
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);

  useEffect(() => {
    loadMedicalHistory();
    loadHealthMetrics();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, selectedType, selectedStatus, selectedYear]);

  const loadMedicalHistory = async () => {
    try {
      // Simulación de datos - en producción usarías tus APIs
      const mockRecords: MedicalRecord[] = [
        {
          id: '1',
          date: '2025-01-15',
          type: 'consultation',
          title: 'Consulta de Cardiología',
          description: 'Chequeo cardiológico de rutina. El paciente presenta presión arterial normal y ritmo cardíaco regular.',
          doctor: 'Dr. Carlos García López',
          specialty: 'Cardiología',
          status: 'completed',
          priority: 'medium',
          notes: 'Paciente asintomático. Continuar con medicación actual.',
          medications: ['Amlodipina 5mg', 'Atorvastatina 20mg']
        },
        {
          id: '2',
          date: '2025-01-10',
          type: 'lab_result',
          title: 'Análisis de Sangre Completo',
          description: 'Hemograma completo, perfil lipídico y glucemia en ayunas.',
          doctor: 'Dra. María Ruiz',
          specialty: 'Medicina General',
          status: 'completed',
          priority: 'low',
          results: {
            hemoglobina: '14.2 g/dL',
            glucosa: '95 mg/dL',
            colesterol: '180 mg/dL'
          }
        },
        {
          id: '3',
          date: '2025-01-05',
          type: 'prescription',
          title: 'Renovación de Medicamentos',
          description: 'Renovación de medicamentos para hipertensión y colesterol.',
          doctor: 'Dr. Carlos García López',
          specialty: 'Cardiología',
          status: 'completed',
          priority: 'medium',
          medications: ['Amlodipina 5mg', 'Atorvastatina 20mg', 'Aspirina 100mg']
        },
        {
          id: '4',
          date: '2024-12-20',
          type: 'vaccination',
          title: 'Vacuna contra la Gripe',
          description: 'Vacunación anual contra la influenza.',
          doctor: 'Dra. Ana Martínez',
          specialty: 'Medicina General',
          status: 'completed',
          priority: 'low'
        },
        {
          id: '5',
          date: '2024-12-15',
          type: 'consultation',
          title: 'Consulta de Dermatología',
          description: 'Revisión de lesión cutánea en brazo derecho.',
          doctor: 'Dr. Roberto Silva',
          specialty: 'Dermatología',
          status: 'completed',
          priority: 'medium',
          notes: 'Lesión benigna. No requiere tratamiento adicional.'
        }
      ];

      setRecords(mockRecords);
      setLoading(false);
    } catch (error) {
      console.error('Error loading medical history:', error);
      setLoading(false);
    }
  };

  const loadHealthMetrics = async () => {
    const mockMetrics: HealthMetric[] = [
      {
        name: 'Presión Arterial',
        value: '120/80',
        unit: 'mmHg',
        trend: 'stable',
        normalRange: '90/60 - 140/90',
        status: 'normal'
      },
      {
        name: 'Frecuencia Cardíaca',
        value: '72',
        unit: 'bpm',
        trend: 'stable',
        normalRange: '60-100',
        status: 'normal'
      },
      {
        name: 'Glucemia',
        value: '95',
        unit: 'mg/dL',
        trend: 'down',
        normalRange: '70-100',
        status: 'normal'
      },
      {
        name: 'Colesterol Total',
        value: '180',
        unit: 'mg/dL',
        trend: 'down',
        normalRange: '<200',
        status: 'normal'
      }
    ];

    setHealthMetrics(mockMetrics);
  };

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(record => record.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(record => {
        const recordYear = new Date(record.date).getFullYear().toString();
        return recordYear === selectedYear;
      });
    }

    setFilteredRecords(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <User className="w-4 h-4" />;
      case 'lab_result': return <Activity className="w-4 h-4" />;
      case 'prescription': return <Pill className="w-4 h-4" />;
      case 'vaccination': return <Shield className="w-4 h-4" />;
      case 'surgery': return <Stethoscope className="w-4 h-4" />;
      case 'emergency': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'lab_result': return 'bg-green-100 text-green-800';
      case 'prescription': return 'bg-purple-100 text-purple-800';
      case 'vaccination': return 'bg-yellow-100 text-yellow-800';
      case 'surgery': return 'bg-red-100 text-red-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportRecords = () => {
    // Implementar exportación de registros
    console.log('Exporting records...');
  };

  const shareRecords = () => {
    // Implementar compartir registros
    console.log('Sharing records...');
  };

  const openRecordModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const years = Array.from(new Set(records.map(r => new Date(r.date).getFullYear().toString()))).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial médico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Historial Médico</h1>
              <p className="text-gray-600 mt-1">Gestiona y revisa todos tus registros médicos</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportRecords}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={shareRecords}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar con filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar registros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tipo de registro */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="consultation">Consultas</option>
                  <option value="lab_result">Resultados de laboratorio</option>
                  <option value="prescription">Recetas</option>
                  <option value="vaccination">Vacunas</option>
                  <option value="surgery">Cirugías</option>
                  <option value="emergency">Emergencias</option>
                </select>
              </div>

              {/* Estado */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="completed">Completado</option>
                  <option value="pending">Pendiente</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Año */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los años</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Métricas de salud */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Métricas de Salud</h4>
                <div className="space-y-3">
                  {healthMetrics.map((metric, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          metric.status === 'normal' ? 'bg-green-100 text-green-800' :
                          metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {metric.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          {metric.value} {metric.unit}
                        </span>
                        <TrendingUp className={`w-4 h-4 ${
                          metric.trend === 'up' ? 'text-green-600' :
                          metric.trend === 'down' ? 'text-red-600' :
                          'text-gray-400'
                        }`} />
                      </div>
                      <p className="text-xs text-gray-500">Normal: {metric.normalRange}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {/* Controles de vista */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Vista:</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        viewMode === 'timeline'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Cronología
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        viewMode === 'list'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Lista
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        viewMode === 'calendar'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Calendario
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {filteredRecords.length} registros encontrados
                </div>
              </div>
            </div>

            {/* Lista de registros */}
            <div className="bg-white rounded-lg shadow">
              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron registros</h3>
                  <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${getTypeColor(record.type)}`}>
                            {getTypeIcon(record.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(record.priority)}`}>
                                {record.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{record.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {record.doctor}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(record.date).toLocaleDateString('es-ES')}
                              </span>
                              <span className="flex items-center">
                                <Stethoscope className="w-4 h-4 mr-1" />
                                {record.specialty}
                              </span>
                            </div>
                            {record.medications && record.medications.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">Medicamentos:</p>
                                <div className="flex flex-wrap gap-1">
                                  {record.medications.map((med, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {med}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => openRecordModal(record)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle del registro */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Detalle del Registro</h2>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedRecord.title}</h3>
                  <p className="text-gray-600">{selectedRecord.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Médico:</span>
                    <p className="text-gray-900">{selectedRecord.doctor}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Especialidad:</span>
                    <p className="text-gray-900">{selectedRecord.specialty}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fecha:</span>
                    <p className="text-gray-900">{new Date(selectedRecord.date).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Estado:</span>
                    <p className="text-gray-900">{selectedRecord.status}</p>
                  </div>
                </div>
                
                {selectedRecord.notes && (
                  <div>
                    <span className="font-medium text-gray-700">Notas:</span>
                    <p className="text-gray-900 mt-1">{selectedRecord.notes}</p>
                  </div>
                )}
                
                {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Medicamentos:</span>
                    <div className="mt-2 space-y-1">
                      {selectedRecord.medications.map((med, index) => (
                        <div key={index} className="px-3 py-2 bg-blue-50 rounded-md">
                          {med}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedRecord.results && (
                  <div>
                    <span className="font-medium text-gray-700">Resultados:</span>
                    <div className="mt-2 space-y-2">
                      {Object.entries(selectedRecord.results).map(([key, value]) => (
                        <div key={key} className="flex justify-between px-3 py-2 bg-gray-50 rounded-md">
                          <span className="font-medium text-gray-700">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
