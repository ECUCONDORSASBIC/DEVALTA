/**
 * 🔔 WEBSOCKET NOTIFICATIONS API
 * Real-time notifications via WebSocket
 * 
 * WebSocket /api/v1/notifications/websocket
 * 
 * Handles:
 * - Client connections and authentication
 * - Real-time notification delivery
 * - Connection management
 * - Heartbeat monitoring
 */

import { verifyAuthToken } from '@/lib/simple-auth';
import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest } from 'next/server';

const db = getFirestore();

// Store active connections
const activeConnections = new Map<string, {
  ws: WebSocket;
  userId: string;
  userRole: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  subscriptions: string[];
}>();

// WebSocket connection handler
export async function GET(request: NextRequest) {
  try {
    // Upgrade to WebSocket
    const { socket, response } = await (request as any).webSocket();
    
    if (!socket) {
      return new Response('WebSocket upgrade failed', { status: 400 });
    }

    let authenticatedUser: { id: string; role: string } | null = null;
    let connectionId: string | null = null;

    // Handle WebSocket events
    socket.addEventListener('open', () => {
      console.log('WebSocket connection opened');
    });

    socket.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'AUTHENTICATE':
            await handleAuthentication(socket, data, authenticatedUser, connectionId);
            break;
            
          case 'SUBSCRIBE':
            await handleSubscription(socket, data, authenticatedUser, connectionId);
            break;
            
          case 'UNSUBSCRIBE':
            await handleUnsubscription(socket, data, authenticatedUser, connectionId);
            break;
            
          case 'HEARTBEAT':
            await handleHeartbeat(socket, connectionId);
            break;
            
          case 'GET_NOTIFICATIONS':
            await handleGetNotifications(socket, authenticatedUser);
            break;
            
          default:
            socket.send(JSON.stringify({
              type: 'ERROR',
              error: 'Unknown message type',
              messageId: data.messageId
            }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        socket.send(JSON.stringify({
          type: 'ERROR',
          error: 'Invalid message format',
          messageId: event.data?.messageId
        }));
      }
    });

    socket.addEventListener('close', () => {
      if (connectionId && activeConnections.has(connectionId)) {
        activeConnections.delete(connectionId);
        console.log(`WebSocket connection closed: ${connectionId}`);
      }
    });

    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      if (connectionId && activeConnections.has(connectionId)) {
        activeConnections.delete(connectionId);
      }
    });

    return response;

  } catch (error) {
    console.error('WebSocket setup error:', error);
    return new Response('WebSocket setup failed', { status: 500 });
  }
}

// Authentication handler
async function handleAuthentication(
  socket: WebSocket, 
  data: any, 
  authenticatedUser: { id: string; role: string } | null,
  connectionId: string | null
) {
  try {
    // Verify token
    const authResult = await verifyAuthToken(data.token);
    if (!authResult.success || !authResult.user) {
      socket.send(JSON.stringify({
        type: 'AUTH_ERROR',
        error: 'Invalid authentication token',
        messageId: data.messageId
      }));
      return;
    }

    // Generate connection ID
    connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    authenticatedUser = {
      id: authResult.user.id,
      role: authResult.user.role
    };

    // Store connection
    activeConnections.set(connectionId, {
      ws: socket,
      userId: authenticatedUser.id,
      userRole: authenticatedUser.role,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      subscriptions: ['notifications', 'appointments', 'telemedicine']
    });

    // Send authentication success
    socket.send(JSON.stringify({
      type: 'AUTHENTICATED',
      connectionId,
      userId: authenticatedUser.id,
      userRole: authenticatedUser.role,
      messageId: data.messageId
    }));

    // Send initial notifications
    await sendInitialNotifications(socket, authenticatedUser.id);

  } catch (error) {
    console.error('Authentication error:', error);
    socket.send(JSON.stringify({
      type: 'AUTH_ERROR',
      error: 'Authentication failed',
      messageId: data.messageId
    }));
  }
}

// Subscription handler
async function handleSubscription(
  socket: WebSocket, 
  data: any, 
  authenticatedUser: { id: string; role: string } | null,
  connectionId: string | null
) {
  if (!connectionId || !activeConnections.has(connectionId)) {
    socket.send(JSON.stringify({
      type: 'ERROR',
      error: 'Not authenticated',
      messageId: data.messageId
    }));
    return;
  }

  const connection = activeConnections.get(connectionId)!;
  const { channel } = data;

  if (!connection.subscriptions.includes(channel)) {
    connection.subscriptions.push(channel);
  }

  socket.send(JSON.stringify({
    type: 'SUBSCRIBED',
    channel,
    messageId: data.messageId
  }));
}

