import { BaseAgent, MetricPoint } from '../shared/BaseAgent.js';
import { RoutingConfig, routingConfigSchema, loadConfig } from '../shared/config.js';
import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

interface RouteDefinition {
  path: string;
  service: string;
  requiresAuth: boolean;
  roles: string[];
  targetUrl: string;
  healthCheck: string;
}

interface ServiceHealth {
  service: string;
  healthy: boolean;
  lastCheck: Date;
  responseTime: number;
}

interface UserBehaviorPattern {
  userId: string;
  routeSequence: string[];
  timestamps: Date[];
  predictedNext: string[];
}

interface RouteCache {
  routeName: string;
  data: any;
  cachedAt: Date;
  expiresAt: Date;
}

interface PredictiveFetchConfig {
  enabled: boolean;
  cacheSize: number;
  prefetchThreshold: number;
  learningRate: number;
}

const routeRequestSchema = z.object({
  path: z.string(),
  method: z.string().optional().default('GET'),
  user: z.object({
    id: z.string(),
    roles: z.array(z.string()),
  }).optional(),
});

const generateUrlSchema = z.object({
  service: z.string(),
  path: z.string().optional(),
  params: z.record(z.string()).optional(),
  query: z.record(z.string()).optional(),
});

export class RoutingAgent extends BaseAgent {
  private config: RoutingConfig;
  private routes: Map<string, RouteDefinition> = new Map();
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private userBehaviorPatterns: Map<string, UserBehaviorPattern> = new Map();
  private routeCache: Map<string, RouteCache> = new Map();
  private predictiveFetchConfig: PredictiveFetchConfig = {
    enabled: true,
    cacheSize: 100,
    prefetchThreshold: 0.7,
    learningRate: 0.1
  };
  private prefetchInterval: NodeJS.Timeout | null = null;

  constructor() {
    const config = loadConfig(routingConfigSchema, 'routing-agent');
    super(config);
    this.config = config;
    this.initializeRoutes();
    this.startHealthChecks();
    this.startPredictivePrefetch();
  }

  private initializeRoutes(): void {
    // Load routes from configuration
    for (const [routeName, routeConfig] of Object.entries(this.config.routes)) {
      const service = this.config.services[routeConfig.service];
      if (!service) {
        this.log('warn', `Service ${routeConfig.service} not found for route ${routeName}`);
        continue;
      }

      const routeDefinition: RouteDefinition = {
        path: routeConfig.path,
        service: routeConfig.service,
        requiresAuth: routeConfig.requiresAuth,
        roles: routeConfig.roles,
        targetUrl: service.url,
        healthCheck: service.healthCheck,
      };

      this.routes.set(routeName, routeDefinition);
      this.log('info', `Route registered: ${routeName} -> ${routeDefinition.targetUrl}`);
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.checkServiceHealth();
    }, 30000); // Check every 30 seconds

