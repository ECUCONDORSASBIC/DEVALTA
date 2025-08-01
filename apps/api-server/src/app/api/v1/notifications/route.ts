/**
 * 🔔 NOTIFICATIONS API - ALTAMEDICA (REFACTORED)
 * Endpoint refactorizado usando Service Pattern + Unified Auth
 * MIGRADO: De verifyAuthToken legacy a Unified Auth middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for notification queries
const NotificationSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
  type: z.enum(['info', 'warning', 'success', 'error', 'appointment', 'prescription', 'system', 'all']).default('all'),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'all']).default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeExpired: z.coerce.boolean().default(false),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema for creating notifications
const CreateNotificationSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  recipientType: z.enum(['user', 'doctor', 'patient', 'company', 'all']).default('user'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  type: z.enum(['info', 'warning', 'success', 'error', 'appointment', 'prescription', 'system']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  actionUrl: z.string().url().optional(),
  actionText: z.string().max(50).optional(),
  data: z.record(z.any()).optional(),
  expiresAt: z.string().optional(),
  sendPush: z.boolean().default(false),
  sendEmail: z.boolean().default(false),
  scheduleFor: z.string().optional(),
  channels: z.array(z.enum(['web', 'push', 'email', 'sms'])).default(['web'])
});

// Schema for bulk notifications
const BulkNotificationSchema = z.object({
  recipients: z.array(z.string()).min(1, 'At least one recipient required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['info', 'warning', 'success', 'error', 'appointment', 'prescription', 'system']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  actionUrl: z.string().url().optional(),
  actionText: z.string().max(50).optional(),
  data: z.record(z.any()).optional(),
  expiresAt: z.string().optional(),
  channels: z.array(z.enum(['web', 'push', 'email', 'sms'])).default(['web'])
});

/**
 * GET /api/v1/notifications
 * List notifications for authenticated user with advanced filtering
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const searchData = NotificationSearchSchema.parse(Object.fromEntries(searchParams));
      
      const { page, limit, unreadOnly, type, priority, startDate, endDate, includeExpired, sortBy, sortOrder } = searchData;
      const offset = (page - 1) * limit;

      // Build query for user's notifications
      let query: any = adminDb.collection('notifications');

      // Filter by recipient - user can see notifications for them or global 'all'
      query = query.where('userId', 'in', [authContext.user.uid, 'all']);

      // Filter by read status
      if (unreadOnly) {
        query = query.where('isRead', '==', false);
      }

      // Filter by type
      if (type !== 'all') {
        query = query.where('type', '==', type);
      }

      // Filter by priority
      if (priority !== 'all') {
        query = query.where('priority', '==', priority);
      }

      // Date filtering
      if (startDate) {
        query = query.where('createdAt', '>=', new Date(startDate));
      }
      if (endDate) {
        query = query.where('createdAt', '<=', new Date(endDate));
      }

      // Expiration filtering
      if (!includeExpired) {
        const now = new Date();
        query = query.where('expiresAt', '>', now);
      }

      // Sort and paginate
      query = query.orderBy('createdAt', sortOrder).offset(offset).limit(limit);

      const snapshot = await query.get();
      
      const notifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || data.createdAt,
          updatedAt: data.updatedAt?.toDate() || data.updatedAt,
          readAt: data.readAt?.toDate() || data.readAt,
          expiresAt: data.expiresAt?.toDate() || data.expiresAt,
          scheduledFor: data.scheduledFor?.toDate() || data.scheduledFor
        };
      });

      // Get unread count efficiently
      const unreadCountQuery = adminDb.collection('notifications')
        .where('userId', 'in', [authContext.user.uid, 'all'])
        .where('isRead', '==', false);
        
      if (!includeExpired) {
        unreadCountQuery.where('expiresAt', '>', new Date());
      }
      
      const unreadSnapshot = await unreadCountQuery.get();
      const unreadCount = unreadSnapshot.size;

      // Get total count for pagination
      let totalQuery: any = adminDb.collection('notifications')
        .where('userId', 'in', [authContext.user.uid, 'all']);
      
      if (!includeExpired) {
        totalQuery = totalQuery.where('expiresAt', '>', new Date());
      }
      
      const totalSnapshot = await totalQuery.get();
      const total = totalSnapshot.size;

      // Get notification statistics
      const stats = await getNotificationStats(authContext.user.uid);

      return NextResponse.json(
        createSuccessResponse(notifications, {
          unreadCount,
          total,
          page,
          limit,
          hasNext: offset + limit < total,
          hasPrev: page > 1,
          stats
        })
      );

    } catch (error) {
      console.error('Error in GET /notifications:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid query parameters', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error fetching notifications'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'company', 'nurse'],
    auditAction: 'notifications_accessed',
    rateLimitKey: 'notifications'
  }
);

/**
 * POST /api/v1/notifications
 * Create new notification (Admin/System only)
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const body = await request.json();
      
      // Check for bulk notifications first
      const isBulkNotification = body.recipients && Array.isArray(body.recipients);
      
      if (isBulkNotification) {
        // Validate bulk notification data
        const bulkData = BulkNotificationSchema.parse(body);
        
        const notifications = [];
        const batch = adminDb.batch();
        
        // Create individual notifications for each recipient
        for (const recipientId of bulkData.recipients) {
          const notificationData = {
            userId: recipientId,
            title: bulkData.title,
            message: bulkData.message,
            type: bulkData.type,
            priority: bulkData.priority,
            actionUrl: bulkData.actionUrl,
            actionText: bulkData.actionText,
            data: bulkData.data || {},
            expiresAt: bulkData.expiresAt ? new Date(bulkData.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            channels: bulkData.channels,
            isRead: false,
            createdAt: new Date(),
            createdBy: authContext.user.uid
          };
          
          const notifRef = adminDb.collection('notifications').doc();
          batch.set(notifRef, notificationData);
          notifications.push({ id: notifRef.id, ...notificationData });
        }
        
        // Commit batch
        await batch.commit();
        
        // Send push/email notifications if requested
        if (bulkData.channels.includes('push') || bulkData.channels.includes('email')) {
          // Queue background job for external notifications
          await queueNotificationDelivery(notifications, bulkData.channels);
        }
        
        // Audit log
        await adminDb.collection('audit_logs').add({
          action: 'bulk_notifications_created',
          userId: authContext.user.uid,
          resourceType: 'notification',
          resourceId: 'bulk',
          details: {
            recipientCount: bulkData.recipients.length,
            type: bulkData.type,
            priority: bulkData.priority,
            channels: bulkData.channels
          },
          timestamp: new Date(),
          ipAddress: getClientIP(request),
          userAgent: request.headers.get('user-agent')
        });
        
        return NextResponse.json(
          createSuccessResponse({
            notificationsSent: notifications.length,
            notifications: notifications.map(n => ({ id: n.id, recipientId: n.userId, type: n.type }))
          }, {
            message: `${notifications.length} notifications created successfully`
          }),
          { status: 201 }
        );
        
      } else {
        // Single notification
        const notificationData = CreateNotificationSchema.parse(body);
        
        // Handle 'all' recipient type for system-wide notifications
        if (notificationData.recipientId === 'all') {
          // Get all active users based on recipient type
          let usersQuery = adminDb.collection('users').where('isActive', '==', true);
          
          if (notificationData.recipientType !== 'all') {
            usersQuery = usersQuery.where('role', '==', notificationData.recipientType);
          }
          
          const usersSnapshot = await usersQuery.get();
          const recipientIds = usersSnapshot.docs.map(doc => doc.id);
          
          // Convert to bulk notification
          const bulkNotificationData = {
            recipients: recipientIds,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            priority: notificationData.priority,
            actionUrl: notificationData.actionUrl,
            actionText: notificationData.actionText,
            data: notificationData.data,
            expiresAt: notificationData.expiresAt,
            channels: notificationData.channels
          };
          
          const validatedBulkData = BulkNotificationSchema.parse(bulkNotificationData);
          
          // Create bulk notifications
          const notifications = [];
          const batch = adminDb.batch();
          
          for (const recipientId of validatedBulkData.recipients) {
            const singleNotificationData = {
              userId: recipientId,
              title: validatedBulkData.title,
              message: validatedBulkData.message,
              type: validatedBulkData.type,
              priority: validatedBulkData.priority,
              actionUrl: validatedBulkData.actionUrl,
              actionText: validatedBulkData.actionText,
              data: validatedBulkData.data || {},
              expiresAt: validatedBulkData.expiresAt ? new Date(validatedBulkData.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              channels: validatedBulkData.channels,
              isRead: false,
              createdAt: new Date(),
              createdBy: authContext.user.uid
            };
            
            const notifRef = adminDb.collection('notifications').doc();
            batch.set(notifRef, singleNotificationData);
            notifications.push({ id: notifRef.id, ...singleNotificationData });
          }
          
          await batch.commit();
          
          return NextResponse.json(
            createSuccessResponse({
              notificationsSent: notifications.length,
              type: 'system_wide'
            }, {
              message: `System-wide notification sent to ${notifications.length} users`
            }),
            { status: 201 }
          );
          
        } else {
          // Single recipient notification
          
          // Verify recipient exists
          const recipientDoc = await adminDb.collection('users').doc(notificationData.recipientId).get();
          if (!recipientDoc.exists) {
            return NextResponse.json(
              createErrorResponse('RECIPIENT_NOT_FOUND', 'Recipient user not found'),
              { status: 404 }
            );
          }
          
          // Create notification
          const newNotification = {
            userId: notificationData.recipientId,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            priority: notificationData.priority,
            actionUrl: notificationData.actionUrl,
            actionText: notificationData.actionText,
            data: notificationData.data || {},
            expiresAt: notificationData.expiresAt ? new Date(notificationData.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            scheduledFor: notificationData.scheduleFor ? new Date(notificationData.scheduleFor) : null,
            channels: notificationData.channels,
            isRead: false,
            deliveryStatus: {
              web: 'delivered',
              push: notificationData.sendPush ? 'pending' : 'not_requested',
              email: notificationData.sendEmail ? 'pending' : 'not_requested',
              sms: notificationData.channels.includes('sms') ? 'pending' : 'not_requested'
            },
            createdAt: new Date(),
            createdBy: authContext.user.uid
          };
          
          const notificationRef = await adminDb.collection('notifications').add(newNotification);
          
          // Queue external notifications if requested
          const externalChannels = notificationData.channels.filter(c => c !== 'web');
          if (externalChannels.length > 0) {
            await queueNotificationDelivery([{ id: notificationRef.id, ...newNotification }], externalChannels);
          }
          
          // Audit log
          await adminDb.collection('audit_logs').add({
            action: 'notification_created',
            userId: authContext.user.uid,
            resourceType: 'notification',
            resourceId: notificationRef.id,
            details: {
              recipientId: notificationData.recipientId,
              type: notificationData.type,
              priority: notificationData.priority,
              channels: notificationData.channels,
              hasSchedule: !!notificationData.scheduleFor
            },
            timestamp: new Date(),
            ipAddress: getClientIP(request),
            userAgent: request.headers.get('user-agent')
          });
          
          return NextResponse.json(
            createSuccessResponse({
              id: notificationRef.id,
              ...newNotification
            }),
            { status: 201 }
          );
        }
      }
      
    } catch (error) {
      console.error('Error in POST /notifications:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid notification data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error creating notification'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'system'],
    requiredPermissions: ['notifications:create'],
    auditAction: 'notification_created',
    rateLimitKey: 'notification_create'
  }
);

// Helper functions
async function getNotificationStats(userId: string): Promise<any> {
  try {
    const statsQuery = adminDb.collection('notifications')
      .where('userId', 'in', [userId, 'all']);
    
    const snapshot = await statsQuery.get();
    const notifications = snapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      lastWeek: 0,
      lastMonth: 0
    };
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const notification of notifications) {
      // Count by type
      const type = notification.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Count by priority
      const priority = notification.priority || 'medium';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
      
      // Count recent notifications
      const createdAt = notification.createdAt?.toDate() || new Date(notification.createdAt);
      if (createdAt > oneWeekAgo) stats.lastWeek++;
      if (createdAt > oneMonthAgo) stats.lastMonth++;
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return {
      total: 0,
      unread: 0,
      byType: {},
      byPriority: {},
      lastWeek: 0,
      lastMonth: 0
    };
  }
}

async function queueNotificationDelivery(notifications: any[], channels: string[]): Promise<void> {
  try {
    // In a real implementation, this would queue jobs to a background job processor
    // For now, we'll just log the intent
    console.log(`Queuing ${notifications.length} notifications for delivery via channels:`, channels);
    
    for (const notification of notifications) {
      // Push notifications
      if (channels.includes('push')) {
        // Queue push notification job
        console.log(`Push notification queued for user ${notification.userId}: ${notification.title}`);
      }
      
      // Email notifications
      if (channels.includes('email')) {
        // Queue email job
        console.log(`Email notification queued for user ${notification.userId}: ${notification.title}`);
      }
      
      // SMS notifications
      if (channels.includes('sms')) {
        // Queue SMS job
        console.log(`SMS notification queued for user ${notification.userId}: ${notification.title}`);
      }
    }
    
    // In production, you would integrate with services like:
    // - Firebase Cloud Messaging for push notifications
    // - SendGrid/SES for email
    // - Twilio for SMS
    // - Bull/Agenda for job queuing
    
  } catch (error) {
    console.error('Error queuing notification delivery:', error);
    // Don't throw error - notification was created successfully, delivery is secondary
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}
