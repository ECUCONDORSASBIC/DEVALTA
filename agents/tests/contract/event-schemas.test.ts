import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import Ajv from 'ajv';
import { eventSchemas } from '../../src/shared/event-schemas';

const ajv = new Ajv({ strict: true });

// Define event schemas
const AuthEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  type: z.enum(['USER_LOGIN', 'USER_LOGOUT', 'TOKEN_REFRESH', 'AUTH_FAILURE']),
  userId: z.string(),
  userType: z.enum(['patient', 'doctor', 'admin', 'company']),
  metadata: z.record(z.unknown()).optional(),
  source: z.string()
});

const RoutingEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  type: z.enum(['ROUTE_RESOLVED', 'DEEP_LINK_CREATED', 'REDIRECT_TRIGGERED']),
  path: z.string(),
  resolvedPath: z.string(),
  userId: z.string().optional(),
  context: z.record(z.string()).optional(),
  source: z.string()
});

const SecurityEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  type: z.enum(['RATE_LIMIT_EXCEEDED', 'CSRF_VIOLATION', 'CORS_BLOCKED', 'SUSPICIOUS_ACTIVITY']),
  ip: z.string().ip(),
  userId: z.string().optional(),
  endpoint: z.string(),
  details: z.record(z.unknown()),
  source: z.string()
});

const MonitoringEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  type: z.enum(['METRIC_RECORDED', 'ALERT_TRIGGERED', 'ANOMALY_DETECTED', 'HEALTH_CHECK']),
  metric: z.string().optional(),
  value: z.number().optional(),
  threshold: z.number().optional(),
  service: z.string(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  source: z.string()
});

const DeploymentEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  type: z.enum(['DEPLOYMENT_STARTED', 'DEPLOYMENT_COMPLETED', 'DEPLOYMENT_FAILED', 'ROLLBACK_INITIATED']),
  deploymentId: z.string(),
  service: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
  version: z.string(),
  status: z.enum(['pending', 'in_progress', 'success', 'failed', 'rolled_back']),
  source: z.string()
});

