"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WebRTCVideoCall from "../../../../components/telemedicine/WebRTCVideoCall";
import ChatPanel from "../../../../components/telemedicine/ChatPanel";
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare,
  FileText,
  Shield,
  AlertCircle
} from "lucide-react";

interface TelemedicineSession {
  id: string;
  roomId: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'waiting' | 'active' | 'ended';
  notes?: string;
}

export default function WebRTCTelemedicinePage({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = params;
  const router = useRouter();
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userType, setUserType] = useState<'doctor' | 'patient'>('patient');

  // Cargar sesión de telemedicina
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        
        // En producción, esto vendría de la API
        const mockSession: TelemedicineSession = {
          id: 'session-1',
          roomId,
          doctorId: 'doctor-123',
          patientId: 'patient-456',
          doctorName: 'Dr. María García',
          patientName: 'Carlos Rodríguez',
          specialty: 'Cardiología',
          date: new Date().toLocaleDateString('es-ES'),
          time: new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'waiting',
          notes: 'Consulta de seguimiento cardiológico'
        };

        setSession(mockSession);
        
        // Determinar tipo de usuario (en producción vendría del contexto de auth)
        const storedUserType = localStorage.getItem('userType') as 'doctor' | 'patient';
        const storedUserId = localStorage.getItem('userId');
        
        if (storedUserType && storedUserId) {
          setUserType(storedUserType);
          setCurrentUserId(storedUserId);
        } else {
          // Fallback para desarrollo
          setUserType('patient');
          setCurrentUserId('patient-456');
        }

      } catch (err) {
        setError('Error al cargar la sesión de telemedicina');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [roomId]);

  // Manejar fin de llamada
  const handleEndCall = () => {
    setSession(prev => prev ? { ...prev, status: 'ended' } : null);
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      router.push('/appointments');
    }, 2000);
  };

  // Manejar errores de video
  const handleVideoError = (error: string) => {
    setError(error);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sala de telemedicina...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/appointments')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver a citas
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sesión no encontrada</h2>
          <p className="text-gray-600 mb-4">La sala de telemedicina no existe o ha expirado.</p>
          <button
            onClick={() => router.push('/appointments')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver a citas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-6 h-6 text-blue-500" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Telemedicina - {userType === 'doctor' ? 'Médico' : 'Paciente'}
                </h1>
              </div>
              
              {/* Información de la sesión */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>
                    {userType === 'doctor' ? session.patientName : session.doctorName}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{session.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{session.time}</span>
                </div>
              </div>
            </div>

            {/* Controles de la sesión */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-colors ${
                  showChat 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              
              <button
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Documentos"
              >
                <FileText className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Shield className="w-3 h-3" />
                <span>Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Video Call Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border h-full">
              <WebRTCVideoCall
                roomId={roomId}
                userId={currentUserId}
                userType={userType}
                onEndCall={handleEndCall}
                onError={handleVideoError}
              />
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border h-full">
                <ChatPanel
                  sessionId={session.id}
                  currentUserId={currentUserId}
                  currentUserName={userType === 'doctor' ? session.doctorName : session.patientName}
                />
              </div>
            </div>
          )}
        </div>

        {/* Session Info (Mobile) */}
        <div className="md:hidden mt-4 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {userType === 'doctor' ? session.patientName : session.doctorName}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{session.date}</span>
              <span>{session.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Ended Overlay */}
      {session.status === 'ended' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md">
            <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sesión finalizada
            </h2>
            <p className="text-gray-600 mb-4">
              La consulta de telemedicina ha terminado. Serás redirigido a tus citas.
            </p>
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
} 