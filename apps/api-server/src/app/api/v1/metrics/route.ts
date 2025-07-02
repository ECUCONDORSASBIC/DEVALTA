import { NextRequest, NextResponse } from 'next/server';

// Simple metrics collector
class MetricsCollector {
  private metrics: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();

  increment(name: string, value: number = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  gauge(name: string, value: number) {
    this.metrics.set(name, value);
  }

  getPrometheusFormat(): string {
    const lines: string[] = [];
    
    // Counters
    for (const [name, value] of this.counters.entries()) {
      lines.push(`# HELP ${name} Total number of ${name.replace(/_/g, ' ')}`);
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name} ${value}`);
    }
    
    // Gauges
    for (const [name, value] of this.metrics.entries()) {
      lines.push(`# HELP ${name} Current ${name.replace(/_/g, ' ')}`);
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name} ${value}`);
    }
    
    return lines.join('\n') + '\n';
  }
}

const metrics = new MetricsCollector();

// Simulated metrics - in production, these would come from your app
function collectSystemMetrics() {
  // System metrics
  const memUsage = process.memoryUsage();
  metrics.gauge('altamedica_memory_used_bytes', memUsage.heapUsed);
  metrics.gauge('altamedica_memory_total_bytes', memUsage.heapTotal);
  metrics.gauge('altamedica_uptime_seconds', process.uptime());
  
  // Health status (1 = healthy, 0 = unhealthy)
  metrics.gauge('altamedica_database_status', 1); // From health check
  metrics.gauge('altamedica_api_status', 1);
  
  // Business metrics
  metrics.increment('altamedica_http_requests_total');
  metrics.increment('altamedica_auth_requests_total');
  
  // Security metrics (simulated - these would be real in production)
  metrics.gauge('altamedica_rate_limit_exceeded_total', 0);
  metrics.gauge('altamedica_auth_failures_total', 0);
  metrics.gauge('altamedica_security_sql_injection_attempts_total', 0);
  metrics.gauge('altamedica_security_xss_attempts_total', 0);
  metrics.gauge('altamedica_invalid_jwt_total', 0);
  metrics.gauge('altamedica_firebase_errors_total', 0);
}

export async function GET(request: NextRequest) {
  try {
    // Collect current metrics
    collectSystemMetrics();
    
    // Return Prometheus format
    const prometheusData = metrics.getPrometheusFormat();
    
    return new NextResponse(prometheusData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: unknown) {
    console.error('Metrics collection failed:', error);
    return NextResponse.json(
      { error: 'Metrics collection failed' },
      { status: 500 }
    );
  }
}
