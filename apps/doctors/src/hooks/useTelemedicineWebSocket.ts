/**
 * 🔌 HOOK DE WEBSOCKET PARA TELEMEDICINA
 * Manejo de conexiones WebSocket en tiempo real para sesiones de telemedicina
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from "@altamedica/auth';

export interface TelemedicineWebSocketMessage {
  type: 'session_update' | 'participant_joined' | 'participant_left' | 'connection_quality' | 'error' | 'heartbeat';
  sessionId?: string;
  data?: any;
  timestamp?: string;
  userId?: string;
}

export interface UseTelemedicineWebSocketProps {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export interface UseTelemedicineWebSocketReturn {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastMessage: TelemedicineWebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: TelemedicineWebSocketMessage) => void;
  subscribeToSession: (sessionId: string) => void;
  unsubscribeFromSession: (sessionId: string) => void;
  error: string | null;
}

export function useTelemedicineWebSocket(
  props: UseTelemedicineWebSocketProps = {}
): UseTelemedicineWebSocketReturn {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000,
    heartbeatInterval = 30000
  } = props;

  const { user } = useAuth();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<TelemedicineWebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const subscribedSessionsRef = useRef<Set<string>>(new Set());

  // URL del WebSocket
  const getWebSocketUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    return `${baseUrl}/api/v1/notifications/websocket`;
  }, []);

  // Enviar mensaje WebSocket
  const sendMessage = useCallback((message: TelemedicineWebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: new Date().toISOString(),
          userId: user?.id
        };
        wsRef.current.send(JSON.stringify(messageWithTimestamp));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        setError('Error enviando mensaje');
      }
    } else {
      console.warn('WebSocket not connected. Cannot send message:', message);
    }
  }, [user?.id]);

  // Configurar heartbeat
  const setupHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendMessage({
          type: 'heartbeat',
          data: { timestamp: Date.now() }
        });
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, sendMessage]);

  // Limpiar heartbeat
  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Conectar WebSocket
  const connect = useCallback(() => {
    if (!user?.token) {
      setError('Token de autenticación no disponible');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket conectado para telemedicina');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectCountRef.current = 0;

        // Autenticar
        sendMessage({
          type: 'session_update',
          data: {
            action: 'authenticate',
            token: user.token,
            userType: 'doctor',
            userId: user.id
          }
        });

        // Re-suscribirse a sesiones previas
        subscribedSessionsRef.current.forEach(sessionId => {
          sendMessage({
            type: 'session_update',
            sessionId,
            data: { action: 'subscribe' }
          });
        });

        // Configurar heartbeat
        setupHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message: TelemedicineWebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Manejar mensajes específicos
          if (message.type === 'error') {
            setError(message.data?.message || 'Error en WebSocket');
          }
          
          if (message.type === 'heartbeat') {
            // Responder al heartbeat del servidor
            return;
          }

          console.log('📨 Mensaje WebSocket recibido:', message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        clearHeartbeat();

        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current);
          console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${reconnectCountRef.current + 1}/${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++;
            connect();
          }, delay);
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          setError('Máximo número de reintentos alcanzado');
          setConnectionStatus('error');
        }
      };

      ws.onerror = (error) => {
        console.error('🚨 Error en WebSocket:', error);
        setError('Error de conexión WebSocket');
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Error creando conexión WebSocket');
      setConnectionStatus('error');
    }
  }, [user?.token, user?.id, getWebSocketUrl, sendMessage, setupHeartbeat, clearHeartbeat, reconnectAttempts, reconnectDelay]);

  // Desconectar WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    clearHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, 'Disconnected by user');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setError(null);
    reconnectCountRef.current = 0;
    subscribedSessionsRef.current.clear();
  }, [clearHeartbeat]);

  // Suscribirse a sesión específica
  const subscribeToSession = useCallback((sessionId: string) => {
    subscribedSessionsRef.current.add(sessionId);
    
    if (isConnected) {
      sendMessage({
        type: 'session_update',
        sessionId,
        data: { action: 'subscribe' }
      });
    }
  }, [isConnected, sendMessage]);

  // Desuscribirse de sesión
  const unsubscribeFromSession = useCallback((sessionId: string) => {
    subscribedSessionsRef.current.delete(sessionId);
    
    if (isConnected) {
      sendMessage({
        type: 'session_update',
        sessionId,
        data: { action: 'unsubscribe' }
      });
    }
  }, [isConnected, sendMessage]);

  // Auto-conectar cuando el usuario esté disponible
  useEffect(() => {
    if (autoConnect && user?.token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user?.token]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    subscribeToSession,
    unsubscribeFromSession,
    error
  };
}

// Hook específico para sesiones de telemedicina
export function useTelemedicineSession(sessionId: string) {
  const {
    isConnected,
    connectionStatus,
    lastMessage,
    subscribeToSession,
    unsubscribeFromSession,
    sendMessage,
    error
  } = useTelemedicineWebSocket();

  const [sessionData, setSessionData] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'unknown'>('unknown');

  // Suscribirse a la sesión al montar
  useEffect(() => {
    if (sessionId && isConnected) {
      subscribeToSession(sessionId);
    }

    return () => {
      if (sessionId) {
        unsubscribeFromSession(sessionId);
      }
    };
  }, [sessionId, isConnected, subscribeToSession, unsubscribeFromSession]);

  // Procesar mensajes de la sesión
  useEffect(() => {
    if (lastMessage && lastMessage.sessionId === sessionId) {
      switch (lastMessage.type) {
        case 'session_update':
          if (lastMessage.data?.sessionData) {
            setSessionData(lastMessage.data.sessionData);
          }
          break;

        case 'participant_joined':
          setParticipants(prev => {
            const existing = prev.find(p => p.id === lastMessage.data?.participant?.id);
            if (!existing) {
              return [...prev, lastMessage.data.participant];
            }
            return prev;
          });
          break;

        case 'participant_left':
          setParticipants(prev => 
            prev.filter(p => p.id !== lastMessage.data?.participant?.id)
          );
          break;

        case 'connection_quality':
          setConnectionQuality(lastMessage.data?.quality || 'unknown');
          break;
      }
    }
  }, [lastMessage, sessionId]);

  // Funciones específicas de sesión
  const joinSession = useCallback(() => {
    sendMessage({
      type: 'session_update',
      sessionId,
      data: { action: 'join' }
    });
  }, [sessionId, sendMessage]);

  const leaveSession = useCallback(() => {
    sendMessage({
      type: 'session_update',
      sessionId,
      data: { action: 'leave' }
    });
  }, [sessionId, sendMessage]);

  const updateSessionStatus = useCallback((status: string) => {
    sendMessage({
      type: 'session_update',
      sessionId,
      data: { action: 'update_status', status }
    });
  }, [sessionId, sendMessage]);

  return {
    isConnected,
    connectionStatus,
    sessionData,
    participants,
    connectionQuality,
    joinSession,
    leaveSession,
    updateSessionStatus,
    error
  };
}