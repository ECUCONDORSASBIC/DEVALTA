import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    MarketplaceConversation,
    MarketplaceMessage,
    MessageFilters,
    MessageNotification,
    MessageStats,
    TypingIndicator,
    WebSocketMessage
} from '../types/messaging';

// Mock WebSocket implementation
class MockWebSocket {
  private listeners: { [event: string]: Function[] } = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    setTimeout(() => {
      this.isConnected = true;
      this.emit('open');
      
      // Simulate periodic messages
      setInterval(() => {
        if (this.isConnected) {
          this.simulateMessage();
        }
      }, 30000); // Every 30 seconds
    }, 1000);
  }

  private simulateMessage() {
    const mockMessage: WebSocketMessage = {
      type: 'message',
      data: {
        id: `msg-${Date.now()}`,
        conversationId: 'conv-001',
        senderId: 'company-001',
        content: 'Este es un mensaje de prueba del WebSocket',
        sentAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      userId: 'company-001'
    };

    this.emit('message', { data: JSON.stringify(mockMessage) });
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  send(data: string) {
    if (this.isConnected) {
      console.log('WebSocket sending:', data);
      // Echo back for testing
      setTimeout(() => {
        this.emit('message', { data });
      }, 100);
    }
  }

  close() {
    this.isConnected = false;
    this.emit('close');
  }

  get readyState() {
    return this.isConnected ? 1 : 0; // 1 = OPEN, 0 = CONNECTING
  }
}

// Mock API functions
const mockApi = {
  async getConversations(userId: string, userType: 'company' | 'doctor', filters?: MessageFilters): Promise<MarketplaceConversation[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        id: 'conv-001',
        jobId: 'job-001',
        jobTitle: 'Cardiólogo Senior',
        applicationId: 'app-001',
        participants: {
          companyId: 'company-001',
          companyName: 'Hospital General Madrid',
          companyLogo: '/logos/hospital-madrid.png',
          doctorId: 'doctor-001',
          doctorName: 'Dr. María González',
          doctorAvatar: '/avatars/maria-gonzalez.jpg'
        },
        lastMessage: {
          id: 'msg-001',
          conversationId: 'conv-001',
          senderId: 'company-001',
          senderType: 'company',
          senderName: 'Hospital General Madrid',
          receiverId: 'doctor-001',
          receiverType: 'doctor',
          receiverName: 'Dr. María González',
          content: 'Hola Dr. González, hemos revisado su aplicación y nos gustaría programar una entrevista.',
          type: 'text',
          status: 'delivered',
          sentAt: '2025-01-29T10:30:00Z',
          isImportant: false
        },
        lastMessageAt: '2025-01-29T10:30:00Z',
        unreadCount: {
          company: 0,
          doctor: 1
        },
        status: 'active',
        tags: ['interview', 'cardiology'],
        priority: 'high',
        createdAt: '2025-01-20T10:30:00Z',
        updatedAt: '2025-01-29T10:30:00Z'
      },
      {
        id: 'conv-002',
        jobId: 'job-002',
        jobTitle: 'Pediatra - Medicina Familiar',
        participants: {
          companyId: 'company-002',
          companyName: 'Clínica San Rafael',
          doctorId: 'doctor-001',
          doctorName: 'Dr. María González'
        },
        lastMessage: {
          id: 'msg-002',
          conversationId: 'conv-002',
          senderId: 'doctor-001',
          senderType: 'doctor',
          senderName: 'Dr. María González',
          receiverId: 'company-002',
          receiverType: 'company',
          receiverName: 'Clínica San Rafael',
          content: 'Gracias por considerar mi aplicación. Estoy muy interesada en esta oportunidad.',
          type: 'text',
          status: 'read',
          sentAt: '2025-01-28T15:20:00Z',
          readAt: '2025-01-28T15:25:00Z',
          isImportant: false
        },
        lastMessageAt: '2025-01-28T15:20:00Z',
        unreadCount: {
          company: 0,
          doctor: 0
        },
        status: 'active',
        tags: ['pediatrics'],
        priority: 'medium',
        createdAt: '2025-01-22T15:20:00Z',
        updatedAt: '2025-01-28T15:25:00Z'
      }
    ];
  },

  async getMessages(conversationId: string): Promise<MarketplaceMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'msg-001',
        conversationId,
        senderId: 'doctor-001',
        senderType: 'doctor',
        senderName: 'Dr. María González',
        receiverId: 'company-001',
        receiverType: 'company',
        receiverName: 'Hospital General Madrid',
        content: 'Buenos días, he enviado mi aplicación para la posición de Cardiólogo Senior. ¿Podrían confirmar que la han recibido?',
        type: 'text',
        status: 'read',
        sentAt: '2025-01-20T10:30:00Z',
        readAt: '2025-01-20T11:00:00Z',
        isImportant: false
      },
      {
        id: 'msg-002',
        conversationId,
        senderId: 'company-001',
        senderType: 'company',
        senderName: 'Hospital General Madrid',
        receiverId: 'doctor-001',
        receiverType: 'doctor',
        receiverName: 'Dr. María González',
        content: 'Buenos días Dr. González, confirmamos la recepción de su aplicación. Estamos revisando los candidatos y le contactaremos pronto.',
        type: 'text',
        status: 'read',
        sentAt: '2025-01-22T14:15:00Z',
        readAt: '2025-01-22T14:20:00Z',
        isImportant: false
      },
      {
        id: 'msg-003',
        conversationId,
        senderId: 'company-001',
        senderType: 'company',
        senderName: 'Hospital General Madrid',
        receiverId: 'doctor-001',
        receiverType: 'doctor',
        receiverName: 'Dr. María González',
        content: 'Hola Dr. González, hemos revisado su aplicación y nos gustaría programar una entrevista. ¿Estaría disponible el viernes a las 10:00 AM?',
        type: 'text',
        metadata: {
          interviewDetails: {
            date: '2025-01-31T10:00:00Z',
            type: 'video',
            meetingLink: 'https://meet.google.com/abc-defg-hij'
          }
        },
        status: 'delivered',
        sentAt: '2025-01-29T10:30:00Z',
        isImportant: true
      }
    ];
  },

  async sendMessage(messageData: Partial<MarketplaceMessage>): Promise<MarketplaceMessage> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newMessage: MarketplaceMessage = {
      id: `msg-${Date.now()}`,
      conversationId: messageData.conversationId!,
      senderId: messageData.senderId!,
      senderType: messageData.senderType!,
      senderName: messageData.senderName!,
      receiverId: messageData.receiverId!,
      receiverType: messageData.receiverType!,
      receiverName: messageData.receiverName!,
      content: messageData.content!,
      type: messageData.type || 'text',
      metadata: messageData.metadata,
      status: 'sent',
      sentAt: new Date().toISOString(),
      isImportant: messageData.isImportant || false,
      replyToId: messageData.replyToId
    };

    return newMessage;
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Mock mark as read logic
  },

  async getNotifications(userId: string, userType: 'company' | 'doctor'): Promise<MessageNotification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'notif-001',
        type: 'new_message',
        title: 'Nuevo mensaje',
        message: 'Hospital General Madrid te ha enviado un mensaje',
        userId,
        userType,
        conversationId: 'conv-001',
        isRead: false,
        createdAt: '2025-01-29T10:30:00Z',
        actionUrl: '/messages/conv-001',
        actionText: 'Ver mensaje'
      },
      {
        id: 'notif-002',
        type: 'interview_scheduled',
        title: 'Entrevista programada',
        message: 'Se ha programado una entrevista para el viernes a las 10:00 AM',
        userId,
        userType,
        conversationId: 'conv-001',
        jobId: 'job-001',
        isRead: false,
        createdAt: '2025-01-29T10:35:00Z',
        actionUrl: '/interviews/upcoming',
        actionText: 'Ver entrevista'
      }
    ];
  },

  async getMessageStats(userId: string, userType: 'company' | 'doctor'): Promise<MessageStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      totalConversations: 15,
      activeConversations: 12,
      totalMessages: 234,
      unreadMessages: 3,
      averageResponseTime: 180, // 3 hours
      conversationsByStatus: {
        active: 12,
        archived: 3,
        blocked: 0
      },
      messagesByType: {
        text: 198,
        file: 15,
        application: 12,
        interview: 6,
        offer: 2,
        system: 1
      },
      dailyMessageVolume: [
        { date: '2025-01-23', sent: 12, received: 8 },
        { date: '2025-01-24', sent: 15, received: 11 },
        { date: '2025-01-25', sent: 9, received: 13 },
        { date: '2025-01-26', sent: 18, received: 7 },
        { date: '2025-01-27', sent: 11, received: 14 },
        { date: '2025-01-28', sent: 16, received: 9 },
        { date: '2025-01-29', sent: 8, received: 6 }
      ]
    };
  }
};

