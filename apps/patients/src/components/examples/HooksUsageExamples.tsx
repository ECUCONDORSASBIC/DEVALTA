/**
 * Ejemplos de Uso de Hooks Integrados
 * Demuestra cómo usar los hooks del backend dockerizado en componentes
 */

'use client';

import React, { useState } from 'react';
import {
  // Hooks de pacientes
  usePatients,
  usePatient,
  useCreatePatient,
  usePatientsManager,
  
  // Hooks de citas
  useUpcomingAppointments,
  useCreateAppointment,
  useDoctors,
  
  // Hooks de registros médicos
  useActivePrescriptions,
  useMedicalSummary,
  useCreateMedicalRecord,
  
  // Hooks de telemedicina
  useJoinTelemedicineSession,
  useTelemedicineManager,
  
  // Hook maestro y conectividad
  useIntegratedDashboard,
  useBackendConnectivity,
  
  // Tipos
  type CreatePatientRequest,
  type CreateAppointmentRequest,
  type JoinSessionRequest
} from '../../hooks/useIntegratedServices';

const HooksUsageExamples: React.FC = () => {
  const [currentPatientId, setCurrentPatientId] = useState<string>('patient-123');
  const [showExample, setShowExample] = useState<string>('patients');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ejemplos de Uso - Hooks Integrados
        </h1>
        <p className="text-gray-600">
          Demuestra cómo usar los hooks del backend dockerizado
        </p>
      </div>

      {/* Selector de ejemplos */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'patients', label: 'Pacientes' },
            { id: 'appointments', label: 'Citas' },
            { id: 'medical', label: 'Registros Médicos' },
            { id: 'telemedicine', label: 'Telemedicina' },
            { id: 'dashboard', label: 'Dashboard Integrado' },
            { id: 'connectivity', label: 'Conectividad' }
          ].map((example) => (
            <button
              key={example.id}
              onClick={() => setShowExample(example.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showExample === example.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ejemplo 1: Gestión de Pacientes */}
      {showExample === 'patients' && <PatientsExample />}

      {/* Ejemplo 2: Gestión de Citas */}
      {showExample === 'appointments' && <AppointmentsExample patientId={currentPatientId} />}

      {/* Ejemplo 3: Registros Médicos */}
      {showExample === 'medical' && <MedicalRecordsExample patientId={currentPatientId} />}

      {/* Ejemplo 4: Telemedicina */}
      {showExample === 'telemedicine' && <TelemedicineExample patientId={currentPatientId} />}

      {/* Ejemplo 5: Dashboard Integrado */}
      {showExample === 'dashboard' && <DashboardExample patientId={currentPatientId} />}

      {/* Ejemplo 6: Conectividad */}
      {showExample === 'connectivity' && <ConnectivityExample />}
    </div>
  );
};

// Ejemplo 1: Gestión de Pacientes
const PatientsExample: React.FC = () => {
  // Hook para obtener lista de pacientes
  const { data: patients, isLoading, error, refetch } = usePatients(1, 5);
  
  // Hook para gestión completa de pacientes
  const {
    createPatient,
    updatePatient,
    deletePatient,
    isCreating,
    isUpdating,
    isDeleting,
    createError
  } = usePatientsManager();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<CreatePatientRequest>>({});

  const handleCreatePatient = async () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.email) {
      alert('Por favor, completa los campos requeridos');
      return;
    }

    try {
      await createPatient.mutateAsync(newPatient as CreatePatientRequest);
      setNewPatient({});
      setShowCreateForm(false);
      alert('¡Paciente creado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📋 Gestión de Pacientes</h2>
      
      <div className="space-y-4">
        {/* Estado de carga */}
        {isLoading && (
          <div className="text-blue-600">⏳ Cargando pacientes...</div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-800">❌ Error: {error.message}</p>
            <button 
              onClick={() => refetch()}
              className="text-red-600 underline text-sm mt-2"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de pacientes */}
        {patients && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                Lista de Pacientes ({patients.total} total)
              </h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ➕ Nuevo Paciente
              </button>
            </div>

            {/* Formulario de creación */}
            {showCreateForm && (
              <div className="bg-gray-50 border rounded p-4 mb-4">
                <h4 className="font-medium mb-3">Crear Nuevo Paciente</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newPatient.firstName || ''}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, firstName: e.target.value }))}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={newPatient.lastName || ''}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, lastName: e.target.value }))}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newPatient.email || ''}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="date"
                    value={newPatient.dateOfBirth || ''}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="border rounded px-3 py-2"
                  />
                </div>
                
                {createError && (
                  <p className="text-red-600 text-sm mt-2">
                    Error: {createError.message}
                  </p>
                )}
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleCreatePatient}
                    disabled={isCreating}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isCreating ? 'Creando...' : '✅ Crear'}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de pacientes */}
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Edad</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.patients.map((patient) => (
                    <tr key={patient.id} className="border-t">
                      <td className="px-4 py-2 font-medium">{patient.name}</td>
                      <td className="px-4 py-2">{patient.email}</td>
                      <td className="px-4 py-2">{patient.age}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          patient.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Ejemplo 2: Gestión de Citas
const AppointmentsExample: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { data: appointments, isLoading } = useUpcomingAppointments(patientId);
  const { data: doctors } = useDoctors();
  const createAppointment = useCreateAppointment();

  const handleQuickBooking = async () => {
    if (!doctors?.doctors.length) return;

    const appointmentData: CreateAppointmentRequest = {
      patientId,
      doctorId: doctors.doctors[0].id,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // mañana
      time: '10:00',
      type: 'consultation',
      reason: 'Consulta de ejemplo'
    };

    try {
      await createAppointment.mutateAsync(appointmentData);
      alert('¡Cita agendada para mañana!');
    } catch (error) {
      alert('Error al agendar cita');
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📅 Gestión de Citas</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Próximas Citas</h3>
          <button
            onClick={handleQuickBooking}
            disabled={createAppointment.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createAppointment.isPending ? 'Agendando...' : '⚡ Agendar Rápido'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-blue-600">⏳ Cargando citas...</div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-2">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded p-3">
                <div className="font-medium">Dr. {appointment.doctorName}</div>
                <div className="text-sm text-gray-600">
                  {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                </div>
                <div className="text-sm text-gray-500">{appointment.reason}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay citas próximas</p>
        )}
      </div>
    </div>
  );
};

// Ejemplo 3: Registros Médicos
const MedicalRecordsExample: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { data: prescriptions, isLoading } = useActivePrescriptions(patientId);
  const { data: summary } = useMedicalSummary(patientId);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🏥 Registros Médicos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prescripciones activas */}
        <div>
          <h3 className="font-medium mb-3">💊 Prescripciones Activas</h3>
          {isLoading ? (
            <div className="text-blue-600">⏳ Cargando...</div>
          ) : prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-2">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded p-3">
                  <div className="font-medium">
                    {prescription.medications.length} medicamentos
                  </div>
                  <div className="text-sm text-gray-600">
                    Emitida: {new Date(prescription.issueDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    Estado: <span className="text-green-600">{prescription.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay prescripciones activas</p>
          )}
        </div>

        {/* Resumen médico */}
        <div>
          <h3 className="font-medium mb-3">📊 Resumen Médico</h3>
          {summary ? (
            <div className="space-y-3">
              <div>
                <span className="font-medium">Alergias:</span>
                <div className="text-sm text-gray-600">
                  {summary.allergies.length > 0 
                    ? summary.allergies.join(', ')
                    : 'No registradas'
                  }
                </div>
              </div>
              
              <div>
                <span className="font-medium">Condiciones Crónicas:</span>
                <div className="text-sm text-gray-600">
                  {summary.chronicConditions.length > 0 
                    ? summary.chronicConditions.join(', ')
                    : 'Ninguna'
                  }
                </div>
              </div>
              
              <div>
                <span className="font-medium">Última Actualización:</span>
                <div className="text-sm text-gray-600">
                  {new Date(summary.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Cargando resumen...</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Ejemplo 4: Telemedicina
const TelemedicineExample: React.FC<{ patientId: string }> = ({ patientId }) => {
  const {
    joinSession,
    endSession,
    sendMessage,
    isJoining,
    isEnding,
    isSendingMessage
  } = useTelemedicineManager();

  const handleJoinSession = async () => {
    const sessionData: JoinSessionRequest = {
      patientId,
      doctorId: 'doctor-123',
      sessionType: 'video'
    };

    try {
      const result = await joinSession.mutateAsync(sessionData);
      alert(`¡Sesión creada! ID: ${result.sessionId}`);
    } catch (error) {
      alert('Error al unirse a la sesión');
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">💻 Telemedicina</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={handleJoinSession}
            disabled={isJoining}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isJoining ? 'Conectando...' : '🎥 Unirse a Sesión'}
          </button>
          
          <button
            onClick={() => sendMessage.mutate({
              sessionId: 'session-123',
              message: 'Hola doctor',
              senderId: patientId
            })}
            disabled={isSendingMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSendingMessage ? 'Enviando...' : '💬 Chat'}
          </button>
        </div>

        {joinSession.data && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h4 className="font-medium text-green-800">✅ Sesión Activa</h4>
            <p className="text-green-700">ID: {joinSession.data.sessionId}</p>
            <p className="text-green-700">Sala: {joinSession.data.roomId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Ejemplo 5: Dashboard Integrado
const DashboardExample: React.FC<{ patientId: string }> = ({ patientId }) => {
  const dashboardData = useIntegratedDashboard(patientId);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🎛️ Dashboard Integrado</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Estado del Dashboard</h3>
          <button
            onClick={dashboardData.refetchAll}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔄 Actualizar Todo
          </button>
        </div>

        {dashboardData.isLoading ? (
          <div className="text-blue-600">⏳ Cargando dashboard completo...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.upcomingAppointments?.length || 0}
              </div>
              <div className="text-sm text-blue-800">Próximas Citas</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {dashboardData.activePrescriptions?.length || 0}
              </div>
              <div className="text-sm text-green-800">Prescripciones</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData.medicalRecords?.length || 0}
              </div>
              <div className="text-sm text-purple-800">Registros</div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.sessionHistory?.length || 0}
              </div>
              <div className="text-sm text-orange-800">Telemedicina</div>
            </div>
          </div>
        )}

        {dashboardData.patient && (
          <div className="bg-gray-50 border rounded p-4">
            <h4 className="font-medium mb-2">👤 Información del Paciente</h4>
            <p><strong>Nombre:</strong> {dashboardData.patient.name}</p>
            <p><strong>Email:</strong> {dashboardData.patient.email}</p>
            <p><strong>Edad:</strong> {dashboardData.patient.age} años</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Ejemplo 6: Conectividad
const ConnectivityExample: React.FC = () => {
  const {
    isHealthy,
    healthData,
    serverStatus,
    isCheckingHealth,
    healthError,
    refetchHealth
  } = useBackendConnectivity();

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🔌 Estado de Conectividad</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              Backend: {isHealthy ? '✅ Conectado' : '❌ Desconectado'}
            </span>
          </div>
          
          <button
            onClick={() => refetchHealth()}
            disabled={isCheckingHealth}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCheckingHealth ? 'Verificando...' : '🔄 Verificar'}
          </button>
        </div>

        {healthError && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-800">❌ Error de conexión: {healthError.message}</p>
            <p className="text-red-600 text-sm mt-1">
              Verifica que el backend esté ejecutándose en http://localhost:3001
            </p>
          </div>
        )}

        {healthData && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <h4 className="font-medium text-green-800 mb-2">✅ Health Check</h4>
            <pre className="text-sm text-green-700 bg-green-100 p-2 rounded overflow-auto">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}

        {serverStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h4 className="font-medium text-blue-800 mb-2">📊 Estado del Servidor</h4>
            <pre className="text-sm text-blue-700 bg-blue-100 p-2 rounded overflow-auto">
              {JSON.stringify(serverStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default HooksUsageExamples;