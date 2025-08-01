import express from 'express';
import cors from 'cors';
import { initializeMiddlewares } from './middleware';
import securityConfig from './config/security-config';
import marketplaceRoutes from './routes/marketplace-routes';
import agentsRoutes from './routes/agents-routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar middlewares de seguridad
initializeMiddlewares(app, process.env.ENCRYPTION_SECRET || 'default-key-change-in-production');

// CORS configuration
app.use(cors({
  origin: [
    /localhost:(3000|3002|3003|3004|3005)$/,
    'http://localhost:3000',
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Aplicar middlewares específicos por endpoint
import { applyEndpointConfig } from './middleware';

// Endpoints de autenticación
app.use('/api/auth', applyEndpointConfig('auth'));

// Endpoints de datos médicos
app.use('/api/patients', applyEndpointConfig('medicalData'));
app.use('/api/medical-records', applyEndpointConfig('medicalData'));
app.use('/api/diagnoses', applyEndpointConfig('medicalData'));

// Endpoints de telemedicina
app.use('/api/telemedicine', applyEndpointConfig('telemedicine'));
app.use('/api/video-calls', applyEndpointConfig('telemedicine'));

// Endpoints de marketplace
app.use('/api', marketplaceRoutes);

// Endpoints para el servicio de agentes
app.use('/api/agents', agentsRoutes);

// Endpoints de búsqueda
app.use('/api/search', applyEndpointConfig('search'));

// Endpoints generales
app.use('/api', applyEndpointConfig('general'));

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
