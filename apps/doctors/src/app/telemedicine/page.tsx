'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Clock, 
  User, 
  Calendar,
  Plus,
  Search,
  Filter,
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { 
  telemedicineService, 
  useTelemedicineService,
  type TelemedicineSession,
  type SessionFilters 
} from '@/services/telemedicine-service';
import { useTelemedicineWebSocket } from '@/hooks/useTelemedicineWebSocket';

export default function DoctorTelemedicinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setAuthToken } = useTelemedicineService();
  const { 
    isConnected: wsConnected, 
    connectionStatus, 
    lastMessage,
    error: wsError 
  } = useTelemedicineWebSocket({
    autoConnect: true,
    reconnectAttempts: 3
  });

  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    scheduledSessions: 0,
    completedSessions: 0
  });

  // Configurar autenticación del servicio
  useEffect(() => {
    if (user?.token) {
      setAuthToken(user.token);
    }
  }, [user?.token, setAuthToken]);

  // Cargar sesiones de telemedicina
  const loadSessions = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const filters: SessionFilters = {
        doctorId: user.id,
        status: filter === 'all' ? undefined : filter as any,
        limit: 50
      };

      const result = await telemedicineService.getSessions(filters);
      setSessions(result.sessions);

      // Calcular estadísticas
      const stats = {
        totalSessions: result.sessions.length,
        activeSessions: result.sessions.filter(s => s.status === 'active').length,
        scheduledSessions: result.sessions.filter(s => s.status === 'scheduled').length,
        completedSessions: result.sessions.filter(s => s.status === 'completed').length
      };
      setStats(stats);

    } catch (error) {
      console.error('Error loading telemedicine sessions:', error);
      setError('Error al cargar las sesiones de telemedicina. Mostrando datos de ejemplo.');
      
      // Fallback a datos de ejemplo en caso de error
      const mockSessions: TelemedicineSession[] = [
        {
          id: 'session-001',
          appointmentId: 'apt-001',
          doctorId: user.id,
          patientId: 'pat-001',
          sessionType: 'video',
          provider: 'webrtc',
          status: 'scheduled',
          scheduledAt: new Date(Date.now() + 5 * 60 * 1000),
          scheduledDuration: 30,
          title: 'Consulta de seguimiento',
          patient: {
            id: 'pat-001',
            firstName: 'María',
            lastName: 'González',
            email: 'maria.gonzalez@email.com'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'session-002',
          appointmentId: 'apt-002',
          doctorId: user.id,
          patientId: 'pat-002',
          sessionType: 'video',
          provider: 'webrtc',
          status: 'active',
          scheduledAt: new Date(Date.now() - 10 * 60 * 1000),
          startedAt: new Date(Date.now() - 10 * 60 * 1000),
          scheduledDuration: 45,
          title: 'Consulta de emergencia',
          patient: {
            id: 'pat-002',
            firstName: 'Carlos',
            lastName: 'Rodríguez',
            email: 'carlos.rodriguez@email.com'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setSessions(mockSessions);
      setStats({
        totalSessions: mockSessions.length,
        activeSessions: mockSessions.filter(s => s.status === 'active').length,
        scheduledSessions: mockSessions.filter(s => s.status === 'scheduled').length,
        completedSessions: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user?.id, filter]);

  // Procesar mensajes WebSocket en tiempo real
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'session_update') {
      const { data } = lastMessage;
      
      if (data?.action === 'session_updated') {
        // Actualizar sesión específica
        setSessions(prev => prev.map(session => 
          session.id === data.sessionId 
            ? { ...session, ...data.updates }
            : session
        ));
      } else if (data?.action === 'session_created') {
        // Agregar nueva sesión
        if (data.session && data.session.doctorId === user?.id) {
          setSessions(prev => [data.session, ...prev]);
        }
      } else if (data?.action === 'session_deleted') {
        // Remover sesión
        setSessions(prev => prev.filter(session => session.id !== data.sessionId));
      }
    }
  }, [lastMessage, user?.id]);

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const patientName = session.patient ? `${session.patient.firstName} ${session.patient.lastName}` : '';
    const sessionTitle = session.title || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sessionTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      scheduled: { variant: 'secondary' as const, text: 'Programada' },
      active: { variant: 'success' as const, text: 'Activa' },
      completed: { variant: 'outline' as const, text: 'Completada' },
      cancelled: { variant: 'destructive' as const, text: 'Cancelada' }
    };
    
    const config = configs[status as keyof typeof configs];
    return <Badge variant={config?.variant || 'secondary'}>{config?.text || status}</Badge>;
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      // Intentar unirse a la sesión
      const joinResult = await telemedicineService.joinSession(sessionId, 'doctor');
      router.push(`/telemedicine/session/${sessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Error al unirse a la sesión. Redirigiendo a la página de sesión...');
      router.push(`/telemedicine/session/${sessionId}`);
    }
  };

  const handleCreateNewSession = () => {
    router.push('/telemedicine/create');
  };

  const handleRetry = () => {
    loadSessions();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesiones de telemedicina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Centro de Telemedicina
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      wsConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {wsConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Gestiona tus consultas virtuales
                </p>
              </div>
            </div>
            <Button onClick={handleCreateNewSession}>
              <Plus className="h-5 w-5 mr-2" />
              Nueva Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    ⚠️ {error}
                  </p>
                </div>
                <Button 
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Todas las sesiones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programadas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.scheduledSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Próximas sesiones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.activeSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                En progreso ahora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Finalizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente o motivo..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {['all', 'scheduled', 'active', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(status as any)}
                  >
                    {status === 'all' && 'Todas'}
                    {status === 'scheduled' && 'Programadas'}
                    {status === 'active' && 'Activas'}
                    {status === 'completed' && 'Completadas'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Video className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay sesiones
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filter === 'all' 
                      ? 'No tienes sesiones programadas'
                      : `No hay sesiones con estado "${filter}"`
                    }
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleCreateNewSession}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva Sesión
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {session.patient ? `${session.patient.firstName} ${session.patient.lastName}` : 'Paciente desconocido'}
                          </h3>
                          {session.sessionType === 'video' && <Video className="h-4 w-4 text-blue-500" />}
                          {session.sessionType === 'audio' && <Activity className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-600">{session.title || 'Consulta de telemedicina'}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {session.scheduledAt.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {session.scheduledDuration} min
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                              {session.provider}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(session.status)}
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/patients/${session.patientId}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Paciente
                        </Button>
                        
                        {session.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => handleJoinSession(session.id)}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Iniciar Consulta
                          </Button>
                        )}
                        
                        {session.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => handleJoinSession(session.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Activity className="h-4 w-4 mr-1" />
                            Continuar
                          </Button>
                        )}
                        
                        {session.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/telemedicine/session/${session.id}?view=summary`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Resumen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {session.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notas:</span> {session.notes}
                      </p>
                    </div>
                  )}
                  
                  {session.status === 'active' && session.startedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-green-600">
                        <span className="font-medium">Iniciada:</span> {session.startedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}