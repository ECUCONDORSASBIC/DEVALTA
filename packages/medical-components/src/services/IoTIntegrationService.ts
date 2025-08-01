/**
 * 🔌 IOT INTEGRATION SERVICE - ALTAMEDICA
 * Comprehensive IoT device integration for medical monitoring and data collection
 */

import { EventEmitter } from 'events';
import { logger } from '@altamedica/logger';
import { medicalAuditor } from '@altamedica/medical-security';

// IoT Device Types
export enum IoTDeviceType {
  HEART_MONITOR = 'heart_monitor',
  BLOOD_PRESSURE = 'blood_pressure',
  TEMPERATURE = 'temperature',
  GLUCOSE_MONITOR = 'glucose_monitor',
  OXYGEN_SATURATION = 'oxygen_saturation',
  WEIGHT_SCALE = 'weight_scale',
  SLEEP_TRACKER = 'sleep_tracker',
  ACTIVITY_TRACKER = 'activity_tracker',
  SMART_PILL_BOX = 'smart_pill_box',
  INSULIN_PUMP = 'insulin_pump',
  ECG_MONITOR = 'ecg_monitor',
  RESPIRATORY_MONITOR = 'respiratory_monitor'
}

// IoT Device Status
export enum IoTDeviceStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  LOW_BATTERY = 'low_battery',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline'
}

// IoT Data Structure
export interface IoTDataPoint {
  deviceId: string;
  deviceType: IoTDeviceType;
  patientId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'fair' | 'poor';
  metadata?: Record<string, any>;
}

// IoT Device Configuration
export interface IoTDeviceConfig {
  deviceId: string;
  deviceType: IoTDeviceType;
  patientId: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  connectionType: 'bluetooth' | 'wifi' | 'cellular' | 'usb';
  dataFormat: 'json' | 'xml' | 'csv' | 'binary';
  updateInterval: number; // seconds
  batteryLevel?: number;
  lastSync?: Date;
  status: IoTDeviceStatus;
  settings: Record<string, any>;
}

// IoT Alert Configuration
export interface IoTAlert {
  id: string;
  deviceId: string;
  patientId: string;
  type: 'threshold' | 'trend' | 'anomaly' | 'connection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  data?: Record<string, any>;
}

// IoT Integration Provider
export interface IoTProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  supportedDevices: IoTDeviceType[];
  rateLimit: number;
  timeout: number;
}

// Main IoT Integration Service
export class IoTIntegrationService extends EventEmitter {
  private devices: Map<string, IoTDeviceConfig> = new Map();
  private dataStreams: Map<string, NodeJS.Timeout> = new Map();
  private alerts: Map<string, IoTAlert[]> = new Map();
  private providers: Map<string, IoTProvider> = new Map();
  private isRunning: boolean = false;

  constructor() {
    super();
    this.initializeProviders();
  }

  /**
   * Initialize supported IoT providers
   */
  private initializeProviders(): void {
    // Philips HealthSuite
    this.providers.set('philips', {
      name: 'Philips HealthSuite',
      apiKey: process.env.PHILIPS_API_KEY || '',
      baseUrl: 'https://api.healthsuite.philips.com',
      supportedDevices: [
        IoTDeviceType.HEART_MONITOR,
        IoTDeviceType.BLOOD_PRESSURE,
        IoTDeviceType.TEMPERATURE,
        IoTDeviceType.OXYGEN_SATURATION
      ],
      rateLimit: 100,
      timeout: 30000
    });

    // GE Healthcare
    this.providers.set('ge', {
      name: 'GE Healthcare Edison',
      apiKey: process.env.GE_API_KEY || '',
      baseUrl: 'https://api.edison.gehealthcare.com',
      supportedDevices: [
        IoTDeviceType.ECG_MONITOR,
        IoTDeviceType.RESPIRATORY_MONITOR,
        IoTDeviceType.HEART_MONITOR
      ],
      rateLimit: 200,
      timeout: 30000
    });

    // Medtronic CareLink
    this.providers.set('medtronic', {
      name: 'Medtronic CareLink',
      apiKey: process.env.MEDTRONIC_API_KEY || '',
      baseUrl: 'https://api.carelink.medtronic.com',
      supportedDevices: [
        IoTDeviceType.INSULIN_PUMP,
        IoTDeviceType.GLUCOSE_MONITOR,
        IoTDeviceType.HEART_MONITOR
      ],
      rateLimit: 60,
      timeout: 30000
    });

    // Dexcom
    this.providers.set('dexcom', {
      name: 'Dexcom API',
      apiKey: process.env.DEXCOM_API_KEY || '',
      baseUrl: 'https://api.dexcom.com',
      supportedDevices: [
        IoTDeviceType.GLUCOSE_MONITOR
      ],
      rateLimit: 100,
      timeout: 30000
    });

    // Fitbit
    this.providers.set('fitbit', {
      name: 'Fitbit API',
      apiKey: process.env.FITBIT_API_KEY || '',
      baseUrl: 'https://api.fitbit.com',
      supportedDevices: [
        IoTDeviceType.ACTIVITY_TRACKER,
        IoTDeviceType.SLEEP_TRACKER,
        IoTDeviceType.HEART_MONITOR
      ],
      rateLimit: 150,
      timeout: 30000
    });
  }

