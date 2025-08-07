'use client';

import React, { useState } from 'react';
import MarketplaceMap from '../MarketplaceMap';
import { useMarketplaceNotifications } from '../../hooks/useMarketplac          <button
            onClick={() => setActiveView('applications')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeView === 'applications' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'
            }`}
              )}
          </div>
        )}
        
        {activeView === 'analytics' && (
          <MarketplaceAnalytics />
        )}
      </div>    >
            📋 Postulaciones
            <span className="block text-sm text-neutral-500">
              {[...extendedJobs, ...additionalJobs].reduce((sum, job) => sum + (job.applicants?.length || 0), 0)} candidatos
            </span>
          </button>
          
          <button
            onClick={() => setActiveView('analytics')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeView === 'analytics' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'
            }`}
          >
            📊 Analytics del Marketplace
            <span className="block text-sm text-neutral-500">Métricas y tendencias</span>
          </button>
          
          <button
            onClick={() => setShowMessaging(true)}
            className="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-neutral-50"
          >
            💬 Mensajería
            <span className="block text-sm text-neutral-500">
              {unreadCount > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs mr-1">{unreadCount}</span>}
              Conversaciones activas
            </span>
          </button>port { useMarketplace } from '@/contexts/MarketplaceContext';
import type { MarketplaceDoctor, MarketplaceCompany, JobOffer } from '@/contexts/MarketplaceContext';
import JobForm from './JobForm';
import MessagingSystem from './MessagingSystem';
import MarketplaceAnalytics from './MarketplaceAnalytics';

// Interfaz para postulantes (específica del dashboard)
interface Applicant {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  appliedDate: string;
  status: 'pending' | 'reviewing' | 'interviewed' | 'rejected' | 'accepted';
  resumeUrl?: string;
  profileUrl?: string;
}


export default function JobMarketplaceDashboard() {
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showFullJobForm, setShowFullJobForm] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null);
  
  // Hook del marketplace (estado compartido)
  const {
    doctors,
    companies,
    selectedDoctor,
    selectedCompany,
    selectedJob,
    activeView,
    setSelectedDoctor,
    setSelectedCompany,
    setSelectedJob,
    setActiveView,
    getFilteredDoctors,
    getFilteredCompanies,
  } = useMarketplace();
  
  // Hook de notificaciones del marketplace
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    sendNotification,
    markAsRead 
  } = useMarketplaceNotifications();


  // Obtener ofertas de trabajo de Hospital San Vicente (empresa actual)
  const hospitalSanVicente = companies.find(c => c.id === 'hospital-san-vicente-001');
  const myCompanyJobs = hospitalSanVicente?.jobs || [];
  
  // Datos filtrados para el mapa
  const filteredDoctors = getFilteredDoctors();
  const filteredCompanies = getFilteredCompanies().map(company => ({
    ...company,
    size: company.size || 'No especificado',
    companyType: company.companyType === 'laboratory' || company.companyType === 'other' 
      ? 'hospital' as const 
      : company.companyType
  }));
  
  // Combinar ofertas reales con mock para demostrar funcionalidad completa del dashboard
  const extendedJobs = [...myCompanyJobs].map(job => ({
    ...job,
    applicants: [] as Applicant[] // Se llenarán con datos reales de la API
  }));

  // Mock adicional de ofertas para demostrar funcionalidad del dashboard
  const additionalJobs: (JobOffer & { applicants?: Applicant[] })[] = [
    {
      id: "job1",
      companyId: "company1",
      title: "Cardiólogo Intervencionista",
      company: "Hospital Italiano",
      location: "Buenos Aires, Argentina",
      specialty: "Cardiología",
      type: "job",
      salary: "USD 8,000 - 12,000",
      postedDate: "2025-01-15",
      applications: 12,
      rating: 4.9,
      urgent: true,
      status: 'active',
      description: "Buscamos cardiólogo especializado en procedimientos intervencionistas.",
      requirements: ["Especialidad en Cardiología", "5 años experiencia"],
      benefits: ["Seguro médico familiar", "Capacitación continua"],
      experience: "5-10 años",
      schedule: "Tiempo completo",
      remote: false,
      applicants: [
        {
          id: "app1",
          name: "Dr. Carlos Mendez",
          specialty: "Cardiología",
          experience: 10,
          rating: 4.8,
          appliedDate: "2025-01-20",
          status: "reviewing"
        },
        {
          id: "app2",
          name: "Dra. Ana Rodriguez",
          specialty: "Cardiología",
          experience: 8,
          rating: 4.7,
          appliedDate: "2025-01-22",
          status: "pending"
        }
      ]
    },
    {
      id: "job2",
      companyId: "company1",
      title: "Pediatra - Telemedicina",
      company: "Hospital Italiano",
      location: "Remoto - LATAM",
      specialty: "Pediatría",
      type: "contract",
      salary: "USD 50-80/hora",
      postedDate: "2025-01-20",
      applications: 8,
      rating: 4.8,
      status: 'active',
      description: "Pediatra para consultas remotas.",
      requirements: ["Especialidad en Pediatría", "Experiencia en telemedicina"],
      benefits: ["Horario flexible", "100% remoto"],
      experience: "2-5 años",
      schedule: "Medio tiempo",
      remote: true,
      applicants: []
    }
  ];

  return (
    <div className={`flex h-[calc(100vh-120px)] ${(selectedDoctor || selectedCompany) ? 'pr-96' : ''} transition-all duration-300`}>
      {/* Barra lateral de navegación */}
      <div className="w-64 bg-white border-r border-neutral-200 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Portal de Empleo</h2>
          <button 
            onClick={() => setShowFullJobForm(true)}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            ➕ Publicar Nueva Oferta
          </button>
        </div>
        
        <nav className="space-y-1">
          <button
            onClick={() => setActiveView('marketplace')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeView === 'marketplace' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'
            }`}
          >
            🗺️ Mapa del Marketplace
            <span className="block text-sm text-neutral-500">Buscar talento médico</span>
          </button>
          
          <button
            onClick={() => setActiveView('jobs')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeView === 'jobs' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'
            }`}
          >
            💼 Mis Ofertas de Trabajo
            <span className="block text-sm text-neutral-500">{extendedJobs.length} ofertas activas</span>
          </button>
          
          <button
            onClick={() => setActiveView('analytics')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeView === 'analytics' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'
            }`}
          >
            � Analytics del Marketplace
            <span className="block text-sm text-neutral-500">Métricas y tendencias</span>
          </button>
          
          <button
            onClick={() => setShowMessaging(true)}
            className="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-neutral-50"
          >
            💬 Mensajería
            <span className="block text-sm text-neutral-500">
              {unreadCount > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs mr-1">{unreadCount}</span>}
              Conversaciones activas
            </span>
          </button>
        </nav>
        
        <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
          <h3 className="font-medium mb-2">Estadísticas Rápidas</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Ofertas activas:</span>
              <span className="font-medium">{extendedJobs.filter(j => j.status === 'active').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Total postulantes:</span>
              <span className="font-medium">
                {[...extendedJobs, ...additionalJobs].reduce((sum, job) => sum + (job.applicants?.length || 0), 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Posiciones urgentes:</span>
              <span className="font-medium text-alert-600">
                {extendedJobs.filter(j => j.urgent).length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Notificaciones del Marketplace */}
        <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-primary-800">Notificaciones</h3>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-alert-500'}`}></div>
              <span className="text-xs text-primary-600">{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-primary-700">Sin leer:</span>
              <span className="font-medium text-primary-800">
                {unreadCount > 0 ? (
                  <span className="bg-alert-500 text-white px-2 py-1 rounded-full text-xs">
                    {unreadCount}
                  </span>
                ) : (
                  '0'
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-700">Total notificaciones:</span>
              <span className="font-medium text-primary-800">{notifications.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 bg-neutral-50 overflow-hidden">
        {activeView === 'jobs' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Mis Ofertas de Trabajo</h2>
            
            <div className="grid gap-4">
              {[...extendedJobs, ...additionalJobs].map(job => (
                <div key={job.id} className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <p className="text-neutral-600">{job.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.urgent && (
                        <span className="px-3 py-1 bg-alert-100 text-alert-700 rounded-full text-sm font-medium">
                          🚨 Urgente
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === 'active' ? 'bg-success-100 text-success-700' : 
                        job.status === 'paused' ? 'bg-alert-100 text-alert-700' : 
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {job.status === 'active' ? '✅ Activa' : 
                         job.status === 'paused' ? '⏸️ Pausada' : '🔒 Cerrada'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-neutral-500">Especialidad</span>
                      <p className="font-medium">{job.specialty}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Salario</span>
                      <p className="font-medium text-success-600">{job.salary}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Modalidad</span>
                      <p className="font-medium">{job.remote ? '🏠 Remoto' : '🏥 Presencial'}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Postulaciones</span>
                      <p className="font-medium">{job.applicants?.length || 0} candidatos</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedJob(job)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Ver Postulantes
                    </button>
                    <button 
                      onClick={() => setEditingJob(job)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Editar Oferta
                    </button>
                    <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                      {job.status === 'active' ? 'Pausar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeView === 'marketplace' && (
          <div className="h-full">
            <div className="p-6 pb-0">
              <h2 className="text-2xl font-bold mb-4">Mapa del Marketplace Médico</h2>
              <p className="text-neutral-600 mb-6">Explora médicos disponibles y empresas del sector salud</p>
            </div>
            <div className="h-[calc(100%-120px)]">
              <MarketplaceMap 
                doctors={filteredDoctors}
                companies={filteredCompanies}
                showDoctors={true}
                showCompanies={true}
                mode="hiring"
                onDoctorSelect={(doctor) => {
                  setSelectedDoctor(doctor);
                  console.log('Doctor seleccionado:', doctor);
                }}
                onCompanySelect={(company) => {
                  setSelectedCompany(company as any);
                  console.log('Empresa seleccionada:', company);
                }}
              />
            </div>
          </div>
        )}
        
        {activeView === 'applications' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Gestión de Postulaciones</h2>
            
            {[...extendedJobs, ...additionalJobs].filter(job => job.applicants && job.applicants.length > 0).map(job => (
              <div key={job.id} className="mb-8">
                <h3 className="text-lg font-semibold mb-4">
                  {job.title} - {job.applicants?.length} postulantes
                </h3>
                
                <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Candidato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Especialidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Experiencia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Calificación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {job.applicants?.map(applicant => (
                        <tr key={applicant.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-900">{applicant.name}</div>
                            <div className="text-sm text-neutral-500">Aplicó: {applicant.appliedDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {applicant.specialty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {applicant.experience} años
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-yellow-400">⭐</span>
                              <span className="ml-1 text-sm text-neutral-900">{applicant.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              applicant.status === 'pending' ? 'bg-alert-100 text-alert-800' :
                              applicant.status === 'reviewing' ? 'bg-primary-100 text-primary-800' :
                              applicant.status === 'interviewed' ? 'bg-primary-100 text-primary-800' :
                              applicant.status === 'accepted' ? 'bg-success-100 text-success-800' :
                              'bg-alert-100 text-alert-800'
                            }`}>
                              {applicant.status === 'pending' ? 'Pendiente' :
                               applicant.status === 'reviewing' ? 'En revisión' :
                               applicant.status === 'interviewed' ? 'Entrevistado' :
                               applicant.status === 'accepted' ? 'Aceptado' :
                               'Rechazado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-3">
                              Ver Perfil
                            </button>
                            <button className="text-success-600 hover:text-success-900">
                              Contactar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Panel de detalles deslizable */}
      {(selectedDoctor || selectedCompany) && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-neutral-200 shadow-lg transform translate-x-0 transition-transform z-40">
          <div className="h-full flex flex-col">
            <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedDoctor ? 'Detalles del Médico' : 'Detalles de la Empresa'}
              </h3>
              <button 
                onClick={() => {
                  setSelectedDoctor(null);
                  setSelectedCompany(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {selectedDoctor && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    <h4 className="text-xl font-semibold">{selectedDoctor.name}</h4>
                    <p className="text-neutral-600">{selectedDoctor.specialties.join(', ')}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="font-medium">{selectedDoctor.rating}</span>
                      <span className="text-sm text-neutral-500">({selectedDoctor.totalHires} contrataciones)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <p className="text-sm text-neutral-600 mb-1">Tarifa por hora</p>
                      <p className="text-lg font-semibold text-success-600">${selectedDoctor.hourlyRate}</p>
                    </div>
                    
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <p className="text-sm text-neutral-600 mb-1">Experiencia</p>
                      <p className="font-medium">{selectedDoctor.experience} años</p>
                    </div>
                    
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <p className="text-sm text-neutral-600 mb-1">Modalidad</p>
                      <p className="font-medium capitalize">{selectedDoctor.workArrangement}</p>
                    </div>
                    
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <p className="text-sm text-neutral-600 mb-1">Estado</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${selectedDoctor.isOnline ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm">{selectedDoctor.isOnline ? 'En línea' : 'Desconectado'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-neutral-600 mb-2">Idiomas</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedDoctor.languages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                      Contactar Médico
                    </button>
                  </div>
                </div>
              )}
              
              {selectedCompany && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-success-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">🏥</span>
                    </div>
                    <h4 className="text-xl font-semibold">{selectedCompany.name}</h4>
                    <p className="text-neutral-600">{selectedCompany.location.city}, {selectedCompany.location.country}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="font-medium">{selectedCompany.rating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary-600">{selectedCompany.activeJobs}</p>
                      <p className="text-sm text-neutral-600">Ofertas activas</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-alert-600">{selectedCompany.urgentJobs}</p>
                      <p className="text-sm text-neutral-600">Urgentes</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <p className="text-sm text-neutral-600 mb-1">Tiempo de respuesta</p>
                      <p className="font-medium">{selectedCompany.averageResponseTime} horas</p>
                    </div>
                    
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <p className="text-sm text-neutral-600 mb-1">Total contrataciones</p>
                      <p className="font-medium">{selectedCompany.totalHires}</p>
                    </div>
                  </div>
                  
                  {selectedCompany.jobs && selectedCompany.jobs.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Últimas ofertas:</h5>
                      <div className="space-y-2">
                        {selectedCompany.jobs.slice(0, 3).map((job) => (
                          <div key={job.id} className="p-3 bg-neutral-50 rounded-lg">
                            <p className="font-medium text-sm">{job.title}</p>
                            <p className="text-xs text-neutral-600">{job.specialty}</p>
                            <p className="text-xs text-success-600 mt-1">{job.salary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <button className="w-full bg-success-600 text-white py-2 px-4 rounded-lg hover:bg-success-700 transition-colors">
                      Ver Todas las Ofertas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Sistema de Mensajería */}
      {showMessaging && (
        <MessagingSystem onClose={() => setShowMessaging(false)} />
      )}
      
      {/* Formulario completo de Job */}
      {showFullJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <JobForm
              onSubmit={(data) => {
                console.log('Nueva oferta creada:', data);
                // Aquí se enviaría al backend
                setShowFullJobForm(false);
              }}
              onCancel={() => setShowFullJobForm(false)}
            />
          </div>
        </div>
      )}
      
      {/* Formulario de edición de Job */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <JobForm
              onSubmit={(data) => {
                console.log('Oferta actualizada:', data);
                // Aquí se enviaría al backend
                setEditingJob(null);
              }}
              onCancel={() => setEditingJob(null)}
              initialData={{
                title: editingJob.title,
                specialty: editingJob.specialty,
                description: editingJob.description,
                requirements: editingJob.requirements,
                benefits: editingJob.benefits,
                location: editingJob.location,
                remote: editingJob.remote,
                type: editingJob.type,
                schedule: editingJob.schedule,
                experience: editingJob.experience,
                urgent: editingJob.urgent,
                // Parsear salario del string a objeto
                salary: {
                  min: 8000,
                  max: 12000,
                  currency: 'USD' as const,
                  period: 'month' as const
                },
                contactInfo: {
                  email: 'rrhh@hospitalsanvicente.com',
                  phone: '+54 11 1234-5678',
                  contactPerson: 'Dr. María González'
                },
                applicationDeadline: '2025-08-31',
                startDate: '2025-09-15'
              }}
              isEditing={true}
            />
          </div>
        </div>
      )}
      
      {/* Modal para crear nueva oferta */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Publicar Nueva Oferta de Trabajo</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Título del puesto</label>
                <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Especialidad</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Cardiología</option>
                  <option>Pediatría</option>
                  <option>Oncología</option>
                  <option>Neurología</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Salario</label>
                  <input type="text" placeholder="USD 8,000 - 12,000" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Modalidad</label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                    <option>Presencial</option>
                    <option>Remoto</option>
                    <option>Híbrido</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
                <textarea rows={4} className="w-full px-3 py-2 border border-neutral-300 rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowCreateJobModal(false);
                    setShowFullJobForm(true);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Usar Formulario Completo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}