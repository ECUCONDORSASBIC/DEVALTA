/**
 * 🚀 DATABASE QUERY OPTIMIZER - ALTAMEDICA
 * Advanced query optimization with caching, indexing, and performance monitoring
 */

import { EventEmitter } from 'events';
import { logger } from '@altamedica/logger';
import { medicalCache } from '@altamedica/medical-cache';

// Query types
export enum QueryType {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  JOIN = 'JOIN',
  AGGREGATE = 'AGGREGATE',
  COMPLEX = 'COMPLEX'
}

// Query complexity levels
export enum QueryComplexity {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  COMPLEX = 'complex',
  VERY_COMPLEX = 'very_complex'
}

// Query performance metrics
export interface QueryMetrics {
  queryId: string;
  sql: string;
  type: QueryType;
  complexity: QueryComplexity;
  executionTime: number;
  rowsAffected: number;
  rowsReturned: number;
  cacheHit: boolean;
  cacheKey?: string;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
  error?: string;
}

// Query cache entry
export interface QueryCacheEntry {
  data: any;
  timestamp: Date;
  expiresAt: Date;
  hitCount: number;
  lastAccessed: Date;
  size: number;
  tags: string[];
}

// Index recommendation
export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  reason: string;
  estimatedImprovement: number; // percentage
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Query optimization suggestion
export interface QueryOptimizationSuggestion {
  queryId: string;
  originalQuery: string;
  optimizedQuery: string;
  explanation: string;
  estimatedImprovement: number;
  risk: 'low' | 'medium' | 'high';
  tags: string[];
}

// Database connection pool configuration
export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
  destroyTimeoutMillis: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  createRetryIntervalMillis: number;
}

// Main Query Optimizer
export class QueryOptimizer extends EventEmitter {
  private queryCache: Map<string, QueryCacheEntry> = new Map();
  private queryMetrics: Map<string, QueryMetrics[]> = new Map();
  private slowQueries: QueryMetrics[] = [];
  private indexRecommendations: IndexRecommendation[] = [];
  private optimizationSuggestions: QueryOptimizationSuggestion[] = [];
  private isMonitoring: boolean = false;
  private slowQueryThreshold: number = 1000; // 1 second
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB
  private currentCacheSize: number = 0;

  constructor() {
    super();
    this.initializeOptimizer();
  }

  /**
   * Initialize the query optimizer
   */
  private initializeOptimizer(): void {
    // Start cache cleanup interval
    setInterval(() => {
      this.cleanupCache();
    }, 60 * 1000); // Every minute

    // Start metrics aggregation
    setInterval(() => {
      this.aggregateMetrics();
    }, 5 * 60 * 1000); // Every 5 minutes

    logger.info('Query Optimizer initialized');
  }

