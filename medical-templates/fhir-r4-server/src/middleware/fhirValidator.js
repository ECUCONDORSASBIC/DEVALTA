const Joi = require('joi');

const validateFHIRRequest = (req, res, next) => {
  // Skip validation for metadata and well-known endpoints
  if (req.path.includes('metadata') || req.path.includes('.well-known')) {
    return next();
  }

  // Validate Accept header
  const acceptHeader = req.get('Accept');
  if (acceptHeader && !acceptHeader.includes('application/fhir+json') && 
      !acceptHeader.includes('application/json') && 
      !acceptHeader.includes('*/*')) {
    return res.status(406).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-supported',
        diagnostics: 'Accept header must include application/fhir+json or application/json'
      }]
    });
  }

  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-supported',
          diagnostics: 'Content-Type must be application/json or application/fhir+json'
        }]
      });
    }
  }

  // Set proper response content type
  res.set('Content-Type', 'application/fhir+json; charset=utf-8');
  
  next();
};

module.exports = {
  validateFHIRRequest
};
