import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AuthAgent } from '../../src/auth';
import { RoutingAgent } from '../../src/routing';
import { SecurityAgent } from '../../src/security';
import { MonitoringAgent } from '../../src/monitoring';
import { DevOpsAgent } from '../../src/devops';
import axios from 'axios';

describe('Agent Communication Integration Tests', () => {
  let authAgent: AuthAgent;
  let routingAgent: RoutingAgent;
  let securityAgent: SecurityAgent;
  let monitoringAgent: MonitoringAgent;
  let devOpsAgent: DevOpsAgent;

  beforeAll(async () => {
    // Start all agents
    authAgent = new AuthAgent({ port: 3001 });
    routingAgent = new RoutingAgent({ port: 3002 });
    securityAgent = new SecurityAgent({ port: 3006 });
    monitoringAgent = new MonitoringAgent({ port: 3007 });
    devOpsAgent = new DevOpsAgent({ port: 3008 });

    await Promise.all([
      authAgent.start(),
      routingAgent.start(),
      securityAgent.start(),
      monitoringAgent.start(),
      devOpsAgent.start()
    ]);

    // Wait for agents to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await Promise.all([
      authAgent.stop(),
      routingAgent.stop(),
      securityAgent.stop(),
      monitoringAgent.stop(),
      devOpsAgent.stop()
    ]);
  });

  describe('Auth and Routing Integration', () => {
    it('should authenticate user and get appropriate dashboard route', async () => {
      // Login through AuthAgent
      const loginResponse = await axios.post('http://localhost:3001/auth/login', {
        username: 'doctor@hospital.com',
        password: 'secure123',
        userType: 'doctor'
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('token');
      expect(loginResponse.data).toHaveProperty('refreshToken');

      const { token } = loginResponse.data;

      // Get dashboard route from RoutingAgent
      const routingResponse = await axios.post('http://localhost:3002/routing/dashboard', {
        userType: 'doctor',
        context: 'main'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(routingResponse.status).toBe(200);
      expect(routingResponse.data).toHaveProperty('url');
      expect(routingResponse.data.url).toContain('/doctors');
    });
  });

  describe('Security and Monitoring Integration', () => {
    it('should apply rate limiting and log attempts', async () => {
      const endpoint = 'http://localhost:3001/auth/verify';
      const requests = [];

      // Make multiple rapid requests
      for (let i = 0; i < 15; i++) {
        requests.push(
          axios.post(endpoint, { token: 'test-token' })
            .catch(err => ({ status: err.response?.status }))
        );
      }

      const responses = await Promise.all(requests);
      
      // Check that rate limiting kicked in
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Check monitoring logged the rate limit events
      const logsResponse = await axios.get('http://localhost:3007/monitoring/logs', {
        params: {
          event: 'RATE_LIMIT_EXCEEDED',
          last: '1m'
        }
      });

      expect(logsResponse.data.logs).toHaveLength(rateLimitedResponses.length);
    });
  });

  describe('DevOps and Monitoring Integration', () => {
    it('should trigger deployment and monitor health', async () => {
      // Trigger a deployment through DevOpsAgent
      const deployResponse = await axios.post('http://localhost:3008/devops/deploy', {
        service: 'auth-agent',
        version: '1.2.3',
        environment: 'staging'
      });

      expect(deployResponse.status).toBe(202);
      expect(deployResponse.data).toHaveProperty('deploymentId');

      const { deploymentId } = deployResponse.data;

      // Wait for deployment to process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check deployment status
      const statusResponse = await axios.get(`http://localhost:3008/devops/deployments/${deploymentId}`);
      expect(statusResponse.data).toHaveProperty('status');

      // Verify monitoring captured deployment metrics
      const metricsResponse = await axios.get('http://localhost:3007/monitoring/metrics', {
        params: {
          metric: 'deployment_status',
          deploymentId
        }
      });

      expect(metricsResponse.data.metrics).toHaveLength(1);
      expect(metricsResponse.data.metrics[0]).toHaveProperty('value');
    });
  });

  describe('End-to-End Agent Workflow', () => {
    it('should handle complete user authentication flow with security checks', async () => {
      // 1. Security agent checks allowed origins
      const corsCheckResponse = await axios.post('http://localhost:3006/security/cors/check', {
        origin: 'https://altamedica.com',
        method: 'POST'
      });

      expect(corsCheckResponse.data.allowed).toBe(true);

      // 2. Authenticate user
      const authResponse = await axios.post('http://localhost:3001/auth/login', {
        username: 'patient@email.com',
        password: 'password123',
        userType: 'patient'
      });

      const { token, userId } = authResponse.data;

      // 3. Get user-specific routing
      const routeResponse = await axios.post('http://localhost:3002/routing/resolve', {
        path: '/dashboard',
        userType: 'patient',
        userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      expect(routeResponse.data.resolvedPath).toBe('/patients/dashboard');

      // 4. Verify monitoring captured all events
      const eventsResponse = await axios.get('http://localhost:3007/monitoring/events', {
        params: {
          userId,
          last: '5m'
        }
      });

      const events = eventsResponse.data.events;
      expect(events).toContainEqual(expect.objectContaining({ type: 'AUTH_SUCCESS' }));
      expect(events).toContainEqual(expect.objectContaining({ type: 'ROUTE_RESOLVED' }));
    });
  });

  describe('WebSocket Real-time Communication', () => {
    it('should propagate auth events across agents in real-time', async () => {
      const WebSocket = require('ws');
      const authWs = new WebSocket('ws://localhost:3001/ws');
      const monitoringWs = new WebSocket('ws://localhost:3007/ws');

      const authEvents: any[] = [];
      const monitoringEvents: any[] = [];

      authWs.on('message', (data: string) => {
        authEvents.push(JSON.parse(data));
      });

      monitoringWs.on('message', (data: string) => {
        monitoringEvents.push(JSON.parse(data));
      });

      // Wait for connections to establish
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Trigger a login that should broadcast events
      await axios.post('http://localhost:3001/auth/login', {
        username: 'admin@altamedica.com',
        password: 'admin123',
        userType: 'admin'
      });

      // Wait for events to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify auth websocket received login event
      expect(authEvents).toContainEqual(expect.objectContaining({
        type: 'USER_LOGIN',
        userType: 'admin'
      }));

      // Verify monitoring websocket received the event
      expect(monitoringEvents).toContainEqual(expect.objectContaining({
        type: 'AUTH_EVENT',
        event: 'USER_LOGIN'
      }));

      authWs.close();
      monitoringWs.close();
    });
  });
});
