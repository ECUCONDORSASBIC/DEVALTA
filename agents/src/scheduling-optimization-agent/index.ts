import { BaseAgent, AgentConfig, MetricPoint } from '../shared/BaseAgent';
import { Request, Response } from 'express';
import { WebSocket } from 'ws';
import { z } from 'zod';
import axios from 'axios';
import { EventEmitter } from 'events';

// Schema definitions
const StaffMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(z.string()),
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string()
  })),
  maxHoursPerWeek: z.number(),
  preferredShifts: z.array(z.string()).optional()
});

const AppointmentRequestSchema = z.object({
  patientId: z.string(),
  type: z.enum(['consultation', 'procedure', 'followup', 'emergency']),
  duration: z.number(),
  requiredSkills: z.array(z.string()),
  preferredTimeSlots: z.array(z.object({
    startTime: z.string(),
    endTime: z.string()
  })).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

const RoomResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['consultation', 'procedure', 'surgery', 'imaging']),
  equipment: z.array(z.string()),
  capacity: z.number(),
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string()
  }))
});

const SchedulingConstraintSchema = z.object({
  type: z.enum(['hard', 'soft']),
  name: z.string(),
  description: z.string(),
  weight: z.number().optional()
});

const OptimizationRequestSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  staff: z.array(StaffMemberSchema),
  appointments: z.array(AppointmentRequestSchema),
  rooms: z.array(RoomResourceSchema),
  constraints: z.array(SchedulingConstraintSchema).optional()
});

interface SchedulingOptimizationConfig extends AgentConfig {
  optaplannerServiceUrl: string;
  mlServiceUrl: string;
  redisHost: string;
  redisPort: number;
  kafkaBrokers: string[];
  demandForecastingEnabled: boolean;
}

interface DemandForecast {
  date: string;
  appointmentType: string;
  predictedDemand: number;
  confidence: number;
}

interface OptimizationResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  score: {
    hardScore: number;
    softScore: number;
  };
  schedule: {
    appointments: Array<{
      id: string;
      patientId: string;
      staffId: string;
      roomId: string;
      startTime: string;
      endTime: string;
    }>;
    staffRosters: Array<{
      staffId: string;
      shifts: Array<{
        date: string;
        startTime: string;
        endTime: string;
      }>;
    }>;
  };
  metrics: {
    utilizationRate: number;
    staffSatisfaction: number;
    patientWaitTime: number;
  };
}

export class SchedulingOptimizationAgent extends BaseAgent {
  private config: SchedulingOptimizationConfig;
  private optimizationQueue: Map<string, OptimizationResult> = new Map();
  private demandForecasts: Map<string, DemandForecast[]> = new Map();
  private eventBus: EventEmitter = new EventEmitter();

  constructor(config: SchedulingOptimizationConfig) {
    super(config);
    this.config = config;
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    // Initialize connection to OptaPlanner service
    await this.checkOptaplannerConnection();
    
    // Initialize ML service connection if enabled
    if (this.config.demandForecastingEnabled) {
      await this.checkMLServiceConnection();
    }
    
    // Setup periodic demand forecasting
    if (this.config.demandForecastingEnabled) {
      setInterval(() => this.updateDemandForecasts(), 3600000); // Every hour
    }
  }

