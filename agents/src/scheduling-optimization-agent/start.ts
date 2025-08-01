import { SchedulingOptimizationAgent, defaultConfig } from './index';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Override default config with environment variables if available
const config = {
  ...defaultConfig,
  port: parseInt(process.env.SCHEDULING_AGENT_PORT || String(defaultConfig.port)),
  host: process.env.SCHEDULING_AGENT_HOST || defaultConfig.host,
  logLevel: (process.env.LOG_LEVEL || defaultConfig.logLevel) as 'debug' | 'info' | 'warn' | 'error',
  optaplannerServiceUrl: process.env.OPTAPLANNER_SERVICE_URL || defaultConfig.optaplannerServiceUrl,
  mlServiceUrl: process.env.ML_SERVICE_URL || defaultConfig.mlServiceUrl,
  redisHost: process.env.REDIS_HOST || defaultConfig.redisHost,
  redisPort: parseInt(process.env.REDIS_PORT || String(defaultConfig.redisPort)),
  kafkaBrokers: (process.env.KAFKA_BROKERS || defaultConfig.kafkaBrokers.join(',')).split(','),
  demandForecastingEnabled: process.env.ENABLE_DEMAND_FORECASTING === 'true'
};

// Create and start agent
const agent = new SchedulingOptimizationAgent(config);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await agent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await agent.stop();
  process.exit(0);
});

// Start the agent
agent.start().then(() => {
  console.log(`SchedulingOptimizationAgent started successfully`);
  console.log(`- API: http://${config.host}:${config.port}`);
  console.log(`- WebSocket: ws://${config.host}:${config.port}`);
  console.log(`- OptaPlanner Service: ${config.optaplannerServiceUrl}`);
  console.log(`- ML Service: ${config.mlServiceUrl}`);
  console.log(`- Demand Forecasting: ${config.demandForecastingEnabled ? 'Enabled' : 'Disabled'}`);
}).catch((error) => {
  console.error('Failed to start SchedulingOptimizationAgent:', error);
  process.exit(1);
});
