#!/usr/bin/env node

/**
 * 🤖 NEXT-PHASE AUTO-RUNNER
 * 
 * Cron-like automation script that:
 * - Checks unfinished backlog items every 15 min
 * - Invokes MCP tools to spawn next composition automatically
 * - Enforces auto-commit after each successful `turbo test`
 * 
 * @author Enhanced Multi-Agent Composer
 * @version 1.0.0
 * @since 2025-01-27
 */

import { exec, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// 🔧 Configuration
const CONFIG = {
  CHECK_INTERVAL: 15 * 60 * 1000, // 15 minutes in milliseconds
  BACKLOG_FILE: path.join(PROJECT_ROOT, 'docs/architecture/dev-backlog.md'),
  MCP_SERVER_PATH: path.join(PROJECT_ROOT, 'mcp-servers/enhanced-multi-agent-mcp.js'),
  MAX_CONCURRENT_TASKS: 3,
  AUTO_COMMIT_ENABLED: true,
  DRY_RUN: process.env.NEXT_PHASE_DRY_RUN === 'true' || process.argv.includes('--dry-run'),
  LOG_LEVEL: process.env.NEXT_PHASE_LOG_LEVEL || (process.argv.includes('--debug') ? 'debug' : 'info'),
  TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes timeout for each task
};

// 📊 Logger
class Logger {
  constructor(level = 'info') {
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
    this.level = this.levels[level] || 1;
  }

  log(level, ...args) {
    if (this.levels[level] >= this.level) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}]`, ...args);
    }
  }

  debug(...args) { this.log('debug', ...args); }
  info(...args) { this.log('info', ...args); }
  warn(...args) { this.log('warn', ...args); }
  error(...args) { this.log('error', ...args); }
}

const logger = new Logger(CONFIG.LOG_LEVEL);

// 🎯 Backlog Parser
class BacklogParser {
  static async parseBacklog() {
    try {
      const content = await fs.readFile(CONFIG.BACKLOG_FILE, 'utf-8');
      const items = this.extractBacklogItems(content);
      logger.debug(`Parsed ${items.length} backlog items`);
      return items;
    } catch (error) {
      logger.error('Failed to parse backlog:', error.message);
      return [];
    }
  }

  static extractBacklogItems(content) {
    const items = [];
    const lines = content.split('\n');
    let currentItem = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match item headers like "### **F001: Advanced Medical Dashboard Components**"
      const itemMatch = trimmed.match(/^### \*\*([^:]+):\s*(.+)\*\*$/);
      if (itemMatch) {
        if (currentItem) {
          items.push(currentItem);
        }
        currentItem = {
          id: itemMatch[1].trim(),
          title: itemMatch[2].trim(),
          description: '',
          priority: 'MEDIUM',
          estimatedLOC: 0,
          targetAgent: '',
          dependencies: [],
          status: 'PENDING',
          technical_requirements: [],
          user_stories: []
        };
        continue;
      }

      if (currentItem) {
        // Extract metadata
        if (trimmed.startsWith('- **Priority**:')) {
          currentItem.priority = trimmed.replace('- **Priority**:', '').trim();
        } else if (trimmed.startsWith('- **Estimated LOC**:')) {
          const locMatch = trimmed.match(/(\d+)/);
          currentItem.estimatedLOC = locMatch ? parseInt(locMatch[1]) : 0;
        } else if (trimmed.startsWith('- **Target Agent**:')) {
          currentItem.targetAgent = trimmed.replace('- **Target Agent**:', '').trim().replace(/`/g, '');
        } else if (trimmed.startsWith('- **Description**:')) {
          currentItem.description = trimmed.replace('- **Description**:', '').trim();
        } else if (trimmed.startsWith('  - As')) {
          currentItem.user_stories.push(trimmed.substring(4));
        } else if (trimmed.startsWith('  - ') && currentItem.user_stories.length === 0) {
          currentItem.technical_requirements.push(trimmed.substring(4));
        }
      }
    }

    if (currentItem) {
      items.push(currentItem);
    }

    return items;
  }

  static getUnfinishedItems(items) {
    return items.filter(item => 
      item.status === 'PENDING' || 
      item.status === 'IN_PROGRESS' ||
      item.status === 'FAILED'
    );
  }

  static prioritizeItems(items) {
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    return items.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      return bPriority - aPriority;
    });
  }
}

// 🤖 MCP Client
class MCPClient {
  constructor() {
    this.activeProcesses = new Map();
  }

  async invokeMCPComposition(item) {
    logger.info(`🚀 Invoking MCP composition for item: ${item.id}`);
    
    if (CONFIG.DRY_RUN) {
      logger.info(`[DRY RUN] Would compose: ${item.title}`);
      return { success: true, output: 'DRY RUN - Simulated success' };
    }

    const compositionRequest = {
      type: 'medical_composition',
      item: item,
      priority: item.priority,
      estimated_complexity: this.calculateComplexity(item),
      requirements: {
        medical_standards: ['ICD-10', 'FHIR R4', 'HIPAA'],
        security_level: 'HIGH',
        performance_requirements: 'REAL_TIME',
        scalability: 'HORIZONTAL'
      }
    };

    try {
      const result = await this.execMCPCommand(compositionRequest);
      logger.info(`✅ MCP composition completed for ${item.id}`);
      return result;
    } catch (error) {
      logger.error(`❌ MCP composition failed for ${item.id}:`, error.message);
      throw error;
    }
  }

