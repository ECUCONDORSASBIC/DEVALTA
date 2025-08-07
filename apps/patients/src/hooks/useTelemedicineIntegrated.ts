/**
 * Hook integrado para gestión de telemedicina con backend dockerizado
 * Utiliza React Query para cache y el servicio de telemedicina
 */

import { useTanstackQuery as useQuery, useMutation, useQueryClient } from '@altamedica/hooks';
import { 
  telemedicineService,
  TelemedicineSession,
  JoinSessionRequest,
  SessionJoinResponse,
  WebRTCConfig
} from '../services/telemedicine-service';
import { useState, useEffect, useCallback } from 'react';

// Keys para queries de React Query
export const telemedicineQueryKeys = {
  all: ['telemedicine'] as const,
  sessions: () => [...telemedicineQueryKeys.all, 'sessions'] as const,
  sessionDetail: (id: string) => [...telemedicineQueryKeys.all, 'session', id] as const,
  patientSessions: (patientId: string) => [...telemedicineQueryKeys.all, 'patient-sessions', patientId] as const,
  doctorSessions: (doctorId: string) => [...telemedicineQueryKeys.all, 'doctor-sessions', doctorId] as const,
  webrtcConfig: (roomId: string) => [...telemedicineQueryKeys.all, 'webrtc-config', roomId] as const,
  chatMessages: (sessionId: string) => [...telemedicineQueryKeys.all, 'chat', sessionId] as const,
};

/**
 * Hook para obtener todas las sesiones de telemedicina
 */
export function useTelemedicineSessions() {
  return useQuery({
    queryKey: telemedicineQueryKeys.sessions(),
    queryFn: async () => {
      const response = await telemedicineService.getSessions();
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener sesiones');
      }
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos para datos en tiempo real
    gcTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refrescar cada 30 segundos
  });
}

/**
 * Hook para obtener una sesión específica
 */
export function useTelemedicineSession(sessionId: string | undefined | null) {
  return useQuery({
    queryKey: telemedicineQueryKeys.sessionDetail(sessionId!),
    queryFn: async () => {
      const response = await telemedicineService.getSessionById(sessionId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener sesión');
      }
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 10 * 1000, // 10 segundos para sesiones activas
    gcTime: 1 * 60 * 1000,
    refetchInterval: 15 * 1000, // Refrescar cada 15 segundos si está activa
  });
}

/**
 * Hook para obtener historial de sesiones de un paciente
 */
export function usePatientSessionHistory(patientId: string | undefined | null) {
  return useQuery({
    queryKey: telemedicineQueryKeys.patientSessions(patientId!),
    queryFn: async () => {
      const response = await telemedicineService.getPatientSessionHistory(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener historial de sesiones');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos para historial
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener sesiones activas de un doctor
 */
export function useDoctorActiveSessions(doctorId: string | undefined | null) {
  return useQuery({
    queryKey: telemedicineQueryKeys.doctorSessions(doctorId!),
    queryFn: async () => {
      const response = await telemedicineService.getDoctorActiveSessions(doctorId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener sesiones del doctor');
      }
      return response.data;
    },
    enabled: !!doctorId,
    staleTime: 30 * 1000, // 30 segundos para sesiones activas
    gcTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook para obtener configuración WebRTC
 */
export function useWebRTCConfig(roomId: string | undefined | null) {
  return useQuery({
    queryKey: telemedicineQueryKeys.webrtcConfig(roomId!),
    queryFn: async () => {
      const response = await telemedicineService.getWebRTCConfig(roomId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener configuración WebRTC');
      }
      return response.data;
    },
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000, // 5 minutos para configuración
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener mensajes de chat de una sesión
 */
export function useChatMessages(sessionId: string | undefined | null) {
  return useQuery({
    queryKey: telemedicineQueryKeys.chatMessages(sessionId!),
    queryFn: async () => {
      const response = await telemedicineService.getChatMessages(sessionId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener mensajes de chat');
      }
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 5 * 1000, // 5 segundos para chat en tiempo real
    gcTime: 1 * 60 * 1000,
    refetchInterval: 3 * 1000, // Refrescar cada 3 segundos
  });
}

/**
 * Hook para crear/unirse a una sesión de telemedicina
 */
export function useJoinTelemedicineSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: JoinSessionRequest) => {
      const response = await telemedicineService.createSession(sessionData);
      if (!response.success) {
        throw new Error(response.error || 'Error al unirse a la sesión');
      }
      return response.data;
    },
    onSuccess: (sessionData, variables) => {
      // Invalidar lista de sesiones
      queryClient.invalidateQueries({ queryKey: telemedicineQueryKeys.sessions() });
      
      // Invalidar sesiones del paciente y doctor
      queryClient.invalidateQueries({ 
        queryKey: telemedicineQueryKeys.patientSessions(variables.patientId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: telemedicineQueryKeys.doctorSessions(variables.doctorId) 
      });
    },
    onError: (error) => {
      console.error('Error joining telemedicine session:', error);
    },
  });
}

/**
 * Hook para unirse a una sesión existente
 */
export function useJoinExistingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      const response = await telemedicineService.joinSession(sessionId, userId);
      if (!response.success) {
        throw new Error(response.error || 'Error al unirse a la sesión');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar la sesión específica
      queryClient.invalidateQueries({ 
        queryKey: telemedicineQueryKeys.sessionDetail(variables.sessionId) 
      });
      
      // Invalidar lista de sesiones
      queryClient.invalidateQueries({ queryKey: telemedicineQueryKeys.sessions() });
    },
    onError: (error) => {
      console.error('Error joining existing session:', error);
    },
  });
}

/**
 * Hook para finalizar una sesión de telemedicina
 */
export function useEndTelemedicineSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: string; reason?: string }) => {
      const response = await telemedicineService.endSession(sessionId, reason);
      if (!response.success) {
        throw new Error(response.error || 'Error al finalizar la sesión');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar la sesión específica
      queryClient.invalidateQueries({ 
        queryKey: telemedicineQueryKeys.sessionDetail(variables.sessionId) 
      });
      
      // Invalidar lista de sesiones
      queryClient.invalidateQueries({ queryKey: telemedicineQueryKeys.sessions() });
    },
    onError: (error) => {
      console.error('Error ending telemedicine session:', error);
    },
  });
}

/**
 * Hook para actualizar estado de una sesión
 */
export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, status }: { 
      sessionId: string; 
      status: 'active' | 'waiting' | 'completed' | 'cancelled' 
    }) => {
      const response = await telemedicineService.updateSessionStatus(sessionId, status);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar estado de la sesión');
      }
      return response.data;
    },
    onSuccess: (updatedSession, variables) => {
      const { sessionId } = variables;
      
      // Actualizar cache específico de la sesión
      queryClient.setQueryData(telemedicineQueryKeys.sessionDetail(sessionId), updatedSession);
      
      // Invalidar lista de sesiones
      queryClient.invalidateQueries({ queryKey: telemedicineQueryKeys.sessions() });
    },
    onError: (error) => {
      console.error('Error updating session status:', error);
    },
  });
}

