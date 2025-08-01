import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebRTC } from './useWebRTC';
import {
  TelemedicineSession,
  WebRTCConfig,
  ChatMessage,
  TranscriptionSegment,
  AIAnalysis,
  PatientVitals,
  SessionRecording,
  TelemedicineSettings
} from '../types';

export interface UseTelemedicineSessionOptions {
  sessionId?: string;
  appointmentId?: string;
  roomId?: string;
  userId: string;
  userType: 'doctor' | 'patient';
  autoJoin?: boolean;
  enableChat?: boolean;
  enableRecording?: boolean;
  enableTranscription?: boolean;
  enableAIAnalysis?: boolean;
}

export interface UseTelemedicineSessionReturn {
  // Estado de la sesión
  session: TelemedicineSession | null;
  isSessionReady: boolean;
  isSessionActive: boolean;
  isSessionEnded: boolean;
  
  // Estado de WebRTC
  webrtcState: ReturnType<typeof useWebRTC>;
  
  // Chat y comunicación
  chatMessages: ChatMessage[];
  sendChatMessage: (message: string) => void;
  
  // Transcripción
  transcription: TranscriptionSegment[];
  isTranscriptionActive: boolean;
  toggleTranscription: () => void;
  
  // Análisis de IA
  aiAnalysis: AIAnalysis | null;
  isAIAnalyzing: boolean;
  startAIAnalysis: () => Promise<void>;
  
  // Signos vitales
  patientVitals: PatientVitals | null;
  
  // Grabación
  isRecording: boolean;
  recording: SessionRecording | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  
  // Configuración
  settings: TelemedicineSettings;
  updateSettings: (settings: Partial<TelemedicineSettings>) => void;
  
  // Acciones de sesión
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
  endSession: () => Promise<void>;
  
  // Utilidades
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

export function useTelemedicineSession(options: UseTelemedicineSessionOptions): UseTelemedicineSessionReturn {
  const {
    sessionId,
    appointmentId,
    roomId,
    userId,
    userType,
    autoJoin = false,
    enableChat = true,
    enableRecording = false,
    enableTranscription = false,
    enableAIAnalysis = false,
  } = options;

  // Estados de sesión
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  // Estados de chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Estados de transcripción
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([]);
  const [isTranscriptionActive, setIsTranscriptionActive] = useState(false);

  // Estados de IA
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);

  // Estados de signos vitales
  const [patientVitals, setPatientVitals] = useState<PatientVitals | null>(null);

  // Estados de grabación
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<SessionRecording | null>(null);

  // Estados de configuración
  const [settings, setSettings] = useState<TelemedicineSettings>({
    videoQuality: 'high',
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true,
    enableBandwidthOptimization: false,
    enableVirtualBackground: false,
    enableRecording: false,
    enableTranscription: false,
    enableAIAnalysis: false,
  });

  // Configuración WebRTC
  const webRTCConfig: WebRTCConfig = {
    serverUrl: process.env.NEXT_PUBLIC_TELEMEDICINE_SERVER_URL || 'http://localhost:3001',
    roomId: roomId || session?.roomId || '',
    userId,
    userType,
    enableAudio: true,
    enableVideo: true,
    enableScreenShare: true,
    enableRecording: settings.enableRecording,
  };

  // Hook WebRTC
  const webrtcState = useWebRTC(webRTCConfig);

  // Referencias
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptionRecognitionRef = useRef<any>(null);

  // Cargar sesión
  const loadSession = useCallback(async () => {
    if (!sessionId && !appointmentId) return;

    try {
      setLoading(true);
      setError(null);

      // En una implementación real, aquí se cargaría la sesión desde la API
      const mockSession: TelemedicineSession = {
        id: sessionId || `session-${Date.now()}`,
        appointmentId: appointmentId || `appointment-${Date.now()}`,
        roomId: roomId || `room-${Date.now()}`,
        doctorId: 'doctor-1',
        patientId: 'patient-1',
        doctorName: 'Dr. Carlos López',
        patientName: 'María González',
        specialty: 'Medicina General',
        scheduledAt: new Date().toISOString(),
        status: 'active',
        startTime: new Date().toISOString(),
        isTelemedicine: true,
        type: 'video'
      };

      setSession(mockSession);
      setIsSessionReady(true);
      setIsSessionActive(true);

      // Cargar datos adicionales
      await Promise.all([
        loadChatMessages(),
        loadPatientVitals(),
        loadTranscription()
      ]);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar la sesión');
    } finally {
      setLoading(false);
    }
  }, [sessionId, appointmentId, roomId]);

