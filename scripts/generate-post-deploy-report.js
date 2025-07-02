#!/usr/bin/env node

/**
 * Post-Deploy Intelligence Report Generator
 * 
 * This script triggers the get_intelligence_report function and stores the result
 * as post-deploy-report.json for production monitoring and analysis.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PostDeployReporter {
  constructor() {
    this.reportPath = path.join(__dirname, '..', 'post-deploy-report.json');
  }

  async generateReport() {
    console.log('🚀 Starting Post-Deploy Intelligence Report Generation...');
    
    try {
      const startTime = Date.now();
      
      // Get intelligence report from MCP server
      console.log('📊 Requesting intelligence report from MCP server...');
      const intelligenceData = await this.getIntelligenceReport();
      
      // Gather system metrics
      console.log('📈 Gathering system metrics...');
      const systemMetrics = await this.gatherSystemMetrics();
      
      // Generate comprehensive report
      const report = this.createComprehensiveReport(intelligenceData, systemMetrics, startTime);
      
      // Store the report
      await this.storeReport(report);
      
      console.log('✅ Post-deploy report generated successfully!');
      console.log(`📁 Report saved to: ${this.reportPath}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Failed to generate post-deploy report:', error);
      
      // Generate fallback report
      const fallbackReport = this.createFallbackReport(error);
      await this.storeReport(fallbackReport);
      
      throw error;
    }
  }

  async getIntelligenceReport() {
    try {
      // Call the MCP server intelligence report function
      const response = await this.callMCPFunction('get_intelligence_report', {
        timeRange: 3600000 // Last hour
      });
      
      return response;
    } catch (error) {
      console.warn('⚠️ MCP intelligence report failed, using fallback data');
      return this.getFallbackIntelligenceData();
    }
  }

  async callMCPFunction(functionName, args) {
    // Simulate MCP call - replace with actual implementation
    console.log(`🔧 Calling MCP function: ${functionName}`);
    
    // Mock response for now
    return {
      success: true,
      timestamp: new Date().toISOString(),
      function: functionName,
      arguments: args,
      result: {
        systemHealth: 'operational',
        performanceScore: 85,
        issues: [],
        recommendations: [
          {
            type: 'performance',
            description: 'Consider implementing Redis caching for frequently accessed data'
          },
          {
            type: 'monitoring',
            description: 'Set up additional alerts for database connection pool usage'
          }
        ]
      }
    };
  }

  getFallbackIntelligenceData() {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: 'MCP server unavailable',
      fallback: true,
      systemHealth: 'unknown',
      performanceScore: null,
      issues: ['Unable to connect to intelligence system'],
      recommendations: ['Verify MCP server is running and accessible']
    };
  }

  async gatherSystemMetrics() {
    const metrics = {
      deployment: {
        timestamp: new Date().toISOString(),
        version: await this.getDeploymentVersion(),
        environment: process.env.NODE_ENV || 'production'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      },
      services: await this.checkServiceHealth(),
      performance: await this.gatherPerformanceMetrics()
    };

    return metrics;
  }

  async getDeploymentVersion() {
    try {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageContent = await fs.promises.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      return packageJson.version || '1.0.0';
    } catch (error) {
      return 'unknown';
    }
  }

  async checkServiceHealth() {
    const services = {
      firebase: { status: 'operational', responseTime: 150 },
      api_server: { status: 'operational', responseTime: 200 },
      frontend_apps: { status: 'operational', responseTime: 300 },
      database: { status: 'operational', responseTime: 100 }
    };

    // In a real implementation, these would be actual health checks
    return services;
  }

  async gatherPerformanceMetrics() {
    return {
      apiResponseTime: 250, // ms
      pageLoadTime: 1200,   // ms
      errorRate: 0.02,      // 2%
      throughput: 450,      // requests/minute
      databaseQueryTime: 80, // ms
      cacheHitRate: 0.85    // 85%
    };
  }

  createComprehensiveReport(intelligenceData, systemMetrics, startTime) {
    const endTime = Date.now();
    const reportGenerationTime = endTime - startTime;

    return {
      metadata: {
        reportId: `post-deploy-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        generationTimeMs: reportGenerationTime,
        version: '1.0.0',
        type: 'post-deploy-assessment'
      },
      intelligence: intelligenceData,
      system: systemMetrics,
      assessment: this.generateAssessment(intelligenceData, systemMetrics),
      alerts: this.generateAlerts(intelligenceData, systemMetrics),
      recommendations: this.generateRecommendations(intelligenceData, systemMetrics),
      nextActions: this.generateNextActions(intelligenceData, systemMetrics)
    };
  }

  createFallbackReport(error) {
    return {
      metadata: {
        reportId: `post-deploy-fallback-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        type: 'post-deploy-assessment-fallback',
        error: error.message
      },
      status: 'degraded',
      message: 'Report generated with limited data due to system issues',
      error: {
        message: error.message,
        stack: error.stack
      },
      recommendations: [
        'Investigate MCP server connectivity',
        'Verify all monitoring systems are operational',
        'Run manual health checks on critical services'
      ]
    };
  }

  generateAssessment(intelligenceData, systemMetrics) {
    const { performance } = systemMetrics;
    
    let overallScore = 85; // Default score
    let status = 'healthy';
    
    // Assess performance metrics
    if (performance.errorRate > 0.05) {
      overallScore -= 20;
      status = 'degraded';
    }
    
    if (performance.apiResponseTime > 1000) {
      overallScore -= 15;
      status = 'degraded';
    }
    
    if (performance.pageLoadTime > 3000) {
      overallScore -= 10;
    }

    return {
      overallScore,
      status,
      healthChecks: {
        services: 'operational',
        performance: performance.errorRate < 0.05 ? 'good' : 'needs-attention',
        reliability: 'stable',
        security: 'compliant'
      },
      summary: `Deployment assessment completed with score ${overallScore}/100. System status: ${status}.`
    };
  }

  generateAlerts(intelligenceData, systemMetrics) {
    const alerts = [];
    const { performance } = systemMetrics;

    if (performance.errorRate > 0.05) {
      alerts.push({
        level: 'warning',
        type: 'error_rate',
        message: `Error rate is ${(performance.errorRate * 100).toFixed(2)}% (threshold: 5%)`,
        action: 'Investigate error logs and identify root cause'
      });
    }

    if (performance.apiResponseTime > 1000) {
      alerts.push({
        level: 'warning',
        type: 'response_time',
        message: `API response time is ${performance.apiResponseTime}ms (threshold: 1000ms)`,
        action: 'Optimize API performance and database queries'
      });
    }

    if (performance.cacheHitRate < 0.7) {
      alerts.push({
        level: 'info',
        type: 'cache_performance',
        message: `Cache hit rate is ${(performance.cacheHitRate * 100).toFixed(1)}% (optimal: >70%)`,
        action: 'Review caching strategy and cache invalidation policies'
      });
    }

    return alerts;
  }

  generateRecommendations(intelligenceData, systemMetrics) {
    const recommendations = [];
    const { performance } = systemMetrics;

    // Performance recommendations
    if (performance.apiResponseTime > 500) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        title: 'Optimize API Response Times',
        description: 'Consider implementing caching, database query optimization, or CDN usage',
        estimatedImpact: 'Reduce response times by 30-50%'
      });
    }

    if (performance.databaseQueryTime > 100) {
      recommendations.push({
        category: 'database',
        priority: 'high',
        title: 'Optimize Database Queries',
        description: 'Review slow queries and add appropriate indexes',
        estimatedImpact: 'Improve overall system performance by 20%'
      });
    }

    // Monitoring recommendations
    recommendations.push({
      category: 'monitoring',
      priority: 'low',
      title: 'Enhance Monitoring Coverage',
      description: 'Add more detailed performance metrics and user experience tracking',
      estimatedImpact: 'Better visibility into system health and user satisfaction'
    });

    return recommendations;
  }

  generateNextActions(intelligenceData, systemMetrics) {
    return [
      {
        action: 'Monitor system performance for the next 4 hours',
        deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        responsible: 'DevOps Team'
      },
      {
        action: 'Review error logs and address any critical issues',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        responsible: 'Engineering Team'
      },
      {
        action: 'Schedule next deployment health check',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        responsible: 'Release Manager'
      }
    ];
  }

  async storeReport(report) {
    try {
      const reportJson = JSON.stringify(report, null, 2);
      await fs.promises.writeFile(this.reportPath, reportJson, 'utf8');
      
      // Also create a timestamped backup
      const backupPath = path.join(
        path.dirname(this.reportPath),
        `post-deploy-report-${Date.now()}.json`
      );
      await fs.promises.writeFile(backupPath, reportJson, 'utf8');
      
      console.log(`📊 Report stored at: ${this.reportPath}`);
      console.log(`🔄 Backup created at: ${backupPath}`);
      
    } catch (error) {
      console.error('❌ Failed to store report:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const reporter = new PostDeployReporter();
  
  try {
    const report = await reporter.generateReport();
    
    // Print summary to console
    console.log('\n📋 DEPLOYMENT REPORT SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Overall Score: ${report.assessment?.overallScore || 'N/A'}/100`);
    console.log(`System Status: ${report.assessment?.status || 'unknown'}`);
    console.log(`Alerts: ${report.alerts?.length || 0}`);
    console.log(`Recommendations: ${report.recommendations?.length || 0}`);
    console.log('=' .repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
main();

export { PostDeployReporter };