  /**
   * Execute optimized query
   */
  async executeQuery(
    sql: string,
    params: any[] = [],
    options: {
      cache?: boolean;
      cacheTTL?: number;
      tags?: string[];
      priority?: 'low' | 'normal' | 'high';
    } = {}
  ): Promise<any> {
    const startTime = performance.now();
    const queryId = this.generateQueryId(sql, params);
    const cacheKey = this.generateCacheKey(sql, params);
    
    let cacheHit = false;
    let result: any;

    try {
      // Check cache for SELECT queries
      if (options.cache !== false && this.isCacheableQuery(sql)) {
        const cached = this.getCachedQuery(cacheKey);
        if (cached) {
          cacheHit = true;
          result = cached.data;
        }
      }

      // Execute query if not cached
      if (!cacheHit) {
        result = await this.executeDatabaseQuery(sql, params);
        
        // Cache result for SELECT queries
        if (options.cache !== false && this.isCacheableQuery(sql)) {
          this.cacheQuery(cacheKey, result, options.cacheTTL || this.cacheTTL, options.tags || []);
        }
      }

      // Record metrics
      const executionTime = performance.now() - startTime;
      const metrics: QueryMetrics = {
        queryId,
        sql,
        type: this.getQueryType(sql),
        complexity: this.getQueryComplexity(sql),
        executionTime,
        rowsAffected: this.getRowsAffected(result),
        rowsReturned: this.getRowsReturned(result),
        cacheHit,
        cacheKey: cacheHit ? cacheKey : undefined,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: process.cpuUsage().user / 1000000,
        timestamp: new Date()
      };

      this.recordMetrics(metrics);

      // Check for slow queries
      if (executionTime > this.slowQueryThreshold) {
        this.recordSlowQuery(metrics);
        this.analyzeSlowQuery(metrics);
      }

      // Generate optimization suggestions
      if (executionTime > 500) { // 500ms threshold
        this.generateOptimizationSuggestions(metrics);
      }

      return result;

    } catch (error) {
      // Record error metrics
      const executionTime = performance.now() - startTime;
      const errorMetrics: QueryMetrics = {
        queryId,
        sql,
        type: this.getQueryType(sql),
        complexity: this.getQueryComplexity(sql),
        executionTime,
        rowsAffected: 0,
        rowsReturned: 0,
        cacheHit: false,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: process.cpuUsage().user / 1000000,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.recordMetrics(errorMetrics);
      throw error;
    }
  }

  /**
   * Execute database query (mock implementation)
   */
  private async executeDatabaseQuery(sql: string, params: any[]): Promise<any> {
    // In production, this would execute the actual database query
    // For now, we'll simulate different query types and complexities
    
    const queryType = this.getQueryType(sql);
    const complexity = this.getQueryComplexity(sql);
    
    // Simulate execution time based on complexity
    const baseTime = this.getBaseExecutionTime(complexity);
    const randomFactor = 0.5 + Math.random(); // 0.5x to 1.5x
    const executionTime = baseTime * randomFactor;
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // Return mock data based on query type
    return this.generateMockResult(queryType, complexity);
  }

  /**
   * Get base execution time for complexity level
   */
  private getBaseExecutionTime(complexity: QueryComplexity): number {
    switch (complexity) {
      case QueryComplexity.SIMPLE:
        return 10; // 10ms
      case QueryComplexity.MEDIUM:
        return 50; // 50ms
      case QueryComplexity.COMPLEX:
        return 200; // 200ms
      case QueryComplexity.VERY_COMPLEX:
        return 500; // 500ms
      default:
        return 100;
    }
  }

  /**
   * Generate mock result based on query type
   */
  private generateMockResult(type: QueryType, complexity: QueryComplexity): any {
    switch (type) {
      case QueryType.SELECT:
        return this.generateMockSelectResult(complexity);
      case QueryType.INSERT:
        return { insertId: Math.floor(Math.random() * 1000000) };
      case QueryType.UPDATE:
        return { affectedRows: Math.floor(Math.random() * 100) + 1 };
      case QueryType.DELETE:
        return { affectedRows: Math.floor(Math.random() * 50) };
      case QueryType.AGGREGATE:
        return this.generateMockAggregateResult();
      default:
        return { success: true };
    }
  }

  /**
   * Generate mock SELECT result
   */
  private generateMockSelectResult(complexity: QueryComplexity): any[] {
    const rowCount = this.getRowCountForComplexity(complexity);
    const rows = [];
    
    for (let i = 0; i < rowCount; i++) {
      rows.push({
        id: i + 1,
        name: `Patient ${i + 1}`,
        email: `patient${i + 1}@example.com`,
        age: Math.floor(Math.random() * 50) + 20,
        diagnosis: this.getRandomDiagnosis(),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      });
    }
    
    return rows;
  }

  /**
   * Generate mock aggregate result
   */
  private generateMockAggregateResult(): any {
    return {
      count: Math.floor(Math.random() * 1000) + 100,
      sum: Math.floor(Math.random() * 100000) + 10000,
      avg: Math.floor(Math.random() * 100) + 50,
      min: Math.floor(Math.random() * 50) + 1,
      max: Math.floor(Math.random() * 200) + 100
    };
  }

  /**
   * Get row count for complexity level
   */
  private getRowCountForComplexity(complexity: QueryComplexity): number {
    switch (complexity) {
      case QueryComplexity.SIMPLE:
        return Math.floor(Math.random() * 10) + 1;
      case QueryComplexity.MEDIUM:
        return Math.floor(Math.random() * 50) + 10;
      case QueryComplexity.COMPLEX:
        return Math.floor(Math.random() * 200) + 50;
      case QueryComplexity.VERY_COMPLEX:
        return Math.floor(Math.random() * 1000) + 200;
      default:
        return 10;
    }
  }

  /**
   * Get random diagnosis
   */
  private getRandomDiagnosis(): string {
    const diagnoses = [
      'Diabetes tipo 2',
      'Hipertensión arterial',
      'Asma bronquial',
      'Artritis reumatoide',
      'Depresión mayor',
      'Ansiedad generalizada',
      'Migraña',
      'Osteoporosis',
      'Enfermedad pulmonar obstructiva crónica',
      'Insuficiencia cardíaca'
    ];
    return diagnoses[Math.floor(Math.random() * diagnoses.length)];
  }

  /**
   * Check if query is cacheable
   */
  private isCacheableQuery(sql: string): boolean {
    const upperSql = sql.trim().toUpperCase();
    return upperSql.startsWith('SELECT') && 
           !upperSql.includes('RAND()') && 
           !upperSql.includes('NOW()') &&
           !upperSql.includes('CURRENT_TIMESTAMP');
  }

  /**
   * Get cached query
   */
  private getCachedQuery(cacheKey: string): QueryCacheEntry | null {
    const entry = this.queryCache.get(cacheKey);
    
    if (entry && entry.expiresAt > new Date()) {
      entry.hitCount++;
      entry.lastAccessed = new Date();
      return entry;
    }
    
    if (entry) {
      this.queryCache.delete(cacheKey);
      this.currentCacheSize -= entry.size;
    }
    
    return null;
  }

  /**
   * Cache query result
   */
  private cacheQuery(cacheKey: string, data: any, ttl: number, tags: string[]): void {
    try {
      const dataSize = JSON.stringify(data).length;
      
      // Check if we have enough space
      if (this.currentCacheSize + dataSize > this.maxCacheSize) {
        this.evictCacheEntries(dataSize);
      }
      
      const entry: QueryCacheEntry = {
        data,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + ttl),
        hitCount: 1,
        lastAccessed: new Date(),
        size: dataSize,
        tags
      };
      
      this.queryCache.set(cacheKey, entry);
      this.currentCacheSize += dataSize;
      
    } catch (error) {
      logger.error('Error caching query:', error);
    }
  }

