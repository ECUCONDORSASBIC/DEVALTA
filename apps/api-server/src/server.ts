import cors from 'cors';
import express from 'express';
import { initializeMiddlewares } from './middleware';

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3002 to 3001

// Inicializar middlewares de seguridad
initializeMiddlewares(app, process.env.ENCRYPTION_SECRET || 'default-key-change-in-production');

// CORS configuration
app.use(cors({
  origin: [
    /localhost:(3000|3001|3002|3003|3004|3005)$/,
    'http://localhost:3000',
    'http://localhost:3001', // Updated port
    'http://localhost:3002',
    'http://localhost:3003', 
    'http://localhost:3004',
    'http://localhost:3005'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Configuración básica de Express
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AltaMedica API Server',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    architecture: 'Next.js API Routes + Service Layer',
    documentation: '/api/v1/health',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      ai: '/api/v1/ai',
      telemedicine: '/api/v1/telemedicine',
      marketplace: '/api/v1/marketplace',
      notifications: '/api/v1/notifications',
      metrics: '/api/v1/metrics'
    },
    migration: {
      status: 'completed',
      migratedRoutes: [
        'ai-jobs -> /api/v1/ai/jobs',
        'telemedicine-routes -> /api/v1/telemedicine',
        'marketplace-routes -> /api/v1/marketplace',
        'notification-routes -> /api/v1/notifications',
        'metrics -> /api/v1/metrics'
      ]
    }
  });
});

// Legacy health check endpoint (redirect to new endpoint)
app.get('/api/health', (req, res) => {
  res.redirect(301, '/api/v1/health');
});

// Legacy API redirects for backward compatibility
app.use('/api/ai/*', (req, res) => {
  const newPath = req.path.replace('/api/ai', '/api/v1/ai');
  res.redirect(301, newPath);
});

app.use('/api/telemedicine/*', (req, res) => {
  const newPath = req.path.replace('/api/telemedicine', '/api/v1/telemedicine');
  res.redirect(301, newPath);
});

app.use('/api/marketplace/*', (req, res) => {
  const newPath = req.path.replace('/api/marketplace', '/api/v1/marketplace');
  res.redirect(301, newPath);
});

// Aplicar middlewares específicos por endpoint para rutas legacy (si las hay)
import { applyEndpointConfig } from './middleware';

// Endpoints de datos médicos (legacy - mantener si hay implementaciones)
app.use('/api/patients', applyEndpointConfig('medicalData'));
app.use('/api/medical-records', applyEndpointConfig('medicalData'));
app.use('/api/diagnoses', applyEndpointConfig('medicalData'));

// Endpoints de búsqueda (legacy - mantener si hay implementaciones)
app.use('/api/search', applyEndpointConfig('search'));

// Endpoints generales (legacy - mantener si hay implementaciones)
app.use('/api/general', applyEndpointConfig('general'));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Error en el servidor:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🔒 Security middlewares applied`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
