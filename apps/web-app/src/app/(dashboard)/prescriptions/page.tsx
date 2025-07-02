'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { usePrescriptions } from '@/hooks/api-hooks'
import { Pill, Plus, Search, Calendar, User, Clock, FileText, Download, AlertTriangle, CheckCircle } from 'lucide-react'

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const { data: prescriptions, isLoading } = usePrescriptions({ 
    search: searchTerm,
    status: filterStatus !== 'all' ? filterStatus : undefined 
  })

  const mockPrescriptions = [
    {
      id: '1',
      patientName: 'María García',
      doctorName: 'Dr. Eduardo Hernández',
      issuedDate: '2024-06-20',
      validUntil: '2024-07-20',
      status: 'active',
      medications: [
        {
          name: 'Atorvastatina',
          dosage: '20mg',
          frequency: 'Una vez al día',
          duration: '30 días',
          instructions: 'Tomar con la cena'
        },
        {
          name: 'Aspirina',
          dosage: '100mg',
          frequency: 'Una vez al día',
          duration: '30 días',
          instructions: 'Tomar con alimentos'
        }
      ],
      diagnosis: 'Hipercolesterolemia',
      notes: 'Control de laboratorio en 4 semanas'
    },
    {
      id: '2',
      patientName: 'Carlos Rodríguez',
      doctorName: 'Dra. Ana Morales',
      issuedDate: '2024-06-18',
      validUntil: '2024-07-18',
      status: 'active',
      medications: [
        {
          name: 'Amoxicilina',
          dosage: '500mg',
          frequency: 'Cada 8 horas',
          duration: '7 días',
          instructions: 'Tomar con abundante agua'
        }
      ],
      diagnosis: 'Infección respiratoria',
      notes: 'Regresar si no hay mejoría en 3 días'
    },
    {
      id: '3',
      patientName: 'Ana Martínez',
      doctorName: 'Dr. Roberto Silva',
      issuedDate: '2024-06-10',
      validUntil: '2024-07-10',
      status: 'completed',
      medications: [
        {
          name: 'Topiramato',
          dosage: '25mg',
          frequency: 'Dos veces al día',
          duration: '30 días',
          instructions: 'Aumentar dosis gradualmente'
        }
      ],
      diagnosis: 'Migraña crónica',
      notes: 'Tratamiento preventivo, seguimiento en consulta'
    }
  ]

  const displayPrescriptions = prescriptions || mockPrescriptions

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'expired': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'expired': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const isExpiringSoon = (validUntil: string) => {
    const expiryDate = new Date(validUntil)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'completed', label: 'Completadas' },
    { value: 'expired', label: 'Expiradas' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescripciones</h1>
            <p className="text-gray-600 mt-1">Gestión de recetas médicas y medicamentos</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Prescripción
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, doctor o medicamento..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
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
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Pill className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-gray-600">Total</p>
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
                  <p className="text-gray-600">Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <p className="text-gray-600">Por Vencer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">15</p>
                  <p className="text-gray-600">Este Mes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de prescripciones */}
        <div className="space-y-6">
          {Array.isArray(displayPrescriptions) && displayPrescriptions.map((prescription: any) => (
            <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      {prescription.patientName}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Prescrito por: {prescription.doctorName}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isExpiringSoon(prescription.validUntil) && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Vence pronto
                      </span>
                    )}
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getStatusColor(prescription.status)}`}>
                      {getStatusIcon(prescription.status)}
                      <span className="ml-1 capitalize">{prescription.status}</span>
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Información general */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Información General</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Emitida: {new Date(prescription.issuedDate).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Válida hasta: {new Date(prescription.validUntil).toLocaleDateString('es-ES')}
                        </div>
                        <div className="text-gray-600">
                          <strong>Diagnóstico:</strong> {prescription.diagnosis}
                        </div>
                      </div>
                    </div>
                    
                    {prescription.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {prescription.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Medicamentos */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-4">Medicamentos</h4>
                    <div className="space-y-4">
                      {prescription.medications.map((med: any, index: number) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-2">
                                {med.name} - {med.dosage}
                              </h5>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Frecuencia:</span>
                                  <p className="font-medium">{med.frequency}</p>
                                </div>
                                
                                <div>
                                  <span className="text-gray-600">Duración:</span>
                                  <p className="font-medium">{med.duration}</p>
                                </div>
                              </div>
                              
                              {med.instructions && (
                                <div className="mt-2">
                                  <span className="text-gray-600">Instrucciones:</span>
                                  <p className="text-sm text-gray-700 italic">{med.instructions}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-2 bg-blue-100 rounded-lg ml-4">
                              <Pill className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Acciones */}
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  
                  {prescription.status === 'active' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Renovar
                    </Button>
                  )}
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
