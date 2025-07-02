'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAppointments } from '@/hooks/api-hooks'
import { Calendar, Clock, User, Video, Phone, MapPin, Plus, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState('all')
  
  const { data: appointments, isLoading } = useAppointments({ 
    date: selectedDate,
    status: filterStatus !== 'all' ? filterStatus : undefined 
  })

  const mockAppointments = [
    {
      id: '1',
      patientName: 'María García',
      doctorName: 'Dr. Eduardo Hernández',
      dateTime: '2024-06-24T09:00:00',
      duration: 60,
      type: 'consultation',
      status: 'confirmed',
      symptoms: ['Dolor de pecho', 'Fatiga'],
      location: 'Consultorio 101',
      specialty: 'Cardiología',
      isVideoCall: false
    },
    {
      id: '2',
      patientName: 'Carlos Rodríguez', 
      doctorName: 'Dra. Ana Morales',
      dateTime: '2024-06-24T10:30:00',
      duration: 45,
      type: 'follow-up',
      status: 'in-progress',
      symptoms: ['Control rutinario'],
      location: 'Consultorio 205',
      specialty: 'Pediatría',
      isVideoCall: false
    },
    {
      id: '3',
      patientName: 'Ana Martínez',
      doctorName: 'Dr. Roberto Silva',
      dateTime: '2024-06-24T14:00:00',
      duration: 30,
      type: 'video-call',
      status: 'scheduled',
      symptoms: ['Consulta de seguimiento'],
      location: 'Virtual',
      specialty: 'Neurología',
      isVideoCall: true
    },
    {
      id: '4',
      patientName: 'Luis Torres',
      doctorName: 'Dr. Eduardo Hernández',
      dateTime: '2024-06-24T16:15:00',
      duration: 60,
      type: 'emergency',
      status: 'cancelled',
      symptoms: ['Emergencia cardíaca'],
      location: 'Urgencias',
      specialty: 'Cardiología',
      isVideoCall: false
    }
  ]

  const displayAppointments = appointments || mockAppointments

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'in-progress': return <AlertCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-500'
      case 'video-call': return 'bg-purple-500'
      case 'follow-up': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'scheduled', label: 'Programadas' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'in-progress', label: 'En Curso' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Citas Médicas</h1>
            <p className="text-gray-600 mt-1">Gestión y seguimiento de citas</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Más Filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">4</p>
                  <p className="text-gray-600">Total Hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-gray-600">Confirmadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <p className="text-gray-600">Virtuales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <p className="text-gray-600">Urgencias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de citas */}
        <Card>
          <CardHeader>
            <CardTitle>Citas del {new Date(selectedDate).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(displayAppointments) && displayAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-1 h-16 rounded-full ${getTypeColor(appointment.type)}`}></div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {appointment.patientName}
                            </h3>
                            <span className="text-gray-500">•</span>
                            <span className="text-sm text-gray-600">
                              {appointment.doctorName}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {formatTime(appointment.dateTime)} - {appointment.duration}min
                            </div>
                            
                            <div className="flex items-center">
                              {appointment.isVideoCall ? (
                                <Video className="h-4 w-4 mr-2" />
                              ) : (
                                <MapPin className="h-4 w-4 mr-2" />
                              )}
                              {appointment.location}
                            </div>
                            
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              {appointment.specialty}
                            </div>
                          </div>
                          
                          {appointment.symptoms && appointment.symptoms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-700">
                                <strong>Motivo:</strong> {appointment.symptoms.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </span>
                        
                        <div className="flex space-x-2">
                          {appointment.status === 'confirmed' && (
                            <Button size="sm" variant="outline">
                              Iniciar
                            </Button>
                          )}
                          
                          {appointment.isVideoCall && appointment.status !== 'cancelled' && (
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <Video className="h-4 w-4 mr-1" />
                              Unirse
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
