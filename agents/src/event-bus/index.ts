import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { EventEmitter } from 'events';
import { z } from 'zod';
import crypto from 'crypto';

// Event message schema
const EventMessageSchema = z.object({
  id: z.string(),
  type: z.string(),
  source: z.string(),
  timestamp: z.string(),
  data: z.any(),
  correlationId: z.string().optional()
});

interface Client {
  id: string;
  name: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  connectedAt: Date;
}

interface EventMetrics {
  totalEvents: number;
  eventsByType: Map<string, number>;
  eventsBySource: Map<string, number>;
  errors: number;
}

export class EventBus extends EventEmitter {
  private app: express.Application;
  private server: any;
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private eventHistory: any[] = [];
  private metrics: EventMetrics = {
    totalEvents: 0,
    eventsByType: new Map(),
    eventsBySource: new Map(),
    errors: 0
  };
  private port: number;

  constructor(port: number = 3010) {
    super();
    this.port = port;
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.use(express.json());

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        clients: this.clients.size,
        totalEvents: this.metrics.totalEvents,
        uptime: process.uptime()
      });
    });

    // Get connected clients
    this.app.get('/clients', (req, res) => {
      const clientList = Array.from(this.clients.values()).map(client => ({
        id: client.id,
        name: client.name,
        subscriptions: Array.from(client.subscriptions),
        connectedAt: client.connectedAt
      }));
      res.json(clientList);
    });

    // Get metrics
    this.app.get('/metrics', (req, res) => {
      res.json({
        totalEvents: this.metrics.totalEvents,
        eventsByType: Object.fromEntries(this.metrics.eventsByType),
        eventsBySource: Object.fromEntries(this.metrics.eventsBySource),
        errors: this.metrics.errors,
        clientCount: this.clients.size,
        eventHistorySize: this.eventHistory.length
      });
    });

    // Get event history
    this.app.get('/events/history', (req, res) => {
      const limit = parseInt(req.query.limit as string) || 100;
      res.json(this.eventHistory.slice(-limit));
    });

    // Publish event via HTTP (for non-WebSocket clients)
    this.app.post('/events/publish', (req, res) => {
      try {
        const event = EventMessageSchema.parse(req.body);
        this.handleEvent(event, null);
        res.json({ success: true, eventId: event.id });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  public start(): void {
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ 
      server: this.server,
      path: '/event-bus'
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = crypto.randomUUID();
      const client: Client = {
        id: clientId,
        name: 'unknown',
        ws,
        subscriptions: new Set(),
        connectedAt: new Date()
      };

      this.clients.set(clientId, client);
      console.log(`[EventBus] Client connected: ${clientId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        clientId,
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(client, message);
        } catch (error) {
          console.error('[EventBus] Invalid message from client:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        console.log(`[EventBus] Client disconnected: ${client.name} (${clientId})`);
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error(`[EventBus] WebSocket error for client ${clientId}:`, error);
      });
    });

    this.server.listen(this.port, () => {
      console.log(`[EventBus] Started on port ${this.port}`);
    });
  }

  private handleClientMessage(client: Client, message: any): void {
    switch (message.type) {
      case 'identify':
        client.name = message.name || client.name;
        console.log(`[EventBus] Client identified: ${client.name} (${client.id})`);
        break;

      case 'subscribe':
        if (message.patterns && Array.isArray(message.patterns)) {
          message.patterns.forEach((pattern: string) => {
            client.subscriptions.add(pattern);
          });
          console.log(`[EventBus] ${client.name} subscribed to: ${message.patterns.join(', ')}`);
        }
        break;

      case 'unsubscribe':
        if (message.patterns && Array.isArray(message.patterns)) {
          message.patterns.forEach((pattern: string) => {
            client.subscriptions.delete(pattern);
          });
        }
        break;

      case 'event':
        try {
          const event = EventMessageSchema.parse(message);
          this.handleEvent(event, client.id);
        } catch (error) {
          client.ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid event format',
            details: error.message
          }));
        }
        break;

      default:
        console.log(`[EventBus] Unknown message type from ${client.name}: ${message.type}`);
    }
  }

  private handleEvent(event: z.infer<typeof EventMessageSchema>, senderId: string | null): void {
    // Update metrics
    this.metrics.totalEvents++;
    this.metrics.eventsByType.set(
      event.type,
      (this.metrics.eventsByType.get(event.type) || 0) + 1
    );
    this.metrics.eventsBySource.set(
      event.source,
      (this.metrics.eventsBySource.get(event.source) || 0) + 1
    );

    // Add to history
    this.eventHistory.push({
      ...event,
      receivedAt: new Date().toISOString()
    });

    // Keep history size limited
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-500);
    }

    console.log(`[EventBus] Event: ${event.type} from ${event.source}`);

    // Forward to subscribed clients
    let forwardedCount = 0;
    this.clients.forEach((client, clientId) => {
      // Don't send back to sender
      if (clientId === senderId) return;

      // Check if client is subscribed to this event type
      const isSubscribed = Array.from(client.subscriptions).some(pattern => {
        if (pattern === '*') return true;
        if (pattern === event.type) return true;
        
        // Support wildcard patterns
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(event.type);
      });

      if (isSubscribed && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(event));
        forwardedCount++;
      }
    });

    console.log(`[EventBus] Forwarded to ${forwardedCount} clients`);
  }

  public stop(): void {
    this.wss.close();
    this.server.close();
    console.log('[EventBus] Stopped');
  }
}

// Start the event bus if run directly
if (require.main === module) {
  const eventBus = new EventBus();
  eventBus.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[EventBus] Shutting down...');
    eventBus.stop();
    process.exit(0);
  });
}
