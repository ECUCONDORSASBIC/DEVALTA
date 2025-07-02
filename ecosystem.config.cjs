module.exports = {
  apps: [
    // Enhanced Multi-Agent MCP
    {
      name: 'enhanced-multi-agent-mcp',
      script: 'mcp-servers/enhanced-multi-agent-mcp.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/enhanced-multi-agent-mcp.log',
      out_file: './logs/enhanced-multi-agent-mcp-out.log',
      error_file: './logs/enhanced-multi-agent-mcp-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // System Configuration MCP
    {
      name: 'system-configuration-mcp',
      script: 'mcp-servers/system-configuration.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/system-configuration-mcp.log',
      out_file: './logs/system-configuration-mcp-out.log',
      error_file: './logs/system-configuration-mcp-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // Codebase Intelligence MCP
    {
      name: 'codebase-intelligence-mcp',
      script: 'mcp-protected/servers/codebase-intelligence-mcp.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/codebase-intelligence-mcp.log',
      out_file: './logs/codebase-intelligence-mcp-out.log',
      error_file: './logs/codebase-intelligence-mcp-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // AI Flow Orchestrator MCP
    {
      name: 'ai-flow-orchestrator-mcp',
      script: 'mcp-protected/servers/ai-flow-orchestrator-mcp.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/ai-flow-orchestrator-mcp.log',
      out_file: './logs/ai-flow-orchestrator-mcp-out.log',
      error_file: './logs/ai-flow-orchestrator-mcp-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // Frontend Error Handler MCP
    {
      name: 'frontend-error-handler-mcp',
      script: 'mcp-protected/servers/frontend-error-handler.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: './',
        MCP_ENABLED: 'true'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/frontend-error-handler-mcp.log',
      out_file: './logs/frontend-error-handler-mcp-out.log',
      error_file: './logs/frontend-error-handler-mcp-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}; 