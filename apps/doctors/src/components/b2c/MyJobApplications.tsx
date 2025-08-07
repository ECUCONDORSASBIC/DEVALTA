/**
 * 👨‍⚕️ MY JOB APPLICATIONS - DOCTORS B2C
 * Componente para que los doctores vean y gestionen sus aplicaciones
 */

'use client'

import { useState, useEffect } from 'react'
import { useDoctorToCompanyCommunication, useUnreadNotificationsCount, useJobApplication } from '@altamedica/hooks'
import { JobApplication } from '@altamedica/types'

interface MyJobApplicationsProps {
  doctorId: string
}

export default function MyJobApplications({ doctorId }: MyJobApplicationsProps) {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [messageText, setMessageText] = useState('')

  // Hook principal B2C para doctores
  const {
    applications,
    interviews,
    notifications,
    submitApplication,
    sendMessage,
    isLoading,
    isError,
    error
  } = useDoctorToCompanyCommunication(doctorId)

  // Contador de notificaciones no leídas
  const unreadCount = useUnreadNotificationsCount(doctorId, 'doctor')

  // Hook para obtener detalles de aplicación específica
  const { 
    data: selectedApplicationDetails, 
    isLoading: loadingDetails 
  } = useJobApplication(selectedApplication?.id || '')

  // Manejar envío de nueva aplicación
  const handleSubmitApplication = async (applicationData: Partial<JobApplication>) => {
    try {
      await submitApplication(applicationData)
      setShowApplicationForm(false)
      
      // UI feedback
      alert('¡Aplicación enviada exitosamente!')
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error al enviar la aplicación. Intenta de nuevo.')
    }
  }

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!selectedApplication || !messageText.trim()) return

    try {
      await sendMessage(selectedApplication.id, messageText, 'text')
      setMessageText('')
      
      // Actualizar los detalles de la aplicación
      setSelectedApplication(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), {
          id: crypto.randomUUID(),
          applicationId: prev.id,
          senderId: doctorId,
          senderType: 'doctor' as const,
          content: messageText,
          type: 'text' as const,
          sentAt: new Date()
        }],
        lastMessageAt: new Date()
      } : null)
      
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Obtener color del badge según el status
  const getStatusBadgeColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Obtener texto del status
  const getStatusText = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending': return '⏳ Pendiente'
      case 'reviewing': return '👀 En revisión'
      case 'interview_scheduled': return '📅 Entrevista programada'
      case 'accepted': return '✅ Aceptada'
      case 'rejected': return '❌ Rechazada'
      case 'withdrawn': return '🔙 Retirada'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando tus aplicaciones...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error al cargar aplicaciones</h3>
        <p className="text-red-600 text-sm mt-1">
          {error?.message || 'Ha ocurrido un error inesperado'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Mis Aplicaciones de Trabajo
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona tus aplicaciones y comunícate con empresas
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Badge de notificaciones */}
          {unreadCount > 0 && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-2">
              <span className="text-blue-800 font-medium">
                🔔 {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Botón para nueva aplicación */}
          <button
            onClick={() => setShowApplicationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Nueva Aplicación
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium">Total Aplicaciones</h3>
          <p className="text-2xl font-bold text-blue-900">{applications.length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">En Proceso</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {applications.filter(app => ['pending', 'reviewing', 'interview_scheduled'].includes(app.status)).length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-purple-800 font-medium">Entrevistas</h3>
          <p className="text-2xl font-bold text-purple-900">{interviews.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-medium">Aceptadas</h3>
          <p className="text-2xl font-bold text-green-900">
            {applications.filter(app => app.status === 'accepted').length}
          </p>
        </div>
      </div>

      {/* Lista de aplicaciones */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Historial de Aplicaciones</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {applications.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <p className="text-gray-500 text-lg mb-2">No tienes aplicaciones aún</p>
              <p className="text-gray-400">¡Comienza aplicando a tu primer trabajo!</p>
              <button
                onClick={() => setShowApplicationForm(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Crear Primera Aplicación
              </button>
            </div>
          ) : (
            applications.map((application) => (
              <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Posición en {application.companyId}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ID de trabajo: {application.jobOfferId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>📅 Aplicado: {new Date(application.appliedAt).toLocaleDateString()}</span>
                      {application.reviewedAt && (
                        <span>👀 Revisado: {new Date(application.reviewedAt).toLocaleDateString()}</span>
                      )}
                      {application.interviewDate && (
                        <span>📅 Entrevista: {new Date(application.interviewDate).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Última actividad */}
                    {application.lastMessageAt && (
                      <div className="mt-2 text-xs text-blue-600">
                        💬 Último mensaje: {new Date(application.lastMessageAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Badge de estado */}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>

                    {/* Botón de mensaje */}
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      💬 Ver Detalles
                    </button>
                  </div>
                </div>

                {/* Preview del cover letter */}
                {application.coverLetter && (
                  <div className="mt-3 bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      <strong>Carta de presentación:</strong> {application.coverLetter}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de detalles de aplicación */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">
                  Detalles de Aplicación
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Estado y información básica */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeColor(selectedApplication.status)}`}>
                    {getStatusText(selectedApplication.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ID: {selectedApplication.id}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Empresa:</strong> {selectedApplication.companyId}
                  </div>
                  <div>
                    <strong>Trabajo:</strong> {selectedApplication.jobOfferId}
                  </div>
                  <div>
                    <strong>Aplicado:</strong> {new Date(selectedApplication.appliedAt).toLocaleString()}
                  </div>
                  {selectedApplication.expectedSalary && (
                    <div>
                      <strong>Salario esperado:</strong> {selectedApplication.expectedSalary.currency} {selectedApplication.expectedSalary.amount}
                    </div>
                  )}
                </div>
              </div>

              {/* Mensajes */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">💬 Conversación</h4>
                
                {selectedApplication.messages && selectedApplication.messages.length > 0 ? (
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {selectedApplication.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.senderType === 'doctor'
                            ? 'bg-blue-50 border border-blue-200 ml-4'
                            : 'bg-gray-50 border border-gray-200 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {message.senderType === 'doctor' ? '👨‍⚕️ Tú' : '🏢 Empresa'}
                          </span>
                          <span>{new Date(message.sentAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">💬</div>
                    <p>No hay mensajes aún</p>
                  </div>
                )}

                {/* Formulario para nuevo mensaje */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nueva aplicación (placeholder) */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">📝 Nueva Aplicación</h3>
              <div className="text-gray-400 text-6xl mb-4">🚧</div>
              <p className="text-gray-600 mb-4">
                El formulario de nueva aplicación estará disponible próximamente.
              </p>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="fixed bottom-4 right-4 bg-green-600 text-white rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Conectado con sistema B2C</span>
        </div>
      </div>
    </div>
  )
}