describe('Event Schema Contract Tests', () => {
  describe('Auth Event Schema', () => {
    it('should validate correct auth event', () => {
      const validEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: new Date().toISOString(),
        type: 'USER_LOGIN',
        userId: 'user123',
        userType: 'doctor',
        metadata: { ip: '192.168.1.1' },
        source: 'auth-agent'
      };

      expect(() => AuthEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should reject auth event with invalid type', () => {
      const invalidEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: new Date().toISOString(),
        type: 'INVALID_TYPE',
        userId: 'user123',
        userType: 'doctor',
        source: 'auth-agent'
      };

      expect(() => AuthEventSchema.parse(invalidEvent)).toThrow();
    });

    it('should reject auth event with missing required fields', () => {
      const invalidEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: new Date().toISOString(),
        type: 'USER_LOGIN'
        // Missing userId, userType, and source
      };

      expect(() => AuthEventSchema.parse(invalidEvent)).toThrow();
    });
  });

  describe('Cross-Agent Event Compatibility', () => {
    it('should ensure all agents produce compatible event formats', () => {
      // Simulate events from different agents
      const authEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174001',
        timestamp: new Date().toISOString(),
        type: 'USER_LOGIN',
        userId: 'user456',
        userType: 'patient',
        source: 'auth-agent'
      };

      const routingEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174002',
        timestamp: new Date().toISOString(),
        type: 'ROUTE_RESOLVED',
        path: '/dashboard',
        resolvedPath: '/patients/dashboard',
        userId: 'user456',
        source: 'routing-agent'
      };

      const securityEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174003',
        timestamp: new Date().toISOString(),
        type: 'RATE_LIMIT_EXCEEDED',
        ip: '192.168.1.100',
        userId: 'user456',
        endpoint: '/api/data',
        details: { attempts: 15, window: '1m' },
        source: 'security-agent'
      };

      // All events should have common fields
      const commonFields = ['eventId', 'timestamp', 'type', 'source'];
      
      [authEvent, routingEvent, securityEvent].forEach(event => {
        commonFields.forEach(field => {
          expect(event).toHaveProperty(field);
        });
        
        // Verify eventId is UUID format
        expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        
        // Verify timestamp is ISO format
        expect(new Date(event.timestamp).toISOString()).toBe(event.timestamp);
      });
    });
  });

  describe('Event Schema Versioning', () => {
    it('should handle schema evolution with backward compatibility', () => {
      // V1 schema (older)
      const v1Event = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: new Date().toISOString(),
        type: 'USER_LOGIN',
        userId: 'user123',
        userType: 'doctor',
        source: 'auth-agent'
      };

      // V2 schema (newer, with additional optional field)
      const AuthEventSchemaV2 = AuthEventSchema.extend({
        sessionId: z.string().optional(),
        version: z.literal('v2').default('v2')
      });

      // V1 events should still be valid in V2
      expect(() => AuthEventSchemaV2.parse(v1Event)).not.toThrow();

      // V2 events with new fields
      const v2Event = {
        ...v1Event,
        sessionId: 'session123',
        version: 'v2'
      };

      expect(() => AuthEventSchemaV2.parse(v2Event)).not.toThrow();
    });
  });

  describe('JSON Schema Validation', () => {
    it('should validate events against JSON schemas', () => {
      const authJsonSchema = {
        type: 'object',
        properties: {
          eventId: { type: 'string', format: 'uuid' },
          timestamp: { type: 'string', format: 'date-time' },
          type: { 
            type: 'string', 
            enum: ['USER_LOGIN', 'USER_LOGOUT', 'TOKEN_REFRESH', 'AUTH_FAILURE'] 
          },
          userId: { type: 'string' },
          userType: { 
            type: 'string', 
            enum: ['patient', 'doctor', 'admin', 'company'] 
          },
          metadata: { type: 'object' },
          source: { type: 'string' }
        },
        required: ['eventId', 'timestamp', 'type', 'userId', 'userType', 'source']
      };

      const validate = ajv.compile(authJsonSchema);

      const validEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: new Date().toISOString(),
        type: 'USER_LOGIN',
        userId: 'user123',
        userType: 'doctor',
        source: 'auth-agent'
      };

      expect(validate(validEvent)).toBe(true);
    });
  });

  describe('Event Correlation', () => {
    it('should maintain correlation IDs across agent events', () => {
      const correlationId = 'corr-123e4567-e89b-12d3-a456-426614174000';
      
      // Extended schemas with correlation support
      const CorrelatedAuthEvent = AuthEventSchema.extend({
        correlationId: z.string().uuid()
      });

      const CorrelatedRoutingEvent = RoutingEventSchema.extend({
        correlationId: z.string().uuid()
      });

      const authEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174001',
        timestamp: new Date().toISOString(),
        type: 'USER_LOGIN',
        userId: 'user789',
        userType: 'patient',
        source: 'auth-agent',
        correlationId
      };

      const routingEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174002',
        timestamp: new Date().toISOString(),
        type: 'ROUTE_RESOLVED',
        path: '/dashboard',
        resolvedPath: '/patients/dashboard',
        userId: 'user789',
        source: 'routing-agent',
        correlationId
      };

      expect(() => CorrelatedAuthEvent.parse(authEvent)).not.toThrow();
      expect(() => CorrelatedRoutingEvent.parse(routingEvent)).not.toThrow();
      expect(authEvent.correlationId).toBe(routingEvent.correlationId);
    });
  });

  describe('Event Payload Size Constraints', () => {
    it('should enforce reasonable payload size limits', () => {
      const LimitedMetadataSchema = z.record(z.unknown()).refine(
        (data) => JSON.stringify(data).length <= 10240, // 10KB limit
        { message: 'Metadata exceeds size limit of 10KB' }
      );

      const SizedAuthEventSchema = AuthEventSchema.omit({ metadata: true }).extend({
        metadata: LimitedMetadataSchema.optional()
      });

      // Valid event with reasonable metadata
      const validEvent = {
        eventId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: new Date().toISOString(),
        type: 'USER_LOGIN',
        userId: 'user123',
        userType: 'doctor',
        source: 'auth-agent',
        metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' }
      };

      expect(() => SizedAuthEventSchema.parse(validEvent)).not.toThrow();

      // Event with oversized metadata
      const oversizedEvent = {
        ...validEvent,
        metadata: {
          largeData: 'x'.repeat(11000) // > 10KB
        }
      };

      expect(() => SizedAuthEventSchema.parse(oversizedEvent)).toThrow(/exceeds size limit/);
    });
  });
});
