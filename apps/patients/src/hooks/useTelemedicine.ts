import { useState, useEffect, useCallback } from "react";

export interface TelemedicineSession {
  id: string;
  roomId: string;
  doctorId: string;
  patientId: string;
  status: "waiting" | "active" | "ended" | "cancelled";
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  notes?: string;
}

export interface VideoCallState {
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  participants: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: "text" | "file" | "image";
}

export const useTelemedicineSession = (roomId: string) => {
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [videoCallState, setVideoCallState] = useState<VideoCallState>({
    isConnected: false,
    isMuted: false,
    isVideoEnabled: true,
    isScreenSharing: false,
    participants: [],
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carga de sesión
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        // Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockSession: TelemedicineSession = {
          id: "session-1",
          roomId,
          doctorId: "doctor-1",
          patientId: "patient-1",
          status: "waiting",
          startTime: new Date(),
        };

        setSession(mockSession);

        // Simular mensajes iniciales
        const mockMessages: ChatMessage[] = [
          {
            id: "1",
            senderId: "system",
            senderName: "Sistema",
            message:
              "Bienvenido a la sala de espera virtual. El médico se conectará pronto.",
            timestamp: new Date(),
            type: "text",
          },
        ];
        setMessages(mockMessages);
      } catch (err) {
        setError("Error al cargar la sesión de telemedicina");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [roomId]);

  // Función para enviar mensaje
  const sendMessage = useCallback(
    (message: string, senderId: string, senderName: string) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId,
        senderName,
        message,
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev: ChatMessage[]) => [...prev, newMessage]);
    },
    []
  );

  // Función para cambiar estado del micrófono
  const toggleMute = useCallback(() => {
    setVideoCallState((prev: VideoCallState) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  // Función para cambiar estado del video
  const toggleVideo = useCallback(() => {
    setVideoCallState((prev: VideoCallState) => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled,
    }));
  }, []);

  // Función para compartir pantalla
  const toggleScreenShare = useCallback(() => {
    setVideoCallState((prev: VideoCallState) => ({
      ...prev,
      isScreenSharing: !prev.isScreenSharing,
    }));
  }, []);

  // Función para terminar la llamada
  const endCall = useCallback(async () => {
    try {
      setVideoCallState((prev: VideoCallState) => ({
        ...prev,
        isConnected: false,
      }));

      if (session) {
        setSession((prev: TelemedicineSession | null) =>
          prev
            ? {
                ...prev,
                status: "ended",
                endTime: new Date(),
                duration: prev.startTime
                  ? Math.floor(
                      (new Date().getTime() - prev.startTime.getTime()) / 1000
                    )
                  : undefined,
              }
            : null
        );
      }
    } catch (err) {
      setError("Error al terminar la llamada");
    }
  }, [session]);

  // Función para unirse a la llamada
  const joinCall = useCallback(async () => {
    try {
      setVideoCallState((prev: VideoCallState) => ({
        ...prev,
        isConnected: true,
      }));

      if (session) {
        setSession((prev: TelemedicineSession | null) =>
          prev
            ? {
                ...prev,
                status: "active",
              }
            : null
        );
      }

      // Simular mensaje de sistema
      sendMessage("Se ha unido a la llamada", "system", "Sistema");
    } catch (err) {
      setError("Error al unirse a la llamada");
    }
  }, [session, sendMessage]);

  return {
    session,
    videoCallState,
    messages,
    isLoading,
    error,
    sendMessage,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endCall,
    joinCall,
  };
};
