'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import VideoConsultationDoctor from '@/components/telemedicine/VideoConsultationDoctor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Clock, 
  User, 
  Calendar,
  FileText,
  Phone,
  Video,
  AlertCircle
} from 'lucide-react';

interface SessionDetails {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  scheduledTime: Date;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  vitals?: {
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    temperature?: number;
    oxygenSaturation?: number;
  };
}

export default function DoctorTelemedicineSession() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [preCallChecksComplete, setPreCallChecksComplete] = useState(false);

  // Simulated session data - In real app, fetch from API
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setIsLoading(true);
        
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockSession: SessionDetails = {
          id: sessionId,
          appointmentId: `APT-${sessionId}`,
          patientId: 'patient-123',
          patientName: 'María González',
          patientAge: 45,
          scheduledTime: new Date(),
          status: 'waiting',
          notes: 'Paciente reporta dolor abdominal y náuseas desde hace 2 días.',
          vitals: {
            heartRate: 78,
            bloodPressure: { systolic: 120, diastolic: 80 },
            temperature: 36.8,
            oxygenSaturation: 98
          }
        };
        
        setSessionDetails(mockSession);
      } catch (err) {
        setError('Error al cargar los detalles de la sesión');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const handleStartCall = () => {
    if (!preCallChecksComplete) {
      alert('Por favor complete las verificaciones pre-consulta');
      return;
    }
    setShowVideoCall(true);
  };

  const handleEndCall = () => {
    setShowVideoCall(false);
    // Redirect to post-consultation form
    router.push(`/telemedicine/post-consultation/${sessionId}`);
  };

  const handleError = (error: string) => {
    setError(error);
    setShowVideoCall(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesión médica...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Sesión no encontrada</p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="mt-4 w-full"
              >
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showVideoCall) {
    return (
      <VideoConsultationDoctor
        roomId={sessionId}
        appointmentId={sessionDetails.appointmentId}
        patientId={sessionDetails.patientId}
        doctorId={user?.id || ''}
        doctorName={user?.name || `Dr. ${user?.firstName} ${user?.lastName}`}
        patientName={sessionDetails.patientName}
        authToken={user?.accessToken || ''}
        onCallEnd={handleEndCall}
        onError={handleError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Consulta de Telemedicina
                </h1>
                <p className="text-sm text-gray-500">
                  Sesión ID: {sessionId}
                </p>
              </div>
            </div>
            <Badge variant={
              sessionDetails.status === 'waiting' ? 'secondary' :
              sessionDetails.status === 'in-progress' ? 'default' :
              sessionDetails.status === 'completed' ? 'success' : 'destructive'
            }>
              {sessionDetails.status === 'waiting' && 'En Espera'}
              {sessionDetails.status === 'in-progress' && 'En Progreso'}
              {sessionDetails.status === 'completed' && 'Completada'}
              {sessionDetails.status === 'cancelled' && 'Cancelada'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-lg font-semibold">{sessionDetails.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Edad</label>
                    <p className="text-lg font-semibold">{sessionDetails.patientAge} años</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID del Paciente</label>
                    <p className="text-lg font-semibold">{sessionDetails.patientId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de la Cita</label>
                    <p className="text-lg font-semibold flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {sessionDetails.scheduledTime.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {sessionDetails.notes && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">Notas de la Cita</label>
                    <p className="mt-1 text-gray-900">{sessionDetails.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vital Signs */}
            {sessionDetails.vitals && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Signos Vitales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sessionDetails.vitals.heartRate && (
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-500">Frecuencia Cardíaca</p>
                        <p className="text-2xl font-bold text-red-600">
                          {sessionDetails.vitals.heartRate}
                        </p>
                        <p className="text-xs text-gray-500">bpm</p>
                      </div>
                    )}
                    
                    {sessionDetails.vitals.bloodPressure && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">Presión Arterial</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {sessionDetails.vitals.bloodPressure.systolic}/
                          {sessionDetails.vitals.bloodPressure.diastolic}
                        </p>
                        <p className="text-xs text-gray-500">mmHg</p>
                      </div>
                    )}
                    
                    {sessionDetails.vitals.temperature && (
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-gray-500">Temperatura</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {sessionDetails.vitals.temperature}
                        </p>
                        <p className="text-xs text-gray-500">°C</p>
                      </div>
                    )}
                    
                    {sessionDetails.vitals.oxygenSaturation && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">Saturación O₂</p>
                        <p className="text-2xl font-bold text-green-600">
                          {sessionDetails.vitals.oxygenSaturation}
                        </p>
                        <p className="text-xs text-gray-500">%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Pre-call checklist */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => setPreCallChecksComplete(e.target.checked)}
                      />
                      <span className="text-sm">
                        He revisado la información del paciente
                      </span>
                    </label>
                  </div>

                  <Button
                    onClick={handleStartCall}
                    disabled={!preCallChecksComplete}
                    className="w-full"
                    size="lg"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Iniciar Videollamada
                  </Button>
                  
                  {!preCallChecksComplete && (
                    <p className="text-xs text-gray-500 text-center">
                      Complete las verificaciones para iniciar la consulta
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Tiempo de Sesión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-500">Hora actual</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Historial Médico
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamada de Audio
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard')}
                  >
                    Volver al Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}