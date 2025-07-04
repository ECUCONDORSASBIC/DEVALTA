import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface LoadTestResult {
  tester: string;
  timestamp: string;
  passed: boolean;
  metrics: {
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  thresholds: {
    maxErrorRate: number;
    maxP95ResponseTime: number;
    minRequestsPerSecond: number;
  };
  duration: number;
  testDuration: number;
}

export interface LoadTestConfig {
  baseUrl: string;
  virtualUsers: number;
  duration: string;
  thresholds: {
    maxErrorRate: number;
    maxP95ResponseTime: number;
    minRequestsPerSecond: number;
  };
}

export class LoadTester {
  private readonly projectPath: string;
  private readonly outputDir: string;
  private readonly defaultConfig: LoadTestConfig;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
    this.outputDir = path.join(projectPath, '.load-test-reports');
    this.defaultConfig = {
      baseUrl: process.env.LOAD_TEST_BASE_URL || 'http://localhost:3000',
      virtualUsers: 10,
      duration: '30s',
      thresholds: {
        maxErrorRate: 5, // 5% max error rate
        maxP95ResponseTime: 2000, // 2 seconds max P95 response time
        minRequestsPerSecond: 5 // minimum 5 requests per second
      }
    };
  }

  async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to create output directory:', error);
    }
  }

  /**
   * Create k6 test script
   */
  private async createK6TestScript(config: LoadTestConfig): Promise<string> {
    const scriptPath = path.join(this.outputDir, 'k6-test.js');
    
    const script = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTrend = new Trend('response_time');
const successfulRequests = new Counter('successful_requests');

export const options = {
  vus: ${config.virtualUsers},
  duration: '${config.duration}',
  thresholds: {
    'error_rate': ['rate < ${config.thresholds.maxErrorRate / 100}'],
    'http_req_duration': ['p(95) < ${config.thresholds.maxP95ResponseTime}'],
    'http_reqs': ['rate > ${config.thresholds.minRequestsPerSecond}'],
  },
};

export default function () {
  // Test health endpoint
  const healthResponse = http.get('${config.baseUrl}/api/health');
  const healthCheck = check(healthResponse, {
    'health endpoint status is 200': (r) => r.status === 200,
    'health response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!healthCheck);
  responseTrend.add(healthResponse.timings.duration);
  if (healthCheck) successfulRequests.add(1);

  sleep(1);

  // Test metrics endpoint
  const metricsResponse = http.get('${config.baseUrl}/api/v1/metrics?format=json');
  const metricsCheck = check(metricsResponse, {
    'metrics endpoint status is 200': (r) => r.status === 200,
    'metrics response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(!metricsCheck);
  responseTrend.add(metricsResponse.timings.duration);
  if (metricsCheck) successfulRequests.add(1);

  sleep(1);

  // Test authenticated endpoints (with mock auth)
  const params = {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token-for-load-testing'
    },
  };

  const authResponse = http.get('${config.baseUrl}/api/v1/auth/me', params);
  const authCheck = check(authResponse, {
    'auth response time < 1500ms': (r) => r.timings.duration < 1500,
  });
  
  responseTrend.add(authResponse.timings.duration);
  // Don't count auth failures as errors since it's expected without real auth

  sleep(2);
}

export function handleSummary(data) {
  return {
    '${path.join(this.outputDir, 'k6-summary.json')}': JSON.stringify(data, null, 2),
  };
}
`;

    await fs.writeFile(scriptPath, script);
    return scriptPath;
  }

  /**
   * Create Artillery test config
   */
  private async createArtilleryTestConfig(config: LoadTestConfig): Promise<string> {
    const configPath = path.join(this.outputDir, 'artillery-config.yml');
    
    const artilleryConfig = `
config:
  target: '${config.baseUrl}'
  phases:
    - duration: ${parseInt(config.duration)}
      arrivalRate: ${Math.ceil(config.virtualUsers / 10)}
      name: "Load test phase"
  payload:
    path: "./payload.csv"
    fields:
      - "endpoint"

scenarios:
  - name: "Health Check Test"
    weight: 30
    flow:
      - get:
          url: "/api/health"
          expect:
            - statusCode: 200
            - hasProperty: "status"
  
  - name: "Metrics API Test"
    weight: 40
    flow:
      - get:
          url: "/api/v1/metrics?format=json"
          expect:
            - statusCode: 200
            - contentType: "json"
  
  - name: "Mixed API Test"
    weight: 30
    flow:
      - get:
          url: "/api/v1/doctors"
          headers:
            Authorization: "Bearer mock-token"
      - think: 2
      - get:
          url: "/api/v1/patients"
          headers:
            Authorization: "Bearer mock-token"
      - think: 1
`;

    await fs.writeFile(configPath, artilleryConfig);

    // Create payload file
    const payloadPath = path.join(this.outputDir, 'payload.csv');
    const payloadData = `endpoint
/api/health
/api/v1/metrics
/api/v1/doctors
/api/v1/patients`;
    
    await fs.writeFile(payloadPath, payloadData);

    return configPath;
  }

  /**
   * Run k6 load test
   */
  async runK6LoadTest(config: LoadTestConfig = this.defaultConfig): Promise<LoadTestResult> {
    const startTime = Date.now();

    try {
      await this.ensureOutputDir();
      const scriptPath = await this.createK6TestScript(config);
      const outputFile = path.join(this.outputDir, 'k6-results.json');

      const command = `k6 run --out json="${outputFile}" "${scriptPath}"`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath,
        timeout: 120000, // 2 minutes timeout
      });

      // Parse k6 results
      const resultsFile = await fs.readFile(outputFile, 'utf-8');
      const summaryFile = await fs.readFile(path.join(this.outputDir, 'k6-summary.json'), 'utf-8');
      const summary = JSON.parse(summaryFile);

      const metrics = {
        totalRequests: summary.metrics?.http_reqs?.count || 0,
        failedRequests: summary.metrics?.http_req_failed?.count || 0,
        averageResponseTime: summary.metrics?.http_req_duration?.avg || 0,
        p95ResponseTime: summary.metrics?.http_req_duration?.['p(95)'] || 0,
        p99ResponseTime: summary.metrics?.http_req_duration?.['p(99)'] || 0,
        requestsPerSecond: summary.metrics?.http_reqs?.rate || 0,
        errorRate: (summary.metrics?.error_rate?.rate || 0) * 100
      };

      const passed = 
        metrics.errorRate <= config.thresholds.maxErrorRate &&
        metrics.p95ResponseTime <= config.thresholds.maxP95ResponseTime &&
        metrics.requestsPerSecond >= config.thresholds.minRequestsPerSecond;

      return {
        tester: 'k6',
        timestamp: new Date().toISOString(),
        passed,
        metrics,
        thresholds: config.thresholds,
        duration: Date.now() - startTime,
        testDuration: parseInt(config.duration) * 1000
      };

    } catch (error) {
      console.error('k6 load test failed:', error);
      
      return {
        tester: 'k6',
        timestamp: new Date().toISOString(),
        passed: false,
        metrics: {
          totalRequests: 0,
          failedRequests: 1,
          averageResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        },
        thresholds: config.thresholds,
        duration: Date.now() - startTime,
        testDuration: 0
      };
    }
  }

  /**
   * Run Artillery load test
   */
  async runArtilleryLoadTest(config: LoadTestConfig = this.defaultConfig): Promise<LoadTestResult> {
    const startTime = Date.now();

    try {
      await this.ensureOutputDir();
      const configPath = await this.createArtilleryTestConfig(config);
      const outputFile = path.join(this.outputDir, 'artillery-report.json');

      const command = `artillery run --output "${outputFile}" "${configPath}"`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath,
        timeout: 120000, // 2 minutes timeout
      });

      // Parse Artillery results
      const reportContent = await fs.readFile(outputFile, 'utf-8');
      const report = JSON.parse(reportContent);

      const aggregate = report.aggregate;
      const metrics = {
        totalRequests: aggregate.requestsCompleted || 0,
        failedRequests: aggregate.errors || 0,
        averageResponseTime: aggregate.latency?.mean || 0,
        p95ResponseTime: aggregate.latency?.p95 || 0,
        p99ResponseTime: aggregate.latency?.p99 || 0,
        requestsPerSecond: aggregate.rps?.mean || 0,
        errorRate: aggregate.errors && aggregate.requestsCompleted 
          ? (aggregate.errors / aggregate.requestsCompleted) * 100 
          : 0
      };

      const passed = 
        metrics.errorRate <= config.thresholds.maxErrorRate &&
        metrics.p95ResponseTime <= config.thresholds.maxP95ResponseTime &&
        metrics.requestsPerSecond >= config.thresholds.minRequestsPerSecond;

      return {
        tester: 'Artillery',
        timestamp: new Date().toISOString(),
        passed,
        metrics,
        thresholds: config.thresholds,
        duration: Date.now() - startTime,
        testDuration: parseInt(config.duration) * 1000
      };

    } catch (error) {
      console.error('Artillery load test failed:', error);
      
      return {
        tester: 'Artillery',
        timestamp: new Date().toISOString(),
        passed: false,
        metrics: {
          totalRequests: 0,
          failedRequests: 1,
          averageResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
          requestsPerSecond: 0,
          errorRate: 100
        },
        thresholds: config.thresholds,
        duration: Date.now() - startTime,
        testDuration: 0
      };
    }
  }

  /**
   * Run comprehensive load tests
   */
  async runComprehensiveLoadTest(config: LoadTestConfig = this.defaultConfig): Promise<LoadTestResult[]> {
    console.log('Starting comprehensive load testing...');

    const [k6Result, artilleryResult] = await Promise.all([
      this.runK6LoadTest(config),
      this.runArtilleryLoadTest(config)
    ]);

    return [k6Result, artilleryResult];
  }
}
