'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import VideoConsultationPatient from '@/components/telemedicine/VideoConsultationPatient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Clock, 
  User, 
  Calendar,
  Video,
  AlertCircle,
  Shield,
  CheckCircle,
  Camera,
  Mic
} from 'lucide-react';

interface ConsultationDetails {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  scheduledTime: Date;
  estimatedDuration: number;
  status: 'waiting' | 'ready' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  preparationInstructions?: string[];
}

export default function PatientTelemedicineConsultation() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [devicePermissions, setDevicePermissions] = useState({
    camera: false,
    microphone: false,
    checked: false
  });
  const [consentGiven, setConsentGiven] = useState(false);

  // Simulated consultation data - In real app, fetch from API
  useEffect(() => {
    const fetchConsultationDetails = async () => {
      try {
        setIsLoading(true);
        
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockConsultation: ConsultationDetails = {
          id: sessionId,
          appointmentId: `APT-${sessionId}`,
          doctorId: 'doctor-456',
          doctorName: 'Dr. Carlos Mendoza',
          doctorSpecialty: 'Medicina General',
          scheduledTime: new Date(),
          estimatedDuration: 30,
          status: 'waiting',
          notes: 'Consulta de seguimiento para evaluación de síntomas abdominales.',
          preparationInstructions: [
            'Asegúrese de estar en un lugar tranquilo y bien iluminado',
            'Tenga a mano su lista de medicamentos actuales',
            'Prepare cualquier pregunta que desee hacer al doctor',
            'Verifique que su dispositivo tenga batería suficiente'
          ]
        };
        
        setConsultationDetails(mockConsultation);
      } catch (err) {
        setError('Error al cargar los detalles de la consulta');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchConsultationDetails();
    }
  }, [sessionId]);

  // Check device permissions
  const checkDevicePermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setDevicePermissions({
        camera: true,
        microphone: true,
        checked: true
      });

      // Stop the stream after testing
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setDevicePermissions({
        camera: false,
        microphone: false,
        checked: true
      });
    }
  };

  const handleJoinCall = () => {
    if (!devicePermissions.camera || !devicePermissions.microphone) {
      alert('Se requiere acceso a cámara y micrófono para la consulta');
      return;
    }
    
    if (!consentGiven) {
      alert('Debe aceptar el consentimiento informado para continuar');
      return;
    }
    
    setShowVideoCall(true);
  };

  const handleEndCall = () => {
    setShowVideoCall(false);
    // Redirect to feedback or summary page
    router.push(`/telemedicine/feedback/${sessionId}`);
  };

  const handleError = (error: string) => {
    setError(error);
    setShowVideoCall(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando consulta médica...</p>
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
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!consultationDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Consulta no encontrada</p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="mt-4 w-full"
              >
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showVideoCall) {
    return (
      <VideoConsultationPatient
        roomId={sessionId}
        appointmentId={consultationDetails.appointmentId}
        patientId={user?.id || ''}
        doctorId={consultationDetails.doctorId}
        patientName={`${user?.firstName} ${user?.lastName}` || 'Paciente'}
        doctorName={consultationDetails.doctorName}
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
              <Heart className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mi Consulta Médica
                </h1>
                <p className="text-sm text-gray-500">
                  Telemedicina - Sesión {sessionId}
                </p>
              </div>
            </div>
            <Badge variant={
              consultationDetails.status === 'waiting' ? 'secondary' :
              consultationDetails.status === 'ready' ? 'default' :
              consultationDetails.status === 'in-progress' ? 'default' :
              consultationDetails.status === 'completed' ? 'success' : 'destructive'
            }>
              {consultationDetails.status === 'waiting' && 'Esperando'}
              {consultationDetails.status === 'ready' && 'Listo'}
              {consultationDetails.status === 'in-progress' && 'En Progreso'}
              {consultationDetails.status === 'completed' && 'Completada'}
              {consultationDetails.status === 'cancelled' && 'Cancelada'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Doctor Information and Preparation */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Su Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {consultationDetails.doctorName}
                    </h3>
                    <p className="text-gray-600">{consultationDetails.doctorSpecialty}</p>
                    <div className="flex items-center mt-2">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {consultationDetails.scheduledTime.toLocaleDateString()} a las{' '}
                        {consultationDetails.scheduledTime.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {consultationDetails.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Motivo de la consulta:</p>
                    <p className="text-blue-700">{consultationDetails.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preparation Instructions */}
            {consultationDetails.preparationInstructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Preparación para la Consulta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {consultationDetails.preparationInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Device Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Verificación de Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!devicePermissions.checked && (
                    <Button onClick={checkDevicePermissions} className="w-full">
                      Verificar Cámara y Micrófono
                    </Button>
                  )}
                  
                  {devicePermissions.checked && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Camera className="h-4 w-4 mr-2" />
                          <span>Cámara</span>
                        </div>
                        {devicePermissions.camera ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mic className="h-4 w-4 mr-2" />
                          <span>Micrófono</span>
                        </div>
                        {devicePermissions.microphone ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      
                      {(!devicePermissions.camera || !devicePermissions.microphone) && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Por favor, permita el acceso a su cámara y micrófono para continuar con la consulta.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Unirse a la Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Consent */}
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 mb-1">
                            Consentimiento Informado
                          </p>
                          <p className="text-gray-600">
                            Al continuar, acepto que esta consulta será realizada por 
                            telemedicina y entiendo las limitaciones de este método.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">
                        Acepto el consentimiento informado
                      </span>
                    </label>
                  </div>

                  <Button
                    onClick={handleJoinCall}
                    disabled={!devicePermissions.camera || !devicePermissions.microphone || !consentGiven}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Unirse a la Consulta
                  </Button>
                  
                  {(!devicePermissions.camera || !devicePermissions.microphone || !consentGiven) && (
                    <p className="text-xs text-gray-500 text-center">
                      Complete las verificaciones para unirse
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Información de la Cita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Duración estimada:</span>
                    <span className="text-sm font-medium">
                      {consultationDetails.estimatedDuration} minutos
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Hora programada:</span>
                    <span className="text-sm font-medium">
                      {consultationDetails.scheduledTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Estado:</span>
                    <Badge variant="secondary">
                      {consultationDetails.status === 'waiting' && 'Esperando'}
                      {consultationDetails.status === 'ready' && 'Listo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>¿Necesita Ayuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Problemas de Conexión
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Soporte Técnico
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard')}
                  >
                    Volver al Inicio
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