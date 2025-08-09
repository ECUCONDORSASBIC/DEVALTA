import { Router } from 'express';

const router = Router();

// Health status endpoint
router.get('/', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    uptimeHuman: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    },
    services: {
      database: 'connected', // TODO: implement real DB check
      auth: 'active',
      api: 'running'
    }
  });
});

// Version endpoint
router.get('/version', (req, res) => {
  res.json({
    name: 'AltaMedica API Server',
    version: '2.0.0',
    buildDate: new Date().toISOString(),
    architecture: 'Express.js + TypeScript',
    node: process.version,
    platform: process.platform
  });
});

// Detailed metrics endpoint
router.get('/metrics', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024)
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    process: {
      pid: process.pid,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001
    }
  });
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', (req, res) => {
  // TODO: Add real readiness checks (DB connections, etc.)
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: true, // TODO: implement real check
      auth: true,
      api: true
    }
  });
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

export default router;