  protected setupCustomRoutes(): void {
    // Optimize schedule endpoint
    this.app.post('/api/v1/schedule/optimize', async (req: Request, res: Response) => {
      try {
        const request = this.validateSchema(OptimizationRequestSchema, req.body);
        const optimizationId = await this.optimizeSchedule(request);
        
        res.status(202).json({
          optimizationId,
          status: 'accepted',
          message: 'Schedule optimization started'
        });
      } catch (error) {
        this.log('error', 'Failed to start optimization', error);
        res.status(400).json({ error: error.message });
      }
    });

    // Get optimization status
    this.app.get('/api/v1/schedule/optimize/:id', (req: Request, res: Response) => {
      const { id } = req.params;
      const result = this.optimizationQueue.get(id);
      
      if (!result) {
        res.status(404).json({ error: 'Optimization not found' });
        return;
      }
      
      res.json(result);
    });

    // Get current schedule
    this.app.get('/api/v1/schedule/current', async (req: Request, res: Response) => {
      try {
        const { startDate, endDate } = req.query;
        const schedule = await this.getCurrentSchedule(
          startDate as string,
          endDate as string
        );
        res.json(schedule);
      } catch (error) {
        this.log('error', 'Failed to get current schedule', error);
        res.status(500).json({ error: 'Failed to retrieve schedule' });
      }
    });

    // Demand forecasting endpoint
    this.app.get('/api/v1/forecast/demand', async (req: Request, res: Response) => {
      try {
        const { startDate, endDate, appointmentType } = req.query;
        const forecasts = await this.getDemandForecasts(
          startDate as string,
          endDate as string,
          appointmentType as string
        );
        res.json(forecasts);
      } catch (error) {
        this.log('error', 'Failed to get demand forecasts', error);
        res.status(500).json({ error: 'Failed to retrieve forecasts' });
      }
    });

    // Real-time appointment booking
    this.app.post('/api/v1/appointments/book', async (req: Request, res: Response) => {
      try {
        const appointment = this.validateSchema(AppointmentRequestSchema, req.body);
        const result = await this.bookAppointment(appointment);
        
        // Emit real-time update
        this.broadcastUpdate({
          type: 'appointment_booked',
          data: result
        });
        
        res.json(result);
      } catch (error) {
        this.log('error', 'Failed to book appointment', error);
        res.status(400).json({ error: error.message });
      }
    });

    // Staff roster management
    this.app.get('/api/v1/roster/:staffId', async (req: Request, res: Response) => {
      try {
        const { staffId } = req.params;
        const { startDate, endDate } = req.query;
        const roster = await this.getStaffRoster(
          staffId,
          startDate as string,
          endDate as string
        );
        res.json(roster);
      } catch (error) {
        this.log('error', 'Failed to get staff roster', error);
        res.status(500).json({ error: 'Failed to retrieve roster' });
      }
    });

    // Room utilization
    this.app.get('/api/v1/rooms/utilization', async (req: Request, res: Response) => {
      try {
        const { startDate, endDate } = req.query;
        const utilization = await this.getRoomUtilization(
          startDate as string,
          endDate as string
        );
        res.json(utilization);
      } catch (error) {
        this.log('error', 'Failed to get room utilization', error);
        res.status(500).json({ error: 'Failed to retrieve utilization' });
      }
    });

    // Constraint management
    this.app.get('/api/v1/constraints', async (req: Request, res: Response) => {
      try {
        const constraints = await this.getSchedulingConstraints();
        res.json(constraints);
      } catch (error) {
        this.log('error', 'Failed to get constraints', error);
        res.status(500).json({ error: 'Failed to retrieve constraints' });
      }
    });

    this.app.post('/api/v1/constraints', async (req: Request, res: Response) => {
      try {
        const constraint = this.validateSchema(SchedulingConstraintSchema, req.body);
        const result = await this.addSchedulingConstraint(constraint);
        res.json(result);
      } catch (error) {
        this.log('error', 'Failed to add constraint', error);
        res.status(400).json({ error: error.message });
      }
    });
  }

