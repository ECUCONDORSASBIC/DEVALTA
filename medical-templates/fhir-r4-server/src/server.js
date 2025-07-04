const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const fhirRoutes = require('./routes/fhir');
const authRoutes = require('./routes/auth');
const smartRoutes = require('./routes/smart');
const { errorHandler } = require('./middleware/errorHandler');
const { validateFHIRRequest } = require('./middleware/fhirValidator');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration for healthcare environments
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/fhir', limiter);

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    fhirVersion: 'R4',
    smartOnFhir: 'enabled'
  });
});

// FHIR metadata endpoint
app.get('/fhir/metadata', (req, res) => {
  res.json({
    resourceType: 'CapabilityStatement',
    id: 'altamedica-fhir-server',
    status: 'active',
    date: new Date().toISOString(),
    publisher: 'AltaMedica',
    kind: 'instance',
    software: {
      name: 'AltaMedica FHIR R4 Server',
      version: '1.0.0'
    },
    implementation: {
      description: 'FHIR R4 Server with SMART-on-FHIR authentication',
      url: process.env.SERVER_URL || 'http://localhost:3000'
    },
    fhirVersion: '4.0.1',
    format: ['json', 'xml'],
    rest: [{
      mode: 'server',
      documentation: 'FHIR R4 server with SMART-on-FHIR authentication support',
      security: {
        service: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/restful-security-service',
            code: 'SMART-on-FHIR'
          }]
        }],
        description: 'SMART-on-FHIR authentication with OAuth 2.0'
      },
      resource: [
        {
          type: 'Patient',
          profile: 'http://hl7.org/fhir/StructureDefinition/Patient',
          interaction: [
            { code: 'read' },
            { code: 'search-type' },
            { code: 'create' },
            { code: 'update' }
          ],
          searchParam: [
            { name: 'identifier', type: 'token' },
            { name: 'name', type: 'string' },
            { name: 'birthdate', type: 'date' }
          ]
        },
        {
          type: 'Observation',
          profile: 'http://hl7.org/fhir/StructureDefinition/Observation',
          interaction: [
            { code: 'read' },
            { code: 'search-type' },
            { code: 'create' }
          ],
          searchParam: [
            { name: 'patient', type: 'reference' },
            { name: 'code', type: 'token' },
            { name: 'date', type: 'date' }
          ]
        }
      ]
    }]
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/smart', smartRoutes);
app.use('/fhir', validateFHIRRequest, fhirRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  logger.info(`FHIR R4 Server running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`FHIR metadata available at http://localhost:${PORT}/fhir/metadata`);
});

module.exports = app;
