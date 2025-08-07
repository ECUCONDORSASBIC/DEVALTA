"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import IntegratedVideoCall from '../../../../components/telemedicine/IntegratedVideoCall';
// import { useAuth } from '../../../../hooks/useAuthSimple'; // Comentado temporalmente
import { AlertCircle, ArrowLeft, User } from 'lucide-react';

// Mock data para propósitos de demostración
// En producción, estos datos vendrían de la API
const mockSessions: { [key: string]: {
  id: string;
  doctorName: string;
  doctorEmail: string;
  specialty: string;
  scheduledTime: string;
  patientName: string;
  patientEmail: string;
  status: 'scheduled' | 'active' | 'completed';
  notes?: string;
}} = {
  'session-001': {
    id: 'session-001',
    doctorName: 'Dr. García Martínez',
    doctorEmail: 'dr.garcia@altamedica.com',
    specialty: 'Cardiología',
    scheduledTime: '2025-02-05 10:30',
    patientName: 'Juan Pérez',
    patientEmail: 'juan.perez@email.com',
    status: 'active',
    notes: 'Control de presión arterial'
  },
  'session-002': {
    id: 'session-002',
    doctorName: 'Dra. López Hernández',
    doctorEmail: 'dra.lopez@altamedica.com',
    specialty: 'Neurología',
    scheduledTime: '2025-02-12 15:00',
    patientName: 'María González',
    patientEmail: 'maria.gonzalez@email.com',
    status: 'scheduled',
    notes: 'Seguimiento de migrañas'
  }
};

export default function TelemedicineRoomPage() {
  const params = useParams();
  const router = useRouter();
  // const { authState } = useAuth(); // Comentado temporalmente
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<typeof mockSessions[string] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Mock auth state para desarrollo
  const authState = {
    user: {
      email: 'patient.test@email.com',
      name: 'Paciente de Prueba'
    }
  };

  const roomId = params.roomid as string;

  useEffect(() => {
    // Simular carga de datos de la sesión
    const loadSession = async () => {
      try {
        // En producción, hacer una llamada a la API para obtener los datos de la sesión
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de API
        
        const sessionData = mockSessions[roomId];
        
        if (!sessionData) {
          setError('Sesión no encontrada');
          return;
        }

        // Verificar que el usuario tenga acceso a esta sesión
        if (!authState?.user?.email) {
          setError('Usuario no autenticado');
          return;
        }

        // En producción, verificar que el usuario tenga permiso para acceder a esta sesión
        setSession(sessionData);
      } catch (error) {
        console.error('Error loading session:', error);
        setError('Error al cargar la sesión');
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      loadSession();
    }
  }, [roomId, authState?.user?.email]);

  const handleCallEnd = () => {
    // Redirigir a la página de telemedicina con mensaje de éxito
    router.push('/telemedicine?callEnded=true');
  };

  const handleGoBack = () => {
    router.push('/telemedicine');
  };

  // Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando sesión...</h2>
          <p className="text-gray-600">Preparando su consulta médica</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {error || 'Sesión no encontrada'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error === 'Usuario no autenticado' 
              ? 'Por favor, inicie sesión para acceder a la videollamada.'
              : 'No pudimos encontrar la sesión solicitada. Verifique el enlace e intente nuevamente.'
            }
          </p>
          <div className="space-y-3">
            {error === 'Usuario no autenticado' ? (
              <button
                onClick={() => router.push('/login')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            )}
            <button
              onClick={handleGoBack}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Telemedicina</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Página principal de videollamada
  return (
    <div className="min-h-screen">
      {/* Pre-call information overlay (se puede mostrar antes de unirse) */}
      {session.status === 'scheduled' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Consulta con {session.doctorName}
              </h3>
              <p className="text-gray-600">{session.specialty}</p>
              {session.notes && (
                <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                  {session.notes}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setSession(prev => prev ? {...prev, status: 'active'} : null)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Unirse a la Consulta
              </button>
              <button
                onClick={handleGoBack}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Volver Después
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente principal de videollamada */}
      <IntegratedVideoCall
        sessionId={session.id}
        doctorEmail={session.doctorEmail}
        doctorName={session.doctorName}
        specialty={session.specialty}
        onCallEnd={handleCallEnd}
      />
    </div>
  );
}