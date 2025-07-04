const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'security',
        diagnostics: 'No access token provided'
      }]
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'forbidden',
          diagnostics: 'Invalid or expired access token'
        }]
      });
    }

    // Check scopes for FHIR resource access
    const scopes = decoded.scope ? decoded.scope.split(' ') : [];
    const method = req.method.toLowerCase();
    const resourceType = req.url.split('/')[1]; // Extract resource type from URL

    if (!hasRequiredScope(scopes, method, resourceType)) {
      return res.status(403).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'forbidden',
          diagnostics: 'Insufficient scope for requested operation'
        }]
      });
    }

    req.user = decoded;
    next();
  });
};

const hasRequiredScope = (scopes, method, resourceType) => {
  // Check for system-level scopes
  if (scopes.includes(`system/${resourceType}.*`) || scopes.includes('system/*.*')) {
    return true;
  }

  // Check for user-level scopes
  if (scopes.includes(`user/${resourceType}.*`) || scopes.includes('user/*.*')) {
    return true;
  }

  // Check for patient-level scopes
  if (scopes.includes(`patient/${resourceType}.*`) || scopes.includes('patient/*.*')) {
    return true;
  }

  // Check method-specific scopes
  const action = getActionFromMethod(method);
  return scopes.includes(`user/${resourceType}.${action}`) ||
         scopes.includes(`patient/${resourceType}.${action}`) ||
         scopes.includes(`system/${resourceType}.${action}`);
};

const getActionFromMethod = (method) => {
  switch (method) {
    case 'get': return 'read';
    case 'post': return 'write';
    case 'put': return 'write';
    case 'patch': return 'write';
    case 'delete': return 'write';
    default: return 'read';
  }
};

module.exports = {
  authenticateToken,
  hasRequiredScope
};