    // Initial health check
    this.checkServiceHealth();
  }

  private async checkServiceHealth(): Promise<void> {
    for (const [serviceName, serviceConfig] of Object.entries(this.config.services)) {
      const startTime = Date.now();
      
      try {
        const healthUrl = `${serviceConfig.url}${serviceConfig.healthCheck}`;
        const response = await axios.get(healthUrl, { timeout: 5000 });
        
        const responseTime = Date.now() - startTime;
        const healthy = response.status === 200;
        
        this.serviceHealth.set(serviceName, {
          service: serviceName,
          healthy,
          lastCheck: new Date(),
          responseTime,
        });
        
        this.recordMetric('service_health_check', healthy ? 1 : 0, { service: serviceName });
        this.recordMetric('service_response_time', responseTime, { service: serviceName });
        
      } catch (error) {
        this.serviceHealth.set(serviceName, {
          service: serviceName,
          healthy: false,
          lastCheck: new Date(),
          responseTime: Date.now() - startTime,
        });
        
        this.recordMetric('service_health_check', 0, { service: serviceName });
        this.log('warn', `Service ${serviceName} health check failed`, { error: error.message });
      }
    }
  }

  protected setupCustomRoutes(): void {
    // Route resolution
    this.app.post('/routing/resolve', this.handleResolveRoute.bind(this));
    this.app.get('/routing/resolve/:path(*)', this.handleResolveRouteGet.bind(this));
    
    // URL generation
    this.app.post('/routing/generate-url', this.handleGenerateUrl.bind(this));
    
    // Route validation
    this.app.post('/routing/validate', this.handleValidateRoute.bind(this));
    
    // Route listing
    this.app.get('/routing/routes', this.handleGetRoutes.bind(this));
    
    // Service health
    this.app.get('/routing/health', this.handleGetServiceHealth.bind(this));
    
    // Deep link handling
    this.app.post('/routing/deep-link', this.handleDeepLink.bind(this));
    
    // Dashboard routing
    this.app.post('/routing/dashboard', this.handleDashboardRouting.bind(this));
    
    // Predictive routing
    this.app.get('/routing/predictions/:userId', this.handleGetPredictions.bind(this));
    this.app.post('/routing/track-navigation', this.handleTrackNavigation.bind(this));
    this.app.get('/routing/prefetch/:userId', this.handleGetPrefetchData.bind(this));
  }

  private async handleResolveRoute(req: Request, res: Response): Promise<void> {
    try {
      const { path, method, user } = this.validateSchema(routeRequestSchema, req.body);
      
      const route = this.findMatchingRoute(path);
      if (!route) {
        res.status(404).json({ error: 'Route not found' });
        return;
      }
      
      // Check authentication requirements
      if (route.requiresAuth && !user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      // Check role requirements
      if (route.roles.length > 0 && user) {
        const hasRequiredRole = route.roles.some(role => user.roles.includes(role));
        if (!hasRequiredRole) {
          res.status(403).json({ error: 'Insufficient permissions' });
          return;
        }
      }
      
      // Check service health
      const serviceHealth = this.serviceHealth.get(route.service);
      if (!serviceHealth?.healthy) {
        res.status(503).json({ error: 'Service unavailable' });
        return;
      }
      
      this.recordMetric('route_resolved', 1, { 
        route: route.path, 
        service: route.service,
        method 
      });
      
      res.json({
        route: route.path,
        service: route.service,
        targetUrl: route.targetUrl,
        method,
        requiresAuth: route.requiresAuth,
        roles: route.roles,
      });
      
    } catch (error) {
      this.recordMetric('route_resolution_error', 1);
      this.log('error', 'Route resolution failed', { error: error.message });
      res.status(400).json({ error: 'Route resolution failed' });
    }
  }

  private async handleResolveRouteGet(req: Request, res: Response): Promise<void> {
    try {
      const path = '/' + req.params.path;
      const route = this.findMatchingRoute(path);
      
      if (!route) {
        res.status(404).json({ error: 'Route not found' });
        return;
      }
      
      res.json({
        route: route.path,
        service: route.service,
        targetUrl: route.targetUrl,
        requiresAuth: route.requiresAuth,
        roles: route.roles,
      });
      
    } catch (error) {
      this.log('error', 'Route resolution failed', { error: error.message });
      res.status(400).json({ error: 'Route resolution failed' });
    }
  }

  private async handleGenerateUrl(req: Request, res: Response): Promise<void> {
    try {
      const { service, path, params, query } = this.validateSchema(generateUrlSchema, req.body);
      
      const serviceConfig = this.config.services[service];
      if (!serviceConfig) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      
      let url = serviceConfig.url;
      
      if (path) {
        url += path.startsWith('/') ? path : '/' + path;
      }
      
      // Replace path parameters
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          url = url.replace(`:${key}`, value);
        }
      }
      
      // Add query parameters
      if (query) {
        const queryString = new URLSearchParams(query).toString();
        if (queryString) {
          url += '?' + queryString;
        }
      }
      
      this.recordMetric('url_generated', 1, { service });
      
      res.json({ url });
      
    } catch (error) {
      this.log('error', 'URL generation failed', { error: error.message });
      res.status(400).json({ error: 'URL generation failed' });
    }
  }

  private async handleValidateRoute(req: Request, res: Response): Promise<void> {
    try {
      const { path, user } = this.validateSchema(routeRequestSchema, req.body);
      
      const route = this.findMatchingRoute(path);
      if (!route) {
        res.json({ valid: false, reason: 'Route not found' });
        return;
      }
      
      // Check authentication requirements
      if (route.requiresAuth && !user) {
        res.json({ valid: false, reason: 'Authentication required' });
        return;
      }
      
      // Check role requirements
      if (route.roles.length > 0 && user) {
        const hasRequiredRole = route.roles.some(role => user.roles.includes(role));
        if (!hasRequiredRole) {
          res.json({ valid: false, reason: 'Insufficient permissions' });
          return;
        }
      }
      
      // Check service health
      const serviceHealth = this.serviceHealth.get(route.service);
      if (!serviceHealth?.healthy) {
        res.json({ valid: false, reason: 'Service unavailable' });
        return;
      }
      
      res.json({ valid: true });
      
    } catch (error) {
      this.log('error', 'Route validation failed', { error: error.message });
      res.status(400).json({ error: 'Route validation failed' });
    }
  }

  private async handleGetRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = Array.from(this.routes.entries()).map(([name, route]) => ({
        name,
        path: route.path,
        service: route.service,
        requiresAuth: route.requiresAuth,
        roles: route.roles,
      }));
      
      res.json({ routes });
      
    } catch (error) {
      this.log('error', 'Failed to get routes', { error: error.message });
      res.status(500).json({ error: 'Failed to get routes' });
    }
  }

  private async handleGetServiceHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = Array.from(this.serviceHealth.values()).map(health => ({
        service: health.service,
        healthy: health.healthy,
        lastCheck: health.lastCheck,
        responseTime: health.responseTime,
      }));
      
      res.json({ services: health });
      
    } catch (error) {
      this.log('error', 'Failed to get service health', { error: error.message });
      res.status(500).json({ error: 'Failed to get service health' });
    }
  }

  private async handleDeepLink(req: Request, res: Response): Promise<void> {
    try {
      const { url, user } = req.body;
      
      // Parse the deep link URL
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      
      const route = this.findMatchingRoute(path);
      if (!route) {
        res.status(404).json({ error: 'Route not found' });
        return;
      }
      
      // Check permissions
      if (route.requiresAuth && !user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      if (route.roles.length > 0 && user) {
        const hasRequiredRole = route.roles.some(role => user.roles.includes(role));
        if (!hasRequiredRole) {
          res.status(403).json({ error: 'Insufficient permissions' });
          return;
        }
      }
      
      // Generate the target URL
      const targetUrl = route.targetUrl + path + parsedUrl.search;
      
      this.recordMetric('deep_link_resolved', 1, { service: route.service });
      
      res.json({
        targetUrl,
        service: route.service,
        requiresAuth: route.requiresAuth,
      });
      
    } catch (error) {
      this.log('error', 'Deep link resolution failed', { error: error.message });
      res.status(400).json({ error: 'Deep link resolution failed' });
    }
  }

  private async handleDashboardRouting(req: Request, res: Response): Promise<void> {
    try {
      const { user } = req.body;
      
      if (!user) {
        res.status(401).json({ error: 'User information required' });
        return;
      }
      
      // Determine appropriate dashboard based on user roles
      let dashboardRoute = 'default-dashboard';
      
      if (user.roles.includes('admin')) {
        dashboardRoute = 'admin-dashboard';
      } else if (user.roles.includes('doctor')) {
        dashboardRoute = 'doctor-dashboard';
      } else if (user.roles.includes('patient')) {
        dashboardRoute = 'patient-dashboard';
      }
      
      const route = this.routes.get(dashboardRoute);
      if (!route) {
        res.status(404).json({ error: 'Dashboard route not found' });
        return;
      }
      
      this.recordMetric('dashboard_routed', 1, { dashboard: dashboardRoute });
      
      res.json({
        dashboardUrl: route.targetUrl,
        dashboard: dashboardRoute,
        service: route.service,
      });
      
    } catch (error) {
      this.log('error', 'Dashboard routing failed', { error: error.message });
      res.status(400).json({ error: 'Dashboard routing failed' });
    }
  }

  private findMatchingRoute(path: string): RouteDefinition | null {
    // First try exact match
    for (const route of this.routes.values()) {
      if (route.path === path) {
        return route;
      }
    }
    
    // Then try pattern matching
    for (const route of this.routes.values()) {
      if (this.matchesPattern(path, route.path)) {
        return route;
      }
    }
    
    return null;
  }

  private matchesPattern(path: string, pattern: string): boolean {
    // Simple pattern matching - in production, use a proper router
    const patternRegex = pattern.replace(/:\w+/g, '([^/]+)');
    const regex = new RegExp(`^${patternRegex}$`);
    return regex.test(path);
  }

  protected performHealthChecks(): Record<string, boolean> {
    const checks: Record<string, boolean> = {};
    
    // Check if all services are healthy
    for (const [serviceName, health] of this.serviceHealth) {
      checks[`service_${serviceName}`] = health.healthy;
    }
    
    // Check if routes are configured
    checks.routes_configured = this.routes.size > 0;
    
    return checks;
  }

  protected getCustomMetrics(): MetricPoint[] {
    const metrics: MetricPoint[] = [];
    
    // Add service health metrics
    for (const health of this.serviceHealth.values()) {
      metrics.push({
        name: 'service_health',
        value: health.healthy ? 1 : 0,
        timestamp: new Date().toISOString(),
        labels: { service: health.service },
      });
      
      metrics.push({
        name: 'service_response_time',
        value: health.responseTime,
        timestamp: new Date().toISOString(),
        labels: { service: health.service },
      });
    }
    
    // Add route metrics
    metrics.push({
      name: 'total_routes',
      value: this.routes.size,
      timestamp: new Date().toISOString(),
    });
    
    return metrics;
  }

  public async stop(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.prefetchInterval) {
      clearInterval(this.prefetchInterval);
      this.prefetchInterval = null;
    }
    
    await super.stop();
  }
  
  private startPredictivePrefetch(): void {
    if (!this.predictiveFetchConfig.enabled) return;
    
    this.prefetchInterval = setInterval(() => {
      this.prefetchDataForUsers();
    }, 60000); // Run every minute
  }

  private prefetchDataForUsers(): void {
    for (const [userId, pattern] of this.userBehaviorPatterns) {
      for (const predictedRoute of pattern.predictedNext) {
        if (!this.routeCache.has(predictedRoute)) {
          this.fetchRouteData(predictedRoute).then(data => {
            if (data) {
              this.routeCache.set(predictedRoute, {
                routeName: predictedRoute,
                data,
                cachedAt: new Date(),
                expiresAt: new Date(Date.now() + 300000) // Cache expires in 5 min
              });
            }
          });
        }
      }
    }
  }

  private async fetchRouteData(routeName: string): Promise<any> {
    // Mock implementation, replace with real data fetching
    this.log('info', `Prefetching data for route: ${routeName}`);
    return { dummyData: true };
  }

  private async handleGetPredictions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const pattern = this.userBehaviorPatterns.get(userId);
      if (!pattern) {
        res.status(404).json({ error: 'No predictions found' });
        return;
      }

      res.json({ predictions: pattern.predictedNext });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get predictions' });
    }
  }

  private async handleTrackNavigation(req: Request, res: Response): Promise<void> {
    try {
      const { userId, route, timestamp } = req.body;
      let pattern = this.userBehaviorPatterns.get(userId);
      if (!pattern) {
        pattern = { userId, routeSequence: [], timestamps: [], predictedNext: [] };
        this.userBehaviorPatterns.set(userId, pattern);
      }

      pattern.routeSequence.push(route);
      pattern.timestamps.push(new Date(timestamp));
      this.updatePredictionsForUser(userId);

      res.json({ success: true });

    } catch (error) {
      res.status(500).json({ error: 'Failed to track navigation' });
    }
  }

  private async handleGetPrefetchData(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const pattern = this.userBehaviorPatterns.get(userId);
      if (!pattern) {
        res.status(404).json({ error: 'No prefetch data found' });
        return;
      }
      const prefetchData = pattern.predictedNext.map(route => {
        const cache = this.routeCache.get(route);
        return cache ? { route, data: cache.data } : null;
      }).filter(Boolean);

      res.json({ prefetchData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get prefetch data' });
    }
  }

  private updatePredictionsForUser(userId: string): void {
    const pattern = this.userBehaviorPatterns.get(userId);
    if (!pattern) return;

    const sequenceLength = pattern.routeSequence.length;
    if (sequenceLength < 2) return;

    const lastRoute = pattern.routeSequence[sequenceLength - 1];
    const previousRoute = pattern.routeSequence[sequenceLength - 2];

    const predictedRoutes: Map<string, number> = new Map();

    // Very simplistic prediction logic
    for (const [key, userPattern] of this.userBehaviorPatterns) {
      if (key !== userId) {
        userPattern.routeSequence.forEach((route, index) => {
          if (index < userPattern.routeSequence.length - 1 && userPattern.routeSequence[index] === previousRoute) {
            const nextRoute = userPattern.routeSequence[index + 1];
            const currentWeight = predictedRoutes.get(nextRoute) || 0;
            predictedRoutes.set(nextRoute, currentWeight + this.predictiveFetchConfig.learningRate);
          }
        });
      }
    }

    const sortedPredictions = Array.from(predictedRoutes.entries()).sort((a, b) => b[1] - a[1]);
    const topPredictions = sortedPredictions.filter(([route, weight]) => weight > this.predictiveFetchConfig.prefetchThreshold)
                                           .map(([route]) => route);

    pattern.predictedNext = topPredictions;
  }
}

// Start the agent if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new RoutingAgent();
  agent.start().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGTERM', () => agent.stop());
  process.on('SIGINT', () => agent.stop());
}