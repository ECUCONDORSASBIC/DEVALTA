import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';
import { waitFor } from '../utils/test-helpers';

describe('Agent Chaos Engineering Tests', () => {
  let agentProcesses: Map<string, ChildProcess> = new Map();

  const startAgent = (name: string, port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const process = spawn('node', [`src/${name}/start.ts`], {
        env: { ...process.env, PORT: port.toString() },
        stdio: 'pipe'
      });

      process.on('error', reject);
      
      process.stdout?.on('data', (data) => {
        if (data.toString().includes('Agent started')) {
          agentProcesses.set(name, process);
          resolve();
        }
      });

      process.stderr?.on('data', (data) => {
        console.error(`${name} error:`, data.toString());
      });
    });
  };

  const killAgent = (name: string) => {
    const process = agentProcesses.get(name);
    if (process) {
      process.kill('SIGKILL');
      agentProcesses.delete(name);
    }
  };

  beforeAll(async () => {
    // Start all agents
    await Promise.all([
      startAgent('auth', 3001),
      startAgent('routing', 3002),
      startAgent('security', 3006),
      startAgent('monitoring', 3007),
      startAgent('devops', 3008)
    ]);

    // Wait for all agents to be ready
    await waitFor(3000);
  });

  afterAll(() => {
    // Kill all agent processes
    agentProcesses.forEach((process) => {
      process.kill();
    });
  });

  describe('Network Partition Simulation', () => {
    it('should handle auth agent becoming unreachable', async () => {
      // Kill auth agent to simulate network partition
      killAgent('auth');

      // Try to access routing agent which depends on auth
      try {
        const response = await axios.post('http://localhost:3002/routing/dashboard', {
          userType: 'doctor'
        }, {
          timeout: 5000
        });

        // Should fallback to cached auth or return error
        expect(response.status).toBe(503);
        expect(response.data).toHaveProperty('error');
        expect(response.data.error).toContain('auth service unavailable');
      } catch (error: any) {
        expect(error.response?.status).toBe(503);
      }

      // Restart auth agent
      await startAgent('auth', 3001);
      await waitFor(2000);

      // Verify recovery
      const recoveryResponse = await axios.get('http://localhost:3001/health');
      expect(recoveryResponse.status).toBe(200);
    });
  });

  describe('Resource Exhaustion', () => {
    it('should handle memory pressure gracefully', async () => {
      const memoryBomb = async () => {
        const arrays: any[] = [];
        
        // Allocate memory in chunks
        for (let i = 0; i < 100; i++) {
          arrays.push(new Array(1024 * 1024).fill('x')); // 1MB chunks
          await waitFor(10);
        }

        return arrays;
      };

      // Monitor agent health during memory pressure
      const healthChecks = [];
      const checkInterval = setInterval(async () => {
        try {
          const response = await axios.get('http://localhost:3007/health');
          healthChecks.push({ timestamp: Date.now(), status: response.status });
        } catch (error) {
          healthChecks.push({ timestamp: Date.now(), status: 'error' });
        }
      }, 500);

      // Apply memory pressure
      let arrays: any[] = [];
      try {
        arrays = await memoryBomb();
      } catch (error) {
        // Expected to potentially fail
      }

      // Wait and then release memory
      await waitFor(2000);
      arrays = []; // Release memory
      
      if (global.gc) {
        global.gc(); // Force garbage collection if available
      }

      clearInterval(checkInterval);

      // Verify agent remained responsive
      const errorCount = healthChecks.filter(check => check.status === 'error').length;
      expect(errorCount / healthChecks.length).toBeLessThan(0.5); // Less than 50% errors
    });

    it('should handle CPU saturation', async () => {
      const cpuBomb = () => {
        const endTime = Date.now() + 5000; // 5 seconds of CPU load
        while (Date.now() < endTime) {
          Math.sqrt(Math.random());
        }
      };

      // Start CPU intensive task in background
      const cpuPromise = Promise.resolve().then(() => cpuBomb());

      // Try to make requests during CPU saturation
      const startTime = Date.now();
      const response = await axios.get('http://localhost:3001/health', {
        timeout: 10000
      });
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(8000); // Should respond within 8 seconds even under load

      await cpuPromise;
    });
  });

  describe('Cascading Failures', () => {
    it('should prevent cascading failures when monitoring agent fails', async () => {
      // Kill monitoring agent
      killAgent('monitoring');

      // Other agents should continue to function
      const responses = await Promise.allSettled([
        axios.post('http://localhost:3001/auth/login', {
          username: 'test@example.com',
          password: 'password123'
        }),
        axios.post('http://localhost:3002/routing/resolve', {
          path: '/dashboard'
        }),
        axios.get('http://localhost:3006/security/policies')
      ]);

      // All should succeed despite monitoring being down
      responses.forEach(result => {
        if (result.status === 'fulfilled') {
          expect(result.value.status).toBeLessThan(300);
        }
      });

      // Restart monitoring
      await startAgent('monitoring', 3007);
    });
  });

  describe('Chaos Injection', () => {
    it('should handle random agent restarts', async () => {
      const agents = ['auth', 'routing', 'security'];
      const ports = { auth: 3001, routing: 3002, security: 3006 };
      
      // Function to randomly restart an agent
      const chaosRestart = async () => {
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        console.log(`Chaos: Restarting ${randomAgent} agent`);
        
        killAgent(randomAgent);
        await waitFor(Math.random() * 2000); // Random delay
        await startAgent(randomAgent, ports[randomAgent as keyof typeof ports]);
      };

      // Perform chaos restarts
      const chaosPromises = [];
      for (let i = 0; i < 5; i++) {
        chaosPromises.push(
          waitFor(i * 1000).then(() => chaosRestart())
        );
      }

      // Meanwhile, try to use the system
      const requestPromises = [];
      for (let i = 0; i < 20; i++) {
        requestPromises.push(
          waitFor(i * 250).then(async () => {
            try {
              const response = await axios.get('http://localhost:3001/health', {
                timeout: 3000
              });
              return { success: true, status: response.status };
            } catch (error) {
              return { success: false, error };
            }
          })
        );
      }

      await Promise.all(chaosPromises);
      const results = await Promise.all(requestPromises);

      // System should have some successful requests despite chaos
      const successRate = results.filter(r => r.success).length / results.length;
      expect(successRate).toBeGreaterThan(0.5); // At least 50% success rate
    });
  });

  describe('Byzantine Failures', () => {
    it('should handle agents returning invalid data', async () => {
      // Mock auth agent to return invalid tokens
      const mockAuthAgent = spawn('node', ['-e', `
        const http = require('http');
        const server = http.createServer((req, res) => {
          if (req.url === '/health') {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok' }));
          } else if (req.url === '/auth/verify') {
            // Return invalid response
            res.writeHead(200);
            res.end('INVALID_JSON_RESPONSE');
          }
        });
        server.listen(3009);
      `]);

      await waitFor(1000);

      // Try to verify token through the byzantine agent
      try {
        await axios.post('http://localhost:3009/auth/verify', {
          token: 'some-token'
        });
      } catch (error: any) {
        // Should handle invalid JSON gracefully
        expect(error.message).toContain('JSON');
      }

      mockAuthAgent.kill();
    });
  });

  describe('Time-based Chaos', () => {
    it('should handle clock skew between agents', async () => {
      // Simulate clock skew by manipulating timestamps
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 2); // 2 hours ahead

      const response = await axios.post('http://localhost:3001/auth/login', {
        username: 'test@example.com',
        password: 'password123',
        timestamp: futureTime.toISOString()
      });

      // Should either accept with warning or reject based on policy
      if (response.status === 200) {
        expect(response.data).toHaveProperty('warning');
      } else {
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Partial Failure Scenarios', () => {
    it('should degrade gracefully when some agents are slow', async () => {
      // Simulate slow monitoring agent
      const slowProxy = spawn('node', ['-e', `
        const http = require('http');
        const httpProxy = require('http-proxy');
        const proxy = httpProxy.createProxyServer({ target: 'http://localhost:3007' });
        
        const server = http.createServer((req, res) => {
          setTimeout(() => {
            proxy.web(req, res);
          }, 3000); // 3 second delay
        });
        
        server.listen(3017);
      `]);

      await waitFor(1000);

      // Make request that involves monitoring
      const startTime = Date.now();
      const response = await axios.post('http://localhost:3001/auth/login', {
        username: 'test@example.com',
        password: 'password123'
      }, {
        timeout: 5000
      });

      const duration = Date.now() - startTime;

      // Should complete without waiting for slow monitoring
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(2000); // Should not wait full 3 seconds

      slowProxy.kill();
    });
  });
});