// WebSocket hook for real-time messaging
export const useMarketplaceWebSocket = (userId: string, userType: 'company' | 'doctor') => {
  const [socket, setSocket] = useState<MockWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId) return;

    const ws = new MockWebSocket(`ws://localhost:3001/marketplace-ws?userId=${userId}&userType=${userType}`);

    const handleOpen = () => {
      setIsConnected(true);
      console.log('Marketplace WebSocket connected');
    };

    const handleMessage = (event: any) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);

        if (message.type === 'typing') {
          setTypingUsers(prev => {
            const filtered = prev.filter(t => t.userId !== message.userId);
            if (message.data.isTyping) {
              return [...filtered, message.data];
            }
            return filtered;
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    const handleClose = () => {
      setIsConnected(false);
      console.log('Marketplace WebSocket disconnected');
      
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        setSocket(new MockWebSocket(`ws://localhost:3001/marketplace-ws?userId=${userId}&userType=${userType}`));
      }, 3000);
    };

    ws.on('open', handleOpen);
    ws.on('message', handleMessage);
    ws.on('close', handleClose);

    setSocket(ws);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws.close();
    };
  }, [userId, userType]);

  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      const message: WebSocketMessage = {
        type: 'typing',
        data: {
          conversationId,
          userId,
          userName: userType === 'doctor' ? 'Dr.' : 'Company',
          isTyping,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        userId,
        conversationId
      };
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected, userId, userType]);

  return {
    isConnected,
    lastMessage,
    typingUsers,
    sendMessage,
    sendTypingIndicator
  };
};