  /**
   * Evict cache entries to make space
   */
  private evictCacheEntries(requiredSize: number): void {
    const entries = Array.from(this.queryCache.entries());
    
    // Sort by last accessed time (LRU)
    entries.sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
    
    let freedSpace = 0;
    
    for (const [key, entry] of entries) {
      this.queryCache.delete(key);
      freedSpace += entry.size;
      
      if (freedSpace >= requiredSize) {
        break;
      }
    }
    
    this.currentCacheSize -= freedSpace;
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = new Date();
    let freedSpace = 0;
    
    for (const [key, entry] of this.queryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.queryCache.delete(key);
        freedSpace += entry.size;
      }
    }
    
    this.currentCacheSize -= freedSpace;
    
    if (freedSpace > 0) {
      logger.debug(`Cleaned up ${freedSpace} bytes from query cache`);
    }
  }

  /**
   * Record query metrics
   */
  private recordMetrics(metrics: QueryMetrics): void {
    const queryMetrics = this.queryMetrics.get(metrics.queryId) || [];
    queryMetrics.push(metrics);
    this.queryMetrics.set(metrics.queryId, queryMetrics);
  }

  /**
   * Record slow query
   */
  private recordSlowQuery(metrics: QueryMetrics): void {
    this.slowQueries.push(metrics);
    
    // Keep only last 1000 slow queries
    if (this.slowQueries.length > 1000) {
      this.slowQueries = this.slowQueries.slice(-1000);
    }
    
    this.emit('slowQuery', metrics);
  }

  /**
   * Analyze slow query
   */
  private analyzeSlowQuery(metrics: QueryMetrics): void {
    // Generate index recommendations
    const recommendations = this.generateIndexRecommendations(metrics);
    this.indexRecommendations.push(...recommendations);
    
    // Generate query optimization suggestions
    const suggestions = this.generateQueryOptimizationSuggestions(metrics);
    this.optimizationSuggestions.push(...suggestions);
  }

  /**
   * Generate index recommendations
   */
  private generateIndexRecommendations(metrics: QueryMetrics): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];
    
    // Simple heuristic-based recommendations
    if (metrics.sql.toLowerCase().includes('where') && metrics.executionTime > 1000) {
      recommendations.push({
        table: 'patients',
        columns: ['created_at', 'status'],
        type: 'btree',
        reason: 'Frequent filtering by date and status',
        estimatedImprovement: 75,
        priority: 'high'
      });
    }
    
    if (metrics.sql.toLowerCase().includes('like') && metrics.executionTime > 500) {
      recommendations.push({
        table: 'patients',
        columns: ['name', 'email'],
        type: 'gin',
        reason: 'Text search optimization',
        estimatedImprovement: 60,
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate query optimization suggestions
   */
  private generateQueryOptimizationSuggestions(metrics: QueryMetrics): QueryOptimizationSuggestion[] {
    const suggestions: QueryOptimizationSuggestion[] = [];
    
    // Simple optimization suggestions
    if (metrics.sql.toLowerCase().includes('select *')) {
      suggestions.push({
        queryId: metrics.queryId,
        originalQuery: metrics.sql,
        optimizedQuery: metrics.sql.replace(/select \*/i, 'SELECT id, name, email'),
        explanation: 'Replace SELECT * with specific columns to reduce data transfer',
        estimatedImprovement: 30,
        risk: 'low',
        tags: ['select_optimization']
      });
    }
    
    if (metrics.sql.toLowerCase().includes('order by') && !metrics.sql.toLowerCase().includes('limit')) {
      suggestions.push({
        queryId: metrics.queryId,
        originalQuery: metrics.sql,
        optimizedQuery: metrics.sql + ' LIMIT 100',
        explanation: 'Add LIMIT clause to prevent large result sets',
        estimatedImprovement: 50,
        risk: 'medium',
        tags: ['limit_optimization']
      });
    }
    
    return suggestions;
  }

  /**
   * Aggregate metrics periodically
   */
  private aggregateMetrics(): void {
    const aggregated = {
      totalQueries: 0,
      avgExecutionTime: 0,
      cacheHitRate: 0,
      slowQueryCount: 0,
      errorRate: 0,
      timestamp: new Date()
    };
    
    let totalExecutionTime = 0;
    let totalCacheHits = 0;
    let totalErrors = 0;
    
    for (const metrics of this.queryMetrics.values()) {
      for (const metric of metrics) {
        aggregated.totalQueries++;
        totalExecutionTime += metric.executionTime;
        
        if (metric.cacheHit) {
          totalCacheHits++;
        }
        
        if (metric.error) {
          totalErrors++;
        }
      }
    }
    
    if (aggregated.totalQueries > 0) {
      aggregated.avgExecutionTime = totalExecutionTime / aggregated.totalQueries;
      aggregated.cacheHitRate = (totalCacheHits / aggregated.totalQueries) * 100;
      aggregated.errorRate = (totalErrors / aggregated.totalQueries) * 100;
    }
    
    aggregated.slowQueryCount = this.slowQueries.length;
    
    this.emit('metricsAggregated', aggregated);
  }

  /**
   * Generate query ID
   */
  private generateQueryId(sql: string, params: any[]): string {
    const hash = require('crypto').createHash('md5');
    hash.update(sql + JSON.stringify(params));
    return hash.digest('hex').substring(0, 8);
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(sql: string, params: any[]): string {
    const hash = require('crypto').createHash('md5');
    hash.update(sql + JSON.stringify(params));
    return `query_${hash.digest('hex')}`;
  }

  /**
   * Get query type
   */
  private getQueryType(sql: string): QueryType {
    const upperSql = sql.trim().toUpperCase();
    
    if (upperSql.startsWith('SELECT')) {
      if (upperSql.includes('COUNT(') || upperSql.includes('SUM(') || upperSql.includes('AVG(')) {
        return QueryType.AGGREGATE;
      }
      if (upperSql.includes('JOIN')) {
        return QueryType.JOIN;
      }
      return QueryType.SELECT;
    }
    
    if (upperSql.startsWith('INSERT')) return QueryType.INSERT;
    if (upperSql.startsWith('UPDATE')) return QueryType.UPDATE;
    if (upperSql.startsWith('DELETE')) return QueryType.DELETE;
    
    return QueryType.COMPLEX;
  }

  /**
   * Get query complexity
   */
  private getQueryComplexity(sql: string): QueryComplexity {
    const upperSql = sql.toUpperCase();
    let complexity = 0;
    
    // Count JOINs
    const joinCount = (upperSql.match(/JOIN/g) || []).length;
    complexity += joinCount * 2;
    
    // Count subqueries
    const subqueryCount = (upperSql.match(/\(/g) || []).length;
    complexity += subqueryCount;
    
    // Count WHERE conditions
    const whereCount = (upperSql.match(/WHERE/g) || []).length;
    complexity += whereCount;
    
    // Count GROUP BY
    const groupByCount = (upperSql.match(/GROUP BY/g) || []).length;
    complexity += groupByCount * 2;
    
    // Count ORDER BY
    const orderByCount = (upperSql.match(/ORDER BY/g) || []).length;
    complexity += orderByCount;
    
    if (complexity <= 2) return QueryComplexity.SIMPLE;
    if (complexity <= 5) return QueryComplexity.MEDIUM;
    if (complexity <= 10) return QueryComplexity.COMPLEX;
    return QueryComplexity.VERY_COMPLEX;
  }

  /**
   * Get rows affected
   */
  private getRowsAffected(result: any): number {
    if (result && typeof result === 'object') {
      return result.affectedRows || result.insertId ? 1 : 0;
    }
    return 0;
  }

  /**
   * Get rows returned
   */
  private getRowsReturned(result: any): number {
    if (Array.isArray(result)) {
      return result.length;
    }
    return 0;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    totalQueries: number;
    avgExecutionTime: number;
    cacheHitRate: number;
    slowQueryCount: number;
    errorRate: number;
    cacheSize: number;
    cacheEntries: number;
  } {
    let totalQueries = 0;
    let totalExecutionTime = 0;
    let totalCacheHits = 0;
    let totalErrors = 0;
    
    for (const metrics of this.queryMetrics.values()) {
      for (const metric of metrics) {
        totalQueries++;
        totalExecutionTime += metric.executionTime;
        
        if (metric.cacheHit) {
          totalCacheHits++;
        }
        
        if (metric.error) {
          totalErrors++;
        }
      }
    }
    
    return {
      totalQueries,
      avgExecutionTime: totalQueries > 0 ? totalExecutionTime / totalQueries : 0,
      cacheHitRate: totalQueries > 0 ? (totalCacheHits / totalQueries) * 100 : 0,
      slowQueryCount: this.slowQueries.length,
      errorRate: totalQueries > 0 ? (totalErrors / totalQueries) * 100 : 0,
      cacheSize: this.currentCacheSize,
      cacheEntries: this.queryCache.size
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit: number = 50): QueryMetrics[] {
    return this.slowQueries
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * Get index recommendations
   */
  getIndexRecommendations(): IndexRecommendation[] {
    return this.indexRecommendations;
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): QueryOptimizationSuggestion[] {
    return this.optimizationSuggestions;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.queryCache.clear();
    this.currentCacheSize = 0;
    logger.info('Query cache cleared');
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
    logger.info(`Slow query threshold set to ${threshold}ms`);
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
    logger.info(`Cache TTL set to ${ttl}ms`);
  }
}

// Export singleton instance
export const queryOptimizer = new QueryOptimizer(); 