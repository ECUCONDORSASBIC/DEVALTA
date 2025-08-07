"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@altamedica/auth';
// Importación desde @altamedica/ui centralizado
import {
  CardCorporate,
  CardHeaderCorporate,
  CardContentCorporate,
  ButtonCorporate
} from "@altamedica/ui";
import { Video, Clock, User, Calendar, Phone, Settings } from "lucide-react";

// Mock data para pacientes
const mockPatientSessions = [
  {
    id: "session-001",
    doctorName: "Dr. García Martínez",
    specialty: "Cardiología",
    scheduledTime: "2025-02-05 10:30",
    status: "scheduled",
    type: "follow-up",
    duration: 30,
    notes: "Control de presión arterial"
  },
  {
    id: "session-002",
    doctorName: "Dra. López Hernández",
    specialty: "Neurología",
    scheduledTime: "2025-02-12 15:00",
    status: "active",
    type: "consultation",
    duration: 45,
    notes: "Seguimiento de migrañas"
  }
];

export default function TelemedicinePage() {
  const router = useRouter();
  const { authState } = useAuth();
  const [sessions, setSessions] = useState(mockPatientSessions);
  const [loading, setLoading] = useState(false);
  
  const activeSession = sessions.find(s => s.status === "active");
  const upcomingSessions = sessions.filter(s => s.status === "scheduled");
  const recentSessions = sessions.filter(s => s.status === "completed");

  const handleJoinSession = (sessionId: string) => {
    router.push(`/telemedicine/room/${sessionId}`);
  };

  const handleTestVideo = () => {
    router.push("/telemedicine/test");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Telemedicina</h1>
              <p className="text-gray-600">Tus consultas médicas virtuales</p>
            </div>
            <div className="flex space-x-3">
              <ButtonCorporate
                variant="secondary"
                size="sm"
                onClick={handleTestVideo}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Probar Video</span>
              </ButtonCorporate>
              
              <ButtonCorporate
                variant="primary"
                size="sm"
                onClick={() => router.push("/appointments/new")}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Consulta</span>
              </ButtonCorporate>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Sesión Activa */}
        {activeSession && (
          <div className="mb-8">
            <CardCorporate variant="emergency" size="lg" className="border-green-200 bg-green-50">
              <CardHeaderCorporate title="Consulta en Curso">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">ACTIVA</span>
                </div>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-lg">
                      <User className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {activeSession.doctorName}
                      </h3>
                      <p className="text-gray-600">{activeSession.specialty}</p>
                      <p className="text-sm text-gray-500">{activeSession.notes}</p>
                    </div>
                  </div>
                  <ButtonCorporate
                    variant="success"
                    size="lg"
                    onClick={() => handleJoinSession(activeSession.id)}
                    className="flex items-center space-x-2"
                  >
                    <Video className="w-5 h-5" />
                    <span>Unirse a la Consulta</span>
                  </ButtonCorporate>
                </div>
              </CardContentCorporate>
            </CardCorporate>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Próximas Consultas */}
          <div>
            <CardCorporate variant="default" size="lg">
              <CardHeaderCorporate title="Próximas Consultas">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Próximas Consultas</h2>
                  <span className="text-sm text-gray-500">
                    {upcomingSessions.length} programadas
                  </span>
                </div>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-6">
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {session.doctorName}
                              </h4>
                              <p className="text-sm text-gray-600">{session.specialty}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            Programada
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.scheduledTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Video className="w-4 h-4" />
                            <span>{session.duration} min</span>
                          </div>
                        </div>
                        
                        {session.notes && (
                          <p className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded">
                            {session.notes}
                          </p>
                        )}
                        
                        <div className="flex space-x-2">
                          <ButtonCorporate
                            variant="primary"
                            size="sm"
                            onClick={() => handleJoinSession(session.id)}
                            className="flex items-center space-x-1"
                          >
                            <Video className="w-4 h-4" />
                            <span>Unirse</span>
                          </ButtonCorporate>
                          
                          <ButtonCorporate
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/appointments/${session.id}`)}
                            className="flex items-center space-x-1"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Ver Detalles</span>
                          </ButtonCorporate>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">No tienes consultas programadas</p>
                    <ButtonCorporate
                      variant="primary"
                      onClick={() => router.push("/appointments/new")}
                    >
                      Agendar Consulta Virtual
                    </ButtonCorporate>
                  </div>
                )}
              </CardContentCorporate>
            </CardCorporate>
          </div>

          {/* Accesos Rápidos */}
          <div>
            <CardCorporate variant="default" size="lg">
              <CardHeaderCorporate title="Herramientas de Telemedicina">
                <h2 className="text-lg font-medium text-gray-900">Herramientas</h2>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-6">
                <div className="space-y-4">
                  {/* Test de Video */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Probar Conexión</h4>
                        <p className="text-sm text-gray-600">Verifica tu cámara y micrófono</p>
                      </div>
                    </div>
                    <ButtonCorporate
                      variant="secondary"
                      size="sm"
                      onClick={handleTestVideo}
                      className="w-full"
                    >
                      Hacer Prueba de Video
                    </ButtonCorporate>
                  </div>

                  {/* Contacto de Emergencia */}
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Phone className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-red-900">Emergencia Médica</h4>
                        <p className="text-sm text-red-700">Contacto directo 24/7</p>
                      </div>
                    </div>
                    <ButtonCorporate
                      variant="danger"
                      size="sm"
                      onClick={() => window.open("tel:+541122334455")}
                      className="w-full"
                    >
                      Llamar Emergencias
                    </ButtonCorporate>
                  </div>

                  {/* Historial */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Consultas Anteriores</h4>
                        <p className="text-sm text-gray-600">Ver historial de videollamadas</p>
                      </div>
                    </div>
                    <ButtonCorporate
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/medical-history")}
                      className="w-full"
                    >
                      Ver Historial
                    </ButtonCorporate>
                  </div>
                </div>
              </CardContentCorporate>
            </CardCorporate>
          </div>
        </div>
      </div>
    </div>
  );
}
