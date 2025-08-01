import { EnhancedBaseAgent, EnhancedAgentConfig, EventMessage, ReactiveRule } from '../shared/EnhancedBaseAgent.js';
import { Request, Response } from 'express';
import { WebSocket } from 'ws';
import { z } from 'zod';
import * as path from 'path';
import * as fs from 'fs/promises';

// Data Schemas
const VitalSignsSchema = z.object({
  patientId: z.string(),
  timestamp: z.string(),
  heartRate: z.number().optional(),
  bloodPressureSystolic: z.number().optional(),
  bloodPressureDiastolic: z.number().optional(),
  respiratoryRate: z.number().optional(),
  temperature: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  bloodGlucose: z.number().optional(),
});

const WearableDataSchema = z.object({
  patientId: z.string(),
  deviceId: z.string(),
  timestamp: z.string(),
  type: z.enum(['fitbit', 'apple_watch', 'garmin', 'continuous_glucose_monitor', 'ecg_patch']),
  data: z.record(z.any()),
});

const EHRUpdateSchema = z.object({
  patientId: z.string(),
  timestamp: z.string(),
  updateType: z.enum(['lab_results', 'medication', 'diagnosis', 'procedure', 'note']),
  data: z.record(z.any()),
});

const PatientAlertSchema = z.object({
  patientId: z.string(),
  alertId: z.string(),
  timestamp: z.string(),
  type: z.enum(['sepsis', 'cardiac', 'respiratory', 'neurological', 'metabolic', 'general']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  score: z.number().min(0).max(1),
  indicators: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  modelUsed: z.string(),
});

// Patient monitoring state
interface PatientState {
  patientId: string;
  lastVitals: z.infer<typeof VitalSignsSchema> | null;
  vitalHistory: Array<z.infer<typeof VitalSignsSchema>>;
  wearableData: Map<string, any>;
  ehrData: Map<string, any>;
  alerts: Array<z.infer<typeof PatientAlertSchema>>;
  riskScores: Map<string, number>;
  lastUpdated: Date;
}

// ML Model configurations
interface MLModelConfig {
  id: string;
  name: string;
  type: 'sepsis' | 'cardiac' | 'respiratory' | 'neurological' | 'metabolic';
  modelPath?: string;
  threshold: number;
  inputFeatures: string[];
  enabled: boolean;
}

export class PatientMonitoringAgent extends EnhancedBaseAgent {
  private patients: Map<string, PatientState> = new Map();
  private dataStreams: Map<string, WebSocket> = new Map();
  private modelConfigs: Map<string, MLModelConfig> = new Map();
  private alertHistory: Array<z.infer<typeof PatientAlertSchema>> = [];
  
  // Thresholds and configurations
  private readonly VITAL_HISTORY_LIMIT = 1000;
  private readonly ALERT_HISTORY_LIMIT = 10000;
  private readonly MONITORING_INTERVAL = 60000; // 1 minute
  private readonly CRITICAL_THRESHOLDS = {
    heartRate: { min: 40, max: 150 },
    bloodPressureSystolic: { min: 80, max: 180 },
    bloodPressureDiastolic: { min: 50, max: 110 },
    respiratoryRate: { min: 8, max: 30 },
    temperature: { min: 35, max: 39.5 },
    oxygenSaturation: { min: 88, max: 100 },
    bloodGlucose: { min: 70, max: 400 },
  };

  constructor(config: EnhancedAgentConfig) {
    super({
      ...config,
      name: 'patient-monitoring-agent',
      eventBus: {
        url: config.eventBus?.url || 'ws://localhost:3010/event-bus',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
      },
    });

    this.initializeMLModels();
    this.setupReactiveRules();
  }

  protected setupCustomRoutes(): void {
    // Patient monitoring endpoints
    this.app.post('/patients/:patientId/vitals', this.handleVitalsUpdate.bind(this));
    this.app.post('/patients/:patientId/wearable', this.handleWearableData.bind(this));
    this.app.post('/patients/:patientId/ehr', this.handleEHRUpdate.bind(this));
    
    // Query endpoints
    this.app.get('/patients/:patientId/status', this.getPatientStatus.bind(this));
    this.app.get('/patients/:patientId/alerts', this.getPatientAlerts.bind(this));
    this.app.get('/alerts/active', this.getActiveAlerts.bind(this));
    this.app.get('/alerts/history', this.getAlertHistory.bind(this));
    
    // ML model management
    this.app.get('/models', this.getModelStatus.bind(this));
    this.app.post('/models/:modelId/enable', this.enableModel.bind(this));
    this.app.post('/models/:modelId/disable', this.disableModel.bind(this));
    
    // Stream endpoints
    this.app.ws('/stream/vitals', this.handleVitalStream.bind(this));
    this.app.ws('/stream/alerts', this.handleAlertStream.bind(this));
  }

  private async initializeMLModels(): Promise<void> {
    // Initialize ML model configurations
    const models: MLModelConfig[] = [
      {
        id: 'sepsis_predictor',
        name: 'Sepsis Early Warning System',
        type: 'sepsis',
        threshold: 0.7,
        inputFeatures: ['heartRate', 'temperature', 'respiratoryRate', 'whiteBloodCellCount'],
        enabled: true,
      },
      {
        id: 'cardiac_risk',
        name: 'Cardiac Risk Predictor',
        type: 'cardiac',
        threshold: 0.75,
        inputFeatures: ['heartRate', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'ecgFeatures'],
        enabled: true,
      },
      {
        id: 'respiratory_failure',
        name: 'Respiratory Failure Predictor',
        type: 'respiratory',
        threshold: 0.8,
        inputFeatures: ['respiratoryRate', 'oxygenSaturation', 'bloodGasAnalysis'],
        enabled: true,
      },
    ];

    for (const model of models) {
      this.modelConfigs.set(model.id, model);
      
      // In production, load actual ONNX models
      // await this.loadMLModel(model.id, model.modelPath, {
      //   preprocessor: this.createPreprocessor(model),
      //   postprocessor: this.createPostprocessor(model),
      // });
    }

    this.log('info', 'ML models initialized', { count: models.length });
  }

  private setupReactiveRules(): void {
    // Critical vital signs rule
    this.addRule({
      id: 'critical_vitals',
      name: 'Critical Vital Signs Alert',
      description: 'Triggers when vital signs are outside critical ranges',
      enabled: true,
      conditions: [
        { field: 'vitals.critical', operator: 'eq', value: true },
      ],
      conditionOperator: 'and',
      actions: [
        { type: 'emit', target: 'patient.alert', data: { severity: 'critical' } },
        { type: 'alert', data: { priority: 'high' } },
      ],
      priority: 10,
    });

    // Deterioration trend rule
    this.addRule({
      id: 'deterioration_trend',
      name: 'Patient Deterioration Trend',
      description: 'Detects worsening patient condition over time',
      enabled: true,
      conditions: [
        { field: 'trend.deteriorating', operator: 'eq', value: true },
        { field: 'trend.duration', operator: 'gt', value: 30 }, // minutes
      ],
      conditionOperator: 'and',
      actions: [
        { type: 'emit', target: 'patient.deterioration', data: { urgency: 'high' } },
        { type: 'log', data: { level: 'warn' } },
      ],
      priority: 8,
    });

    // ML prediction threshold rule
    this.addRule({
      id: 'ml_prediction_alert',
      name: 'ML Prediction Alert',
      description: 'Triggers when ML models predict high risk',
      enabled: true,
      conditions: [
        { field: 'prediction.score', operator: 'gte', value: 0.7 },
        { field: 'prediction.confidence', operator: 'gte', value: 0.8 },
      ],
      conditionOperator: 'and',
      actions: [
        { type: 'emit', target: 'patient.alert' },
        { type: 'metric', target: 'ml_alert_triggered' },
      ],
      priority: 9,
    });
  }

  protected subscribeToEvents(): void {
    if (!this.eventBusClient || this.eventBusClient.readyState !== WebSocket.OPEN) return;

    this.eventBusClient.send(JSON.stringify({
      type: 'identify',
      name: this.config.name,
    }));

    this.eventBusClient.send(JSON.stringify({
      type: 'subscribe',
      patterns: [
        'patient.vitals.*',
        'patient.wearable.*',
        'patient.ehr.*',
        'device.data.*',
        'lab.results.*',
      ],
    }));
  }

  protected handleEventBusMessage(message: EventMessage): void {
    switch (message.type) {
      case 'patient.vitals.update':
        this.processVitalsFromEvent(message.data);
        break;
      case 'patient.wearable.data':
        this.processWearableFromEvent(message.data);
        break;
      case 'patient.ehr.update':
        this.processEHRFromEvent(message.data);
        break;
      case 'lab.results.available':
        this.processLabResults(message.data);
        break;
    }
  }

  // Vital signs handling
  private async handleVitalsUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const vitals = VitalSignsSchema.parse({ ...req.body, patientId });
      
      await this.processVitals(vitals);
      
      res.json({ success: true, patientId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  private async processVitals(vitals: z.infer<typeof VitalSignsSchema>): Promise<void> {
    const patient = this.getOrCreatePatient(vitals.patientId);
    
    // Update patient state
    patient.lastVitals = vitals;
    patient.vitalHistory.push(vitals);
    patient.lastUpdated = new Date();
    
    // Limit history size
    if (patient.vitalHistory.length > this.VITAL_HISTORY_LIMIT) {
      patient.vitalHistory = patient.vitalHistory.slice(-this.VITAL_HISTORY_LIMIT);
    }
    
    // Check for critical values
    const criticalFindings = this.checkCriticalVitals(vitals);
    if (criticalFindings.length > 0) {
      await this.generateCriticalAlert(vitals.patientId, criticalFindings);
    }
    
    // Run ML predictions
    await this.runMLPredictions(patient);
    
    // Evaluate reactive rules
    await this.evaluateRules({
      vitals,
      critical: criticalFindings.length > 0,
      patient: patient,
    });
    
    // Emit update event
    this.publishEvent('patient.vitals.processed', {
      patientId: vitals.patientId,
      timestamp: vitals.timestamp,
      criticalFindings,
    });
    
    this.recordMetric('vitals_processed', 1, { patientId: vitals.patientId });
  }

  private checkCriticalVitals(vitals: z.infer<typeof VitalSignsSchema>): string[] {
    const findings: string[] = [];
    
    for (const [key, thresholds] of Object.entries(this.CRITICAL_THRESHOLDS)) {
      const value = vitals[key as keyof typeof vitals] as number | undefined;
      if (value !== undefined && typeof value === 'number') {
        if (value < thresholds.min || value > thresholds.max) {
          findings.push(`${key}: ${value} (normal: ${thresholds.min}-${thresholds.max})`);
        }
      }
    }
    
    return findings;
  }

  // Wearable data handling
  private async handleWearableData(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const wearableData = WearableDataSchema.parse({ ...req.body, patientId });
      
      await this.processWearableData(wearableData);
      
      res.json({ success: true, patientId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  private async processWearableData(data: z.infer<typeof WearableDataSchema>): Promise<void> {
    const patient = this.getOrCreatePatient(data.patientId);
    
    // Store wearable data by device
    patient.wearableData.set(data.deviceId, {
      type: data.type,
      data: data.data,
      timestamp: data.timestamp,
    });
    
    // Extract relevant features for ML models
    const features = this.extractWearableFeatures(data);
    if (features) {
      await this.runMLPredictions(patient, features);
    }
    
    this.publishEvent('patient.wearable.processed', {
      patientId: data.patientId,
      deviceId: data.deviceId,
      type: data.type,
    });
  }

  private extractWearableFeatures(data: z.infer<typeof WearableDataSchema>): any {
    // Extract features based on device type
    switch (data.type) {
      case 'fitbit':
      case 'apple_watch':
        return {
          heartRateVariability: data.data.hrv,
          activityLevel: data.data.activity,
          sleepQuality: data.data.sleep,
        };
      case 'continuous_glucose_monitor':
        return {
          glucoseLevel: data.data.glucose,
          glucoseTrend: data.data.trend,
        };
      case 'ecg_patch':
        return {
          ecgFeatures: data.data.features,
          arrhythmiaDetected: data.data.arrhythmia,
        };
      default:
        return null;
    }
  }

  // EHR update handling
  private async handleEHRUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const ehrUpdate = EHRUpdateSchema.parse({ ...req.body, patientId });
      
      await this.processEHRUpdate(ehrUpdate);
      
      res.json({ success: true, patientId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  private async processEHRUpdate(update: z.infer<typeof EHRUpdateSchema>): Promise<void> {
    const patient = this.getOrCreatePatient(update.patientId);
    
    // Store EHR data by type
    patient.ehrData.set(update.updateType, {
      data: update.data,
      timestamp: update.timestamp,
    });
    
    // Process specific update types
    switch (update.updateType) {
      case 'lab_results':
        await this.processLabResults(update.data);
        break;
      case 'medication':
        await this.processMedicationUpdate(update.patientId, update.data);
        break;
      case 'diagnosis':
        await this.processDiagnosisUpdate(update.patientId, update.data);
        break;
    }
    
    // Re-run predictions with updated data
    await this.runMLPredictions(patient);
    
    this.publishEvent('patient.ehr.processed', {
      patientId: update.patientId,
      updateType: update.updateType,
    });
  }

  // ML prediction methods
  private async runMLPredictions(patient: PatientState, additionalFeatures?: any): Promise<void> {
    const enabledModels = Array.from(this.modelConfigs.values()).filter(m => m.enabled);
    
    for (const modelConfig of enabledModels) {
      try {
        const features = this.prepareModelFeatures(patient, modelConfig, additionalFeatures);
        if (!features) continue;
        
        // In production, run actual inference
        // const prediction = await this.runInference(modelConfig.id, features);
        
        // For now, simulate prediction
        const prediction = this.simulatePrediction(modelConfig, features);
        
        if (prediction.score >= modelConfig.threshold) {
          await this.generateMLAlert(patient.patientId, modelConfig, prediction);
        }
        
        // Store risk score
        patient.riskScores.set(modelConfig.type, prediction.score);
        
        // Evaluate rules with prediction context
        await this.evaluateRules({
          prediction,
          patientId: patient.patientId,
          modelType: modelConfig.type,
        });
        
      } catch (error) {
        this.log('error', `ML prediction failed for ${modelConfig.id}`, { error });
      }
    }
  }

  private prepareModelFeatures(
    patient: PatientState, 
    model: MLModelConfig,
    additionalFeatures?: any
  ): any {
    const features: any = {};
    
    // Extract required features from patient data
    for (const feature of model.inputFeatures) {
      if (patient.lastVitals && feature in patient.lastVitals) {
        features[feature] = patient.lastVitals[feature];
      } else if (additionalFeatures && feature in additionalFeatures) {
        features[feature] = additionalFeatures[feature];
      } else {
        // Try to extract from EHR or wearable data
        features[feature] = this.extractFeatureFromPatientData(patient, feature);
      }
    }
    
    // Check if we have all required features
    const hasAllFeatures = model.inputFeatures.every(f => features[f] !== undefined);
    return hasAllFeatures ? features : null;
  }

  private extractFeatureFromPatientData(patient: PatientState, feature: string): any {
    // Extract features from various data sources
    // This is a simplified implementation
    if (feature === 'whiteBloodCellCount') {
      const labResults = patient.ehrData.get('lab_results');
      return labResults?.data?.wbc;
    }
    
    if (feature === 'ecgFeatures') {
      for (const [_, wearableData] of patient.wearableData) {
        if (wearableData.type === 'ecg_patch') {
          return wearableData.data.features;
        }
      }
    }
    
    return undefined;
  }

  private simulatePrediction(model: MLModelConfig, features: any): any {
    // Simulate ML prediction for development
    // In production, this would call actual ML models
    const baseScore = Math.random() * 0.5;
    
    // Add some logic based on features
    let adjustedScore = baseScore;
    
    if (model.type === 'sepsis' && features.temperature > 38.5) {
      adjustedScore += 0.3;
    }
    
    if (model.type === 'cardiac' && features.heartRate > 120) {
      adjustedScore += 0.25;
    }
    
    if (model.type === 'respiratory' && features.oxygenSaturation < 92) {
      adjustedScore += 0.35;
    }
    
    return {
      score: Math.min(adjustedScore, 1),
      confidence: 0.85 + Math.random() * 0.15,
      features: Object.keys(features),
    };
  }

  // Alert generation
  private async generateMLAlert(
    patientId: string,
    model: MLModelConfig,
    prediction: any
  ): Promise<void> {
    const alert: z.infer<typeof PatientAlertSchema> = {
      patientId,
      alertId: this.generateId(),
      timestamp: new Date().toISOString(),
      type: model.type,
      severity: this.calculateSeverity(prediction.score),
      score: prediction.score,
      indicators: prediction.features,
      recommendedActions: this.getRecommendedActions(model.type, prediction.score),
      modelUsed: model.id,
    };
    
    await this.processAlert(alert);
  }

  private async generateCriticalAlert(patientId: string, findings: string[]): Promise<void> {
    const alert: z.infer<typeof PatientAlertSchema> = {
      patientId,
      alertId: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'general',
      severity: 'critical',
      score: 1,
      indicators: findings,
      recommendedActions: [
        'Immediate medical attention required',
        'Notify attending physician',
        'Prepare for potential intervention',
      ],
      modelUsed: 'threshold_based',
    };
    
    await this.processAlert(alert);
  }

  private async processAlert(alert: z.infer<typeof PatientAlertSchema>): Promise<void> {
    const patient = this.patients.get(alert.patientId);
    if (patient) {
      patient.alerts.push(alert);
      
      // Limit alerts per patient
      if (patient.alerts.length > 100) {
        patient.alerts = patient.alerts.slice(-100);
      }
    }
    
    // Add to global alert history
    this.alertHistory.push(alert);
    if (this.alertHistory.length > this.ALERT_HISTORY_LIMIT) {
      this.alertHistory = this.alertHistory.slice(-this.ALERT_HISTORY_LIMIT);
    }
    
    // Emit alert event
    this.publishEvent('patient.alert', alert);
    
    // Record metrics
    this.recordMetric('alert_generated', 1, { 
      type: alert.type,
      severity: alert.severity,
    });
    
    this.log('warn', `Patient alert generated`, {
      patientId: alert.patientId,
      type: alert.type,
      severity: alert.severity,
      score: alert.score,
    });
  }

  private calculateSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.9) return 'critical';
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  private getRecommendedActions(type: string, score: number): string[] {
    const actions: string[] = [];
    
    switch (type) {
      case 'sepsis':
        actions.push('Order blood cultures');
        actions.push('Check lactate levels');
        if (score > 0.8) {
          actions.push('Consider broad-spectrum antibiotics');
          actions.push('Initiate sepsis protocol');
        }
        break;
      case 'cardiac':
        actions.push('Perform ECG');
        actions.push('Check cardiac biomarkers');
        if (score > 0.8) {
          actions.push('Consider cardiac consultation');
          actions.push('Prepare for potential intervention');
        }
        break;
      case 'respiratory':
        actions.push('Check ABG');
        actions.push('Assess ventilation needs');
        if (score > 0.8) {
          actions.push('Consider ICU transfer');
          actions.push('Prepare ventilatory support');
        }
        break;
    }
    
    actions.push('Monitor closely');
    actions.push('Document findings');
    
    return actions;
  }

  // Query endpoints
  private async getPatientStatus(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;
    const patient = this.patients.get(patientId);
    
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    
    res.json({
      patientId,
      lastUpdated: patient.lastUpdated,
      currentVitals: patient.lastVitals,
      riskScores: Object.fromEntries(patient.riskScores),
      activeAlerts: patient.alerts.filter(a => 
        new Date(a.timestamp).getTime() > Date.now() - 3600000 // Last hour
      ),
      deviceCount: patient.wearableData.size,
    });
  }

  private async getPatientAlerts(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;
    const patient = this.patients.get(patientId);
    
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    
    res.json(patient.alerts);
  }

  private async getActiveAlerts(req: Request, res: Response): Promise<void> {
    const activeAlerts = this.alertHistory.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      return alertTime > Date.now() - 3600000; // Last hour
    });
    
    res.json(activeAlerts);
  }

  private async getAlertHistory(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 100;
    const severity = req.query.severity as string;
    const type = req.query.type as string;
    
    let filtered = this.alertHistory;
    
    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }
    
    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    
    res.json(filtered.slice(-limit));
  }

  private async getModelStatus(req: Request, res: Response): Promise<void> {
    const models = Array.from(this.modelConfigs.values()).map(model => ({
      id: model.id,
      name: model.name,
      type: model.type,
      enabled: model.enabled,
      threshold: model.threshold,
      inputFeatures: model.inputFeatures,
    }));
    
    res.json(models);
  }

  private async enableModel(req: Request, res: Response): Promise<void> {
    const { modelId } = req.params;
    const model = this.modelConfigs.get(modelId);
    
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }
    
    model.enabled = true;
    res.json({ success: true, modelId });
  }

  private async disableModel(req: Request, res: Response): Promise<void> {
    const { modelId } = req.params;
    const model = this.modelConfigs.get(modelId);
    
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }
    
    model.enabled = false;
    res.json({ success: true, modelId });
  }

  // WebSocket stream handlers
  private handleVitalStream(ws: WebSocket, req: Request): void {
    this.log('info', 'Vital stream client connected');
    
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'subscribe' && message.patientId) {
          // Stream patient vitals
          const streamId = `vitals_${message.patientId}`;
          this.dataStreams.set(streamId, ws);
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: 'Invalid message' }));
      }
    });
    
    ws.on('close', () => {
      // Remove from active streams
      for (const [id, stream] of this.dataStreams) {
        if (stream === ws) {
          this.dataStreams.delete(id);
        }
      }
    });
  }

  private handleAlertStream(ws: WebSocket, req: Request): void {
    this.log('info', 'Alert stream client connected');
    
    // Subscribe to all alerts
    this.on('alert', (alert) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(alert));
      }
    });
  }

  // Helper methods
  private getOrCreatePatient(patientId: string): PatientState {
    let patient = this.patients.get(patientId);
    if (!patient) {
      patient = {
        patientId,
        lastVitals: null,
        vitalHistory: [],
        wearableData: new Map(),
        ehrData: new Map(),
        alerts: [],
        riskScores: new Map(),
        lastUpdated: new Date(),
      };
      this.patients.set(patientId, patient);
    }
    return patient;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Event handlers from event bus
  private async processVitalsFromEvent(data: any): Promise<void> {
    try {
      const vitals = VitalSignsSchema.parse(data);
      await this.processVitals(vitals);
    } catch (error) {
      this.log('error', 'Failed to process vitals from event', { error });
    }
  }

  private async processWearableFromEvent(data: any): Promise<void> {
    try {
      const wearableData = WearableDataSchema.parse(data);
      await this.processWearableData(wearableData);
    } catch (error) {
      this.log('error', 'Failed to process wearable data from event', { error });
    }
  }

  private async processEHRFromEvent(data: any): Promise<void> {
    try {
      const ehrUpdate = EHRUpdateSchema.parse(data);
      await this.processEHRUpdate(ehrUpdate);
    } catch (error) {
      this.log('error', 'Failed to process EHR update from event', { error });
    }
  }

  private async processLabResults(data: any): Promise<void> {
    // Process lab results for ML models
    if (data.patientId && data.results) {
      const patient = this.getOrCreatePatient(data.patientId);
      patient.ehrData.set('lab_results', {
        data: data.results,
        timestamp: new Date().toISOString(),
      });
      
      // Re-run predictions with new lab data
      await this.runMLPredictions(patient);
    }
  }

  private async processMedicationUpdate(patientId: string, data: any): Promise<void> {
    // Process medication changes that might affect monitoring
    this.log('info', 'Processing medication update', { patientId });
  }

  private async processDiagnosisUpdate(patientId: string, data: any): Promise<void> {
    // Update monitoring based on new diagnosis
    this.log('info', 'Processing diagnosis update', { patientId });
  }

  // Scheduled jobs
  protected async monitoringCycle(): Promise<void> {
    const now = Date.now();
    
    for (const [patientId, patient] of this.patients) {
      // Check if patient data is stale
      const lastUpdateAge = now - patient.lastUpdated.getTime();
      if (lastUpdateAge > 300000) { // 5 minutes
        this.publishEvent('patient.monitoring.stale', {
          patientId,
          lastUpdate: patient.lastUpdated,
          age: lastUpdateAge,
        });
      }
      
      // Re-evaluate trends
      if (patient.vitalHistory.length > 10) {
        const trend = this.analyzeTrend(patient.vitalHistory.slice(-10));
        if (trend.deteriorating) {
          await this.evaluateRules({
            trend,
            patientId,
          });
        }
      }
    }
    
    // Clean up old data
    this.cleanupOldData();
  }

  private analyzeTrend(vitals: Array<z.infer<typeof VitalSignsSchema>>): any {
    // Simple trend analysis
    const trends = {
      deteriorating: false,
      duration: 0,
      parameters: [] as string[],
    };
    
    // Check for worsening vital signs
    for (let i = 1; i < vitals.length; i++) {
      const prev = vitals[i - 1];
      const curr = vitals[i];
      
      if (curr.heartRate && prev.heartRate) {
        if (curr.heartRate > prev.heartRate + 10) {
          trends.parameters.push('heartRate');
        }
      }
      
      if (curr.oxygenSaturation && prev.oxygenSaturation) {
        if (curr.oxygenSaturation < prev.oxygenSaturation - 2) {
          trends.parameters.push('oxygenSaturation');
        }
      }
    }
    
    trends.deteriorating = trends.parameters.length >= 2;
    trends.duration = vitals.length * 5; // Assuming 5-minute intervals
    
    return trends;
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - 86400000; // 24 hours
    
    // Clean up patients with no recent data
    for (const [patientId, patient] of this.patients) {
      if (patient.lastUpdated.getTime() < cutoffTime) {
        this.patients.delete(patientId);
      }
    }
    
    // Clean up old alerts
    this.alertHistory = this.alertHistory.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoffTime
    );
  }

  // Abstract method implementations
  protected async executeCustomRuleAction(
    rule: ReactiveRule,
    action: any,
    context: Record<string, any>
  ): Promise<void> {
    // Implement custom actions specific to patient monitoring
    this.log('debug', 'Executing custom rule action', { rule: rule.name, action });
  }

  protected async executeCommand(command: string, data: any): Promise<void> {
    // Execute monitoring-specific commands
    switch (command) {
      case 'escalate':
        this.publishEvent('patient.escalation.required', data);
        break;
      case 'notify':
        this.publishEvent('notification.send', data);
        break;
    }
  }

  protected performHealthChecks(): Record<string, boolean> {
    const checks = super.performHealthChecks();
    
    checks.hasActivePatients = this.patients.size > 0;
    checks.modelsLoaded = this.modelConfigs.size > 0;
    checks.alertSystemActive = true;
    
    return checks;
  }

  protected getCustomMetrics(): any[] {
    return [
      {
        name: 'active_patients',
        value: this.patients.size,
        timestamp: new Date().toISOString(),
      },
      {
        name: 'total_alerts',
        value: this.alertHistory.length,
        timestamp: new Date().toISOString(),
      },
      {
        name: 'critical_alerts',
        value: this.alertHistory.filter(a => a.severity === 'critical').length,
        timestamp: new Date().toISOString(),
      },
    ];
  }
}

// Start the agent if run directly
if (require.main === module) {
  const config: EnhancedAgentConfig = {
    port: 3004,
    host: 'localhost',
    name: 'patient-monitoring-agent',
    logLevel: 'info',
    corsOrigins: ['http://localhost:3000'],
    enableWebSocket: true,
    enableMetrics: true,
    healthCheckInterval: 30000,
    eventBus: {
      url: 'ws://localhost:3010/event-bus',
    },
    scheduledJobs: [
      {
        name: 'monitoring_cycle',
        schedule: '*/1 * * * *', // Every minute
        handler: 'monitoringCycle',
      },
    ],
  };

  const agent = new PatientMonitoringAgent(config);
  
  agent.start().catch((error) => {
    console.error('Failed to start PatientMonitoringAgent:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down PatientMonitoringAgent...');
    await agent.stop();
    process.exit(0);
  });
}
