import { NextResponse } from 'next/server';
import { medicalCache } from '@altamedica/medical-cache';
const DEFAULT_CONFIG = {
    enableCache: true,
    enableDeduplication: true,
    enableMetrics: true,
    cacheStrategy: 'smart',
    cacheTTL: {
        'GET:/api/pacientes': 2 * 60 * 1000,
        'GET:/api/citas': 1 * 60 * 1000,
        'GET:/api/disponibilidad': 30 * 1000,
        'GET:/api/lookup': 30 * 60 * 1000,
        'POST:/api/audit': 0
    },
    deduplicationWindow: 5000,
    compressionThreshold: 1024,
    rateLimitWindow: 60 * 1000,
    rateLimitRequests: 100
};
const pendingRequests = new Map();
const requestMetrics = new Map();
const rateLimitCounters = new Map();
function generateCacheKey(req) {
    const url = new URL(req.url);
    const method = req.method;
    const pathname = url.pathname;
    const searchParams = Array.from(url.searchParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    const baseKey = `${method}:${pathname}`;
    return searchParams ? `${baseKey}?${searchParams}` : baseKey;
}
function getCacheType(pathname) {
    if (pathname.includes('/pacientes'))
        return 'patients';
    if (pathname.includes('/citas'))
        return 'appointments';
    if (pathname.includes('/lookup') || pathname.includes('/reference'))
        return 'lookup';
    return 'system';
}
function getTTL(key, config) {
    return config.cacheTTL[key] || 60000;
}
function shouldCompress(data, threshold) {
    const size = JSON.stringify(data).length;
    return size > threshold;
}
function recordMetrics(endpoint, method, metrics) {
    const key = `${method}:${endpoint}`;
    if (!requestMetrics.has(key)) {
        requestMetrics.set(key, []);
    }
    const endpointMetrics = requestMetrics.get(key);
    endpointMetrics.push(metrics);
    if (endpointMetrics.length > 100) {
        endpointMetrics.shift();
    }
    console.log(`[MEDICAL-API-METRICS] ${key}`, {
        duration: metrics.duration,
        cacheHit: metrics.cacheHit,
        responseSize: metrics.responseSize,
        statusCode: metrics.statusCode,
        timestamp: new Date().toISOString()
    });
}
function checkRateLimit(identifier, config) {
    const now = Date.now();
    const counter = rateLimitCounters.get(identifier);
    if (!counter || now > counter.resetTime) {
        rateLimitCounters.set(identifier, {
            count: 1,
            resetTime: now + config.rateLimitWindow
        });
        return {
            allowed: true,
            resetTime: now + config.rateLimitWindow,
            remaining: config.rateLimitRequests - 1
        };
    }
    if (counter.count >= config.rateLimitRequests) {
        return {
            allowed: false,
            resetTime: counter.resetTime,
            remaining: 0
        };
    }
    counter.count++;
    return {
        allowed: true,
        resetTime: counter.resetTime,
        remaining: config.rateLimitRequests - counter.count
    };
}
export async function optimizeApiRequest(request, config = DEFAULT_CONFIG) {
    const startTime = performance.now();
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;
    const cacheKey = generateCacheKey(request);
    const cacheType = getCacheType(pathname);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';
    const userId = request.headers.get('x-user-id');
    const rateLimitId = userId || clientIP;
    const rateLimit = checkRateLimit(rateLimitId, config);
    if (!rateLimit.allowed) {
        return NextResponse.json({
            exito: false,
            mensaje: 'Rate limit excedido',
            codigoError: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date(),
            trazabilidad: Date.now().toString()
        }, {
            status: 429,
            headers: {
                'X-RateLimit-Limit': config.rateLimitRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimit.resetTime.toString()
            }
        });
    }
    let cacheHit = false;
    let response;
    try {
        if (method === 'GET' && config.enableCache) {
            const cached = medicalCache.get(cacheType, cacheKey);
            if (cached) {
                cacheHit = true;
                response = NextResponse.json(cached, {
                    headers: {
                        'X-Cache-Status': 'HIT',
                        'X-Cache-Type': cacheType,
                        'X-Response-Time': (performance.now() - startTime).toFixed(2) + 'ms'
                    }
                });
                if (config.enableMetrics) {
                    recordMetrics(pathname, method, {
                        startTime,
                        endTime: performance.now(),
                        duration: performance.now() - startTime,
                        cacheHit: true,
                        responseSize: JSON.stringify(cached).length,
                        statusCode: 200,
                        endpoint: pathname,
                        method,
                        userId: userId || undefined
                    });
                }
                return response;
            }
        }
        if (config.enableDeduplication && pendingRequests.has(cacheKey)) {
            const pending = pendingRequests.get(cacheKey);
            if (Date.now() - pending.timestamp < config.deduplicationWindow) {
                pending.requestCount++;
                console.log(`[MEDICAL-API] Deduplicating request: ${cacheKey} (count: ${pending.requestCount})`);
                response = await pending.promise;
                const clonedResponse = NextResponse.json(await response.clone().json(), {
                    status: response.status,
                    headers: response.headers
                });
                return clonedResponse;
            }
            else {
                pendingRequests.delete(cacheKey);
            }
        }
        const processRequest = async () => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            const responseData = {
                exito: true,
                datos: {
                    message: `Respuesta optimizada para ${pathname}`,
                    timestamp: new Date().toISOString(),
                    cacheKey,
                    method
                },
                mensaje: 'Request procesada exitosamente',
                timestamp: new Date(),
                trazabilidad: Date.now().toString()
            };
            const apiResponse = NextResponse.json(responseData, {
                headers: {
                    'X-Cache-Status': 'MISS',
                    'X-Cache-Type': cacheType,
                    'X-Response-Time': (performance.now() - startTime).toFixed(2) + 'ms',
                    'X-RateLimit-Limit': config.rateLimitRequests.toString(),
                    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                    'X-RateLimit-Reset': rateLimit.resetTime.toString()
                }
            });
            if (method === 'GET' && config.enableCache) {
                const ttl = getTTL(cacheKey, config);
                if (ttl > 0) {
                    medicalCache.set(cacheType, cacheKey, responseData, {
                        ttl,
                        tags: [cacheType, 'api', method.toLowerCase()],
                        priority: cacheType === 'patients' ? 'high' : 'medium'
                    });
                }
            }
            return apiResponse;
        };
        if (config.enableDeduplication) {
            const requestPromise = processRequest();
            pendingRequests.set(cacheKey, {
                promise: requestPromise,
                timestamp: Date.now(),
                requestCount: 1
            });
            requestPromise.finally(() => {
                setTimeout(() => pendingRequests.delete(cacheKey), config.deduplicationWindow);
            });
        }
        response = config.enableDeduplication
            ? await pendingRequests.get(cacheKey).promise
            : await processRequest();
    }
    catch (error) {
        console.error(`[MEDICAL-API-ERROR] ${pathname}:`, error);
        response = NextResponse.json({
            exito: false,
            mensaje: 'Error interno del servidor',
            codigoError: 'INTERNAL_ERROR',
            timestamp: new Date(),
            trazabilidad: Date.now().toString()
        }, {
            status: 500,
            headers: {
                'X-Cache-Status': 'ERROR',
                'X-Response-Time': (performance.now() - startTime).toFixed(2) + 'ms'
            }
        });
    }
    if (config.enableMetrics) {
        const responseText = await response.clone().text();
        recordMetrics(pathname, method, {
            startTime,
            endTime: performance.now(),
            duration: performance.now() - startTime,
            cacheHit,
            responseSize: responseText.length,
            statusCode: response.status,
            endpoint: pathname,
            method,
            userId: userId || undefined
        });
    }
    return response;
}
export function getApiMetrics() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const result = {};
    requestMetrics.forEach((metrics, endpoint) => {
        const recentMetrics = metrics.filter(m => (m.endTime || m.startTime) > oneMinuteAgo);
        const cacheHits = metrics.filter(m => m.cacheHit).length;
        const errors = metrics.filter(m => m.statusCode >= 400).length;
        result[endpoint] = {
            averageResponseTime: metrics.length > 0
                ? metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length
                : 0,
            cacheHitRate: metrics.length > 0 ? (cacheHits / metrics.length) * 100 : 0,
            totalRequests: metrics.length,
            errorRate: metrics.length > 0 ? (errors / metrics.length) * 100 : 0,
            lastMinuteRequests: recentMetrics.length
        };
    });
    return result;
}
export function cleanupOldMetrics(maxAge = 24 * 60 * 60 * 1000) {
    const cutoffTime = Date.now() - maxAge;
    requestMetrics.forEach((metrics, endpoint) => {
        const filteredMetrics = metrics.filter(m => (m.endTime || m.startTime) > cutoffTime);
        requestMetrics.set(endpoint, filteredMetrics);
    });
    const currentTime = Date.now();
    rateLimitCounters.forEach((counter, key) => {
        if (currentTime > counter.resetTime) {
            rateLimitCounters.delete(key);
        }
    });
}
export default optimizeApiRequest;
//# sourceMappingURL=ApiOptimizationMiddleware.js.map