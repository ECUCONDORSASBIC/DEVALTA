/**
 * 📹 TELEMEDICINE HOOKS - ALTAMEDICA
 * Hooks para gestión de sesiones de telemedicina
 */

import { useTanstackQuery as useQuery, useMutation, useQueryClient } from '@altamedica/hooks';
import { getApiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { z } from 'zod';

// Schema de sesión de telemedicina
const TelemedicineSessionSchema = z.object({
  id: z.string(),
  appointmentId: z.string(),
  doctorId: z.string(),
  patientId: z.string(),
  roomId: z.string(),
  status: z.enum(['scheduled', 'waiting', 'in-progress', 'completed', 'cancelled']),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(), // en minutos
  recordingUrl: z.string().optional(),
  notes: z.string().optional(),
  technicalIssues: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema de servidores ICE
const IceServersSchema = z.array(z.object({
  urls: z.union([z.string(), z.array(z.string())]),
  username: z.string().optional(),
  credential: z.string().optional(),
}));

type TelemedicineSession = z.infer<typeof TelemedicineSessionSchema>;
type IceServers = z.infer<typeof IceServersSchema>;

// Hook para listar sesiones
export function useTelemedicineSessions(params?: {
  status?: TelemedicineSession['status'];
  doctorId?: string;
  patientId?: string;
  date?: string;
}) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: ['telemedicine', 'sessions', params],
    queryFn: async () => {
      return apiClient.get<TelemedicineSession[]>(
        API_ENDPOINTS.telemedicine.sessions,
        { params }
      );
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook para obtener una sesión
export function useTelemedicineSession(id: string) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: ['telemedicine', 'sessions', id],
    queryFn: async () => {
      return apiClient.get<TelemedicineSession>(
        API_ENDPOINTS.telemedicine.getSession(id),
        { validate: TelemedicineSessionSchema }
      );
    },
    enabled: !!id,
    refetchInterval: (data) => {
      // Refetch cada 5 segundos si la sesión está activa
      if (data?.status === 'in-progress' || data?.status === 'waiting') {
        return 5000;
      }
      return false;
    },
  });
}

// Hook para crear sesión
export function useCreateTelemedicineSession() {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation({
    mutationFn: async (sessionData: {
      appointmentId: string;
      doctorId: string;
      patientId: string;
    }) => {
      return apiClient.post<TelemedicineSession>(
        API_ENDPOINTS.telemedicine.createSession,
        sessionData
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['telemedicine', 'sessions'] });
      queryClient.setQueryData(['telemedicine', 'sessions', data.id], data);
    },
  });
}

// Hook para unirse a sesión
export function useJoinTelemedicineSession() {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      role 
    }: { 
      sessionId: string; 
      role: 'doctor' | 'patient';
    }) => {
      return apiClient.post<{
        session: TelemedicineSession;
        token: string;
        iceServers: IceServers;
      }>(
        API_ENDPOINTS.telemedicine.joinSession(sessionId),
        { role }
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['telemedicine', 'sessions', variables.sessionId] 
      });
    },
  });
}

// Hook para finalizar sesión
export function useEndTelemedicineSession() {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      notes,
      duration 
    }: { 
      sessionId: string;
      notes?: string;
      duration?: number;
    }) => {
      return apiClient.post(
        API_ENDPOINTS.telemedicine.endSession(sessionId),
        { notes, duration }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['telemedicine', 'sessions'] });
      queryClient.invalidateQueries({ 
        queryKey: ['telemedicine', 'sessions', variables.sessionId] 
      });
    },
  });
}

// Hook para obtener servidores ICE
export function useIceServers() {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: ['telemedicine', 'ice-servers'],
    queryFn: async () => {
      return apiClient.get<IceServers>(
        API_ENDPOINTS.telemedicine.iceServers,
        { validate: IceServersSchema }
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obtener grabaciones
export function useSessionRecordings(sessionId: string) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: ['telemedicine', 'sessions', sessionId, 'recordings'],
    queryFn: async () => {
      return apiClient.get<{
        recordings: Array<{
          id: string;
          url: string;
          duration: number;
          size: number;
          createdAt: string;
        }>;
      }>(
        API_ENDPOINTS.telemedicine.recordings(sessionId)
      );
    },
    enabled: !!sessionId,
  });
}

// Hook para reportar problema técnico
export function useReportTechnicalIssue() {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      issue 
    }: { 
      sessionId: string; 
      issue: string;
    }) => {
      return apiClient.post(
        `/api/v1/telemedicine/sessions/${sessionId}/report-issue`,
        { issue }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['telemedicine', 'sessions', variables.sessionId] 
      });
    },
  });
}

// Hook para verificar compatibilidad del navegador
export function useBrowserCompatibility() {
  return useQuery({
    queryKey: ['telemedicine', 'browser-compatibility'],
    queryFn: async () => {
      const hasWebRTC = !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        window.RTCPeerConnection
      );

      const hasCameraPermission = await navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(() => true)
        .catch(() => false);

      return {
        compatible: hasWebRTC,
        hasWebRTC,
        hasCameraPermission,
        browser: navigator.userAgent,
      };
    },
    staleTime: Infinity, // No need to refetch
  });
}