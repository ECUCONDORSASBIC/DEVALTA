#!/usr/bin/env node

/**
 * AltaMedica Webhook Notification System
 * Test de integración con sistemas externos (Slack/Teams/Email)
 */

const https = require('https');
const fs = require('fs');

class WebhookNotificationSystem {
  constructor() {
    this.webhookEndpoints = {
      slack: process.env.SLACK_WEBHOOK_URL || null,
      teams: process.env.TEAMS_WEBHOOK_URL || null,
      email: process.env.EMAIL_WEBHOOK_URL || null
    };
    
    this.notificationQueue = [];
    this.deliveryLog = [];
  }

  async sendSlackNotification(alert) {
    const slackPayload = {
      "text": `🏥 AltaMedica Alert: ${alert.type}`,
      "attachments": [
        {
          "color": this.getSeverityColor(alert.severity),
          "fields": [
            {
              "title": "Severity",
              "value": alert.severity,
              "short": true
            },
            {
              "title": "Status",
              "value": alert.message,
              "short": true
            },
            {
              "title": "Timestamp",
              "value": alert.timestamp,
              "short": true
            },
            {
              "title": "Details",
              "value": JSON.stringify(alert.details, null, 2),
              "short": false
            }
          ]
        }
      ]
    };

    return this.sendWebhook('slack', slackPayload);
  }

  async sendTeamsNotification(alert) {
    const teamsPayload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": this.getSeverityColor(alert.severity),
      "summary": `AltaMedica Alert: ${alert.type}`,
      "sections": [
        {
          "activityTitle": `🏥 AltaMedica Medical System Alert`,
          "activitySubtitle": `${alert.severity} - ${alert.type}`,
          "facts": [
            {
              "name": "Message",
              "value": alert.message
            },
            {
              "name": "Timestamp",
              "value": alert.timestamp
            },
            {
              "name": "Details",
              "value": JSON.stringify(alert.details, null, 2)
            }
          ]
        }
      ]
    };