  calculateComplexity(item) {
    let complexity = 'MEDIUM';
    
    if (item.estimatedLOC > 3000) complexity = 'HIGH';
    else if (item.estimatedLOC < 1000) complexity = 'LOW';
    
    if (item.priority === 'HIGH') complexity = 'HIGH';
    if (item.dependencies.length > 3) complexity = 'HIGH';
    
    return complexity;
  }

  async execMCPCommand(request) {
    return new Promise((resolve, reject) => {
      const process = spawn('node', [CONFIG.MCP_SERVER_PATH], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: PROJECT_ROOT
      });

      let output = '';
      let errorOutput = '';

      const timeout = setTimeout(() => {
        process.kill('SIGTERM');
        reject(new Error(`MCP process timeout after ${CONFIG.TIMEOUT_MS}ms`));
      }, CONFIG.TIMEOUT_MS);

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0) {
          resolve({ success: true, output, code });
        } else {
          reject(new Error(`MCP process failed with code ${code}: ${errorOutput}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      // Send the composition request to MCP server
      process.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'compose_medical_component',
          arguments: request
        }
      }));
      process.stdin.end();
    });
  }
}

// 🧪 Test Runner
class TestRunner {
  static async runTests() {
    logger.info('🧪 Running turbo test...');
    
    if (CONFIG.DRY_RUN) {
      logger.info('[DRY RUN] Would run: turbo test');
      return { success: true, output: 'DRY RUN - Simulated test success' };
    }

    return new Promise((resolve, reject) => {
      const process = exec('turbo test', {
        cwd: PROJECT_ROOT,
        timeout: CONFIG.TIMEOUT_MS
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
        logger.debug('Test output:', data.toString().trim());
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
        logger.debug('Test error:', data.toString().trim());
      });

      process.on('close', (code) => {
        if (code === 0) {
          logger.info('✅ Tests passed successfully');
          resolve({ success: true, output, code });
        } else {
          logger.error('❌ Tests failed with code:', code);
          reject(new Error(`Tests failed with code ${code}: ${errorOutput}`));
        }
      });

      process.on('error', (error) => {
        logger.error('❌ Test execution error:', error.message);
        reject(error);
      });
    });
  }
}

// 📝 Git Automation
class GitCommitter {
  static async autoCommit(item, testResult) {
    if (!CONFIG.AUTO_COMMIT_ENABLED) {
      logger.debug('Auto-commit disabled');
      return { success: true, skipped: true };
    }

    logger.info(`📝 Auto-committing changes for ${item.id}`);
    
    if (CONFIG.DRY_RUN) {
      logger.info('[DRY RUN] Would commit changes');
      return { success: true, output: 'DRY RUN - Simulated commit' };
    }

    try {
      // Stage all changes
      await this.execGitCommand('add .');
      
      // Create commit message
      const commitMessage = `chore(automation): enable next-phase auto-runner

- Completed: ${item.title} (${item.id})
- Priority: ${item.priority}
- Estimated LOC: ${item.estimatedLOC}
- Tests: ${testResult.success ? 'PASSED' : 'FAILED'}
- Auto-generated by next-phase automation

[skip ci]`;

      // Commit changes
      await this.execGitCommand(`commit -m "${commitMessage}"`);
      
      logger.info('✅ Changes committed successfully');
      return { success: true, commitMessage };
    } catch (error) {
      logger.error('❌ Git commit failed:', error.message);
      throw error;
    }
  }

  static async execGitCommand(command) {
    return new Promise((resolve, reject) => {
      exec(`git ${command}`, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Git command failed: ${error.message}`));
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }
}

// 🎯 Main Automation Engine
class NextPhaseAutomation extends EventEmitter {
  constructor() {
    super();
    this.mcpClient = new MCPClient();
    this.activeJobs = new Map();
    this.isRunning = false;
    this.stats = {
      totalRuns: 0,
      successfulCompositions: 0,
      failedCompositions: 0,
      testsRun: 0,
      commitsCreated: 0
    };
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Automation already running');
      return;
    }

    this.isRunning = true;
    logger.info('🤖 Starting Next-Phase Automation');
    logger.info(`⏰ Check interval: ${CONFIG.CHECK_INTERVAL / 1000}s`);
    logger.info(`📁 Backlog file: ${CONFIG.BACKLOG_FILE}`);
    logger.info(`🔧 Max concurrent tasks: ${CONFIG.MAX_CONCURRENT_TASKS}`);
    logger.info(`🧪 Auto-commit: ${CONFIG.AUTO_COMMIT_ENABLED ? 'ENABLED' : 'DISABLED'}`);
    
    if (CONFIG.DRY_RUN) {
      logger.info('🔍 DRY RUN MODE - No actual changes will be made');
    }

