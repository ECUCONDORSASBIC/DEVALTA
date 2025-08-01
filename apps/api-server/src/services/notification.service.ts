import { z } from 'zod';

// Notification schema
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'success', 'warning', 'error']),
  isRead: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional()
});

export type Notification = z.infer<typeof NotificationSchema>;

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isRead?: boolean;
  metadata?: Record<string, any>;
}

// Notification service class
export class NotificationService {
  async create(data: CreateNotificationData): Promise<Notification> {
    // Implementation would connect to database
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: data.metadata
    };

    return notification;
  }

  async findById(id: string): Promise<Notification | null> {
    // Implementation would query database
    return null;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    // Implementation would query database
    return [];
  }

  async update(id: string, data: UpdateNotificationData): Promise<Notification | null> {
    // Implementation would update database
    return null;
  }

  async delete(id: string): Promise<boolean> {
    // Implementation would delete from database
    return false;
  }

  async markAsRead(id: string): Promise<boolean> {
    return this.update(id, { isRead: true }) !== null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    // Implementation would update all notifications for user
    return 0;
  }
}

export const notificationService = new NotificationService();

// Add missing schemas that routes are trying to import
export const CreateNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'success', 'warning', 'error']),
  metadata: z.record(z.any()).optional()
});

export const MarkReadSchema = z.object({
  notificationIds: z.array(z.string().uuid())
});