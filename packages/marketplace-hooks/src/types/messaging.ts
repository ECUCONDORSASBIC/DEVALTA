export interface MarketplaceMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'company' | 'doctor';
  senderName: string;
  receiverId: string;
  receiverType: 'company' | 'doctor';
  receiverName: string;
  content: string;
  type: 'text' | 'file' | 'application' | 'interview' | 'offer' | 'system';
  metadata?: {
    jobId?: string;
    applicationId?: string;
    fileUrl?: string;
    fileName?: string;
    interviewDetails?: {
      date: string;
      type: 'phone' | 'video' | 'in-person';
      location?: string;
      meetingLink?: string;
    };
    offerDetails?: {
      position: string;
      salary: {
        amount: number;
        currency: string;
        type: 'hourly' | 'monthly' | 'yearly';
      };
      startDate: string;
      benefits: string[];
    };
  };
  status: 'sent' | 'delivered' | 'read';
  sentAt: string;
  readAt?: string;
  isImportant: boolean;
  replyToId?: string;
}

export interface MarketplaceConversation {
  id: string;
  jobId?: string;
  jobTitle?: string;
  applicationId?: string;
  participants: {
    companyId: string;
    companyName: string;
    companyLogo?: string;
    doctorId: string;
    doctorName: string;
    doctorAvatar?: string;
  };
  lastMessage?: MarketplaceMessage;
  lastMessageAt: string;
  unreadCount: {
    company: number;
    doctor: number;
  };
  status: 'active' | 'archived' | 'blocked';
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface MessageNotification {
  id: string;
  type: 'new_message' | 'new_application' | 'interview_scheduled' | 'offer_received' | 'application_update';
  title: string;
  message: string;
  userId: string;
  userType: 'company' | 'doctor';
  conversationId?: string;
  jobId?: string;
  applicationId?: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface MessageFilters {
  status?: ('active' | 'archived' | 'blocked')[];
  priority?: ('low' | 'medium' | 'high')[];
  hasUnread?: boolean;
  tags?: string[];
  jobIds?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'application' | 'interview' | 'offer' | 'rejection' | 'general';
  subject?: string;
  content: string;
  variables: string[];
  isDefault: boolean;
  userType: 'company' | 'doctor' | 'both';
  createdAt: string;
  updatedAt: string;
}

export interface MessageStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  unreadMessages: number;
  averageResponseTime: number; // in minutes
  conversationsByStatus: {
    active: number;
    archived: number;
    blocked: number;
  };
  messagesByType: {
    text: number;
    file: number;
    application: number;
    interview: number;
    offer: number;
    system: number;
  };
  dailyMessageVolume: {
    date: string;
    sent: number;
    received: number;
  }[];
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read_receipt' | 'status_update' | 'notification';
  data: any;
  timestamp: string;
  userId: string;
  conversationId?: string;
}
