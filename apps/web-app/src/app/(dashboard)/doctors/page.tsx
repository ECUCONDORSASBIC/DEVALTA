'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useDoctors } from '@/hooks/api-hooks'
import { User, Plus, Search, Star, MapPin, Clock, Phone, Stethoscope, Calendar, Award } from 'lucide-react'

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: doctors, isLoading } = useDoctors({ search: searchTerm })

  const mockDoctors = [
    {
      id: '1',
      firstName: 'Dr. Eduardo',
      lastName: 'Hernández',
      email: 'e.hernandez@altamedica.com',
      phone: '+52 555 1001',
      specialization: 'Cardiología',
      licenseNumber: 'MED-001',
      experience: 15,
      rating: 4.9,
      consultationFee: 1200,
      languages: ['Español', 'Inglés'],
      availability: 'Disponible',
      nextSlot: '14:30',
      patients: 245,
      hospital: 'Hospital General'
    },
    {
      id: '2',
      firstName: 'Dra. Ana',
      lastName: 'Morales',
      email: 'a.morales@altamedica.com',
      phone: '+52 555 1002', 
      specialization: 'Pediatría',
      licenseNumber: 'MED-002',
      experience: 12,
      rating: 4.8,
      consultationFee: 1000,
      languages: ['Español'],
      availability: 'Ocupado',
      nextSlot: '16:00',
      patients: 189,
      hospital: 'Hospital Infantil'
    },
    {
      id: '3',
      firstName: 'Dr. Roberto',
      lastName: 'Silva',
      email: 'r.silva@altamedica.com',
      phone: '+52 555 1003',
      specialization: 'Neurología',
      licenseNumber: 'MED-003',
      experience: 20,
      rating: 4.7,
      consultationFee: 1500,
      languages: ['Español', 'Inglés', 'Francés'],
      availability: 'Disponible',
      nextSlot: '15:15',
      patients: 312,
      hospital: 'Centro Neurológico'
    }
  ]

  const displayDoctors = doctors || mockDoctors

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'bg-green-100 text-green-800 border-green-200'
      case 'Ocupado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctores</h1>
            <p className="text-gray-600 mt-1">Directorio médico y gestión de especialistas</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Doctor
          </Button>
        </div>

        {/* Búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad o hospital..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-gray-600">Total Doctores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-gray-600">Disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-gray-600">Rating Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">28</p>
                  <p className="text-gray-600">Citas Hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de doctores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(displayDoctors) && displayDoctors.map((doctor: any) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-xl">
                  {doctor.firstName} {doctor.lastName}
                </CardTitle>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({doctor.rating})</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {doctor.specialization}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    {doctor.experience} años de experiencia
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {doctor.hospital}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {doctor.phone}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {doctor.patients} pacientes
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(doctor.availability)}`}>
                    {doctor.availability}
                  </span>
                  <span className="text-sm text-gray-600">
                    Próximo: {doctor.nextSlot}
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    ${doctor.consultationFee.toLocaleString()} MXN
                  </p>
                  <p className="text-sm text-gray-600">por consulta</p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Perfil
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={doctor.availability === 'Ocupado'}
                  >
                    Agendar Cita
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Idiomas: {doctor.languages.join(', ')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  )
}
