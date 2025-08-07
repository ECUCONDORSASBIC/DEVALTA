import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { MarketplaceConversation, MarketplaceMessage, MessageNotification, TypingIndicator } from '../types/messaging';

interface MessagingState {
  // Conversations
  conversations: MarketplaceConversation[];
  activeConversationId: string | null;
  conversationMessages: Record<string, MarketplaceMessage[]>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  // WebSocket connection
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  webSocketInstance: WebSocket | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;

  // Notifications
  notifications: MessageNotification[];
  unreadCount: number;
  unreadByConversation: Record<string, number>;

  // Typing indicators
  typingUsers: TypingIndicator[];
  isUserTyping: Record<string, boolean>;

  // Message drafts
  messageDrafts: Record<string, string>;

  // Search and filters
  searchQuery: string;
  filteredConversations: MarketplaceConversation[];

  // UI state
  sidebarCollapsed: boolean;
  notificationsPanelOpen: boolean;
  selectedMessages: string[];

  // Actions
  // Conversations
  setConversations: (conversations: MarketplaceConversation[]) => void;
  addConversation: (conversation: MarketplaceConversation) => void;
  updateConversation: (conversationId: string, updates: Partial<MarketplaceConversation>) => void;
  removeConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setConversationsLoading: (loading: boolean) => void;

  // Messages
  setMessages: (conversationId: string, messages: MarketplaceMessage[]) => void;
  addMessage: (message: MarketplaceMessage) => void;
  updateMessage: (messageId: string, updates: Partial<MarketplaceMessage>) => void;
  removeMessage: (messageId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  setMessagesLoading: (loading: boolean) => void;

  // WebSocket
  setWebSocketInstance: (ws: WebSocket | null) => void;
  setConnectionStatus: (status: MessagingState['connectionStatus']) => void;
  setConnected: (connected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;

  // Notifications
  setNotifications: (notifications: MessageNotification[]) => void;
  addNotification: (notification: MessageNotification) => void;
  removeNotification: (notificationId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  updateUnreadCount: (count: number) => void;
  updateConversationUnreadCount: (conversationId: string, count: number) => void;

  // Typing indicators
  setTypingUsers: (users: TypingIndicator[]) => void;
  addTypingUser: (user: TypingIndicator) => void;
  removeTypingUser: (userId: string, conversationId: string) => void;
  setUserTyping: (conversationId: string, isTyping: boolean) => void;

  // Drafts
  setMessageDraft: (conversationId: string, draft: string) => void;
  clearMessageDraft: (conversationId: string) => void;
  getMessageDraft: (conversationId: string) => string;

  // Search
  setSearchQuery: (query: string) => void;
  filterConversations: (query: string) => void;
  clearSearch: () => void;

  // UI actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  toggleNotificationsPanel: () => void;
  setSelectedMessages: (messageIds: string[]) => void;
  toggleMessageSelection: (messageId: string) => void;
  clearMessageSelection: () => void;

  // Utility actions
  getActiveConversation: () => MarketplaceConversation | null;
  getActiveMessages: () => MarketplaceMessage[];
  getTotalUnreadCount: () => number;
  getConversationUnreadCount: (conversationId: string) => number;
  isConversationActive: (conversationId: string) => boolean;

  // Reset actions
  reset: () => void;
  resetMessages: () => void;
  resetNotifications: () => void;
}

const initialState = {
  conversations: [],
  activeConversationId: null,
  conversationMessages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  isConnected: false,
  connectionStatus: 'disconnected' as const,
  webSocketInstance: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  notifications: [],
  unreadCount: 0,
  unreadByConversation: {},
  typingUsers: [],
  isUserTyping: {},
  messageDrafts: {},
  searchQuery: '',
  filteredConversations: [],
  sidebarCollapsed: false,
  notificationsPanelOpen: false,
  selectedMessages: [],
};

export const useMessagingStore = create<MessagingState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Conversations
        setConversations: (conversations) => set({ conversations, filteredConversations: conversations }),
        addConversation: (conversation) => set((state) => {
          const newConversations = [conversation, ...state.conversations];
          return {
            conversations: newConversations,
            filteredConversations: state.searchQuery 
              ? newConversations.filter(c => 
                  c.participants.companyName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                  c.participants.doctorName.toLowerCase().includes(state.searchQuery.toLowerCase())
                )
              : newConversations
          };
        }),
        updateConversation: (conversationId, updates) => set((state) => {
          const updatedConversations = state.conversations.map(conv => 
            conv.id === conversationId ? { ...conv, ...updates } : conv
          );
          return {
            conversations: updatedConversations,
            filteredConversations: state.searchQuery 
              ? updatedConversations.filter(c => 
                  c.participants.companyName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                  c.participants.doctorName.toLowerCase().includes(state.searchQuery.toLowerCase())
                )
              : updatedConversations
          };
        }),
        removeConversation: (conversationId) => set((state) => {
          const filteredConversations = state.conversations.filter(conv => conv.id !== conversationId);
          const { [conversationId]: removed, ...remainingMessages } = state.conversationMessages;
          const { [conversationId]: removedDraft, ...remainingDrafts } = state.messageDrafts;
          const { [conversationId]: removedUnread, ...remainingUnread } = state.unreadByConversation;
          
          return {
            conversations: filteredConversations,
            filteredConversations: state.searchQuery 
              ? filteredConversations.filter(c => 
                  c.participants.companyName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                  c.participants.doctorName.toLowerCase().includes(state.searchQuery.toLowerCase())
                )
              : filteredConversations,
            conversationMessages: remainingMessages,
            messageDrafts: remainingDrafts,
            unreadByConversation: remainingUnread,
            activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
          };
        }),
        setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
        setConversationsLoading: (loading) => set({ isLoadingConversations: loading }),

        // Messages
        setMessages: (conversationId, messages) => set((state) => ({
          conversationMessages: { ...state.conversationMessages, [conversationId]: messages }
        })),
        addMessage: (message) => set((state) => {
          const conversationMessages = state.conversationMessages[message.conversationId] || [];
          return {
            conversationMessages: {
              ...state.conversationMessages,
              [message.conversationId]: [...conversationMessages, message]
            }
          };
        }),
        updateMessage: (messageId, updates) => set((state) => {
          const updatedMessages = { ...state.conversationMessages };
          Object.keys(updatedMessages).forEach(conversationId => {
            updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            );
          });
          return { conversationMessages: updatedMessages };
        }),
        removeMessage: (messageId) => set((state) => {
          const updatedMessages = { ...state.conversationMessages };
          Object.keys(updatedMessages).forEach(conversationId => {
            updatedMessages[conversationId] = updatedMessages[conversationId].filter(msg => msg.id !== messageId);
          });
          return { conversationMessages: updatedMessages };
        }),
        markMessageAsRead: (messageId) => set((state) => {
          const updatedMessages = { ...state.conversationMessages };
          Object.keys(updatedMessages).forEach(conversationId => {
            updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
              msg.id === messageId ? { ...msg, status: 'read' as const } : msg
            );
          });
          return { conversationMessages: updatedMessages };
        }),
        markConversationAsRead: (conversationId) => set((state) => ({
          unreadByConversation: { ...state.unreadByConversation, [conversationId]: 0 }
        })),
        setMessagesLoading: (loading) => set({ isLoadingMessages: loading }),