  private async optimizeSchedule(request: z.infer<typeof OptimizationRequestSchema>): Promise<string> {
    const optimizationId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize optimization result
    this.optimizationQueue.set(optimizationId, {
      id: optimizationId,
      status: 'pending',
      score: { hardScore: 0, softScore: 0 },
      schedule: { appointments: [], staffRosters: [] },
      metrics: { utilizationRate: 0, staffSatisfaction: 0, patientWaitTime: 0 }
    });

    // Get demand forecasts if enabled
    let demandForecasts: DemandForecast[] = [];
    if (this.config.demandForecastingEnabled) {
      demandForecasts = await this.getDemandForecasts(
        request.startDate,
        request.endDate
      );
    }

    // Send to OptaPlanner service
    try {
      const response = await axios.post(
        `${this.config.optaplannerServiceUrl}/optimize`,
        {
          ...request,
          demandForecasts,
          optimizationId
        }
      );

      // Update status
      const result = this.optimizationQueue.get(optimizationId)!;
      result.status = 'processing';
      
      // Start polling for results
      this.pollOptimizationResult(optimizationId, response.data.jobId);
      
    } catch (error) {
      const result = this.optimizationQueue.get(optimizationId)!;
      result.status = 'failed';
      throw error;
    }

    return optimizationId;
  }