  // Cargar mensajes de chat
  const loadChatMessages = async () => {
    // Simular carga de mensajes
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'patient',
        message: 'Hola doctor, me siento un poco mareada',
        timestamp: new Date().toISOString(),
        type: 'text'
      },
      {
        id: '2',
        sender: 'doctor',
        message: 'Hola María, entiendo. ¿Cuándo empezó el mareo?',
        timestamp: new Date().toISOString(),
        type: 'text'
      }
    ];
    setChatMessages(mockMessages);
  };

  // Cargar signos vitales
  const loadPatientVitals = async () => {
    const mockVitals: PatientVitals = {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.8,
      oxygenSaturation: 98,
      weight: 70,
      lastUpdated: new Date().toISOString()
    };
    setPatientVitals(mockVitals);
  };

  // Cargar transcripción
  const loadTranscription = async () => {
    const mockTranscription: TranscriptionSegment[] = [
      {
        id: '1',
        speaker: 'patient',
        text: 'Hola doctor, me siento un poco mareada',
        timestamp: new Date().toISOString(),
        confidence: 0.95
      },
      {
        id: '2',
        speaker: 'doctor',
        text: 'Hola María, entiendo. ¿Cuándo empezó el mareo?',
        timestamp: new Date().toISOString(),
        confidence: 0.98
      }
    ];
    setTranscription(mockTranscription);
  };

  // Unirse a la sesión
  const joinSession = useCallback(async () => {
    try {
      await webrtcState.joinRoom();
      setIsSessionActive(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al unirse a la sesión');
    }
  }, [webrtcState]);

  // Salir de la sesión
  const leaveSession = useCallback(async () => {
    try {
      await webrtcState.leaveRoom();
      setIsSessionActive(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al salir de la sesión');
    }
  }, [webrtcState]);

  // Finalizar sesión
  const endSession = useCallback(async () => {
    try {
      await leaveSession();
      setIsSessionEnded(true);
      setIsSessionActive(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al finalizar la sesión');
    }
  }, [leaveSession]);

  // Enviar mensaje de chat
  const sendChatMessage = useCallback((message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: userType,
      message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, newMessage]);
    webrtcState.sendMessage(message);
  }, [userType, webrtcState]);

  // Toggle transcripción
  const toggleTranscription = useCallback(() => {
    setIsTranscriptionActive(prev => !prev);
    
    if (!isTranscriptionActive) {
      // Iniciar transcripción usando Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            const newSegment: TranscriptionSegment = {
              id: Date.now().toString(),
              speaker: userType,
              text: finalTranscript,
              timestamp: new Date().toISOString(),
              confidence: 0.9
            };
            setTranscription(prev => [...prev, newSegment]);
          }
        };
        
        recognition.start();
        transcriptionRecognitionRef.current = recognition;
      }
    } else {
      // Detener transcripción
      if (transcriptionRecognitionRef.current) {
        transcriptionRecognitionRef.current.stop();
        transcriptionRecognitionRef.current = null;
      }
    }
  }, [isTranscriptionActive, userType]);

  // Análisis de IA
  const startAIAnalysis = useCallback(async () => {
    setIsAIAnalyzing(true);
    
    try {
      // Simular análisis de IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis: AIAnalysis = {
        symptoms: ['Dolor de cabeza', 'Fatiga', 'Mareo'],
        confidence: 0.85,
        possibleConditions: [
          { condition: 'Migraña', probability: 0.65, severity: 'medium' },
          { condition: 'Tensión arterial elevada', probability: 0.45, severity: 'low' },
          { condition: 'Estrés', probability: 0.35, severity: 'low' }
        ],
        recommendations: [
          'Realizar examen neurológico completo',
          'Medir presión arterial en ambos brazos',
          'Evaluar factores de estrés'
        ],
        riskFactors: ['Historial familiar de migrañas', 'Estrés laboral'],
        urgency: 'medium'
      };
      
      setAiAnalysis(mockAnalysis);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error en análisis de IA');
    } finally {
      setIsAIAnalyzing(false);
    }
  }, []);

  // Grabación
  const startRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      
      const mockRecording: SessionRecording = {
        id: `recording-${Date.now()}`,
        sessionId: session?.id || '',
        startTime: new Date().toISOString(),
        isEncrypted: true
      };
      
      setRecording(mockRecording);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al iniciar grabación');
    }
  }, [session?.id]);

  const stopRecording = useCallback(async () => {
    try {
      setIsRecording(false);
      
      if (recording) {
        const updatedRecording: SessionRecording = {
          ...recording,
          endTime: new Date().toISOString(),
          duration: Math.floor((new Date().getTime() - new Date(recording.startTime).getTime()) / 1000)
        };
        setRecording(updatedRecording);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al detener grabación');
    }
  }, [recording]);

  // Actualizar configuración
  const updateSettings = useCallback((newSettings: Partial<TelemedicineSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refrescar sesión
  const refreshSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  // Efectos
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (autoJoin && isSessionReady) {
      joinSession();
    }
  }, [autoJoin, isSessionReady, joinSession]);

  useEffect(() => {
    return () => {
      if (transcriptionRecognitionRef.current) {
        transcriptionRecognitionRef.current.stop();
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Estado de la sesión
    session,
    isSessionReady,
    isSessionActive,
    isSessionEnded,
    
    // Estado de WebRTC
    webrtcState,
    
    // Chat y comunicación
    chatMessages,
    sendChatMessage,
    
    // Transcripción
    transcription,
    isTranscriptionActive,
    toggleTranscription,
    
    // Análisis de IA
    aiAnalysis,
    isAIAnalyzing,
    startAIAnalysis,
    
    // Signos vitales
    patientVitals,
    
    // Grabación
    isRecording,
    recording,
    startRecording,
    stopRecording,
    
    // Configuración
    settings,
    updateSettings,
    
    // Acciones de sesión
    joinSession,
    leaveSession,
    endSession,
    
    // Utilidades
    loading,
    error,
    clearError,
    refreshSession,
  };
} 