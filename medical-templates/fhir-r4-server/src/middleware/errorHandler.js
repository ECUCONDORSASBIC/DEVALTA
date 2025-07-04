const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console()
  ]
});

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // FHIR-compliant error response
  const operationOutcome = {
    resourceType: 'OperationOutcome',
    issue: [{
      severity: 'error',
      code: 'exception',
      diagnostics: process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred' 
        : err.message
    }]
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    operationOutcome.issue[0].code = 'invalid';
    operationOutcome.issue[0].diagnostics = err.message;
    return res.status(400).json(operationOutcome);
  }

  if (err.name === 'JsonWebTokenError') {
    operationOutcome.issue[0].code = 'security';
    operationOutcome.issue[0].diagnostics = 'Invalid token';
    return res.status(401).json(operationOutcome);
  }

  if (err.name === 'TokenExpiredError') {
    operationOutcome.issue[0].code = 'security';
    operationOutcome.issue[0].diagnostics = 'Token expired';
    return res.status(401).json(operationOutcome);
  }

  // Default to 500 Internal Server Error
  res.status(500).json(operationOutcome);
};

module.exports = {
  errorHandler
};
