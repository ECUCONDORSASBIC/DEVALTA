/**
 * Hook para Gestión de Sesiones de Telemedicina
 * Integra citas programadas con WebRTC y gestión de sesiones
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { appointmentService, Appointment } from '../services/appointment-service';
import { useWebRTC } from './useWebRTC';

export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  roomId: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  specialty: string;
  scheduledAt: string;
  status: 'waiting' | 'active' | 'ended' | 'cancelled';
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  isTelemedicine: boolean;
}

export interface UseTelemedicineSessionOptions {
  appointmentId?: string;
  roomId?: string;
  autoJoin?: boolean;
  enableChat?: boolean;
  enableRecording?: boolean;
}

export interface UseTelemedicineSessionReturn {
  // Estado de la sesión
  session: TelemedicineSession | null;
  appointment: Appointment | null;
  isSessionReady: boolean;
  isSessionActive: boolean;
  isSessionEnded: boolean;
  
  // Estado de WebRTC
  webrtcState: {
    isConnected: boolean;
    isConnecting: boolean;
    hasLocalStream: boolean;
    hasRemoteStream: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    connectionState: string;
    iceConnectionState: string;
    error: string | null;
  };
  
  // Acciones de sesión
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
  endSession: () => Promise<void>;
  
  // Acciones de WebRTC
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  sendMessage: (message: string) => void;
  
  // Utilidades
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

export function useTelemedicineSession(options: UseTelemedicineSessionOptions = {}): UseTelemedicineSessionReturn {
  const {
    appointmentId,
    roomId,
    autoJoin = false,
    enableChat = true,
    enableRecording = false,
  } = options;

  const router = useRouter();
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebRTC hook
  const webrtcState = useWebRTC({
    roomId: roomId || session?.roomId || '',
    userId: appointment?.patientId || 'patient',
    userType: 'patient',
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  });

  // Cargar cita si se proporciona appointmentId
  useEffect(() => {
    if (appointmentId) {
      loadAppointment(appointmentId);
    }
  }, [appointmentId]);

  // Crear sesión de telemedicina cuando se carga la cita
  useEffect(() => {
    if (appointment && appointment.isTelemedicine && !session) {
      createTelemedicineSession();
    }
  }, [appointment, session]);

  // Auto-join si está habilitado
  useEffect(() => {
    if (autoJoin && session && session.status === 'waiting') {
      joinSession();
    }
  }, [autoJoin, session]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  const loadAppointment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const appointmentData = await appointmentService.getAppointmentById(id);
      setAppointment(appointmentData);
      
      // Verificar que la cita es de telemedicina
      if (!appointmentData.isTelemedicine) {
        throw new Error('Esta cita no es de telemedicina');
      }
      
      // Verificar que la cita está confirmada
      if (appointmentData.status !== 'confirmed') {
        throw new Error('La cita debe estar confirmada para iniciar telemedicina');
      }
      
      // Verificar que es hora de la cita (15 minutos antes o después)
      const now = new Date();
      const appointmentTime = new Date(appointmentData.scheduledAt);
      const timeDiff = Math.abs(now.getTime() - appointmentTime.getTime()) / (1000 * 60);
      
      if (timeDiff > 15) {
        throw new Error('La sesión de telemedicina solo está disponible 15 minutos antes o después de la cita programada');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando cita';
      setError(errorMessage);
      console.error('Error cargando cita:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTelemedicineSession = useCallback(async () => {
    if (!appointment) return;

    try {
      setLoading(true);
      setError(null);

      // Crear sesión de telemedicina
      const sessionData: TelemedicineSession = {
        id: `session_${Date.now()}`,
        appointmentId: appointment.id,
        roomId: `room_${appointment.id}_${Date.now()}`,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        doctorName: appointment.doctorName,
        patientName: 'Paciente', // En producción vendría del contexto de auth
        specialty: appointment.specialty,
        scheduledAt: appointment.scheduledAt,
        status: 'waiting',
        isTelemedicine: true,
        notes: appointment.notes,
      };

      setSession(sessionData);

      // Configurar timeout para la sesión (30 minutos)
      sessionTimeoutRef.current = setTimeout(() => {
        if (sessionData.status === 'waiting') {
          endSession();
        }
      }, 30 * 60 * 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando sesión';
      setError(errorMessage);
      console.error('Error creando sesión:', err);
    } finally {
      setLoading(false);
    }
  }, [appointment]);

  const joinSession = useCallback(async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      // Actualizar estado de la sesión
      setSession(prev => prev ? {
        ...prev,
        status: 'active',
        startTime: new Date().toISOString(),
      } : null);

      // Actualizar estado de la cita
      if (appointment) {
        await appointmentService.updateAppointment(appointment.id, {
          status: 'in_progress',
        });
      }

      // Unirse a WebRTC
      await webrtcState.joinRoom();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error uniéndose a la sesión';
      setError(errorMessage);
      console.error('Error uniéndose a la sesión:', err);
    } finally {
      setLoading(false);
    }
  }, [session, appointment, webrtcState]);

  const leaveSession = useCallback(async () => {
    if (!session) return;

    try {
      setError(null);

      // Salir de WebRTC
      await webrtcState.leaveRoom();

      // Actualizar estado de la sesión
      setSession(prev => prev ? {
        ...prev,
        status: 'ended',
        endTime: new Date().toISOString(),
        duration: prev.startTime 
          ? Math.floor((new Date().getTime() - new Date(prev.startTime).getTime()) / 1000)
          : undefined,
      } : null);

      // Actualizar estado de la cita
      if (appointment) {
        await appointmentService.updateAppointment(appointment.id, {
          status: 'completed',
        });
      }

      // Limpiar timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saliendo de la sesión';
      setError(errorMessage);
      console.error('Error saliendo de la sesión:', err);
    }
  }, [session, appointment, webrtcState]);

  const endSession = useCallback(async () => {
    if (!session) return;

    try {
      setError(null);

      // Finalizar sesión
      setSession(prev => prev ? {
        ...prev,
        status: 'ended',
        endTime: new Date().toISOString(),
        duration: prev.startTime 
          ? Math.floor((new Date().getTime() - new Date(prev.startTime).getTime()) / 1000)
          : undefined,
      } : null);

      // Salir de WebRTC
      await webrtcState.leaveRoom();

      // Actualizar estado de la cita
      if (appointment) {
        await appointmentService.updateAppointment(appointment.id, {
          status: 'completed',
        });
      }

      // Limpiar timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push('/appointments?completed=true');
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error finalizando sesión';
      setError(errorMessage);
      console.error('Error finalizando sesión:', err);
    }
  }, [session, appointment, webrtcState, router]);

  const sendMessage = useCallback((message: string) => {
    if (!session || !enableChat) return;
    
    // En producción, aquí se enviaría el mensaje a través de WebSocket
    console.log('Mensaje enviado:', message);
  }, [session, enableChat]);

  const refreshSession = useCallback(async () => {
    if (appointmentId) {
      await loadAppointment(appointmentId);
    }
  }, [appointmentId, loadAppointment]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Estados computados
  const isSessionReady = session?.status === 'waiting';
  const isSessionActive = session?.status === 'active';
  const isSessionEnded = session?.status === 'ended';

  return {
    // Estado de la sesión
    session,
    appointment,
    isSessionReady,
    isSessionActive,
    isSessionEnded,
    
    // Estado de WebRTC
    webrtcState: {
      isConnected: webrtcState.isConnected,
      isConnecting: webrtcState.isConnecting,
      hasLocalStream: webrtcState.hasLocalStream,
      hasRemoteStream: webrtcState.hasRemoteStream,
      localStream: webrtcState.localStream,
      remoteStream: webrtcState.remoteStream,
      connectionState: webrtcState.connectionState,
      iceConnectionState: webrtcState.iceConnectionState,
      error: webrtcState.error,
    },
    
    // Acciones de sesión
    joinSession,
    leaveSession,
    endSession,
    
    // Acciones de WebRTC
    toggleMute: webrtcState.toggleMute,
    toggleVideo: webrtcState.toggleVideo,
    toggleScreenShare: webrtcState.toggleScreenShare,
    sendMessage,
    
    // Utilidades
    loading,
    error,
    clearError,
    refreshSession,
  };
}

// Hook especializado para verificar disponibilidad de telemedicina
export function useTelemedicineAvailability(appointmentId: string) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async () => {
    if (!appointmentId) return;

    try {
      setLoading(true);
      setError(null);

      const appointment = await appointmentService.getAppointmentById(appointmentId);
      
      // Verificar que es una cita de telemedicina
      if (!appointment.isTelemedicine) {
        setIsAvailable(false);
        return;
      }

      // Verificar que está confirmada
      if (appointment.status !== 'confirmed') {
        setIsAvailable(false);
        return;
      }

      // Verificar horario (15 minutos antes o después)
      const now = new Date();
      const appointmentTime = new Date(appointment.scheduledAt);
      const timeDiff = Math.abs(now.getTime() - appointmentTime.getTime()) / (1000 * 60);
      
      setIsAvailable(timeDiff <= 15);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error verificando disponibilidad';
      setError(errorMessage);
      setIsAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    isAvailable,
    loading,
    error,
    refresh: checkAvailability,
  };
}

// Hook para preparación de telemedicina
export function useTelemedicinePreparation() {
  const [isPrepared, setIsPrepared] = useState(false);
  const [cameraTest, setCameraTest] = useState(false);
  const [microphoneTest, setMicrophoneTest] = useState(false);
  const [internetTest, setInternetTest] = useState(false);
  const [loading, setLoading] = useState(false);

  const testCamera = useCallback(async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraTest(true);
    } catch (err) {
      setCameraTest(false);
      console.error('Error testing camera:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const testMicrophone = useCallback(async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicrophoneTest(true);
    } catch (err) {
      setMicrophoneTest(false);
      console.error('Error testing microphone:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const testInternet = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      await fetch('/api/v1/health', { method: 'GET' });
      const endTime = Date.now();
      const latency = endTime - startTime;
      setInternetTest(latency < 1000); // Menos de 1 segundo
    } catch (err) {
      setInternetTest(false);
      console.error('Error testing internet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const runAllTests = useCallback(async () => {
    await Promise.all([
      testCamera(),
      testMicrophone(),
      testInternet(),
    ]);
  }, [testCamera, testMicrophone, testInternet]);

  useEffect(() => {
    setIsPrepared(cameraTest && microphoneTest && internetTest);
  }, [cameraTest, microphoneTest, internetTest]);

  return {
    isPrepared,
    cameraTest,
    microphoneTest,
    internetTest,
    loading,
    testCamera,
    testMicrophone,
    testInternet,
    runAllTests,
  };
} 