  /**
   * Register a new IoT device
   */
  async registerDevice(config: IoTDeviceConfig): Promise<boolean> {
    try {
      // Validate device configuration
      if (!this.validateDeviceConfig(config)) {
        throw new Error('Invalid device configuration');
      }

      // Check if device is already registered
      if (this.devices.has(config.deviceId)) {
        logger.warn(`Device ${config.deviceId} is already registered`);
        return false;
      }

      // Store device configuration
      this.devices.set(config.deviceId, config);
      this.alerts.set(config.deviceId, []);

      // Log device registration for HIPAA compliance
      await medicalAuditor.logDeviceRegistration({
        deviceId: config.deviceId,
        patientId: config.patientId,
        deviceType: config.deviceType,
        timestamp: new Date(),
        action: 'device_registered'
      });

      logger.info(`IoT device registered: ${config.deviceId} (${config.deviceType})`);
      this.emit('deviceRegistered', config);

      return true;
    } catch (error) {
      logger.error('Error registering IoT device:', error);
      return false;
    }
  }

  /**
   * Unregister an IoT device
   */
  async unregisterDevice(deviceId: string): Promise<boolean> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        logger.warn(`Device ${deviceId} not found`);
        return false;
      }

      // Stop data stream if running
      this.stopDataStream(deviceId);

      // Remove device and alerts
      this.devices.delete(deviceId);
      this.alerts.delete(deviceId);

      // Log device unregistration for HIPAA compliance
      await medicalAuditor.logDeviceRegistration({
        deviceId,
        patientId: device.patientId,
        deviceType: device.deviceType,
        timestamp: new Date(),
        action: 'device_unregistered'
      });

      logger.info(`IoT device unregistered: ${deviceId}`);
      this.emit('deviceUnregistered', deviceId);

      return true;
    } catch (error) {
      logger.error('Error unregistering IoT device:', error);
      return false;
    }
  }

  /**
   * Start data collection from an IoT device
   */
  async startDataStream(deviceId: string): Promise<boolean> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      // Check if stream is already running
      if (this.dataStreams.has(deviceId)) {
        logger.warn(`Data stream for device ${deviceId} is already running`);
        return false;
      }

      // Find appropriate provider
      const provider = this.findProviderForDevice(device);
      if (!provider) {
        throw new Error(`No provider found for device type ${device.deviceType}`);
      }

      // Start data collection
      const interval = setInterval(async () => {
        try {
          const data = await this.collectDeviceData(device, provider);
          if (data) {
            await this.processDeviceData(data);
          }
        } catch (error) {
          logger.error(`Error collecting data from device ${deviceId}:`, error);
          await this.handleDeviceError(deviceId, error);
        }
      }, device.updateInterval * 1000);

      this.dataStreams.set(deviceId, interval);

      // Update device status
      device.status = IoTDeviceStatus.CONNECTED;
      device.lastSync = new Date();

      logger.info(`Data stream started for device: ${deviceId}`);
      this.emit('dataStreamStarted', deviceId);

      return true;
    } catch (error) {
      logger.error('Error starting data stream:', error);
      return false;
    }
  }

  /**
   * Stop data collection from an IoT device
   */
  stopDataStream(deviceId: string): boolean {
    try {
      const interval = this.dataStreams.get(deviceId);
      if (interval) {
        clearInterval(interval);
        this.dataStreams.delete(deviceId);

        // Update device status
        const device = this.devices.get(deviceId);
        if (device) {
          device.status = IoTDeviceStatus.DISCONNECTED;
        }

        logger.info(`Data stream stopped for device: ${deviceId}`);
        this.emit('dataStreamStopped', deviceId);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error stopping data stream:', error);
      return false;
    }
  }

  /**
   * Collect data from IoT device
   */
  private async collectDeviceData(device: IoTDeviceConfig, provider: IoTProvider): Promise<IoTDataPoint | null> {
    try {
      // Simulate data collection based on device type
      const mockData = this.generateMockDeviceData(device);
      
      // In production, this would make actual API calls to the provider
      // const response = await fetch(`${provider.baseUrl}/devices/${device.deviceId}/data`, {
      //   headers: { 'Authorization': `Bearer ${provider.apiKey}` },
      //   timeout: provider.timeout
      // });
      // const data = await response.json();

      return mockData;
    } catch (error) {
      logger.error(`Error collecting data from device ${device.deviceId}:`, error);
      return null;
    }
  }

  /**
   * Generate mock device data for testing
   */
  private generateMockDeviceData(device: IoTDeviceConfig): IoTDataPoint {
    const baseValue = this.getBaseValueForDeviceType(device.deviceType);
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const value = baseValue * (1 + variation);

    return {
      deviceId: device.deviceId,
      deviceType: device.deviceType,
      patientId: device.patientId,
      timestamp: new Date(),
      value: Math.round(value * 100) / 100,
      unit: this.getUnitForDeviceType(device.deviceType),
      quality: this.getDataQuality(),
      metadata: {
        batteryLevel: device.batteryLevel || 85,
        signalStrength: Math.floor(Math.random() * 100) + 50,
        firmwareVersion: device.firmwareVersion
      }
    };
  }

  /**
   * Get base value for device type
   */
  private getBaseValueForDeviceType(deviceType: IoTDeviceType): number {
    switch (deviceType) {
      case IoTDeviceType.HEART_MONITOR:
        return 75; // BPM
      case IoTDeviceType.BLOOD_PRESSURE:
        return 120; // Systolic
      case IoTDeviceType.TEMPERATURE:
        return 36.8; // Celsius
      case IoTDeviceType.GLUCOSE_MONITOR:
        return 100; // mg/dL
      case IoTDeviceType.OXYGEN_SATURATION:
        return 98; // %
      case IoTDeviceType.WEIGHT_SCALE:
        return 70; // kg
      case IoTDeviceType.SLEEP_TRACKER:
        return 7.5; // hours
      case IoTDeviceType.ACTIVITY_TRACKER:
        return 8000; // steps
      case IoTDeviceType.INSULIN_PUMP:
        return 5; // units
      case IoTDeviceType.ECG_MONITOR:
        return 60; // BPM
      case IoTDeviceType.RESPIRATORY_MONITOR:
        return 16; // breaths/min
      default:
        return 0;
    }
  }

  /**
   * Get unit for device type
   */
  private getUnitForDeviceType(deviceType: IoTDeviceType): string {
    switch (deviceType) {
      case IoTDeviceType.HEART_MONITOR:
      case IoTDeviceType.ECG_MONITOR:
        return 'BPM';
      case IoTDeviceType.BLOOD_PRESSURE:
        return 'mmHg';
      case IoTDeviceType.TEMPERATURE:
        return '°C';
      case IoTDeviceType.GLUCOSE_MONITOR:
        return 'mg/dL';
      case IoTDeviceType.OXYGEN_SATURATION:
        return '%';
      case IoTDeviceType.WEIGHT_SCALE:
        return 'kg';
      case IoTDeviceType.SLEEP_TRACKER:
        return 'hours';
      case IoTDeviceType.ACTIVITY_TRACKER:
        return 'steps';
      case IoTDeviceType.INSULIN_PUMP:
        return 'units';
      case IoTDeviceType.RESPIRATORY_MONITOR:
        return 'breaths/min';
      default:
        return '';
    }
  }

  /**
   * Get data quality based on device status and random factors
   */
  private getDataQuality(): 'good' | 'fair' | 'poor' {
    const quality = Math.random();
    if (quality > 0.8) return 'good';
    if (quality > 0.5) return 'fair';
    return 'poor';
  }

  /**
   * Process collected device data
   */
  private async processDeviceData(data: IoTDataPoint): Promise<void> {
    try {
      // Emit data event
      this.emit('dataReceived', data);

      // Check for alerts
      await this.checkForAlerts(data);

      // Store data (in production, this would go to a database)
      await this.storeDataPoint(data);

      // Log data access for HIPAA compliance
      await medicalAuditor.logDataAccess({
        patientId: data.patientId,
        dataType: 'iot_device_data',
        deviceId: data.deviceId,
        timestamp: new Date(),
        action: 'data_collected'
      });

    } catch (error) {
      logger.error('Error processing device data:', error);
    }
  }

  /**
   * Check for alerts based on device data
   */
  private async checkForAlerts(data: IoTDataPoint): Promise<void> {
    const alerts: IoTAlert[] = [];

    // Check threshold alerts
    const thresholdAlerts = this.checkThresholdAlerts(data);
    alerts.push(...thresholdAlerts);

    // Check trend alerts
    const trendAlerts = await this.checkTrendAlerts(data);
    alerts.push(...trendAlerts);

    // Check anomaly alerts
    const anomalyAlerts = await this.checkAnomalyAlerts(data);
    alerts.push(...anomalyAlerts);

    // Store and emit alerts
    if (alerts.length > 0) {
      const deviceAlerts = this.alerts.get(data.deviceId) || [];
      deviceAlerts.push(...alerts);
      this.alerts.set(data.deviceId, deviceAlerts);

      alerts.forEach(alert => {
        this.emit('alertGenerated', alert);
      });
    }
  }

  /**
   * Check threshold-based alerts
   */
  private checkThresholdAlerts(data: IoTDataPoint): IoTAlert[] {
    const alerts: IoTAlert[] = [];
    const thresholds = this.getThresholdsForDeviceType(data.deviceType);

    if (data.value > thresholds.high) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random()}`,
        deviceId: data.deviceId,
        patientId: data.patientId,
        type: 'threshold',
        severity: 'high',
        message: `${data.deviceType} reading is above normal range: ${data.value} ${data.unit}`,
        timestamp: new Date(),
        acknowledged: false,
        data: { value: data.value, threshold: thresholds.high }
      });
    } else if (data.value < thresholds.low) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random()}`,
        deviceId: data.deviceId,
        patientId: data.patientId,
        type: 'threshold',
        severity: 'high',
        message: `${data.deviceType} reading is below normal range: ${data.value} ${data.unit}`,
        timestamp: new Date(),
        acknowledged: false,
        data: { value: data.value, threshold: thresholds.low }
      });
    }

    return alerts;
  }

  /**
   * Get thresholds for device type
   */
  private getThresholdsForDeviceType(deviceType: IoTDeviceType): { low: number; high: number } {
    switch (deviceType) {
      case IoTDeviceType.HEART_MONITOR:
      case IoTDeviceType.ECG_MONITOR:
        return { low: 60, high: 100 };
      case IoTDeviceType.BLOOD_PRESSURE:
        return { low: 90, high: 140 };
      case IoTDeviceType.TEMPERATURE:
        return { low: 36.0, high: 37.5 };
      case IoTDeviceType.GLUCOSE_MONITOR:
        return { low: 70, high: 140 };
      case IoTDeviceType.OXYGEN_SATURATION:
        return { low: 95, high: 100 };
      case IoTDeviceType.WEIGHT_SCALE:
        return { low: 40, high: 150 };
      case IoTDeviceType.SLEEP_TRACKER:
        return { low: 6, high: 10 };
      case IoTDeviceType.ACTIVITY_TRACKER:
        return { low: 1000, high: 15000 };
      case IoTDeviceType.INSULIN_PUMP:
        return { low: 0, high: 20 };
      case IoTDeviceType.RESPIRATORY_MONITOR:
        return { low: 12, high: 20 };
      default:
        return { low: 0, high: 100 };
    }
  }

  /**
   * Check trend-based alerts (simplified implementation)
   */
  private async checkTrendAlerts(data: IoTDataPoint): Promise<IoTAlert[]> {
    // In production, this would analyze historical data for trends
    return [];
  }

  /**
   * Check anomaly-based alerts (simplified implementation)
   */
  private async checkAnomalyAlerts(data: IoTDataPoint): Promise<IoTAlert[]> {
    // In production, this would use ML models to detect anomalies
    return [];
  }

  /**
   * Store data point (simplified implementation)
   */
  private async storeDataPoint(data: IoTDataPoint): Promise<void> {
    // In production, this would store to a time-series database
    logger.debug(`Storing data point: ${data.deviceId} - ${data.value} ${data.unit}`);
  }

  /**
   * Handle device errors
   */
  private async handleDeviceError(deviceId: string, error: any): Promise<void> {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = IoTDeviceStatus.ERROR;
      
      const alert: IoTAlert = {
        id: `error_${Date.now()}_${Math.random()}`,
        deviceId,
        patientId: device.patientId,
        type: 'connection',
        severity: 'medium',
        message: `Device error: ${error.message}`,
        timestamp: new Date(),
        acknowledged: false,
        data: { error: error.message }
      };

      const deviceAlerts = this.alerts.get(deviceId) || [];
      deviceAlerts.push(alert);
      this.alerts.set(deviceId, deviceAlerts);

      this.emit('deviceError', { deviceId, error });
    }
  }

  /**
   * Find provider for device
   */
  private findProviderForDevice(device: IoTDeviceConfig): IoTProvider | null {
    for (const [key, provider] of this.providers) {
      if (provider.supportedDevices.includes(device.deviceType)) {
        return provider;
      }
    }
    return null;
  }

  /**
   * Validate device configuration
   */
  private validateDeviceConfig(config: IoTDeviceConfig): boolean {
    return !!(
      config.deviceId &&
      config.deviceType &&
      config.patientId &&
      config.manufacturer &&
      config.model &&
      config.updateInterval > 0
    );
  }

  /**
   * Get all registered devices
   */
  getDevices(): IoTDeviceConfig[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): IoTDeviceConfig | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Get alerts for device
   */
  getDeviceAlerts(deviceId: string): IoTAlert[] {
    return this.alerts.get(deviceId) || [];
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    try {
      for (const [deviceId, deviceAlerts] of this.alerts) {
        const alert = deviceAlerts.find(a => a.id === alertId);
        if (alert) {
          alert.acknowledged = true;
          alert.acknowledgedBy = acknowledgedBy;
          alert.acknowledgedAt = new Date();
          
          this.emit('alertAcknowledged', alert);
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error('Error acknowledging alert:', error);
      return false;
    }
  }

  /**
   * Start all device streams
   */
  async startAllStreams(): Promise<void> {
    for (const device of this.devices.values()) {
      await this.startDataStream(device.deviceId);
    }
  }

  /**
   * Stop all device streams
   */
  stopAllStreams(): void {
    for (const deviceId of this.devices.keys()) {
      this.stopDataStream(deviceId);
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    deviceCount: number;
    activeStreams: number;
    totalAlerts: number;
  } {
    return {
      isRunning: this.isRunning,
      deviceCount: this.devices.size,
      activeStreams: this.dataStreams.size,
      totalAlerts: Array.from(this.alerts.values()).reduce((sum, alerts) => sum + alerts.length, 0)
    };
  }
}

// Export singleton instance
export const iotIntegrationService = new IoTIntegrationService(); 