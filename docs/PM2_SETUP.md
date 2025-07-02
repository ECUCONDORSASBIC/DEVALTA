# PM2 Process Manager Setup

This project uses PM2 to manage development processes and ensure single instances of watchers and development servers.

## 🚀 Quick Start

### Install and Start
```bash
# Install PM2 (already included in devDependencies)
pnpm install

# Start all development processes
pnpm pm2:start

# Or start only TypeScript watcher
pnpm pm2:start-tsc
```

### Setup Auto-Restart on Login
```bash
# Run the setup script (Windows)
powershell -ExecutionPolicy Bypass -File scripts/setup-pm2-startup.ps1

# Or use VSCode task: "⚙️ PM2 - Configurar Startup"
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm pm2:start` | Start all development processes |
| `pnpm pm2:start-tsc` | Start only TypeScript watcher |
| `pnpm pm2:start-or-restart` | Start or restart all processes |
| `pnpm pm2:start-or-restart-tsc` | Start or restart only TypeScript watcher |
| `pnpm pm2:stop` | Stop all processes |
| `pnpm pm2:restart` | Restart all processes |
| `pnpm pm2:reload` | Reload processes (zero-downtime) |
| `pnpm pm2:delete` | Delete all processes |
| `pnpm pm2:status` | Show process status |
| `pnpm pm2:logs` | Show logs |
| `pnpm pm2:monit` | Open monitoring dashboard |
| `pnpm pm2:flush` | Clear logs |
| `pnpm pm2:save` | Save current process list |
| `pnpm pm2:resurrect` | Restore saved processes |
| `pnpm pm2:startup` | Show startup command |

## 🔧 Configuration

The PM2 configuration is defined in `ecosystem.config.cjs`:

### Available Apps
- **tsc-watch**: TypeScript compilation watcher
- **turbo-dev**: Turbo development server
- **dev-all**: Combined development processes

### Key Features
- **Single Instance**: Each process is limited to 1 instance
- **Auto-Restart**: Processes restart automatically on failure
- **Memory Management**: Automatic restart on memory limit
- **Logging**: Structured logs in `./logs/` directory
- **Graceful Shutdown**: 5-second timeout for clean exits

## 🖥️ VSCode Integration

Use the following VSCode tasks from the Command Palette (Ctrl+Shift+P → "Tasks: Run Task"):

- **🔄 PM2 - Iniciar TypeScript Watcher**: Start only TS watcher
- **🚀 PM2 - Iniciar Todos los Procesos**: Start all processes
- **📊 PM2 - Estado de Procesos**: Show process status
- **🛑 PM2 - Detener Procesos**: Stop all processes
- **⚙️ PM2 - Configurar Startup**: Setup auto-start on login

## 🔄 Auto-Restart on Login

The setup script creates a Windows Scheduled Task that:
1. Runs on user login
2. Navigates to the project directory
3. Executes `pm2 resurrect` to restore saved processes

### Manual Setup
```bash
# Save current processes
pnpm pm2:save

# Test resurrection
pm2 kill && pm2 resurrect

# Run setup script
powershell -ExecutionPolicy Bypass -File scripts/setup-pm2-startup.ps1
```

## 📊 Monitoring

### Real-time Monitoring
```bash
# Terminal dashboard
pnpm pm2:monit

# Process status
pnpm pm2:status

# Live logs
pnpm pm2:logs
```

### Log Files
Logs are stored in `./logs/` directory:
- `*-out.log`: Standard output
- `*-error.log`: Error output
- `*-combined.log`: Combined logs

## 🚨 Troubleshooting

### Multiple Instances Running
```bash
# Stop all processes
pnpm pm2:stop

# Delete all processes
pnpm pm2:delete

# Clean start
pnpm pm2:start
```

### Startup Issues
```bash
# Check scheduled task
Get-ScheduledTask -TaskName "PM2-ALTAMEDICADEV-Startup"

# Manually test resurrection
pm2 resurrect

# Re-run setup with force
powershell -ExecutionPolicy Bypass -File scripts/setup-pm2-startup.ps1 -Force
```

### Clear Logs
```bash
# Clear all logs
pnpm pm2:flush

# Or manually delete log files
rm -rf logs/*
```

## 🔗 Integration with Existing Workflows

PM2 integrates seamlessly with existing development workflows:

1. **Replace direct npm/pnpm commands** with PM2 equivalents
2. **VSCode tasks** now use PM2 for process management
3. **Auto-restart** ensures processes survive crashes
4. **Single instance** prevents conflicts from multiple VSCode windows

## 📈 Benefits

- ✅ **Prevents multiple watcher instances**
- ✅ **Automatic process recovery**
- ✅ **Structured logging**
- ✅ **Resource monitoring**
- ✅ **Zero-downtime reloads**
- ✅ **Persistent across reboots**
- ✅ **VSCode integration**
- ✅ **Cross-platform compatibility**
