# 🤖 Next-Phase Automation

Automated system for continuous development and deployment of medical components.

## Overview

The Next-Phase Auto-Runner is a cron-like automation script that provides continuous integration and automated development workflows for the AltaMedica medical platform.

### Key Features

- ⏰ **Periodic Backlog Checking**: Automatically checks for unfinished backlog items every 15 minutes
- 🤖 **MCP Integration**: Invokes MCP (Model Context Protocol) tools to spawn next composition automatically
- 🧪 **Automated Testing**: Runs `turbo test` after each composition
- 📝 **Auto-Commit**: Commits changes automatically after successful test runs
- 🔄 **Concurrent Processing**: Supports multiple concurrent tasks with configurable limits
- 📊 **Statistics Tracking**: Monitors automation performance and success rates

## Quick Start

### 1. Basic Usage

```bash
# Start the automation (production mode)
npm run automation:next-phase

# Dry run (no actual changes)
npm run automation:next-phase:dry-run

# Debug mode (verbose logging)
npm run automation:next-phase:debug
```

### 2. Environment Variables

```bash
# Enable dry run mode
export NEXT_PHASE_DRY_RUN=true

# Set log level (debug, info, warn, error)
export NEXT_PHASE_LOG_LEVEL=debug

# Run the automation
node scripts/automation/next-phase.js
```

## Configuration

The automation script can be configured through environment variables or by modifying the `CONFIG` object in the script:

```javascript
const CONFIG = {
  CHECK_INTERVAL: 15 * 60 * 1000,     // 15 minutes
  MAX_CONCURRENT_TASKS: 3,            // Max parallel tasks
  AUTO_COMMIT_ENABLED: true,          // Enable auto-commits
  TIMEOUT_MS: 30 * 60 * 1000,        // 30 minutes timeout
  DRY_RUN: false,                     // Dry run mode
  LOG_LEVEL: 'info'                   // Logging level
};
```

## How It Works

### 1. Backlog Parsing

The script continuously monitors the development backlog (`docs/architecture/dev-backlog.md`) and identifies:

- **Unfinished Items**: Items with status `PENDING`, `IN_PROGRESS`, or `FAILED`
- **Priority Order**: HIGH priority items are processed first
- **Metadata Extraction**: Parses item details, LOC estimates, target agents, etc.

### 2. MCP Composition

For each unfinished item, the automation:

- Calculates complexity based on LOC and dependencies
- Sends composition requests to the MCP server
- Includes medical standards requirements (ICD-10, FHIR R4, HIPAA)
- Monitors process execution with timeouts

### 3. Testing & Validation

After successful composition:

- Runs `turbo test` to validate changes
- Captures test output and error logs
- Reports success/failure status

### 4. Auto-Commit

If tests pass successfully:

- Stages all changes (`git add .`)
- Creates descriptive commit message
- Commits with `[skip ci]` flag
- Includes item details and test results

## Backlog Item Structure

The automation expects backlog items in this format:

```markdown
### **F001: Advanced Medical Dashboard Components**
- **Description**: Interactive medical dashboards for real-time patient monitoring
- **Priority**: HIGH
- **Estimated LOC**: 1,200
- **Target Agent**: `react_specialist_001`
- **Dependencies**: Medical data streams, WebSocket connections
- **User Stories**: 
  - As a doctor, I want real-time vital signs monitoring
  - As a nurse, I want patient status alerts dashboard
```

## Output Examples

### Successful Run
```
[2025-01-27T10:15:00.000Z] [INFO] 🤖 Starting Next-Phase Automation
[2025-01-27T10:15:00.001Z] [INFO] ⏰ Check interval: 900s
[2025-01-27T10:15:00.002Z] [INFO] 📁 Backlog file: /path/to/docs/architecture/dev-backlog.md
[2025-01-27T10:15:00.003Z] [INFO] 🔧 Max concurrent tasks: 3
[2025-01-27T10:15:00.004Z] [INFO] 🧪 Auto-commit: ENABLED
[2025-01-27T10:15:01.000Z] [INFO] 🔄 Starting automation cycle #1
[2025-01-27T10:15:01.100Z] [INFO] 📋 Found 5 unfinished items out of 17 total
[2025-01-27T10:15:01.200Z] [INFO] 🚀 Processing 3 items (0 already active)
[2025-01-27T10:15:01.300Z] [INFO] 🎯 Processing item: F001 - Advanced Medical Dashboard Components
[2025-01-27T10:15:01.400Z] [INFO] 🚀 Invoking MCP composition for item: F001
[2025-01-27T10:15:30.000Z] [INFO] ✅ MCP composition completed for F001
[2025-01-27T10:15:30.100Z] [INFO] 🧪 Running turbo test...
[2025-01-27T10:16:00.000Z] [INFO] ✅ Tests passed successfully
[2025-01-27T10:16:00.100Z] [INFO] 📝 Auto-committing changes for F001
[2025-01-27T10:16:05.000Z] [INFO] ✅ Changes committed successfully
[2025-01-27T10:16:05.100Z] [INFO] ✅ Completed processing: F001
```

### Dry Run Mode
```
[2025-01-27T10:15:00.000Z] [INFO] 🔍 DRY RUN MODE - No actual changes will be made
[2025-01-27T10:15:01.000Z] [INFO] [DRY RUN] Would compose: Advanced Medical Dashboard Components
[2025-01-27T10:15:01.100Z] [INFO] [DRY RUN] Would run: turbo test
[2025-01-27T10:15:01.200Z] [INFO] [DRY RUN] Would commit changes
```

## Statistics Tracking

The automation tracks comprehensive statistics:

```
📊 Automation Statistics:
   Total runs: 24
   Successful compositions: 18
   Failed compositions: 2
   Tests run: 18
   Commits created: 16
```

## Error Handling

The automation includes robust error handling:

- **Timeout Protection**: Prevents hung processes
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals
- **Job Recovery**: Continues processing other items if one fails
- **Detailed Logging**: Comprehensive error reporting

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**
   ```bash
   # Verify MCP server exists
   ls -la mcp-servers/enhanced-multi-agent-mcp.js
   ```

2. **Test Failures**
   ```bash
   # Run tests manually to debug
   turbo test
   ```

3. **Git Commit Issues**
   ```bash
   # Check git status
   git status
   git log --oneline -5
   ```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
NEXT_PHASE_LOG_LEVEL=debug npm run automation:next-phase
```

## Integration with PM2

For production deployment, consider using PM2:

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'next-phase-automation',
    script: 'scripts/automation/next-phase.js',
    cwd: '/path/to/altamedica',
    env: {
      NODE_ENV: 'production',
      NEXT_PHASE_LOG_LEVEL: 'info'
    },
    error_file: './logs/next-phase-error.log',
    out_file: './logs/next-phase-out.log',
    log_file: './logs/next-phase-combined.log',
    restart_delay: 5000,
    max_restarts: 5
  }]
};
```

## Security Considerations

- **Auto-commits**: Include `[skip ci]` to prevent CI loops
- **Timeout Limits**: Prevent resource exhaustion
- **Concurrent Limits**: Avoid overwhelming the system
- **Dry Run Testing**: Always test in dry run mode first

## Contributing

When modifying the automation script:

1. Test thoroughly in dry run mode
2. Update configuration documentation
3. Add appropriate error handling
4. Include logging for debugging
5. Update this README if needed

## License

Part of the AltaMedica medical platform. All rights reserved.