// Unsubscription handler
async function handleUnsubscription(
  socket: WebSocket, 
  data: any, 
  authenticatedUser: { id: string; role: string } | null,
  connectionId: string | null
) {
  if (!connectionId || !activeConnections.has(connectionId)) {
    socket.send(JSON.stringify({
      type: 'ERROR',
      error: 'Not authenticated',
      messageId: data.messageId
    }));
    return;
  }

  const connection = activeConnections.get(connectionId)!;
  const { channel } = data;

  connection.subscriptions = connection.subscriptions.filter(sub => sub !== channel);

  socket.send(JSON.stringify({
    type: 'UNSUBSCRIBED',
    channel,
    messageId: data.messageId
  }));
}

// Heartbeat handler
async function handleHeartbeat(
  socket: WebSocket, 
  connectionId: string | null
) {
  if (!connectionId || !activeConnections.has(connectionId)) {
    return;
  }

  const connection = activeConnections.get(connectionId)!;
  connection.lastHeartbeat = new Date();

  socket.send(JSON.stringify({
    type: 'HEARTBEAT_ACK',
    timestamp: new Date().toISOString()
  }));
}

// Get notifications handler
async function handleGetNotifications(
  socket: WebSocket, 
  authenticatedUser: { id: string; role: string } | null
) {
  if (!authenticatedUser) {
    socket.send(JSON.stringify({
      type: 'ERROR',
      error: 'Not authenticated'
    }));
    return;
  }

  try {
    // Get recent unread notifications
    const snapshot = await db.collection('notifications')
      .where('recipient_id', 'in', [authenticatedUser.id, 'all'])
      .where('is_read', '==', false)
      .orderBy('created_at', 'desc')
      .limit(10)
      .get();

    const notifications = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    socket.send(JSON.stringify({
      type: 'NOTIFICATIONS_LIST',
      notifications,
      unreadCount: notifications.length
    }));

  } catch (error) {
    console.error('Get notifications error:', error);
    socket.send(JSON.stringify({
      type: 'ERROR',
      error: 'Failed to get notifications'
    }));
  }
}

// Send initial notifications
async function sendInitialNotifications(socket: WebSocket, userId: string) {
  try {
    const snapshot = await db.collection('notifications')
      .where('recipient_id', 'in', [userId, 'all'])
      .where('is_read', '==', false)
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();

    const notifications = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    if (notifications.length > 0) {
      socket.send(JSON.stringify({
        type: 'INITIAL_NOTIFICATIONS',
        notifications,
        unreadCount: notifications.length
      }));
    }

  } catch (error) {
    console.error('Send initial notifications error:', error);
  }
}

// Utility function to send notification to specific user
export async function sendNotificationToUser(
  userId: string, 
  notification: {
    title: string;
    message: string;
    type: string;
    priority: string;
    data?: Record<string, unknown>;
  }
) {
  const connections = Array.from(activeConnections.values())
    .filter(conn => conn.userId === userId);

  for (const connection of connections) {
    if (connection.subscriptions.includes('notifications')) {
      try {
        connection.ws.send(JSON.stringify({
          type: 'NEW_NOTIFICATION',
          notification: {
            id: `temp_${Date.now()}`,
            ...notification,
            created_at: new Date().toISOString()
          }
        }));
      } catch (error) {
        console.error('Error sending notification to WebSocket:', error);
        // Remove broken connection
        const connectionId = Array.from(activeConnections.entries())
          .find(([_, conn]) => conn === connection)?.[0];
        if (connectionId) {
          activeConnections.delete(connectionId);
        }
      }
    }
  }
}

// Utility function to broadcast to all users
export async function broadcastNotification(
  notification: {
    title: string;
    message: string;
    type: string;
    priority: string;
    data?: Record<string, unknown>;
  }
) {
  const connections = Array.from(activeConnections.values());

  for (const connection of connections) {
    if (connection.subscriptions.includes('notifications')) {
      try {
        connection.ws.send(JSON.stringify({
          type: 'NEW_NOTIFICATION',
          notification: {
            id: `temp_${Date.now()}`,
            ...notification,
            created_at: new Date().toISOString()
          }
        }));
      } catch (error) {
        console.error('Error broadcasting notification:', error);
        // Remove broken connection
        const connectionId = Array.from(activeConnections.entries())
          .find(([_, conn]) => conn === connection)?.[0];
        if (connectionId) {
          activeConnections.delete(connectionId);
        }
      }
    }
  }
}

// Cleanup function for expired connections
export function cleanupExpiredConnections() {
  const now = new Date();
  const expiredConnections: string[] = [];

  for (const [connectionId, connection] of activeConnections.entries()) {
    const timeSinceHeartbeat = now.getTime() - connection.lastHeartbeat.getTime();
    if (timeSinceHeartbeat > 5 * 60 * 1000) { // 5 minutes
      expiredConnections.push(connectionId);
    }
  }

  for (const connectionId of expiredConnections) {
    const connection = activeConnections.get(connectionId);
    if (connection) {
      try {
        connection.ws.close();
      } catch (error) {
        console.error('Error closing expired connection:', error);
      }
    }
    activeConnections.delete(connectionId);
  }

  if (expiredConnections.length > 0) {
    console.log(`Cleaned up ${expiredConnections.length} expired WebSocket connections`);
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredConnections, 60 * 1000); 