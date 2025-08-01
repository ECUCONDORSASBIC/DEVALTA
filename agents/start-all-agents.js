#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agents = [
  { name: 'auth-agent', port: 3001 },
  { name: 'routing-agent', port: 3002 },
  { name: 'security-agent', port: 3006 },
  { name: 'monitoring-agent', port: 3007 },
  { name: 'devops-agent', port: 3008 },
];

const processes = [];

console.log('🚀 Starting ALTAMEDICA MCP Agents...\n');

// Function to start an agent
function startAgent(agent) {
  const agentPath = path.join(__dirname, 'src', agent.name, 'index.js');
  
  console.log(`Starting ${agent.name} on port ${agent.port}...`);
  
  const child = spawn('node', [agentPath], {
    stdio: 'pipe',
    env: {
      ...process.env,
      PORT: agent.port.toString(),
    },
  });

  child.stdout.on('data', (data) => {
    console.log(`[${agent.name}] ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`[${agent.name}] ERROR: ${data.toString().trim()}`);
  });

  child.on('close', (code) => {
    console.log(`[${agent.name}] Process exited with code ${code}`);
  });

  child.on('error', (error) => {
    console.error(`[${agent.name}] Failed to start: ${error.message}`);
  });

  processes.push({ agent: agent.name, process: child });
  return child;
}

// Start all agents
agents.forEach(agent => {
  startAgent(agent);
  // Small delay between starts
  setTimeout(() => {}, 1000);
});

// Health check function
function healthCheck() {
  console.log('\n🔍 Performing health checks...');
  
  agents.forEach(async (agent) => {
    try {
      const response = await fetch(`http://localhost:${agent.port}/health`);
      const health = await response.json();
      
      const status = health.status === 'healthy' ? '✅' : 
                    health.status === 'degraded' ? '⚠️' : '❌';
      
      console.log(`${status} ${agent.name}: ${health.status} (uptime: ${Math.round(health.uptime / 1000)}s)`);
    } catch (error) {
      console.log(`❌ ${agent.name}: Not responding`);
    }
  });
}

// Perform initial health check after 5 seconds
setTimeout(healthCheck, 5000);

// Perform health checks every 30 seconds
setInterval(healthCheck, 30000);

// Graceful shutdown
function gracefulShutdown() {
  console.log('\n🛑 Shutting down all agents...');
  
  processes.forEach(({ agent, process }) => {
    console.log(`Stopping ${agent}...`);
    process.kill('SIGTERM');
  });
  
  setTimeout(() => {
    console.log('All agents stopped. Goodbye! 👋');
    process.exit(0);
  }, 2000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

console.log('\n📊 Agent Management Dashboard:');
console.log('- Health checks: Every 30 seconds');
console.log('- Press Ctrl+C to stop all agents');
console.log('- Individual agent logs are prefixed with [agent-name]');
console.log('\n🔗 Agent Endpoints:');
agents.forEach(agent => {
  console.log(`- ${agent.name}: http://localhost:${agent.port}`);
});
console.log('');
