import { KnowledgeGraphAgent } from './index.js';
import fs from 'fs';
import path from 'path';

// Load configuration
const configPath = process.env.CONFIG_FILE || path.join(__dirname, '../../config/knowledge-graph-agent.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Create and start the agent
const agent = new KnowledgeGraphAgent(config);

agent.start()
  .then(() => {
    console.log('Knowledge Graph Agent started successfully');
    
    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down Knowledge Graph Agent...');
      await agent.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await agent.stop();
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Failed to start Knowledge Graph Agent:', error);
    process.exit(1);
  });
