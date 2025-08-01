import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { z } from 'zod';

export interface AgentConfig {
  port: number;
  host: string;
  name: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  corsOrigins: string[];
  enableWebSocket: boolean;
  enableMetrics: boolean;
  healthCheckInterval: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: Record<string, boolean>;
}

export interface MetricPoint {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
}

export abstract class BaseAgent extends EventEmitter {
  protected app: Application;
  protected server: Server | null = null;
  protected wsServer: WebSocketServer | null = null;
  protected config: AgentConfig;
  protected startTime: number;
  protected metrics: Map<string, MetricPoint[]> = new Map();
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.startTime = Date.now();
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigins,
      credentials: true
    }));
    
    // Compression
    this.app.use(compression());
    
    // Request logging
    this.app.use(morgan('combined'));
    
    // JSON parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      const health = this.getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(health);
    });

    // Detailed health check
    this.app.get('/health/detailed', (req: Request, res: Response) => {
      const health = this.getDetailedHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(health);
    });

    // Metrics endpoint
    if (this.config.enableMetrics) {
      this.app.get('/metrics', (req: Request, res: Response) => {
        res.json(this.getMetrics());
      });
    }

    // Agent info endpoint
    this.app.get('/info', (req: Request, res: Response) => {
      res.json({
        name: this.config.name,
        version: process.env.npm_package_version || '1.0.0',
        uptime: Date.now() - this.startTime,
        nodeVersion: process.version,
        pid: process.pid
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
      });
    });

    // Global error handler
    this.app.use((err: Error, req: Request, res: Response, next: any) => {
      console.error(`[${this.config.name}] Error:`, err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
  }

  protected abstract setupCustomRoutes(): void;
  protected abstract performHealthChecks(): Record<string, boolean>;
  protected abstract getCustomMetrics(): MetricPoint[];

  public async start(): Promise<void> {
    try {
      // Setup custom routes for the specific agent
      this.setupCustomRoutes();

      // Start HTTP server
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        console.log(`[${this.config.name}] Server started on http://${this.config.host}:${this.config.port}`);
      });

      // Setup WebSocket server if enabled
      if (this.config.enableWebSocket) {
        this.setupWebSocket();
      }

      // Start health check timer
      this.startHealthCheckTimer();

      // Emit started event
      this.emit('started');
    } catch (error) {
      console.error(`[${this.config.name}] Failed to start:`, error);
      throw error;
    }
  }

  private setupWebSocket(): void {
    if (!this.server) return;

    this.wsServer = new WebSocketServer({ server: this.server });
    
    this.wsServer.on('connection', (ws: WebSocket, req: Request) => {
      console.log(`[${this.config.name}] WebSocket connection from ${req.socket.remoteAddress}`);
      
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error(`[${this.config.name}] Invalid WebSocket message:`, error);
        }
      });

      ws.on('close', () => {
        console.log(`[${this.config.name}] WebSocket connection closed`);
      });

      ws.on('error', (error: Error) => {
        console.error(`[${this.config.name}] WebSocket error:`, error);
      });
    });
  }

  protected handleWebSocketMessage(ws: WebSocket, message: any): void {
    // Override in subclasses to handle specific WebSocket messages
    ws.send(JSON.stringify({ type: 'pong', data: message }));
  }

  public async stop(): Promise<void> {
    console.log(`[${this.config.name}] Stopping agent...`);

    // Clear health check timer
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
      this.wsServer = null;
    }

    // Close HTTP server
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log(`[${this.config.name}] Server stopped`);
          resolve();
        });
      });
    }
  }

  private startHealthCheckTimer(): void {
    this.healthCheckTimer = setInterval(() => {
      const checks = this.performHealthChecks();
      this.recordMetric('health_check_status', Object.values(checks).every(Boolean) ? 1 : 0);
    }, this.config.healthCheckInterval);
  }

  private getHealthStatus(): HealthStatus {
    const checks = this.performHealthChecks();
    const allHealthy = Object.values(checks).every(Boolean);
    const partiallyHealthy = Object.values(checks).some(Boolean);
    
    return {
      status: allHealthy ? 'healthy' : partiallyHealthy ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      checks
    };
  }

  private getDetailedHealthStatus(): HealthStatus & { details: any } {
    const baseHealth = this.getHealthStatus();
    return {
      ...baseHealth,
      details: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      }
    };
  }

  protected recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    const metric: MetricPoint = {
      name,
      value,
      timestamp: new Date().toISOString(),
      labels
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 1000 points per metric
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  private getMetrics(): Record<string, MetricPoint[]> {
    const allMetrics: Record<string, MetricPoint[]> = {};

    // Add base metrics
    this.recordMetric('uptime_seconds', (Date.now() - this.startTime) / 1000);
    this.recordMetric('memory_usage_bytes', process.memoryUsage().heapUsed);
    this.recordMetric('cpu_usage_percent', process.cpuUsage().user / 1000);

    // Add custom metrics
    const customMetrics = this.getCustomMetrics();
    customMetrics.forEach(metric => {
      this.recordMetric(metric.name, metric.value, metric.labels);
    });

    // Convert to object
    for (const [name, metrics] of this.metrics) {
      allMetrics[name] = metrics;
    }

    return allMetrics;
  }

  protected validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }

  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: any): void {
    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = logLevels[this.config.logLevel];
    const messageLevel = logLevels[level];

    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        agent: this.config.name,
        message,
        meta
      };

      console.log(JSON.stringify(logEntry));
    }
  }
}
