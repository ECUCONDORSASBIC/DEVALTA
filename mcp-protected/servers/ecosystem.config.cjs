module.exports = {
  apps: [
    {
      name: 'ai-flow-orchestrator-mcp',
      script: 'ai-flow-orchestrator-mcp.js',
      cwd: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\mcp-protected\\servers',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'codebase-intelligence-mcp',
      script: 'codebase-intelligence-mcp.js',
      cwd: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\mcp-protected\\servers',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'context-memory-mcp',
      script: 'context-memory-mcp.js',
      cwd: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\mcp-protected\\servers',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'multi-agent-composer-mcp',
      script: 'multi-agent-composer-mcp.js',
      cwd: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\mcp-protected\\servers',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'smart-completion-mcp',
      script: 'smart-completion-mcp.js',
      cwd: 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\mcp-protected\\servers',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
