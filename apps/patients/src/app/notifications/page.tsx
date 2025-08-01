'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  User,
  Pill,
  Activity,
  FileText,
  Video,
  Phone,
  Mail,
  Settings,
  Trash2,
  Archive,
  MarkAllRead
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'appointment' | 'prescription' | 'lab_result' | 'reminder' | 'alert' | 'info' | 'system';
  title: string;
  message: string;
  date: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    type: 'link' | 'button' | 'modal';
    label: string;
    url?: string;
  };
  metadata?: {
    doctor?: string;
    appointmentDate?: string;
    medication?: string;
    labTest?: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showRead, setShowRead] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, selectedType, selectedPriority, showRead, viewMode]);

  const loadNotifications = async () => {
    try {
      // Simulación de datos - en producción usarías tus APIs
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Recordatorio de cita médica',
          message: 'Tu cita con el Dr. García López está programada para mañana a las 10:00 AM.',
          date: '2025-01-15',
          time: '09:30',
          isRead: false,
          priority: 'high',
          action: {
            type: 'link',
            label: 'Ver detalles',
            url: '/appointments'
          },
          metadata: {
            doctor: 'Dr. Carlos García López',
            appointmentDate: '2025-01-16'
          }
        },
        {
          id: '2',
          type: 'prescription',
          title: 'Reposición de medicamento disponible',
          message: 'Tu receta de Amlodipina está lista para reposición. Puedes solicitarla ahora.',
          date: '2025-01-15',
          time: '08:15',
          isRead: false,
          priority: 'medium',
          action: {
            type: 'button',
            label: 'Solicitar reposición'
          },
          metadata: {
            medication: 'Amlodipina 5mg'
          }
        },
        {
          id: '3',
          type: 'lab_result',
          title: 'Nuevos resultados de laboratorio',
          message: 'Tus resultados de análisis de sangre están listos para revisión.',
          date: '2025-01-14',
          time: '16:45',
          isRead: true,
          priority: 'medium',
          action: {
            type: 'link',
            label: 'Ver resultados',
            url: '/lab-results'
          },
          metadata: {
            labTest: 'Análisis de sangre completo'
          }
        },
        {
          id: '4',
          type: 'reminder',
          title: 'Recordatorio de medicación',
          message: 'Es hora de tomar tu medicamento: Atorvastatina 20mg.',
          date: '2025-01-14',
          time: '20:00',
          isRead: false,
          priority: 'high',
          action: {
            type: 'button',
            label: 'Marcar como tomado'
          },
          metadata: {
            medication: 'Atorvastatina 20mg'
          }
        },
        {
          id: '5',
          type: 'alert',
          title: 'Alerta de salud',
          message: 'Tu presión arterial está ligeramente elevada. Considera contactar a tu médico.',
          date: '2025-01-14',
          time: '14:20',
          isRead: false,
          priority: 'urgent',
          action: {
            type: 'button',
            label: 'Contactar médico'
          }
        },
        {
          id: '6',
          type: 'info',
          title: 'Actualización del sistema',
          message: 'Hemos actualizado nuestra plataforma con nuevas funcionalidades de telemedicina.',
          date: '2025-01-13',
          time: '11:30',
          isRead: true,
          priority: 'low',
          action: {
            type: 'link',
            label: 'Ver novedades',
            url: '/updates'
          }
        },
        {
          id: '7',
          type: 'appointment',
          title: 'Cita cancelada',
          message: 'Tu cita con la Dra. Ruiz del 20 de enero ha sido cancelada. Puedes reprogramarla.',
          date: '2025-01-13',
          time: '10:15',
          isRead: true,
          priority: 'medium',
          action: {
            type: 'button',
            label: 'Reprogramar cita'
          },
          metadata: {
            doctor: 'Dra. María Ruiz',
            appointmentDate: '2025-01-20'
          }
        },
        {
          id: '8',
          type: 'system',
          title: 'Mantenimiento programado',
          message: 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM.',
          date: '2025-01-12',
          time: '18:00',
          isRead: true,
          priority: 'low'
        }
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === selectedPriority);
    }

    if (!showRead) {
      filtered = filtered.filter(notification => !notification.isRead);
    }

    if (viewMode === 'unread') {
      filtered = filtered.filter(notification => !notification.isRead);
    } else if (viewMode === 'read') {
      filtered = filtered.filter(notification => notification.isRead);
    }

    setFilteredNotifications(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'prescription': return <Pill className="w-4 h-4" />;
      case 'lab_result': return <Activity className="w-4 h-4" />;
      case 'reminder': return <Clock className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'prescription': return 'bg-purple-100 text-purple-800';
      case 'lab_result': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-gray-100 text-gray-800';
      case 'system': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const archiveNotification = (notificationId: string) => {
    // Implementar archivo de notificación
    console.log('Archiving notification:', notificationId);
  };

  const handleAction = (notification: Notification) => {
    if (notification.action?.type === 'link' && notification.action.url) {
      window.location.href = notification.action.url;
    } else if (notification.action?.type === 'button') {
      // Implementar acción específica según el tipo de notificación
      console.log('Executing action:', notification.action.label);
    }
    
    // Marcar como leída si no está leída
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
              <p className="text-gray-600 mt-1">Gestiona tus alertas y mensajes importantes</p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MarkAllRead className="w-4 h-4 mr-2" />
                  Marcar todas como leídas
                </button>
              )}
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
                    placeholder="Buscar notificaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="appointment">Citas</option>
                  <option value="prescription">Recetas</option>
                  <option value="lab_result">Resultados de laboratorio</option>
                  <option value="reminder">Recordatorios</option>
                  <option value="alert">Alertas</option>
                  <option value="info">Información</option>
                  <option value="system">Sistema</option>
                </select>
              </div>

              {/* Prioridad */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              {/* Estado de lectura */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showRead}
                      onChange={(e) => setShowRead(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mostrar leídas</span>
                  </label>
                </div>
              </div>

              {/* Resumen */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Resumen</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{notifications.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">No leídas:</span>
                    <span className="font-medium text-blue-600">{unreadCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Leídas:</span>
                    <span className="font-medium text-gray-600">
                      {notifications.filter(n => n.isRead).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Urgentes:</span>
                    <span className="font-medium text-red-600">
                      {notifications.filter(n => n.priority === 'urgent').length}
                    </span>
                  </div>
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
                      onClick={() => setViewMode('all')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        viewMode === 'all'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setViewMode('unread')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        viewMode === 'unread'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      No leídas ({unreadCount})
                    </button>
                    <button
                      onClick={() => setViewMode('read')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        viewMode === 'read'
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Leídas
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {filteredNotifications.length} notificaciones encontradas
                </div>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                  <p className="text-gray-600">No se encontraron notificaciones con los filtros aplicados</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg shadow p-6 transition-colors ${
                      !notification.isRead ? 'border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {new Date(notification.date).toLocaleDateString('es-ES')} a las {notification.time}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{notification.message}</p>
                        
                        {notification.metadata && (
                          <div className="bg-gray-50 p-3 rounded-md mb-4">
                            {notification.metadata.doctor && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Médico:</span> {notification.metadata.doctor}
                              </p>
                            )}
                            {notification.metadata.appointmentDate && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Fecha de cita:</span> {notification.metadata.appointmentDate}
                              </p>
                            )}
                            {notification.metadata.medication && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Medicamento:</span> {notification.metadata.medication}
                              </p>
                            )}
                            {notification.metadata.labTest && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Prueba:</span> {notification.metadata.labTest}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {notification.action && (
                              <button
                                onClick={() => handleAction(notification)}
                                className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                {notification.action.label}
                              </button>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                                title="Marcar como leída"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => archiveNotification(notification.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                              title="Archivar"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
