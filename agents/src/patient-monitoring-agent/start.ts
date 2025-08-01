import { PatientMonitoringAgent } from './index.js';
import { EnhancedAgentConfig } from '../shared/EnhancedBaseAgent.js';

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
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
  scheduledJobs: [
    {
      name: 'monitoring_cycle',
      schedule: '*/1 * * * *', // Every minute
      handler: 'monitoringCycle',
    },
  ],
};

async function start() {
  console.log('Starting Patient Monitoring Agent...');
  console.log('Configuration:', {
    port: config.port,
    host: config.host,
    eventBus: config.eventBus?.url,
  });

  const agent = new PatientMonitoringAgent(config);
  
  try {
    await agent.start();
    console.log('Patient Monitoring Agent is running!');
    console.log(`API available at http://${config.host}:${config.port}`);
    console.log('\nAvailable endpoints:');
    console.log('  POST /patients/:patientId/vitals - Submit vital signs');
    console.log('  POST /patients/:patientId/wearable - Submit wearable data');
    console.log('  POST /patients/:patientId/ehr - Submit EHR updates');
    console.log('  GET  /patients/:patientId/status - Get patient status');
    console.log('  GET  /patients/:patientId/alerts - Get patient alerts');
    console.log('  GET  /alerts/active - Get all active alerts');
    console.log('  GET  /alerts/history - Get alert history');
    console.log('  GET  /models - Get ML model status');
    console.log('  GET  /health - Health check');
    console.log('  GET  /metrics - Agent metrics');
    console.log('\nWebSocket streams:');
    console.log('  ws://localhost:3004/stream/vitals - Real-time vital signs');
    console.log('  ws://localhost:3004/stream/alerts - Real-time alerts');
  } catch (error) {
    console.error('Failed to start Patient Monitoring Agent:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

// Start the agent
start();