/**
 * Hook para enviar mensaje de chat
 */
export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, message, senderId }: { 
      sessionId: string; 
      message: string; 
      senderId: string 
    }) => {
      const response = await telemedicineService.sendChatMessage(sessionId, message, senderId);
      if (!response.success) {
        throw new Error(response.error || 'Error al enviar mensaje');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar mensajes de chat para refrescar la lista
      queryClient.invalidateQueries({ 
        queryKey: telemedicineQueryKeys.chatMessages(variables.sessionId) 
      });
    },
    onError: (error) => {
      console.error('Error sending chat message:', error);
    },
  });
}

/**
 * Hook para reportar calidad de la sesión
 */
export function useReportSessionQuality() {
  return useMutation({
    mutationFn: async ({ sessionId, quality }: { 
      sessionId: string; 
      quality: { video: number; audio: number; connection: number } 
    }) => {
      const response = await telemedicineService.reportSessionQuality(sessionId, quality);
      if (!response.success) {
        throw new Error(response.error || 'Error al reportar calidad');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Error reporting session quality:', error);
    },
  });
}

/**
 * Hook para compartir pantalla
 */
export function useScreenShare() {
  const [isSharing, setIsSharing] = useState(false);

  const startScreenShare = useMutation({
    mutationFn: async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      const response = await telemedicineService.startScreenShare(sessionId, userId);
      if (!response.success) {
        throw new Error(response.error || 'Error al iniciar compartir pantalla');
      }
      return response.data;
    },
    onSuccess: () => {
      setIsSharing(true);
    },
    onError: (error) => {
      console.error('Error starting screen share:', error);
    },
  });

  const stopScreenShare = useMutation({
    mutationFn: async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      const response = await telemedicineService.stopScreenShare(sessionId, userId);
      if (!response.success) {
        throw new Error(response.error || 'Error al detener compartir pantalla');
      }
      return response.data;
    },
    onSuccess: () => {
      setIsSharing(false);
    },
    onError: (error) => {
      console.error('Error stopping screen share:', error);
    },
  });

  return {
    isSharing,
    startScreenShare,
    stopScreenShare,
    isStarting: startScreenShare.isPending,
    isStopping: stopScreenShare.isPending,
    startError: startScreenShare.error,
    stopError: stopScreenShare.error,
  };
}

