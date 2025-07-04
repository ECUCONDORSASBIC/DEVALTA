const request = require('supertest');
const app = require('../src/server');
const jwt = require('jsonwebtoken');

describe('FHIR R4 Server Compliance Tests', () => {
  let server;
  let accessToken;

  beforeAll(async () => {
    // Generate test access token
    accessToken = jwt.sign(
      {
        aud: 'http://localhost:3000/fhir',
        iss: 'http://localhost:3000',
        sub: 'test-user',
        scope: 'patient/*.read patient/*.write',
        client_id: 'test-client',
        exp: Math.floor(Date.now() / 1000) + 3600
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('FHIR Metadata Compliance', () => {
    test('should return valid CapabilityStatement', async () => {
      const response = await request(app)
        .get('/fhir/metadata')
        .expect(200);

      expect(response.body.resourceType).toBe('CapabilityStatement');
      expect(response.body.fhirVersion).toBe('4.0.1');
      expect(response.body.status).toBe('active');
      expect(response.body.rest).toHaveLength(1);
      expect(response.body.rest[0].mode).toBe('server');
    });

    test('should include SMART-on-FHIR security declaration', async () => {
      const response = await request(app)
        .get('/fhir/metadata')
        .expect(200);

      const security = response.body.rest[0].security;
      expect(security).toBeDefined();
      expect(security.service).toEqual([{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/restful-security-service',
          code: 'SMART-on-FHIR'
        }]
      }]);
    });
  });

  describe('SMART-on-FHIR Compliance', () => {
    test('should provide well-known smart configuration', async () => {
      const response = await request(app)
        .get('/smart/.well-known/smart_configuration')
        .expect(200);

      expect(response.body.authorization_endpoint).toContain('/smart/authorize');
      expect(response.body.token_endpoint).toContain('/smart/token');
      expect(response.body.scopes_supported).toContain('patient/*.read');
      expect(response.body.capabilities).toContain('launch-standalone');
    });

    test('should provide JWKS endpoint', async () => {
      const response = await request(app)
        .get('/smart/.well-known/jwks.json')
        .expect(200);

      expect(response.body.keys).toBeDefined();
      expect(Array.isArray(response.body.keys)).toBe(true);
    });

    test('should support client registration', async () => {
      const clientData = {
        client_name: 'Test Client',
        redirect_uris: ['http://localhost:3001/callback'],
        scope: 'patient/*.read patient/*.write'
      };

      const response = await request(app)
        .post('/smart/register')
        .send(clientData)
        .expect(201);

      expect(response.body.client_id).toBeDefined();
      expect(response.body.client_name).toBe(clientData.client_name);
      expect(response.body.redirect_uris).toEqual(clientData.redirect_uris);
    });
  });

  describe('FHIR Resource Compliance', () => {
    test('should require authentication for FHIR resources', async () => {
      await request(app)
        .get('/fhir/Patient')
        .expect(401);
    });

    test('should return valid FHIR Patient resources', async () => {
      const response = await request(app)
        .get('/fhir/Patient')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.type).toBe('searchset');
      expect(response.body.total).toBeDefined();
      expect(Array.isArray(response.body.entry)).toBe(true);

      if (response.body.entry.length > 0) {
        const patient = response.body.entry[0].resource;
        expect(patient.resourceType).toBe('Patient');
        expect(patient.id).toBeDefined();
        expect(patient.meta).toBeDefined();
        expect(patient.meta.lastUpdated).toBeDefined();
      }
    });

    test('should support Patient search by name', async () => {
      const response = await request(app)
        .get('/fhir/Patient?name=Doe')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.type).toBe('searchset');
    });

    test('should return valid FHIR Observation resources', async () => {
      const response = await request(app)
        .get('/fhir/Observation')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.type).toBe('searchset');

      if (response.body.entry.length > 0) {
        const observation = response.body.entry[0].resource;
        expect(observation.resourceType).toBe('Observation');
        expect(observation.id).toBeDefined();
        expect(observation.status).toBeDefined();
        expect(observation.code).toBeDefined();
        expect(observation.subject).toBeDefined();
      }
    });

    test('should create valid Patient resource', async () => {
      const patientData = {
        resourceType: 'Patient',
        name: [{
          use: 'official',
          family: 'Test',
          given: ['Compliance']
        }],
        gender: 'unknown',
        birthDate: '2000-01-01'
      };

      const response = await request(app)
        .post('/fhir/Patient')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(patientData)
        .expect(201);

      expect(response.body.resourceType).toBe('Patient');
      expect(response.body.id).toBeDefined();
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.versionId).toBe('1');
      expect(response.body.name[0].family).toBe('Test');
    });
  });

  describe('Security Compliance', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    test('should enforce rate limiting', async () => {
      const promises = [];
      
      // Make multiple requests quickly to trigger rate limit
      for (let i = 0; i < 105; i++) {
        promises.push(
          request(app)
            .get('/fhir/metadata')
            .set('Authorization', `Bearer ${accessToken}`)
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });

    test('should validate JWT token expiration', async () => {
      const expiredToken = jwt.sign(
        {
          aud: 'http://localhost:3000/fhir',
          iss: 'http://localhost:3000',
          sub: 'test-user',
          scope: 'patient/*.read',
          client_id: 'test-client',
          exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
        },
        process.env.JWT_SECRET || 'your-secret-key'
      );

      await request(app)
        .get('/fhir/Patient')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);
    });
  });

  describe('FHIR Validation Compliance', () => {
    test('should reject invalid Patient resource', async () => {
      const invalidPatient = {
        resourceType: 'Patient',
        // Missing required name field
        gender: 'invalid-gender'
      };

      const response = await request(app)
        .post('/fhir/Patient')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidPatient)
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].severity).toBe('error');
      expect(response.body.issue[0].code).toBe('invalid');
    });

    test('should return proper OperationOutcome for not found resources', async () => {
      const response = await request(app)
        .get('/fhir/Patient/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].severity).toBe('error');
      expect(response.body.issue[0].code).toBe('not-found');
    });
  });

  describe('Health Check Compliance', () => {
    test('should provide health status endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.fhirVersion).toBe('R4');
      expect(response.body.smartOnFhir).toBe('enabled');
    });
  });
});
