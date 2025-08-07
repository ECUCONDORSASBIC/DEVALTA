'use client';

import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Edit3,
    FileText,
    Heart,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Plus,
    Ruler,
    Shield,
    Thermometer,
    User,
    Video,
    Weight
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'O';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
    prescribedDate: string;
  }[];
  lastVisit: string;
  nextAppointment?: string;
  vitalSigns: {
    date: string;
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
    oxygenSaturation: number;
  }[];
}

interface MedicalRecord {
  id: string;
  date: string;
  type: 'consultation' | 'diagnosis' | 'treatment' | 'prescription' | 'test_result';
  title: string;
  description: string;
  attachments?: string[];
  doctorNotes: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: {
    medication: string;
    dosage: string;
    instructions: string;
    duration: string;
  }[];
}

// Mock data del paciente
const mockPatient: Patient = {
  id: 'patient-001',
  firstName: 'María',
  lastName: 'González',
  email: 'maria.gonzalez@email.com',
  phone: '+54 11 4567-8901',
  dateOfBirth: '1985-03-15',
  gender: 'F',
  address: 'Av. Corrientes 1234, Buenos Aires, Argentina',
  emergencyContact: {
    name: 'Carlos González',
    phone: '+54 11 4567-8902',
    relationship: 'Esposo'
  },
  bloodType: 'O+',
  allergies: ['Penicilina', 'Mariscos'],
  chronicConditions: ['Hipertensión arterial', 'Diabetes tipo 2'],
  currentMedications: [
    {
      name: 'Enalapril',
      dosage: '10mg',
      frequency: '2 veces al día',
      prescribedDate: '2024-12-01'
    },
    {
      name: 'Metformina',
      dosage: '850mg',
      frequency: '3 veces al día',
      prescribedDate: '2024-11-15'
    }
  ],
  lastVisit: '2025-01-20',
  nextAppointment: '2025-02-15T10:00:00',
  vitalSigns: [
    {
      date: '2025-01-20',
      bloodPressure: '130/85',
      heartRate: 78,
      temperature: 36.5,
      weight: 68.5,
      height: 165,
      oxygenSaturation: 98
    },
    {
      date: '2024-12-20',
      bloodPressure: '135/90',
      heartRate: 82,
      temperature: 36.7,
      weight: 69.0,
      height: 165,
      oxygenSaturation: 97
    }
  ]
};

const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'record-001',
    date: '2025-01-20',
    type: 'consultation',
    title: 'Consulta de seguimiento - Diabetes e Hipertensión',
    description: 'Control rutinario de paciente con diabetes tipo 2 e hipertensión arterial',
    doctorNotes: 'Paciente en buen estado general. Glucemia controlada. TA ligeramente elevada, ajustar medicación.',
    diagnosis: 'Diabetes mellitus tipo 2 controlada. Hipertensión arterial en tratamiento.',
    treatment: 'Continuar con metformina. Aumentar dosis de enalapril a 20mg/día.',
    prescriptions: [
      {
        medication: 'Enalapril',
        dosage: '20mg',
        instructions: 'Tomar 1 comprimido cada 12 horas',
        duration: '30 días'
      }
    ]
  },
  {
    id: 'record-002',
    date: '2024-12-20',
    type: 'test_result',
    title: 'Resultados de laboratorio',
    description: 'Análisis completo de sangre y perfil lipídico',
    doctorNotes: 'Glucemia en ayunas 110 mg/dl. HbA1c 7.2%. Colesterol total 195 mg/dl.',
    attachments: ['lab_results_dec2024.pdf']
  },
  {
    id: 'record-003',
    date: '2024-11-15',
    type: 'diagnosis',
    title: 'Diagnóstico inicial - Diabetes tipo 2',
    description: 'Primera consulta por síntomas de polidipsia y poliuria',
    doctorNotes: 'Paciente presenta síntomas clásicos de diabetes. Glucemia 180 mg/dl.',
    diagnosis: 'Diabetes mellitus tipo 2 de reciente diagnóstico',
    treatment: 'Inicio de metformina 850mg cada 8 horas. Educación diabetológica.',
    prescriptions: [
      {
        medication: 'Metformina',
        dosage: '850mg',
        instructions: 'Tomar 1 comprimido cada 8 horas con las comidas',
        duration: '30 días'
      }
    ]
  }
];

const PatientDetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'medications' | 'vitals'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);

  useEffect(() => {
    // Simular carga de datos del paciente
    setTimeout(() => {
      setPatient(mockPatient);
      setMedicalRecords(mockMedicalRecords);
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getVitalStatus = (vital: string, value: number) => {
    switch (vital) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'warning';
        return 'normal';
      case 'temperature':
        if (value < 36 || value > 37.5) return 'warning';
        return 'normal';
      case 'oxygenSaturation':
        if (value < 95) return 'critical';
        if (value < 98) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'normal': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Paciente no encontrado</h2>
          <p className="text-gray-600 mb-4">El paciente que buscas no existe o no tienes acceso</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a pacientes
            </button>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowNewRecordModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Consulta
              </button>
            </div>
          </div>

          {/* Información básica del paciente */}
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{calculateAge(patient.dateOfBirth)} años</span>
                    <span>•</span>
                    <span>{patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}</span>
                    <span>•</span>
                    <span>Grupo sanguíneo: {patient.bloodType}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {patient.phone}
                    </span>
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {patient.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Última visita</div>
                <div className="font-medium">
                  {new Date(patient.lastVisit).toLocaleDateString('es-ES')}
                </div>
                {patient.nextAppointment && (
                  <>
                    <div className="text-sm text-gray-500 mt-2">Próxima cita</div>
                    <div className="font-medium text-primary-600">
                      {new Date(patient.nextAppointment).toLocaleDateString('es-ES')}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Alertas médicas */}
            {(patient.allergies.length > 0 || patient.chronicConditions.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  {patient.allergies.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        Alergias: {patient.allergies.join(', ')}
                      </span>
                    </div>
                  )}
                  {patient.chronicConditions.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700">
                        Condiciones crónicas: {patient.chronicConditions.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historial Médico
            </button>
            <button
              onClick={() => setActiveTab('medications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'medications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Medicamentos
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vitals'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Signos Vitales
            </button>
          </nav>
        </div>

        {/* Contenido de las tabs */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Signos vitales recientes */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold mb-4">Signos Vitales Recientes</h2>
                  {patient.vitalSigns.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(() => {
                        const latest = patient.vitalSigns[0];
                        return (
                          <>
                            <div className="text-center">
                              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">{latest.heartRate}</div>
                              <div className="text-sm text-gray-500">ppm</div>
                            </div>
                            <div className="text-center">
                              <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">{latest.bloodPressure}</div>
                              <div className="text-sm text-gray-500">mmHg</div>
                            </div>
                            <div className="text-center">
                              <Thermometer className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">{latest.temperature}°</div>
                              <div className="text-sm text-gray-500">Celsius</div>
                            </div>
                            <div className="text-center">
                              <Weight className="w-8 h-8 text-green-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">{latest.weight}</div>
                              <div className="text-sm text-gray-500">kg</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Historial médico reciente */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-lg font-semibold mb-4">Historial Reciente</h2>
                  <div className="space-y-4">
                    {medicalRecords.slice(0, 3).map((record) => (
                      <div key={record.id} className="border-l-4 border-primary-200 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{record.title}</h3>
                            <p className="text-sm text-gray-600">{record.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(record.date).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === 'consultation' ? 'bg-blue-100 text-blue-800' :
                            record.type === 'diagnosis' ? 'bg-red-100 text-red-800' :
                            record.type === 'treatment' ? 'bg-green-100 text-green-800' :
                            record.type === 'prescription' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.type === 'consultation' ? 'Consulta' :
                             record.type === 'diagnosis' ? 'Diagnóstico' :
                             record.type === 'treatment' ? 'Tratamiento' :
                             record.type === 'prescription' ? 'Receta' : 'Resultados'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel lateral */}
              <div className="space-y-6">
                {/* Información de contacto */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">{patient.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">{patient.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">{patient.email}</span>
                    </div>
                  </div>
                </div>

                {/* Contacto de emergencia */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Contacto de Emergencia</h3>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">{patient.emergencyContact.name}</span>
                      <span className="text-gray-500 ml-2">({patient.emergencyContact.relationship})</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{patient.emergencyContact.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Medicamentos actuales */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Medicamentos Actuales</h3>
                  <div className="space-y-3">
                    {patient.currentMedications.map((med, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-3">
                        <div className="font-medium text-sm">{med.name} {med.dosage}</div>
                        <div className="text-xs text-gray-600">{med.frequency}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Historial Médico Completo</h2>
                  <button
                    onClick={() => setShowNewRecordModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Entrada
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{record.title}</h3>
                          <p className="text-sm text-gray-600">{record.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(record.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.type === 'consultation' ? 'bg-blue-100 text-blue-800' :
                          record.type === 'diagnosis' ? 'bg-red-100 text-red-800' :
                          record.type === 'treatment' ? 'bg-green-100 text-green-800' :
                          record.type === 'prescription' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.type === 'consultation' ? 'Consulta' :
                           record.type === 'diagnosis' ? 'Diagnóstico' :
                           record.type === 'treatment' ? 'Tratamiento' :
                           record.type === 'prescription' ? 'Receta' : 'Resultados'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700">Notas del médico:</h4>
                          <p className="text-sm text-gray-600">{record.doctorNotes}</p>
                        </div>

                        {record.diagnosis && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700">Diagnóstico:</h4>
                            <p className="text-sm text-gray-600">{record.diagnosis}</p>
                          </div>
                        )}

                        {record.treatment && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700">Tratamiento:</h4>
                            <p className="text-sm text-gray-600">{record.treatment}</p>
                          </div>
                        )}

                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700">Prescripciones:</h4>
                            <div className="space-y-2">
                              {record.prescriptions.map((prescription, index) => (
                                <div key={index} className="bg-gray-50 rounded p-2">
                                  <div className="font-medium text-sm">{prescription.medication} - {prescription.dosage}</div>
                                  <div className="text-xs text-gray-600">{prescription.instructions}</div>
                                  <div className="text-xs text-gray-500">Duración: {prescription.duration}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.attachments && record.attachments.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700">Archivos adjuntos:</h4>
                            <div className="flex space-x-2">
                              {record.attachments.map((attachment, index) => (
                                <button
                                  key={index}
                                  className="flex items-center text-xs text-primary-600 hover:text-primary-700"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  {attachment}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Medicamentos</h2>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Prescripción
                </button>
              </div>

              <div className="space-y-4">
                {patient.currentMedications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Dosis:</span> {medication.dosage}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Frecuencia:</span> {medication.frequency}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Prescrito el {new Date(medication.prescribedDate).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Activo
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Signos Vitales</h2>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Signos
                </button>
              </div>

              <div className="space-y-6">
                {patient.vitalSigns.map((vitals, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {new Date(vitals.date).toLocaleDateString('es-ES')}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(vitals.date).toLocaleTimeString('es-ES')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="text-center">
                        <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                        <div className="text-lg font-bold">{vitals.heartRate}</div>
                        <div className="text-xs text-gray-500">ppm</div>
                        <div className={`mt-1 px-2 py-1 rounded-full text-xs ${getStatusColor(getVitalStatus('heartRate', vitals.heartRate))}`}>
                          {getVitalStatus('heartRate', vitals.heartRate)}
                        </div>
                      </div>

                      <div className="text-center">
                        <Activity className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                        <div className="text-lg font-bold">{vitals.bloodPressure}</div>
                        <div className="text-xs text-gray-500">mmHg</div>
                      </div>

                      <div className="text-center">
                        <Thermometer className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                        <div className="text-lg font-bold">{vitals.temperature}°</div>
                        <div className="text-xs text-gray-500">C</div>
                        <div className={`mt-1 px-2 py-1 rounded-full text-xs ${getStatusColor(getVitalStatus('temperature', vitals.temperature))}`}>
                          {getVitalStatus('temperature', vitals.temperature)}
                        </div>
                      </div>

                      <div className="text-center">
                        <Weight className="w-6 h-6 text-green-500 mx-auto mb-1" />
                        <div className="text-lg font-bold">{vitals.weight}</div>
                        <div className="text-xs text-gray-500">kg</div>
                      </div>

                      <div className="text-center">
                        <Ruler className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                        <div className="text-lg font-bold">{vitals.height}</div>
                        <div className="text-xs text-gray-500">cm</div>
                      </div>

                      <div className="text-center">
                        <Activity className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
                        <div className="text-lg font-bold">{vitals.oxygenSaturation}%</div>
                        <div className="text-xs text-gray-500">SpO2</div>
                        <div className={`mt-1 px-2 py-1 rounded-full text-xs ${getStatusColor(getVitalStatus('oxygenSaturation', vitals.oxygenSaturation))}`}>
                          {getVitalStatus('oxygenSaturation', vitals.oxygenSaturation)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para nueva consulta/registro (placeholder) */}
      {showNewRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">Nueva Consulta Médica</h3>
            <p className="text-gray-600 mb-6">
              Funcionalidad en desarrollo. Aquí podrás registrar una nueva consulta, diagnóstico o prescripción.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewRecordModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage;