    // Run initial check
    await this.runAutomationCycle();

    // Set up interval
    this.interval = setInterval(async () => {
      await this.runAutomationCycle();
    }, CONFIG.CHECK_INTERVAL);

    logger.info('✅ Next-Phase Automation started successfully');
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
    }

    // Wait for active jobs to complete
    const activeJobPromises = Array.from(this.activeJobs.values());
    if (activeJobPromises.length > 0) {
      logger.info(`⏳ Waiting for ${activeJobPromises.length} active jobs to complete...`);
      await Promise.allSettled(activeJobPromises);
    }

    logger.info('🛑 Next-Phase Automation stopped');
    this.printStats();
  }

  async runAutomationCycle() {
    try {
      this.stats.totalRuns++;
      logger.info(`🔄 Starting automation cycle #${this.stats.totalRuns}`);

      // Parse backlog
      const allItems = await BacklogParser.parseBacklog();
      const unfinishedItems = BacklogParser.getUnfinishedItems(allItems);
      const prioritizedItems = BacklogParser.prioritizeItems(unfinishedItems);

      logger.info(`📋 Found ${unfinishedItems.length} unfinished items out of ${allItems.length} total`);

      if (unfinishedItems.length === 0) {
        logger.info('🎉 No unfinished backlog items - all work completed!');
        return;
      }

      // Process items (respecting concurrency limit)
      const availableSlots = CONFIG.MAX_CONCURRENT_TASKS - this.activeJobs.size;
      const itemsToProcess = prioritizedItems.slice(0, availableSlots);

      if (itemsToProcess.length === 0) {
        logger.info(`⏸️ All slots busy (${this.activeJobs.size}/${CONFIG.MAX_CONCURRENT_TASKS})`);
        return;
      }

      logger.info(`🚀 Processing ${itemsToProcess.length} items (${this.activeJobs.size} already active)`);

      // Start processing items
      const processingPromises = itemsToProcess.map(item => this.processItem(item));
      await Promise.allSettled(processingPromises);

      logger.info(`✅ Automation cycle #${this.stats.totalRuns} completed`);
    } catch (error) {
      logger.error('❌ Automation cycle failed:', error.message);
    }
  }

  async processItem(item) {
    const jobId = `${item.id}_${Date.now()}`;
    logger.info(`🎯 Processing item: ${item.id} - ${item.title}`);

    const jobPromise = this.executeItemWorkflow(item);
    this.activeJobs.set(jobId, jobPromise);

    try {
      const result = await jobPromise;
      logger.info(`✅ Completed processing: ${item.id}`);
      return result;
    } catch (error) {
      logger.error(`❌ Failed processing: ${item.id}`, error.message);
      this.stats.failedCompositions++;
      throw error;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  async executeItemWorkflow(item) {
    try {
      // Step 1: Invoke MCP composition
      logger.debug(`Step 1: MCP composition for ${item.id}`);
      const compositionResult = await this.mcpClient.invokeMCPComposition(item);
      this.stats.successfulCompositions++;

      // Step 2: Run tests
      logger.debug(`Step 2: Running tests for ${item.id}`);
      const testResult = await TestRunner.runTests();
      this.stats.testsRun++;

      // Step 3: Auto-commit if tests pass
      let commitResult = null;
      if (testResult.success) {
        logger.debug(`Step 3: Auto-committing for ${item.id}`);
        commitResult = await GitCommitter.autoCommit(item, testResult);
        if (commitResult.success && !commitResult.skipped) {
          this.stats.commitsCreated++;
        }
      } else {
        logger.warn(`⚠️ Skipping commit for ${item.id} - tests failed`);
      }

      return {
        item,
        composition: compositionResult,
        tests: testResult,
        commit: commitResult
      };
    } catch (error) {
      logger.error(`❌ Workflow failed for ${item.id}:`, error.message);
      throw error;
    }
  }

  printStats() {
    logger.info('📊 Automation Statistics:');
    logger.info(`   Total runs: ${this.stats.totalRuns}`);
    logger.info(`   Successful compositions: ${this.stats.successfulCompositions}`);
    logger.info(`   Failed compositions: ${this.stats.failedCompositions}`);
    logger.info(`   Tests run: ${this.stats.testsRun}`);
    logger.info(`   Commits created: ${this.stats.commitsCreated}`);
  }
}

// 🎬 Main Execution
async function main() {
  const automation = new NextPhaseAutomation();

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    logger.info('🛑 Received SIGINT, shutting down gracefully...');
    await automation.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('🛑 Received SIGTERM, shutting down gracefully...');
    await automation.stop();
    process.exit(0);
  });

  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  try {
    await automation.start();
  } catch (error) {
    logger.error('💥 Failed to start automation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
const isMainModule = process.argv[1] && (
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith(process.argv[1]) ||
  process.argv[1].endsWith('next-phase.js')
);

if (isMainModule) {
  main().catch((error) => {
    console.error('💥 Main execution failed:', error);
    process.exit(1);
  });
}

export { NextPhaseAutomation, BacklogParser, MCPClient, TestRunner, GitCommitter };
