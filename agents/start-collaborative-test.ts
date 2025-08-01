#!/usr/bin/env node

/**
 * Start All Agents for Collaborative Testing
 * 
 * This script starts all agents with the event bus enabled
 * and runs the collaborative scenario test
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

interface AgentProcess {
  name: string;
  process: ChildProcess;
  port: number;
}

const agents: AgentProcess[] = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(agent: string, message: string, color: string = colors.reset) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  console.log(`${color}[${timestamp}] [${agent.padEnd(20)}] ${message}${colors.reset}`);
}

async function startEventBus(): Promise<AgentProcess> {
  log('EVENT-BUS', 'Starting Event Bus...', colors.cyan);
  
  const eventBus = spawn('npx', ['ts-node', 'src/event-bus/index.ts'], {
    cwd: path.join(__dirname),
    stdio: 'pipe',
    shell: true
  });

  eventBus.stdout?.on('data', (data) => {
    log('EVENT-BUS', data.toString().trim(), colors.cyan);
  });

  eventBus.stderr?.on('data', (data) => {
    log('EVENT-BUS', `ERROR: ${data.toString().trim()}`, colors.red);
  });

  // Wait for event bus to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  return { name: 'event-bus', process: eventBus, port: 3010 };
}

async function startAgent(name: string, configFile: string): Promise<AgentProcess> {
  log(name.toUpperCase(), `Starting ${name} agent...`, colors.green);
  
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', configFile), 'utf8'));
  
  const agent = spawn('npx', ['ts-node', `src/${name}/index.ts`], {
    cwd: path.join(__dirname),
    env: {
      ...process.env,
      CONFIG_FILE: path.join(__dirname, 'config', configFile)
    },
    stdio: 'pipe',
    shell: true
  });

  agent.stdout?.on('data', (data) => {
    log(name.toUpperCase(), data.toString().trim(), colors.green);
  });

  agent.stderr?.on('data', (data) => {
    log(name.toUpperCase(), `ERROR: ${data.toString().trim()}`, colors.red);
  });

  agent.on('error', (error) => {
    log(name.toUpperCase(), `Failed to start: ${error.message}`, colors.red);
  });

  return { name, process: agent, port: config.port };
}

async function waitForAgents(agents: AgentProcess[]): Promise<void> {
  log('SYSTEM', 'Waiting for all agents to be ready...', colors.yellow);
  
  const axios = require('axios');
  const maxRetries = 30;
  
  for (const agent of agents) {
    if (agent.name === 'event-bus') continue; // Event bus doesn't have HTTP endpoint
    
    let ready = false;
    let retries = 0;
    
    while (!ready && retries < maxRetries) {
      try {
        await axios.get(`http://localhost:${agent.port}/health`);
        ready = true;
        log('SYSTEM', `${agent.name} is ready!`, colors.green);
      } catch (error) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!ready) {
      throw new Error(`${agent.name} failed to start after ${maxRetries} attempts`);
    }
  }
  
  log('SYSTEM', 'All agents are ready!', colors.green);
}

async function runScenario(): Promise<void> {
  log('SCENARIO', 'Starting collaborative scenario test...', colors.magenta);
  
  const scenario = spawn('npx', ['ts-node', 'test/collaborative-scenario.ts'], {
    cwd: path.join(__dirname),
    stdio: 'pipe',
    shell: true
  });

  scenario.stdout?.on('data', (data) => {
    console.log(data.toString().trim());
  });

  scenario.stderr?.on('data', (data) => {
    log('SCENARIO', `ERROR: ${data.toString().trim()}`, colors.red);
  });

  return new Promise((resolve, reject) => {
    scenario.on('close', (code) => {
      if (code === 0) {
        log('SCENARIO', 'Scenario completed successfully!', colors.green);
        resolve();
      } else {
        reject(new Error(`Scenario exited with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log(`${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════════════╗
║          ALTAMEDICA Agent Collaborative Test Suite               ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // Start Event Bus first
    const eventBus = await startEventBus();
    agents.push(eventBus);

    // Start all agents
    const agentConfigs = [
      { name: 'auth-agent', config: 'auth-agent.json' },
      { name: 'routing-agent', config: 'routing-agent.json' },
      { name: 'security-agent', config: 'security-agent.json' },
      { name: 'monitoring-agent', config: 'monitoring-agent.json' },
      { name: 'knowledge-graph-agent', config: 'knowledge-graph-agent.json' }
    ];

    for (const { name, config } of agentConfigs) {
      const agent = await startAgent(name, config);
      agents.push(agent);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between starts
    }

    // Wait for all agents to be ready
    await waitForAgents(agents);

    // Wait a bit more for event bus connections
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Run the collaborative scenario
    await runScenario();

    // Keep running for observation
    log('SYSTEM', 'Test completed. Press Ctrl+C to stop all agents.', colors.yellow);

  } catch (error) {
    log('SYSTEM', `Error: ${error.message}`, colors.red);
    cleanup();
    process.exit(1);
  }
}

function cleanup() {
  log('SYSTEM', 'Stopping all agents...', colors.yellow);
  
  agents.forEach(({ name, process }) => {
    log('SYSTEM', `Stopping ${name}...`, colors.yellow);
    process.kill('SIGTERM');
  });
  
  setTimeout(() => {
    agents.forEach(({ process }) => {
      if (!process.killed) {
        process.kill('SIGKILL');
      }
    });
    process.exit(0);
  }, 5000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n');
  cleanup();
});

process.on('SIGTERM', cleanup);

// Run the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
