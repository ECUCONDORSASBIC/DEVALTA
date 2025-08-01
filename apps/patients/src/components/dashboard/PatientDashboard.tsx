'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePatientData } from '../../hooks/usePatientData';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import HealthSummaryCard from './cards/HealthSummaryCard';
import VitalSignsMonitor from './monitors/VitalSignsMonitor';
import MedicationTracker from './trackers/MedicationTracker';
import UpcomingAppointments from './appointments/UpcomingAppointments';
import LabResultsTrends from './lab/LabResultsTrends';
import EmergencyPanel from './emergency/EmergencyPanel';
import MedicalAlerts from './alerts/MedicalAlerts';
import QuickActions from './actions/QuickActions';
import PatientProfile from './profile/PatientProfile';
import ClinicalTimeline from './timeline/ClinicalTimeline';
import DocumentsManager from './documents/DocumentsManager';
import TeamCommunication from './communication/TeamCommunication';

interface PatientDashboardProps {
  patientId: string;
  viewMode?: 'complete' | 'summary' | 'emergency';
  locale?: string;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patientId,
  viewMode = 'complete',
  locale = 'es-MX'
}) => {
  // Estados principales
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Hook personalizado para datos del paciente
  const {
    patientData,
    vitalSigns,
    medications,
    appointments,
    labResults,
    medicalHistory,
    emergencyContacts,
    isLoading,
    error,
    refreshData
  } = usePatientData(patientId);

  // Actualizaciones en tiempo real
  const { subscribe, unsubscribe } = useRealTimeUpdates(patientId);

  // Configuración de navegación
  const navigationSections = [
    {
      id: 'overview',
      label: 'Resumen General',
      icon: '📊',
      priority: 1
    },
    {
      id: 'vitals',
      label: 'Signos Vitales',
      icon: '❤️',
      priority: 2,
      badge: vitalSigns?.hasAnomalies ? 'alert' : null
    },
    {
      id: 'medications',
      label: 'Medicamentos',
      icon: '💊',
      priority: 3,
      badge: medications?.pendingRefills || 0
    },
    {
      id: 'appointments',
      label: 'Citas Médicas',
      icon: '📅',
      priority: 4,
      badge: appointments?.upcoming || 0
    },
    {
      id: 'lab',
      label: 'Laboratorios',
      icon: '🔬',
      priority: 5,
      badge: labResults?.pending || 0
    },
    {
      id: 'history',
      label: 'Historial Clínico',
      icon: '📋',
      priority: 6
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: '📄',
      priority: 7
    },
    {
      id: 'emergency',
      label: 'Emergencia',
      icon: '🚨',
      priority: 8,
      urgent: true
    }
  ];

  // Efectos
  useEffect(() => {
    // Suscribirse a actualizaciones en tiempo real
    const subscriptionId = subscribe({
      onVitalSignsUpdate: (data) => {
        console.log('Actualización de signos vitales:', data);
      },
      onAlertReceived: (alert) => {
        if (alert.severity === 'critical') {
          setIsEmergencyMode(true);
        }
      }
    });

    return () => unsubscribe(subscriptionId);
  }, [subscribe, unsubscribe]);

  // Callbacks optimizados
  const handleEmergencyActivation = useCallback(() => {
    setIsEmergencyMode(true);
    setActiveSection('emergency');
    // Notificar al equipo médico
    notifyEmergencyTeam();
  }, []);

  const notifyEmergencyTeam = async () => {
    try {
      await fetch('/api/emergency/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          timestamp: new Date().toISOString(),
          type: 'dashboard_emergency_activation'
        })
      });
    } catch (error) {
      console.error('Error notificando emergencia:', error);
    }
  };

  // Renderizado condicional por estado
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Error al cargar el dashboard
            </h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={refreshData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isEmergencyMode ? 'bg-red-50' : 'bg-gray-50'
    }`}>
      {/* Header del Dashboard */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isEmergencyMode 
          ? 'bg-red-600 shadow-2xl' 
          : 'bg-white shadow-sm border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Información del Paciente */}
            <div className="flex items-center space-x-4">
              <PatientProfile 
                patient={patientData} 
                compact={true}
                emergencyMode={isEmergencyMode}
              />
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center space-x-3">
              {!isEmergencyMode && (
                <>
                  <QuickActions 
                    patientId={patientId}
                    onEmergency={handleEmergencyActivation}
                  />
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Ayuda"
                  >
                    <span className="text-xl">❓</span>
                  </button>
                </>
              )}
              
              {isEmergencyMode && (
                <button
                  onClick={() => setIsEmergencyMode(false)}
                  className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Salir de Emergencia
                </button>
              )}
            </div>
          </div>

          {/* Navegación de Secciones */}
          {!isEmergencyMode && (
            <nav className="flex space-x-1 overflow-x-auto pb-2 -mb-px">
              {navigationSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    relative flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-all
                    ${activeSection === section.id
                      ? 'bg-gray-100 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                    ${section.urgent ? 'text-red-600 hover:text-red-700' : ''}
                  `}
                >
                  <span className="mr-2 text-lg">{section.icon}</span>
                  <span>{section.label}</span>
                  {section.badge && (
                    <span className={`
                      ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${section.badge === 'alert' 
                        ? 'bg-red-100 text-red-800 animate-pulse' 
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {typeof section.badge === 'number' ? section.badge : '!'}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modo Emergencia */}
        {isEmergencyMode && (
          <EmergencyPanel
            patient={patientData}
            vitalSigns={vitalSigns}
            emergencyContacts={emergencyContacts}
            onDeactivate={() => setIsEmergencyMode(false)}
          />
        )}

        {/* Secciones del Dashboard */}
        {!isEmergencyMode && (
          <>
            {/* Resumen General */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Alertas Médicas */}
                <MedicalAlerts 
                  patientId={patientId}
                  onEmergencyTrigger={handleEmergencyActivation}
                />

                {/* Grid de Tarjetas Principales */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <HealthSummaryCard 
                      patient={patientData}
                      vitalSigns={vitalSigns}
                      medications={medications}
                    />
                  </div>
                  <div>
                    <VitalSignsMonitor 
                      vitalSigns={vitalSigns}
                      compact={true}
                      realTime={true}
                    />
                  </div>
                </div>

                {/* Sección Secundaria */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MedicationTracker 
                    medications={medications}
                    compact={true}
                  />
                  <UpcomingAppointments 
                    appointments={appointments}
                    compact={true}
                  />
                  <LabResultsTrends 
                    results={labResults}
                    compact={true}
                  />
                </div>

                {/* Timeline Clínico */}
                <ClinicalTimeline 
                  patientId={patientId}
                  limit={5}
                />
              </div>
            )}

            {/* Signos Vitales */}
            {activeSection === 'vitals' && (
              <VitalSignsMonitor 
                vitalSigns={vitalSigns}
                compact={false}
                realTime={true}
                showHistory={true}
                showTrends={true}
              />
            )}

            {/* Medicamentos */}
            {activeSection === 'medications' && (
              <MedicationTracker 
                medications={medications}
                compact={false}
                showSchedule={true}
                showInteractions={true}
              />
            )}

            {/* Citas Médicas */}
            {activeSection === 'appointments' && (
              <UpcomingAppointments 
                appointments={appointments}
                compact={false}
                showCalendar={true}
                allowScheduling={true}
              />
            )}

            {/* Resultados de Laboratorio */}
            {activeSection === 'lab' && (
              <LabResultsTrends 
                results={labResults}
                compact={false}
                showComparisons={true}
                showReports={true}
              />
            )}

            {/* Historial Clínico */}
            {activeSection === 'history' && (
              <ClinicalTimeline 
                patientId={patientId}
                showFilters={true}
                groupByType={true}
              />
            )}

            {/* Documentos */}
            {activeSection === 'documents' && (
              <DocumentsManager 
                patientId={patientId}
                allowUpload={true}
                showCategories={true}
              />
            )}

            {/* Panel de Emergencia */}
            {activeSection === 'emergency' && (
              <EmergencyPanel
                patient={patientData}
                vitalSigns={vitalSigns}
                emergencyContacts={emergencyContacts}
                previewMode={true}
              />
            )}
          </>
        )}

        {/* Comunicación con el Equipo */}
        {!isEmergencyMode && viewMode === 'complete' && (
          <div className="fixed bottom-4 right-4 z-40">
            <TeamCommunication 
              patientId={patientId}
              minimized={true}
            />
          </div>
        )}
      </main>

      {/* Tutorial Interactivo */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Guía del Dashboard de Pacientes
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>Bienvenido al Dashboard Profesional de Pacientes de Altamedica.</p>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Secciones Principales:</h3>
                <ul className="space-y-1 ml-4">
                  {navigationSections.map(section => (
                    <li key={section.id} className="flex items-center">
                      <span className="mr-2">{section.icon}</span>
                      <span>{section.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard; 