  private async pollOptimizationResult(optimizationId: string, jobId: string): Promise<void> {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${this.config.optaplannerServiceUrl}/jobs/${jobId}`
        );

        if (response.data.status === 'completed') {
          clearInterval(pollInterval);
          
          const result = this.optimizationQueue.get(optimizationId)!;
          result.status = 'completed';
          result.score = response.data.score;
          result.schedule = response.data.schedule;
          result.metrics = response.data.metrics;
          
          // Emit real-time update
          this.broadcastUpdate({
            type: 'optimization_completed',
            data: result
          });
          
          this.log('info', `Optimization ${optimizationId} completed`, result.score);
        } else if (response.data.status === 'failed') {
          clearInterval(pollInterval);
          
          const result = this.optimizationQueue.get(optimizationId)!;
          result.status = 'failed';
          
          this.log('error', `Optimization ${optimizationId} failed`);
        }
      } catch (error) {
        this.log('error', `Failed to poll optimization result for ${optimizationId}`, error);
      }
    }, 5000); // Poll every 5 seconds
  }

  private async bookAppointment(appointment: z.infer<typeof AppointmentRequestSchema>): Promise<any> {
    // Find optimal slot using current schedule and constraints
    const response = await axios.post(
      `${this.config.optaplannerServiceUrl}/appointments/find-slot`,
      appointment
    );

    if (!response.data.available) {
      throw new Error('No available slots found for the requested appointment');
    }

    // Book the appointment
    const booking = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...appointment,
      ...response.data.slot,
      status: 'confirmed'
    };

    // TODO: Save to database
    
    return booking;
  }

  private async getCurrentSchedule(startDate: string, endDate: string): Promise<any> {
    // TODO: Fetch from database
    // For now, return mock data
    return {
      startDate,
      endDate,
      appointments: [],
      staffRosters: [],
      roomAllocations: []
    };
  }

  private async getStaffRoster(staffId: string, startDate: string, endDate: string): Promise<any> {
    // TODO: Fetch from database
    return {
      staffId,
      startDate,
      endDate,
      shifts: [],
      totalHours: 0,
      overtimeHours: 0
    };
  }

  private async getRoomUtilization(startDate: string, endDate: string): Promise<any> {
    // TODO: Calculate from database
    return {
      startDate,
      endDate,
      rooms: [],
      averageUtilization: 0,
      peakHours: []
    };
  }

  private async getDemandForecasts(
    startDate: string,
    endDate: string,
    appointmentType?: string
  ): Promise<DemandForecast[]> {
    if (!this.config.demandForecastingEnabled) {
      return [];
    }

    try {
      const response = await axios.get(`${this.config.mlServiceUrl}/forecast/demand`, {
        params: { startDate, endDate, appointmentType }
      });
      
      return response.data;
    } catch (error) {
      this.log('error', 'Failed to get demand forecasts from ML service', error);
      return [];
    }
  }

  private async updateDemandForecasts(): Promise<void> {
    if (!this.config.demandForecastingEnabled) {
      return;
    }

    try {
      // Get forecasts for next 30 days
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const forecasts = await this.getDemandForecasts(startDate, endDate);
      
      // Group by date
      forecasts.forEach(forecast => {
        const key = forecast.date;
        if (!this.demandForecasts.has(key)) {
          this.demandForecasts.set(key, []);
        }
        this.demandForecasts.get(key)!.push(forecast);
      });
      
      this.log('info', `Updated demand forecasts: ${forecasts.length} forecasts`);
    } catch (error) {
      this.log('error', 'Failed to update demand forecasts', error);
    }
  }

  private async getSchedulingConstraints(): Promise<any[]> {
    // TODO: Fetch from database
    return [
      {
        type: 'hard',
        name: 'staff_skills_match',
        description: 'Staff must have required skills for appointment'
      },
      {
        type: 'hard',
        name: 'no_double_booking',
        description: 'Staff and rooms cannot be double-booked'
      },
      {
        type: 'soft',
        name: 'minimize_patient_wait',
        description: 'Minimize patient waiting time',
        weight: 10
      },
      {
        type: 'soft',
        name: 'staff_preference',
        description: 'Respect staff shift preferences',
        weight: 5
      }
    ];
  }

  private async addSchedulingConstraint(constraint: z.infer<typeof SchedulingConstraintSchema>): Promise<any> {
    // TODO: Save to database
    return {
      id: `constraint_${Date.now()}`,
      ...constraint,
      createdAt: new Date().toISOString()
    };
  }

  protected handleWebSocketMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'subscribe':
        // Handle subscription to real-time updates
        this.eventBus.on('update', (update) => {
          ws.send(JSON.stringify(update));
        });
        ws.send(JSON.stringify({ type: 'subscribed', status: 'success' }));
        break;
        
      case 'get_optimization_status':
        const result = this.optimizationQueue.get(message.optimizationId);
        ws.send(JSON.stringify({ type: 'optimization_status', data: result }));
        break;
        
      default:
        super.handleWebSocketMessage(ws, message);
    }
  }

  private broadcastUpdate(update: any): void {
    this.eventBus.emit('update', update);
    
    // Also broadcast via WebSocket if available
    if (this.wsServer) {
      this.wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(update));
        }
      });
    }
  }

  private async checkOptaplannerConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.optaplannerServiceUrl}/health`);
      return response.status === 200;
    } catch (error) {
      this.log('error', 'OptaPlanner service not available', error);
      return false;
    }
  }

  private async checkMLServiceConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.mlServiceUrl}/health`);
      return response.status === 200;
    } catch (error) {
      this.log('warn', 'ML service not available', error);
      return false;
    }
  }

  protected performHealthChecks(): Record<string, boolean> {
    return {
      optaplanner: this.checkOptaplannerConnection().then(r => r).catch(() => false),
      mlService: this.config.demandForecastingEnabled ? 
        this.checkMLServiceConnection().then(r => r).catch(() => false) : true,
      webSocket: this.wsServer !== null,
      optimizationQueue: this.optimizationQueue.size < 1000
    };
  }

  protected getCustomMetrics(): MetricPoint[] {
    return [
      {
        name: 'optimization_queue_size',
        value: this.optimizationQueue.size,
        timestamp: new Date().toISOString()
      },
      {
        name: 'demand_forecasts_cached',
        value: this.demandForecasts.size,
        timestamp: new Date().toISOString()
      },
      {
        name: 'active_optimizations',
        value: Array.from(this.optimizationQueue.values())
          .filter(r => r.status === 'processing').length,
        timestamp: new Date().toISOString()
      }
    ];
  }
}

// Export default configuration
export const defaultConfig: SchedulingOptimizationConfig = {
  port: 3010,
  host: '0.0.0.0',
  name: 'SchedulingOptimizationAgent',
  logLevel: 'info',
  corsOrigins: ['http://localhost:3000', 'http://localhost:3001'],
  enableWebSocket: true,
  enableMetrics: true,
  healthCheckInterval: 30000,
  optaplannerServiceUrl: process.env.OPTAPLANNER_SERVICE_URL || 'http://localhost:8080',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8081',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379'),
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  demandForecastingEnabled: process.env.ENABLE_DEMAND_FORECASTING === 'true'
};
