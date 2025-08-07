import { useState, useEffect, useCallback } from 'react';
import { useTelemedicine } from '../../apps/patients/src/hooks/useTelemedicine';
import { useMarketplaceJobs, useJobApplications, useDoctorProfile, useCompanyProfile } from '@altamedica/marketplace-hooks';

interface UnifiedTelemedicineConfig {
  appointmentId: string;
  userType: 'patient' | 'doctor' | 'company';
  userId: string;
}

interface TelemedicineSession {
  id: string;
  roomId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  companyId?: string;
  status: 'scheduled' | 'waiting' | 'active' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  participants: {
    patient: {
      id: string;
      name: string;
      isConnected: boolean;
      hasVideo: boolean;
      hasAudio: boolean;
    };
    doctor: {
      id: string;
      name: string;
      specialty: string;
      isConnected: boolean;
      hasVideo: boolean;
      hasAudio: boolean;
    };
  };
  marketplace: {
    jobId?: string;
    applicationId?: string;
    rating?: number;
    feedback?: string;
  };
}

interface UnifiedTelemedicineState {
  session: TelemedicineSession | null;
  isInSession: boolean;
  isConnecting: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  hasVideo: boolean;
  hasAudio: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  chatMessages: Array<{
    id: string;
    senderId: string;
    senderType: 'patient' | 'doctor';
    message: string;
    timestamp: Date;
  }>;
  loading: boolean;
  error?: string;
}

/**
 * Hook unificado que combina telemedicina con marketplace
 * Proporciona funcionalidad completa de videollamada + comunicación B2C
 */
export const useTelemedicineUnified = (config: UnifiedTelemedicineConfig) => {
  const { appointmentId, userType, userId } = config;
  
  // Hooks base
  const telemedicineHook = useTelemedicine(appointmentId);
  const { jobs, searchJobs } = useMarketplaceJobs();
  const { applications, submitApplication } = useJobApplications(userId);
  
  // Hooks específicos por tipo de usuario
  const doctorProfile = userType === 'doctor' ? useDoctorProfile(userId) : null;
  const companyProfile = userType === 'company' ? useCompanyProfile(userId) : null;

  const [state, setState] = useState<UnifiedTelemedicineState>({
    session: null,
    isInSession: false,
    isConnecting: false,
    connectionQuality: 'disconnected',
    hasVideo: true,
    hasAudio: true,
    isMuted: false,
    isVideoOff: false,
    chatMessages: [],
    loading: false
  });

  // Inicializar sesión de telemedicina
  const initializeSession = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, isConnecting: true }));
    
    try {
      // Crear o recuperar sesión existente
      const sessionData = await createOrGetSession(appointmentId, userType, userId);
      
      setState(prev => ({
        ...prev,
        session: sessionData,
        isInSession: true,
        loading: false,
        isConnecting: false,
        connectionQuality: 'good'
      }));
      
      // Notificar al marketplace sobre el inicio de la sesión
      await notifyMarketplace('session_started', sessionData);
      
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        isConnecting: false,
        error: error.message
      }));
    }
  }, [appointmentId, userType, userId]);

  // Finalizar sesión
  const endSession = useCallback(async (feedback?: {
    rating: number;
    comment: string;
  }) => {
    if (!state.session) return;

    try {
      const endedAt = new Date();
      const duration = state.session.startedAt 
        ? Math.floor((endedAt.getTime() - state.session.startedAt.getTime()) / 1000)
        : 0;

      // Actualizar sesión en base de datos
      await updateSession(state.session.id, {
        status: 'completed',
        endedAt,
        duration,
        feedback
      });

      // Notificar al marketplace
      await notifyMarketplace('session_ended', {
        ...state.session,
        duration,
        feedback
      });

      setState(prev => ({
        ...prev,
        session: null,
        isInSession: false,
        connectionQuality: 'disconnected'
      }));

    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [state.session]);

  // Controles de media
  const toggleVideo = useCallback(() => {
    setState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }));
    // Lógica para activar/desactivar video
  }, []);

  const toggleAudio = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    // Lógica para activar/desactivar audio
  }, []);

  // Enviar mensaje de chat
  const sendMessage = useCallback(async (message: string) => {
    if (!state.session) return;

    const chatMessage = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      senderType: userType,
      message,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, chatMessage]
    }));

    // Enviar a través de WebSocket
    await sendChatMessage(state.session.roomId, chatMessage);
  }, [state.session, userId, userType]);

  // Crear evaluación post-consulta
  const submitConsultationReview = useCallback(async (review: {
    rating: number;
    comment: string;
    wouldRecommend: boolean;
  }) => {
    if (!state.session) return;

    try {
      // Guardar review en marketplace
      await submitReview({
        sessionId: state.session.id,
        appointmentId,
        doctorId: state.session.doctorId,
        patientId: state.session.patientId,
        reviewType: userType === 'patient' ? 'patient_to_doctor' : 'doctor_to_patient',
        ...review
      });

      // Actualizar marketplace ratings
      await updateMarketplaceRatings(state.session.doctorId, review.rating);

    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [state.session, appointmentId, userType]);

  // Effect para inicializar cuando se monta el componente
  useEffect(() => {
    if (appointmentId && userId) {
      initializeSession();
    }
  }, [appointmentId, userId, initializeSession]);

  return {
    // Estado
    ...state,
    
    // Acciones
    initializeSession,
    endSession,
    toggleVideo,
    toggleAudio,
    sendMessage,
    submitConsultationReview,
    
    // Datos de marketplace
    jobs,
    applications,
    doctorProfile: doctorProfile?.doctor,
    companyProfile: companyProfile?.company,
    
    // Funciones auxiliares
    searchJobs,
    submitApplication: (jobData: any) => submitApplication({
      ...jobData,
      sessionReference: state.session?.id
    })
  };
};

// Funciones auxiliares
async function createOrGetSession(appointmentId: string, userType: string, userId: string): Promise<TelemedicineSession> {
  // Implementación de API call para crear/obtener sesión
  const response = await fetch(`/api/v1/telemedicine/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appointmentId, userType, userId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create telemedicine session');
  }
  
  return response.json();
}

async function updateSession(sessionId: string, updates: Partial<TelemedicineSession>): Promise<void> {
  await fetch(`/api/v1/telemedicine/session/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
}

async function notifyMarketplace(event: string, data: any): Promise<void> {
  await fetch(`/api/v1/marketplace/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, data })
  });
}

async function sendChatMessage(roomId: string, message: any): Promise<void> {
  // Implementación WebSocket para enviar mensaje
  // Se integra con signaling-server existente
}

async function submitReview(review: any): Promise<void> {
  await fetch(`/api/v1/marketplace/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });
}

async function updateMarketplaceRatings(doctorId: string, rating: number): Promise<void> {
  await fetch(`/api/v1/marketplace/doctors/${doctorId}/rating`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating })
  });
}

export type { UnifiedTelemedicineConfig, TelemedicineSession, UnifiedTelemedicineState };