// Hook for managing conversations
export const useMarketplaceConversations = (userId: string, userType: 'company' | 'doctor', filters?: MessageFilters) => {
  return useQuery({
    queryKey: ['marketplace-conversations', userId, userType, filters],
    queryFn: () => mockApi.getConversations(userId, userType, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false
  });
};

// Hook for managing messages in a conversation
export const useMarketplaceMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['marketplace-messages', conversationId],
    queryFn: () => mockApi.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });
};

// Hook for sending messages
export const useSendMarketplaceMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockApi.sendMessage,
    onSuccess: (newMessage) => {
      // Update messages cache
      queryClient.setQueryData(
        ['marketplace-messages', newMessage.conversationId],
        (oldData: MarketplaceMessage[] | undefined) => {
          return oldData ? [...oldData, newMessage] : [newMessage];
        }
      );

      // Update conversations cache
      queryClient.setQueryData(
        ['marketplace-conversations'],
        (oldData: MarketplaceConversation[] | undefined) => {
          return oldData?.map(conv =>
            conv.id === newMessage.conversationId
              ? { ...conv, lastMessage: newMessage, lastMessageAt: newMessage.sentAt }
              : conv
          ) || [];
        }
      );
    }
  });
};

// Hook for marking messages as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      mockApi.markAsRead(conversationId, userId),
    onSuccess: (_, { conversationId }) => {
      // Update conversations to mark as read
      queryClient.setQueryData(
        ['marketplace-conversations'],
        (oldData: MarketplaceConversation[] | undefined) => {
          return oldData?.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  unreadCount: { ...conv.unreadCount, doctor: 0, company: 0 }
                }
              : conv
          ) || [];
        }
      );
    }
  });
};

// Hook for notifications
export const useMarketplaceNotifications = (userId: string, userType: 'company' | 'doctor') => {
  return useQuery({
    queryKey: ['marketplace-notifications', userId, userType],
    queryFn: () => mockApi.getNotifications(userId, userType),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Check every 30 seconds
    refetchOnWindowFocus: false
  });
};

// Hook for message statistics
export const useMarketplaceMessageStats = (userId: string, userType: 'company' | 'doctor') => {
  return useQuery({
    queryKey: ['marketplace-message-stats', userId, userType],
    queryFn: () => mockApi.getMessageStats(userId, userType),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Hook for typing management
export const useTypingIndicator = (conversationId: string, userId: string, userType: 'company' | 'doctor') => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { sendTypingIndicator } = useMarketplaceWebSocket(userId, userType);

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }, 3000);
  }, [conversationId, isTyping, sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [conversationId, isTyping, sendTypingIndicator]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { isTyping, startTyping, stopTyping };
};
