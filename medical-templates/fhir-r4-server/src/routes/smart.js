const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const router = express.Router();

// In-memory storage for demo purposes
// In production, use a proper database
const clients = new Map();
const authCodes = new Map();
const accessTokens = new Map();

// SMART-on-FHIR well-known configuration
router.get('/.well-known/smart_configuration', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    issuer: baseUrl,
    jwks_uri: `${baseUrl}/smart/.well-known/jwks.json`,
    authorization_endpoint: `${baseUrl}/smart/authorize`,
    token_endpoint: `${baseUrl}/smart/token`,
    token_endpoint_auth_methods_supported: [
      'client_secret_basic',
      'client_secret_post',
      'private_key_jwt'
    ],
    token_endpoint_auth_signing_alg_values_supported: [
      'RS256',
      'ES256'
    ],
    scopes_supported: [
      'openid',
      'profile',
      'launch',
      'launch/patient',
      'patient/*.read',
      'patient/*.write',
      'user/*.read',
      'user/*.write',
      'offline_access'
    ],
    response_types_supported: [
      'code',
      'code id_token',
      'id_token',
      'refresh_token'
    ],
    capabilities: [
      'launch-ehr',
      'launch-standalone',
      'client-public',
      'client-confidential-symmetric',
      'context-patient',
      'context-user',
      'sso-openid-connect'
    ],
    code_challenge_methods_supported: [
      'S256'
    ]
  });
});

// JWKS endpoint for token validation
router.get('/.well-known/jwks.json', (req, res) => {
  // In production, use actual public keys
  res.json({
    keys: [
      {
        kty: 'RSA',
        use: 'sig',
        kid: 'altamedica-key-1',
        n: 'example_modulus',
        e: 'AQAB',
        alg: 'RS256'
      }
    ]
  });
});

// Client registration schema
const clientSchema = Joi.object({
  client_name: Joi.string().required(),
  redirect_uris: Joi.array().items(Joi.string().uri()).required(),
  scope: Joi.string().required(),
  launch_uri: Joi.string().uri().optional(),
  client_type: Joi.string().valid('public', 'confidential').default('public')
});

// Register a new client
router.post('/register', (req, res) => {
  const { error, value } = clientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'invalid_client_metadata',
      error_description: error.details[0].message
    });
  }

  const clientId = uuidv4();
  const clientSecret = value.client_type === 'confidential' ? uuidv4() : null;

  const client = {
    client_id: clientId,
    client_secret: clientSecret,
    ...value,
    created_at: new Date().toISOString()
  };

  clients.set(clientId, client);

  res.status(201).json({
    client_id: clientId,
    client_secret: clientSecret,
    client_name: value.client_name,
    redirect_uris: value.redirect_uris,
    scope: value.scope
  });
});

// Authorization endpoint
router.get('/authorize', (req, res) => {
  const {
    client_id,
    redirect_uri,
    response_type,
    scope,
    state,
    aud,
    launch
  } = req.query;

  // Validate client
  const client = clients.get(client_id);
  if (!client) {
    return res.status(400).json({
      error: 'invalid_client',
      error_description: 'Client not found'
    });
  }

  // Validate redirect URI
  if (!client.redirect_uris.includes(redirect_uri)) {
    return res.status(400).json({
      error: 'invalid_redirect_uri',
      error_description: 'Redirect URI not registered'
    });
  }

  // In a real implementation, this would redirect to login page
  // For demo purposes, we'll auto-approve
  const code = uuidv4();
  authCodes.set(code, {
    client_id,
    redirect_uri,
    scope,
    aud,
    launch,
    created_at: Date.now(),
    expires_at: Date.now() + 600000 // 10 minutes
  });

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', code);
  if (state) redirectUrl.searchParams.set('state', state);

  res.redirect(redirectUrl.toString());
});

// Token endpoint
router.post('/token', (req, res) => {
  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret
  } = req.body;

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Only authorization_code grant type is supported'
    });
  }

  // Validate authorization code
  const authCode = authCodes.get(code);
  if (!authCode) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid authorization code'
    });
  }

  // Check if code expired
  if (Date.now() > authCode.expires_at) {
    authCodes.delete(code);
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Authorization code expired'
    });
  }

  // Validate client
  const client = clients.get(client_id);
  if (!client) {
    return res.status(400).json({
      error: 'invalid_client',
      error_description: 'Client not found'
    });
  }

  // Validate client secret for confidential clients
  if (client.client_type === 'confidential' && client.client_secret !== client_secret) {
    return res.status(400).json({
      error: 'invalid_client',
      error_description: 'Invalid client secret'
    });
  }

  // Generate access token
  const accessToken = jwt.sign(
    {
      aud: authCode.aud,
      iss: `${req.protocol}://${req.get('host')}`,
      sub: 'patient-123', // In production, determine from context
      scope: authCode.scope,
      client_id: client_id,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { algorithm: 'HS256' }
  );

  // Store token for validation
  accessTokens.set(accessToken, {
    client_id,
    scope: authCode.scope,
    created_at: Date.now(),
    expires_at: Date.now() + 3600000 // 1 hour
  });

  // Clean up authorization code
  authCodes.delete(code);

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: authCode.scope,
    patient: 'patient-123' // Include patient ID for patient-scoped tokens
  });
});

// Token introspection endpoint
router.post('/introspect', (req, res) => {
  const { token } = req.body;
  
  const tokenData = accessTokens.get(token);
  if (!tokenData) {
    return res.json({ active: false });
  }

  // Check if token expired
  if (Date.now() > tokenData.expires_at) {
    accessTokens.delete(token);
    return res.json({ active: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({
      active: true,
      scope: tokenData.scope,
      client_id: tokenData.client_id,
      sub: decoded.sub,
      exp: decoded.exp,
      iat: decoded.iat
    });
  } catch (error) {
    res.json({ active: false });
  }
});

module.exports = router;
