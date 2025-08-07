"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  X,
  Check,
  AlertCircle,
  Info,
  Clock,
  User,
  Calendar,
  Video,
  Heart,
  Trash2,
  Archive,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@altamedica/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@altamedica/ui';
import { Badge } from '@altamedica/ui';
import { Input } from '@altamedica/ui';
import { Select } from '@altamedica/ui';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '@altamedica/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';

interface Notification {
  id: string;
  type: 'appointment' | 'telemedicine' | 'prescription' | 'lab_result' | 'system' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  channels: NotificationChannel[];
  expiresAt?: Date;
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in_app';
  sent: boolean;
  sentAt?: Date;
  error?: string;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  types: {
    appointment: boolean;
    telemedicine: boolean;
    prescription: boolean;
    lab_result: boolean;
    system: boolean;
    emergency: boolean;
  };
}

export default function NotificationSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    inApp: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    types: {
      appointment: true,
      telemedicine: true,
      prescription: true,
      lab_result: true,
      system: true,
      emergency: true
    }
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const notificationsEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection for real-time notifications
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'ws://localhost:3001', {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token')
      }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to notification server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('notification', (notification: Notification) => {
      addNotification(notification);
      showNotificationToast(notification);
    });

    newSocket.on('notification_update', (data: { id: string; read: boolean }) => {
      updateNotificationStatus(data.id, data.read);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch notification settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  // Add new notification
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Update notification status
  const updateNotificationStatus = (id: string, read: boolean) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read } : n
      )
    );
    
    if (!read) {
      setUnreadCount(prev => prev + 1);
    } else {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        updateNotificationStatus(id, true);
        if (socket) {
          socket.emit('notification_read', { id });
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Archive notification
  const archiveNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === id ? { ...n, archived: true } : n
          )
        );
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Update notification settings
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        toast({
          title: 'Configuración actualizada',
          description: 'Las preferencias de notificaciones se han guardado'
        });
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar las configuraciones',
        variant: 'destructive'
      });
    }
  };

  // Show notification toast
  const showNotificationToast = (notification: Notification) => {
    if (settings.inApp) {
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000
      });
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'telemedicine':
        return <Video className="w-5 h-5 text-green-600" />;
      case 'prescription':
        return <Heart className="w-5 h-5 text-purple-600" />;
      case 'lab_result':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'emergency':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      (filter === 'all' && !notification.archived) ||
      (filter === 'unread' && !notification.read && !notification.archived) ||
      (filter === 'read' && notification.read && !notification.archived) ||
      (filter === 'archived' && notification.archived);
    
    const matchesSearch = 
      !searchTerm ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Auto-scroll to bottom
  useEffect(() => {
    notificationsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredNotifications]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-2">
              <Input
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
              <div className="flex items-center space-x-2">
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">No leídas</SelectItem>
                    <SelectItem value="read">Leídas</SelectItem>
                    <SelectItem value="archived">Archivadas</SelectItem>
                  </SelectContent>
                </Select>
                
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8"
                  >
                    Marcar todas como leídas
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-64">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleString()}
                          </p>
                          
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => archiveNotification(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Archive className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={notificationsEndRef} />
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Configuración de Notificaciones</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Channels */}
            <div>
              <h4 className="font-medium mb-3">Canales de Notificación</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Switch
                    checked={settings.email}
                    onCheckedChange={(checked) => updateSettings({ email: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <Switch
                    checked={settings.sms}
                    onCheckedChange={(checked) => updateSettings({ sms: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm">Push Notifications</span>
                  </div>
                  <Switch
                    checked={settings.push}
                    onCheckedChange={(checked) => updateSettings({ push: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">En la aplicación</span>
                  </div>
                  <Switch
                    checked={settings.inApp}
                    onCheckedChange={(checked) => updateSettings({ inApp: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <h4 className="font-medium mb-3">Horas Silenciosas</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activar horas silenciosas</span>
                  <Switch
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ 
                        quietHours: { ...settings.quietHours, enabled: checked } 
                      })
                    }
                  />
                </div>
                
                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Inicio</label>
                      <Input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => 
                          updateSettings({ 
                            quietHours: { ...settings.quietHours, start: e.target.value } 
                          })
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Fin</label>
                      <Input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => 
                          updateSettings({ 
                            quietHours: { ...settings.quietHours, end: e.target.value } 
                          })
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h4 className="font-medium mb-3">Tipos de Notificación</h4>
              <div className="space-y-3">
                {Object.entries(settings.types).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        updateSettings({ 
                          types: { ...settings.types, [type]: checked } 
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 