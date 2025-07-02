'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { usePatients, useCreatePatient } from '@/hooks/api-hooks'
import { User, Plus, Search, Calendar, Phone, MapPin, Heart, Activity } from 'lucide-react'

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const { data: patients, isLoading, error } = usePatients({ search: searchTerm })
  const createPatientMutation = useCreatePatient()

  const mockPatients = [
    {
      id: '1',
      firstName: 'María',
      lastName: 'García',
      email: 'maria.garcia@email.com',
      phone: '+52 555 0101',
      dateOfBirth: '1985-03-15',
      gender: 'female' as const,
      address: 'Av. Reforma 123, CDMX',
      lastVisit: '2024-06-20',
      status: 'active',
      riskLevel: 'low'
    },
    {
      id: '2', 
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+52 555 0202',
      dateOfBirth: '1978-11-22',
      gender: 'male' as const,
      address: 'Calle 5 de Mayo 456, Guadalajara',
      lastVisit: '2024-06-18',
      status: 'active',
      riskLevel: 'medium'
    },
    {
      id: '3',
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@email.com',
      phone: '+52 555 0303',
      dateOfBirth: '1992-07-08',
      gender: 'female' as const,
      address: 'Blvd. Kukulkán 789, Cancún',
      lastVisit: '2024-06-15',
      status: 'active',
      riskLevel: 'low'
    }
  ]

  const displayPatients = Array.isArray(patients) ? patients : mockPatients

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600 mt-1">Gestión integral de pacientes médicos</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
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
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{displayPatients.length}</p>
                  <p className="text-gray-600">Total Pacientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {displayPatients.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-gray-600">Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Heart className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {displayPatients.filter(p => p.riskLevel === 'medium' || p.riskLevel === 'high').length}
                  </p>
                  <p className="text-gray-600">Riesgo Medio/Alto</p>
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
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-gray-600">Citas Hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {displayPatients.map((patient) => (
                  <div key={patient.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Phone className="h-4 w-4 mr-1" />
                            {patient.phone}
                            <span className="mx-2">•</span>
                            <Calendar className="h-4 w-4 mr-1" />
                            Última visita: {patient.lastVisit}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.riskLevel)}`}>
                          Riesgo {patient.riskLevel === 'low' ? 'Bajo' : patient.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                        </span>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {patient.address}
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