    return this.sendWebhook('teams', teamsPayload);
  }

  async sendEmailNotification(alert) {
    const emailPayload = {
      "to": ["admin@altamedica.com", "devops@altamedica.com"],
      "subject": `🚨 AltaMedica Alert: ${alert.type} [${alert.severity}]`,
      "html": `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: ${this.getSeverityColor(alert.severity)};">
            🏥 AltaMedica Medical System Alert
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${alert.type}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Severity:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${alert.severity}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${alert.message}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${alert.timestamp}</td>
            </tr>
          </table>
          <h3>Details:</h3>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">
${JSON.stringify(alert.details, null, 2)}
          </pre>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated notification from AltaMedica Medical System.
            For support, contact: support@altamedica.com
          </p>
        </div>
      `
    };

    return this.sendWebhook('email', emailPayload);
  }

  async sendWebhook(type, payload) {
    const webhookUrl = this.webhookEndpoints[type];
    
    if (!webhookUrl) {
      const logEntry = {
        type,
        status: 'SKIPPED',
        reason: 'No webhook URL configured',
        timestamp: new Date().toISOString()
      };
      
      this.deliveryLog.push(logEntry);
      console.log(`📧 ${type.toUpperCase()} notification skipped - No webhook configured`);
      return logEntry;
    }

    // Simulated webhook delivery (replace with actual HTTP request in production)
    const simulatedResponse = {
      type,
      status: 'SIMULATED_SUCCESS',
      payload: payload,
      timestamp: new Date().toISOString(),
      responseTime: Math.random() * 500 + 100 // Simulate 100-600ms response time
    };

    this.deliveryLog.push(simulatedResponse);
    console.log(`✅ ${type.toUpperCase()} notification sent successfully (simulated)`);
    
    return simulatedResponse;
  }

  getSeverityColor(severity) {
    const colors = {
      'CRITICAL': '#FF0000',
      'HIGH': '#FF6600',
      'MEDIUM': '#FFAA00',
      'LOW': '#00AA00',
      'INFO': '#0066CC'
    };
    return colors[severity] || '#808080';
  }

  async processNotificationQueue() {
    console.log('\n📨 PROCESSING NOTIFICATION QUEUE...');
    
    // Load alerts from previous system
    let alerts = [];
    try {
      const alertsData = JSON.parse(fs.readFileSync('./altamedica-alerts.json', 'utf8'));
      alerts = alertsData.systemState.alerts;
    } catch (error) {
      console.log('No previous alerts found, creating test alerts');
      alerts = this.createTestAlerts();
    }

    // Process critical and high severity alerts for external notifications
    const criticalAlerts = alerts.filter(alert => 
      ['CRITICAL', 'HIGH'].includes(alert.severity)
    );

    console.log(`Found ${criticalAlerts.length} critical/high severity alerts for external notification`);

    for (const alert of criticalAlerts) {
      console.log(`\n📤 Processing alert: ${alert.type}`);
      
      // Send to all configured channels
      await this.sendSlackNotification(alert);
      await this.sendTeamsNotification(alert);
      await this.sendEmailNotification(alert);
      
      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.deliveryLog;
  }

  createTestAlerts() {
    return [
      {
        id: "TEST_ALERT_1",
        type: "CRITICAL_SERVICE_ERROR",
        severity: "CRITICAL",
        message: "Admin Panel ERROR 500 - Critical latency detected",
        details: {
          port: 3005,
          responseTime: "3.32s",
          status: "ERROR_500",
          impact: "Administrative functions compromised"
        },
        timestamp: new Date().toISOString()
      },
      {
        id: "TEST_ALERT_2",
        type: "ARCHITECTURE_DISCOVERY",
        severity: "HIGH",
        message: "Real architecture differs from documentation",
        details: {
          documented: "7-app monorepo",
          reality: "Unified single application",
          action_required: "Update documentation and scripts"
        },
        timestamp: new Date().toISOString()
      }
    ];
  }

  generateDeliveryReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalNotifications: this.deliveryLog.length,
      byChannel: {
        slack: this.deliveryLog.filter(log => log.type === 'slack').length,
        teams: this.deliveryLog.filter(log => log.type === 'teams').length,
        email: this.deliveryLog.filter(log => log.type === 'email').length
      },
      successful: this.deliveryLog.filter(log => log.status.includes('SUCCESS')).length,
      failed: this.deliveryLog.filter(log => log.status.includes('FAILED')).length,
      skipped: this.deliveryLog.filter(log => log.status === 'SKIPPED').length,
      averageResponseTime: this.calculateAverageResponseTime(),
      deliveryLog: this.deliveryLog
    };

    return report;
  }

  calculateAverageResponseTime() {
    const responseTimes = this.deliveryLog
      .filter(log => log.responseTime)
      .map(log => log.responseTime);
    
    if (responseTimes.length === 0) return 0;
    
    const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(average * 100) / 100; // Round to 2 decimal places
  }

  async run() {
    console.log('🚀 AltaMedica Webhook Notification System - STARTING');
    console.log('=' .repeat(60));
    
    const deliveryResults = await this.processNotificationQueue();
    const report = this.generateDeliveryReport();
    
    // Save delivery report
    fs.writeFileSync('./webhook-delivery-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 DELIVERY REPORT SUMMARY');
    console.log('=' .repeat(40));
    console.log(`Total Notifications: ${report.totalNotifications}`);
    console.log(`Successful: ${report.successful}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Skipped: ${report.skipped}`);
    console.log(`Average Response Time: ${report.averageResponseTime}ms`);
    console.log(`\nBy Channel:`);
    console.log(`  Slack: ${report.byChannel.slack}`);
    console.log(`  Teams: ${report.byChannel.teams}`);
    console.log(`  Email: ${report.byChannel.email}`);
    
    console.log('\n✅ WEBHOOK NOTIFICATION SYSTEM COMPLETE');
    console.log(`📄 Report saved to: ./webhook-delivery-report.json`);
    
    return report;
  }
}

// Execute if run directly
if (require.main === module) {
  const webhookSystem = new WebhookNotificationSystem();
  webhookSystem.run().catch(console.error);
}

module.exports = WebhookNotificationSystem;