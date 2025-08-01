import { NextRequest, NextResponse } from 'next/server';
import { getMetrics, getMetricsJson } from '../../../../lib/metrics';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');

    if (format === 'json') {
      const metricsJson = await getMetricsJson();
      return NextResponse.json(metricsJson);
    }

    // Default to Prometheus format
    const metrics = await getMetrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
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
