'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Star, User, Heart, FileText, Bell, CreditCard, Settings } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: string;
  companyId: string;
  companyName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: 'consultation' | 'checkup' | 'emergency';
  location?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    companyId: '1',
    companyName: 'Hospital Universitario',
    doctorId: 'doc1',
    doctorName: 'Dr. García',
    specialty: 'Cardiología',
    date: '2024-01-15',
    time: '09:00',
    status: 'confirmed',
    type: 'consultation',
    location: 'Consulta 3A, Planta 2'
  },
  {
    id: 'apt2',
    companyId: '2',
    companyName: 'Clínica Sant Joan',
    doctorId: 'doc2',
    doctorName: 'Dr. López',
    specialty: 'Neurología',
    date: '2024-01-18',
    time: '14:30',
    status: 'pending',
    type: 'checkup',
    location: 'Consulta 1B, Planta 1'
  }
];

const statusStyles = {
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

const statusLabels = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada'
};

export default function PatientDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + timeString;
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  );

  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
              <p className="text-gray-600">Gestiona tus citas y información médica</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">Juan Pérez</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Próximas Citas</p>
                    <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Citas Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{pastAppointments.length}</p>
                  </div>
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Especialistas</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <User className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Próximas Citas</h2>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        data-testid="appointment-card"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 data-testid="appointment-company" className="font-medium text-gray-900">
                                {appointment.companyName}
                              </h3>
                              <span className={`
                                px-2 py-1 rounded-md text-xs font-medium border
                                ${statusStyles[appointment.status]}
                              `}>
                                {statusLabels[appointment.status]}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <div data-testid="appointment-doctor" className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {appointment.doctorName}
                              </div>
                              
                              <div data-testid="appointment-specialty" className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {appointment.specialty}
                              </div>
                              
                              <div data-testid="appointment-datetime" className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDateTime(appointment.date, appointment.time)}
                              </div>
                              
                              {appointment.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {appointment.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/companies/${appointment.companyId}`}
                            data-testid="view-company-details"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Ver Institución
                          </Link>
                          
                          <Link
                            href={`/patient/appointments/${appointment.id}/reschedule`}
                            data-testid="reschedule-appointment"
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Reprogramar
                          </Link>
                          
                          <button
                            data-testid="cancel-appointment"
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                            onClick={() => setSelectedAppointment(appointment.id)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes citas próximas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Programa una nueva cita con tus especialistas de confianza.
                    </p>
                    <Link
                      href="/companies"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Buscar Especialistas
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Cita confirmada con Dr. García
                      </p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Resultados de laboratorio disponibles
                      </p>
                      <p className="text-xs text-gray-500">Ayer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Reseña enviada para Hospital Universitario
                      </p>
                      <p className="text-xs text-gray-500">Hace 3 días</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              
              <div className="space-y-3">
                <Link
                  href="/companies"
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Nueva Cita</span>
                </Link>
                
                <Link
                  href="/patient/records"
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Mis Registros</span>
                </Link>
                
                <Link
                  href="/emergency"
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-900">Emergencia</span>
                </Link>
              </div>
            </div>

            {/* Health Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Salud</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Última consulta</span>
                  <span className="text-sm font-medium text-gray-900">15 Dic 2023</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Próximo chequeo</span>
                  <span className="text-sm font-medium text-gray-900">15 Ene 2024</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medicamentos activos</span>
                  <span className="text-sm font-medium text-gray-900">2</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Alergias registradas</span>
                  <span className="text-sm font-medium text-gray-900">1</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Contacto de Emergencia</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">María Pérez</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">+34 612 345 678</span>
                </div>
                
                <div className="text-xs text-red-600 mt-2">
                  Relación: Esposa
                </div>
              </div>
              
              <button className="w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                Llamar Emergencia
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Appointment Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Cancelar Cita?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres cancelar esta cita?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Mantener Cita
              </button>
              <button
                onClick={() => {
                  // Handle cancellation
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Cancelar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}