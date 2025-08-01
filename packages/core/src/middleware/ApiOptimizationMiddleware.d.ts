import { NextRequest, NextResponse } from 'next/server';
interface RequestMetrics {
    startTime: number;
    endTime?: number;
    duration?: number;
    cacheHit: boolean;
    responseSize: number;
    statusCode: number;
    endpoint: string;
    method: string;
    userId?: string;
}
interface OptimizationConfig {
    enableCache: boolean;
    enableDeduplication: boolean;
    enableMetrics: boolean;
    cacheStrategy: 'aggressive' | 'conservative' | 'smart';
    cacheTTL: {
        [key: string]: number;
    };
    deduplicationWindow: number;
    compressionThreshold: number;
    rateLimitWindow: number;
    rateLimitRequests: number;
}
export declare function optimizeApiRequest(request: NextRequest, config?: OptimizationConfig): Promise<NextResponse>;
export declare function getApiMetrics(): Record<string, {
    averageResponseTime: number;
    cacheHitRate: number;
    totalRequests: number;
    errorRate: number;
    lastMinuteRequests: number;
}>;
export declare function cleanupOldMetrics(maxAge?: number): void;
export default optimizeApiRequest;
export type { OptimizationConfig, RequestMetrics };
//# sourceMappingURL=ApiOptimizationMiddleware.d.ts.map