/**
 * Hook para grabación de sesión
 */
export function useSessionRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);

  const startRecording = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await telemedicineService.startRecording(sessionId);
      if (!response.success) {
        throw new Error(response.error || 'Error al iniciar grabación');
      }
      return response.data;
    },
    onSuccess: (data) => {
      setIsRecording(true);
      setRecordingId(data.recordingId);
    },
    onError: (error) => {
      console.error('Error starting recording:', error);
    },
  });

  const stopRecording = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await telemedicineService.stopRecording(sessionId);
      if (!response.success) {
        throw new Error(response.error || 'Error al detener grabación');
      }
      return response.data;
    },
    onSuccess: () => {
      setIsRecording(false);
      setRecordingId(null);
    },
    onError: (error) => {
      console.error('Error stopping recording:', error);
    },
  });

  return {
    isRecording,
    recordingId,
    startRecording,
    stopRecording,
    isStarting: startRecording.isPending,
    isStopping: stopRecording.isPending,
    startError: startRecording.error,
    stopError: stopRecording.error,
    recordingUrl: stopRecording.data?.recordingUrl,
  };
}

/**
 * Hook combinado para gestión completa de telemedicina
 */
export function useTelemedicineManager() {
  const joinSession = useJoinTelemedicineSession();
  const joinExisting = useJoinExistingSession();
  const endSession = useEndTelemedicineSession();
  const updateStatus = useUpdateSessionStatus();
  const sendMessage = useSendChatMessage();
  const reportQuality = useReportSessionQuality();
  const screenShare = useScreenShare();
  const recording = useSessionRecording();

  return {
    // Operaciones de sesión
    joinSession,
    joinExisting,
    endSession,
    updateStatus,
    
    // Chat
    sendMessage,
    
    // Calidad y características
    reportQuality,
    screenShare,
    recording,
    
    // Estados de carga principales
    isJoining: joinSession.isPending,
    isJoiningExisting: joinExisting.isPending,
    isEnding: endSession.isPending,
    isUpdatingStatus: updateStatus.isPending,
    isSendingMessage: sendMessage.isPending,
    isReportingQuality: reportQuality.isPending,
    
    // Estados de éxito
    joinSuccess: joinSession.isSuccess,
    joinExistingSuccess: joinExisting.isSuccess,
    endSuccess: endSession.isSuccess,
    statusUpdateSuccess: updateStatus.isSuccess,
    messageSuccess: sendMessage.isSuccess,
    qualityReportSuccess: reportQuality.isSuccess,
    
    // Errores principales
    joinError: joinSession.error,
    joinExistingError: joinExisting.error,
    endError: endSession.error,
    statusUpdateError: updateStatus.error,
    messageError: sendMessage.error,
    qualityError: reportQuality.error,
    
    // Datos de respuesta
    joinedSessionData: joinSession.data,
    joinExistingData: joinExisting.data,
    endResult: endSession.data,
    updatedSession: updateStatus.data,
    messageResult: sendMessage.data,
    qualityResult: reportQuality.data,
    
    // Funciones de reset
    resetJoin: joinSession.reset,
    resetJoinExisting: joinExisting.reset,
    resetEnd: endSession.reset,
    resetStatusUpdate: updateStatus.reset,
    resetMessage: sendMessage.reset,
    resetQuality: reportQuality.reset,
  };
}

/**
 * Hook para manejo de WebRTC y señalización
 */
export function useWebRTCSignaling(roomId: string | null) {
  const [signals, setSignals] = useState<any[]>([]);

  const sendSignal = useMutation({
    mutationFn: async (signal: any) => {
      if (!roomId) throw new Error('Room ID requerido');
      
      const response = await telemedicineService.sendWebRTCSignal(roomId, signal);
      if (!response.success) {
        throw new Error(response.error || 'Error al enviar señal WebRTC');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Error sending WebRTC signal:', error);
    },
  });

  const addSignal = useCallback((signal: any) => {
    setSignals(prev => [...prev, signal]);
  }, []);

  const clearSignals = useCallback(() => {
    setSignals([]);
  }, []);

  return {
    signals,
    sendSignal,
    addSignal,
    clearSignals,
    isSendingSignal: sendSignal.isPending,
    signalError: sendSignal.error,
  };
}