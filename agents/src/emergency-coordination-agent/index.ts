import { EnhancedBaseAgent, EnhancedAgentConfig, EventMessage, ReactiveRule } from '../shared/EnhancedBaseAgent.js';
import { sendNotification } from '../../../apps/api-server/src/lib/notifications';
import { SMSService } from '../../../apps/api-server/src/lib/sms';
import { PushService } from '../../../apps/api-server/src/lib/push';

export class EmergencyCoordinationAgent extends EnhancedBaseAgent {
  constructor(config: EnhancedAgentConfig) {
    super({
      ...config,
      name: 'emergency-coordination-agent',
      eventBus: {
        url: config.eventBus?.url || 'ws://localhost:3010/event-bus',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
      },
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
      patterns: ['patient.alert'],
    }));
  }

  protected handleEventBusMessage(message: EventMessage): void {
    if (message.type === 'patient.alert' && message.data.severity === 'high') {
      this.handleHighSeverityAlert(message.data);
    }
  }

  private async handleHighSeverityAlert(alertData: any): Promise<void> {
    // Example resource check
    const resourcesAvailable = await this.checkResourceAvailability(alertData.patientId);

    if (resourcesAvailable) {
      this.notifyOnCallStaff(alertData);
      this.startIncidentSession(alertData);
    } else {
      this.log('warn', 'Resources not available for high-severity alert', { alertId: alertData.alertId });
    }
  }

  private async checkResourceAvailability(patientId: string): Promise<boolean> {
    // Placeholder: implement actual check
    this.log('info', `Checking resources for patient ${patientId}`);
    return true;
  }

  private async notifyOnCallStaff(alertData: any): Promise<void> {
    const notificationData = {
      type: 'emergency_alert',
      title: 'Alerta de Emergencia',
      message: `High severity alert for patient ${alertData.patientId}`,
      recipients: ['oncall@example.com'], // Replace with dynamic list
      priority: 'critical',
      channels: ['sms', 'push', 'email'],
    };

    await sendNotification(notificationData);

    SMSService.sendEmergencyAlert('+1234567890', `Emergency alert for patient ${alertData.patientId}`);
    PushService.sendEmergencyAlert('token', `Emergency alert for patient ${alertData.patientId}`);
  }

  private startIncidentSession(alertData: any): void {
    this.log('info', `Starting incident session for alert ${alertData.alertId}`);
    // Implement incident session start logic
  }
}

// Start the agent if run directly
if (require.main === module) {
  const config: EnhancedAgentConfig = {
    port: 3005,
    host: 'localhost',
    name: 'emergency-coordination-agent',
    logLevel: 'info',
    corsOrigins: ['http://localhost:3000'],
    enableWebSocket: true,
    enableMetrics: true,
    healthCheckInterval: 30000,
    eventBus: {
      url: 'ws://localhost:3010/event-bus',
    }
  };

  const agent = new EmergencyCoordinationAgent(config);

  agent.start().catch((error) => {
    console.error('Failed to start EmergencyCoordinationAgent:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down EmergencyCoordinationAgent...');
    await agent.stop();
    process.exit(0);
  });
}