        // WebSocket
        setWebSocketInstance: (ws) => set({ webSocketInstance: ws }),
        setConnectionStatus: (status) => set({ connectionStatus: status, isConnected: status === 'connected' }),
        setConnected: (connected) => set({ isConnected: connected }),
        incrementReconnectAttempts: () => set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
        resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),

        // Notifications
        setNotifications: (notifications) => set({ notifications }),
        addNotification: (notification) => set((state) => ({ 
          notifications: [notification, ...state.notifications] 
        })),
        removeNotification: (notificationId) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== notificationId)
        })),
        markNotificationAsRead: (notificationId) => set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        })),
        updateUnreadCount: (count) => set({ unreadCount: count }),
        updateConversationUnreadCount: (conversationId, count) => set((state) => ({
          unreadByConversation: { ...state.unreadByConversation, [conversationId]: count }
        })),

        // Typing indicators
        setTypingUsers: (users) => set({ typingUsers: users }),
        addTypingUser: (user) => set((state) => {
          const existingIndex = state.typingUsers.findIndex(
            u => u.userId === user.userId && u.conversationId === user.conversationId
          );
          if (existingIndex >= 0) {
            const updatedUsers = [...state.typingUsers];
            updatedUsers[existingIndex] = user;
            return { typingUsers: updatedUsers };
          }
          return { typingUsers: [...state.typingUsers, user] };
        }),
        removeTypingUser: (userId, conversationId) => set((state) => ({
          typingUsers: state.typingUsers.filter(
            u => !(u.userId === userId && u.conversationId === conversationId)
          )
        })),
        setUserTyping: (conversationId, isTyping) => set((state) => ({
          isUserTyping: { ...state.isUserTyping, [conversationId]: isTyping }
        })),

        // Drafts
        setMessageDraft: (conversationId, draft) => set((state) => ({
          messageDrafts: { ...state.messageDrafts, [conversationId]: draft }
        })),
        clearMessageDraft: (conversationId) => set((state) => {
          const { [conversationId]: removed, ...remaining } = state.messageDrafts;
          return { messageDrafts: remaining };
        }),
        getMessageDraft: (conversationId) => get().messageDrafts[conversationId] || '',

        // Search
        setSearchQuery: (query) => {
          const state = get();
          const filtered = query 
            ? state.conversations.filter(c => 
                c.participants.companyName.toLowerCase().includes(query.toLowerCase()) ||
                c.participants.doctorName.toLowerCase().includes(query.toLowerCase()) ||
                c.jobTitle?.toLowerCase().includes(query.toLowerCase())
              )
            : state.conversations;
          set({ searchQuery: query, filteredConversations: filtered });
        },
        filterConversations: (query) => {
          const state = get();
          const filtered = query 
            ? state.conversations.filter(c => 
                c.participants.companyName.toLowerCase().includes(query.toLowerCase()) ||
                c.participants.doctorName.toLowerCase().includes(query.toLowerCase()) ||
                c.jobTitle?.toLowerCase().includes(query.toLowerCase())
              )
            : state.conversations;
          set({ filteredConversations: filtered });
        },
        clearSearch: () => set((state) => ({ 
          searchQuery: '', 
          filteredConversations: state.conversations 
        })),

        // UI actions
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
        toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),
        setSelectedMessages: (messageIds) => set({ selectedMessages: messageIds }),
        toggleMessageSelection: (messageId) => set((state) => ({
          selectedMessages: state.selectedMessages.includes(messageId)
            ? state.selectedMessages.filter(id => id !== messageId)
            : [...state.selectedMessages, messageId]
        })),
        clearMessageSelection: () => set({ selectedMessages: [] }),

        // Utility actions
        getActiveConversation: () => {
          const state = get();
          return state.conversations.find(c => c.id === state.activeConversationId) || null;
        },
        getActiveMessages: () => {
          const state = get();
          return state.activeConversationId 
            ? state.conversationMessages[state.activeConversationId] || []
            : [];
        },
        getTotalUnreadCount: () => {
          const state = get();
          return Object.values(state.unreadByConversation).reduce((total, count) => total + count, 0);
        },
        getConversationUnreadCount: (conversationId) => {
          const state = get();
          return state.unreadByConversation[conversationId] || 0;
        },
        isConversationActive: (conversationId) => {
          const state = get();
          return state.activeConversationId === conversationId;
        },

        // Reset actions
        reset: () => set(initialState),
        resetMessages: () => set({ 
          conversationMessages: {},
          messageDrafts: {},
          selectedMessages: [],
          activeConversationId: null 
        }),
        resetNotifications: () => set({ 
          notifications: [],
          unreadCount: 0,
          unreadByConversation: {} 
        }),
      }),
      {
        name: 'messaging-storage',
        partialize: (state) => ({
          conversations: state.conversations,
          unreadByConversation: state.unreadByConversation,
          messageDrafts: state.messageDrafts,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: 'messaging-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for better performance
export const useConversations = () => useMessagingStore((state) => state.conversations);
export const useFilteredConversations = () => useMessagingStore((state) => state.filteredConversations);
export const useActiveConversation = () => useMessagingStore((state) => state.getActiveConversation());
export const useActiveMessages = () => useMessagingStore((state) => state.getActiveMessages());
export const useUnreadCounts = () => useMessagingStore((state) => ({
  total: state.getTotalUnreadCount(),
  byConversation: state.unreadByConversation,
}));
export const useConnectionStatus = () => useMessagingStore((state) => ({
  isConnected: state.isConnected,
  status: state.connectionStatus,
}));
export const useTypingIndicators = () => useMessagingStore((state) => state.typingUsers);
export const useNotifications = () => useMessagingStore((state) => state.notifications);
export const useMessagingUI = () => useMessagingStore((state) => ({
  sidebarCollapsed: state.sidebarCollapsed,
  notificationsPanelOpen: state.notificationsPanelOpen,
  selectedMessages: state.selectedMessages,
  searchQuery: state.searchQuery,
}));
