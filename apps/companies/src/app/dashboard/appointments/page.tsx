'use client';

import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import {
    Appointment,
    AppointmentStatus,
    AppointmentType,
    CreateAppointment,
    Priority
} from '@altamedica/types';
import { Badge } from '@altamedica/ui/badge';
import { Button } from '@altamedica/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@altamedica/ui/card';
import { DataTable } from '@altamedica/ui/data-table';
import { Dialog, DialogContent } from '@altamedica/ui/dialog';
import { Input } from '@altamedica/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@altamedica/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@altamedica/ui/tabs';
import {
    AlertCircle,
    BarChart3,
    Calendar,
    Calendar as CalendarIcon,
    CheckCircle,
    Clock,
    Filter,
    List,
    Plus,
    Search,
    XCircle
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { View } from 'react-big-calendar';

// Mock data para citas
const mockAppointments: Appointment[] = [
  {
    id: 'apt-001',
    title: 'Consulta Cardiológica',
    description: 'Control rutinario, evaluación de presión arterial',
    start: new Date(2025, 7, 7, 9, 0), // 7 de agosto, 9:00 AM
    end: new Date(2025, 7, 7, 10, 0),
    duration: 60,
    timezone: 'America/Argentina/Buenos_Aires',
    doctor: {
      id: 'd1',
      name: 'Dr. Carlos Martínez',
      specialty: 'Cardiología',
      email: 'carlos.martinez@example.com',
      phone: '+54 11 1234-5678'
    },
    patient: {
      id: 'p1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+54 11 9876-5432',
      dni: '12345678',
      age: 45,
      gender: 'Masculino'
    },
    status: AppointmentStatus.SCHEDULED,
    type: AppointmentType.CONSULTATION,
    priority: Priority.NORMAL,
    location: 'Consultorio 201',
    room: '201',
    isVirtual: false,
    symptoms: ['Dolor en el pecho', 'Fatiga'],
    cost: 8500,
    insuranceCovered: true,
    paymentStatus: 'Pendiente',
    reminderSent: false,
    reminderTime: 60,
    notifyPatient: true,
    notifyDoctor: true,
    followUpRequired: false,
    createdAt: '2025-08-05T10:00:00Z',
    updatedAt: '2025-08-05T10:00:00Z',
    createdBy: 'user-001',
    companyId: 'company-001',
    tags: ['control', 'hipertensión']
  },
  {
    id: 'apt-002',
    title: 'Consulta Pediátrica Virtual',
    description: 'Seguimiento post-vacunación',
    start: new Date(2025, 7, 7, 14, 30), // 7 de agosto, 2:30 PM
    end: new Date(2025, 7, 7, 15, 0),
    duration: 30,
    timezone: 'America/Argentina/Buenos_Aires',
    doctor: {
      id: 'd2',
      name: 'Dra. María López',
      specialty: 'Pediatría',
      email: 'maria.lopez@example.com',
      phone: '+54 11 2345-6789'
    },
    patient: {
      id: 'p2',
      name: 'Sofía García',
      email: 'sofia.garcia@example.com',
      phone: '+54 11 8765-4321',
      dni: '87654321',
      age: 8,
      gender: 'Femenino'
    },
    status: AppointmentStatus.COMPLETED,
    type: AppointmentType.FOLLOW_UP,
    priority: Priority.NORMAL,
    isVirtual: true,
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    cost: 5500,
    insuranceCovered: true,
    paymentStatus: 'Pagado',
    reminderSent: true,
    notifyPatient: true,
    notifyDoctor: true,
    followUpRequired: false,
    createdAt: '2025-08-04T15:30:00Z',
    updatedAt: '2025-08-07T15:00:00Z',
    createdBy: 'user-001',
    companyId: 'company-001',
    tags: ['vacunación', 'seguimiento'],
    patientRating: 5,
    patientFeedback: 'Excelente atención, muy claro en las explicaciones'
  },
  {
    id: 'apt-003',
    title: 'Neurología - URGENTE',
    description: 'Evaluación de migrañas severas',
    start: new Date(2025, 7, 8, 11, 0), // 8 de agosto, 11:00 AM
    end: new Date(2025, 7, 8, 12, 30),
    duration: 90,
    timezone: 'America/Argentina/Buenos_Aires',
    doctor: {
      id: 'd3',
      name: 'Dr. Alejandro Rodríguez',
      specialty: 'Neurología',
      email: 'alejandro.rodriguez@example.com',
      phone: '+54 11 3456-7890'
    },
    patientName: 'Ana Martínez', // Paciente no registrado
    status: AppointmentStatus.IN_PROGRESS,
    type: AppointmentType.EMERGENCY,
    priority: Priority.URGENT,
    location: 'Consultorio 305',
    room: '305',
    isVirtual: false,
    symptoms: ['Migraña severa', 'Visión borrosa', 'Náuseas'],
    cost: 12000,
    insuranceCovered: false,
    paymentStatus: 'Pendiente',
    reminderSent: true,
    notifyPatient: true,
    notifyDoctor: true,
    followUpRequired: true,
    followUpDate: new Date(2025, 7, 15, 11, 0),
    createdAt: '2025-08-07T08:00:00Z',
    updatedAt: '2025-08-08T11:15:00Z',
    createdBy: 'user-002',
    companyId: 'company-001',
    tags: ['urgente', 'neurología', 'migraña']
  }
];

// Columnas para la tabla de citas
const appointmentColumns = [
  {
    accessorKey: 'title',
    header: 'Título',
    cell: ({ row }: any) => {
      const appointment = row.original;
      return (
        <div>
          <p className="font-medium">{appointment.title}</p>
          <p className="text-sm text-gray-500">{appointment.type}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'patient',
    header: 'Paciente',
    cell: ({ row }: any) => {
      const appointment = row.original;
      return (
        <div>
          <p className="font-medium">
            {appointment.patient?.name || appointment.patientName || 'Sin asignar'}
          </p>
          {appointment.patient?.phone && (
            <p className="text-sm text-gray-500">{appointment.patient.phone}</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'doctor',
    header: 'Doctor',
    cell: ({ row }: any) => {
      const appointment = row.original;
      return (
        <div>
          <p className="font-medium">{appointment.doctor.name}</p>
          <p className="text-sm text-gray-500">{appointment.doctor.specialty}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'start',
    header: 'Fecha y Hora',
    cell: ({ row }: any) => {
      const appointment = row.original;
      return (
        <div>
          <p className="font-medium">
            {new Date(appointment.start).toLocaleDateString('es-ES')}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(appointment.start).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} - {new Date(appointment.end).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }: any) => {
      const appointment = row.original;
      const statusConfig = {
        [AppointmentStatus.SCHEDULED]: { variant: 'default' as const, label: 'Programada' },
        [AppointmentStatus.IN_PROGRESS]: { variant: 'warning' as const, label: 'En Progreso' },
        [AppointmentStatus.COMPLETED]: { variant: 'success' as const, label: 'Completada' },
        [AppointmentStatus.CANCELLED]: { variant: 'destructive' as const, label: 'Cancelada' },
        [AppointmentStatus.NO_SHOW]: { variant: 'secondary' as const, label: 'No Show' },
        [AppointmentStatus.RESCHEDULED]: { variant: 'outline' as const, label: 'Reprogramada' },
      };
      
      const config = statusConfig[appointment.status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'priority',
    header: 'Prioridad',
    cell: ({ row }: any) => {
      const appointment = row.original;
      const priorityConfig = {
        [Priority.LOW]: { variant: 'secondary' as const, label: 'Baja' },
        [Priority.NORMAL]: { variant: 'default' as const, label: 'Normal' },
        [Priority.HIGH]: { variant: 'warning' as const, label: 'Alta' },
        [Priority.URGENT]: { variant: 'destructive' as const, label: 'Urgente' },
        [Priority.CRITICAL]: { variant: 'destructive' as const, label: 'Crítica' },
      };
      
      const config = priorityConfig[appointment.priority as keyof typeof priorityConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  }
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [calendarView, setCalendarView] = useState<View>('week');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const today = new Date();
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.start);
      return aptDate.toDateString() === today.toDateString();
    });

    return {
      total: appointments.length,
      today: todayAppointments.length,
      scheduled: appointments.filter(apt => apt.status === AppointmentStatus.SCHEDULED).length,
      completed: appointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length,
      cancelled: appointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length,
      urgent: appointments.filter(apt => apt.priority === Priority.URGENT || apt.priority === Priority.CRITICAL).length,
    };
  }, [appointments]);

  // Filtrar citas
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = searchQuery === '' || 
        appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appointment.patient?.name || appointment.patientName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || appointment.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [appointments, searchQuery, statusFilter, priorityFilter]);

  // Manejar creación de cita
  const handleCreateAppointment = async (data: CreateAppointment) => {
    setIsLoading(true);
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAppointment: Appointment = {
        ...data,
        id: `apt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminderSent: false,
        tags: [],
        symptoms: [],
        medicalNotes: []
      };

      setAppointments(prev => [...prev, newAppointment]);
      setShowCreateModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar selección de slot en el calendario
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600">Administra todas las citas médicas de tu institución</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              <p className="text-sm text-gray-600">Hoy</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-sm text-gray-600">Programadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              <p className="text-sm text-gray-600">Canceladas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
              <p className="text-sm text-gray-600">Urgentes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, doctor o paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.values(AppointmentStatus).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              {Object.values(Priority).map((priority) => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Contenido principal con pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analíticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendar
            appointments={filteredAppointments}
            onSelectAppointment={setSelectedAppointment}
            onSelectSlot={handleSelectSlot}
            view={calendarView}
            onViewChange={setCalendarView}
            date={calendarDate}
            onNavigate={setCalendarDate}
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Lista de Citas ({filteredAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={appointmentColumns} 
                data={filteredAppointments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(AppointmentStatus).map((status) => {
                    const count = appointments.filter(apt => apt.status === status).length;
                    const percentage = appointments.length > 0 ? (count / appointments.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{status}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(AppointmentType).map((type) => {
                    const count = appointments.filter(apt => apt.type === type).length;
                    const percentage = appointments.length > 0 ? (count / appointments.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de creación/edición */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AppointmentForm
            onSubmit={handleCreateAppointment}
            onCancel={() => {
              setShowCreateModal(false);
              setSelectedSlot(null);
            }}
            isLoading={isLoading}
            selectedDate={selectedSlot?.start}
            selectedTimeSlot={selectedSlot}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}