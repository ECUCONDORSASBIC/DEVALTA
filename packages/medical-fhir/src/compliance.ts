import { HIPAAValidator } from './validators';

// HIPAA Compliance Manager
export class HIPAAComplianceManager {
  private auditLog: AuditEntry[] = [];
  private encryptionKey: string;
  private retentionDays: number = 2555; // 7 years

  constructor(encryptionKey: string, retentionDays?: number) {
    this.encryptionKey = encryptionKey;
    if (retentionDays) this.retentionDays = retentionDays;
  }

  /**
   * Log access to PHI (Protected Health Information)
   */
  logPHIAccess(entry: AuditEntry): void {
    const complianceCheck = HIPAAValidator.validateAuditTrail(entry);
    
    if (!complianceCheck.compliant) {
      throw new Error(`HIPAA Audit Trail Validation Failed: ${complianceCheck.errors.join(', ')}`);
    }

    this.auditLog.push({
      ...entry,
      timestamp: new Date().toISOString(),
      complianceStatus: 'compliant'
    });

    // Check retention policy
    this.cleanupOldLogs();
  }

  /**
   * Encrypt PHI data
   */
  encryptPHI(data: any): { encryptedData: string; iv: string } {
    // This is a simplified encryption - in production use proper crypto libraries
    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypt PHI data
   */
  decryptPHI(encryptedData: string, iv: string): any {
    const crypto = require('crypto');
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  /**
   * Check if data access is authorized
   */
  checkAuthorization(userId: string, resourceType: string, resourceId: string, action: string): boolean {
    // This should integrate with your RBAC system
    const userPermissions = this.getUserPermissions(userId);
    
    return userPermissions.some(permission => 
      permission.resourceType === resourceType &&
      permission.resourceId === resourceId &&
      permission.actions.includes(action)
    );
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(startDate: Date, endDate: Date): ComplianceReport {
    const relevantLogs = this.auditLog.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });

    const totalAccesses = relevantLogs.length;
    const unauthorizedAccesses = relevantLogs.filter(log => !log.authorized).length;
    const phiAccesses = relevantLogs.filter(log => log.containsPHI).length;

    return {
      period: { startDate, endDate },
      totalAccesses,
      unauthorizedAccesses,
      phiAccesses,
      complianceScore: ((totalAccesses - unauthorizedAccesses) / totalAccesses) * 100,
      violations: this.identifyViolations(relevantLogs),
      recommendations: this.generateRecommendations(relevantLogs)
    };
  }

  /**
   * Clean up old audit logs according to retention policy
   */
  private cleanupOldLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    this.auditLog = this.auditLog.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
  }

  /**
   * Get user permissions (placeholder - integrate with your RBAC system)
   */
  private getUserPermissions(userId: string): Permission[] {
    // This should query your actual permission system
    return [
      {
        userId,
        resourceType: 'Patient',
        resourceId: '*',
        actions: ['read', 'write']
      }
    ];
  }

  /**
   * Identify HIPAA violations in audit logs
   */
  private identifyViolations(logs: AuditEntry[]): Violation[] {
    const violations: Violation[] = [];

    logs.forEach(log => {
      if (!log.authorized) {
        violations.push({
          type: 'unauthorized_access',
          severity: 'high',
          timestamp: log.timestamp,
          userId: log.userId,
          description: `Unauthorized access to ${log.resourceType} ${log.resourceId}`
        });
      }

      if (log.containsPHI && log.transmissionType === 'unencrypted') {
        violations.push({
          type: 'unencrypted_phi_transmission',
          severity: 'critical',
          timestamp: log.timestamp,
          userId: log.userId,
          description: `Unencrypted transmission of PHI for ${log.resourceType} ${log.resourceId}`
        });
      }
    });

    return violations;
  }

  /**
   * Generate compliance recommendations
   */
  private generateRecommendations(logs: AuditEntry[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const unauthorizedCount = logs.filter(log => !log.authorized).length;
    if (unauthorizedCount > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        description: `Review ${unauthorizedCount} unauthorized access attempts`,
        action: 'Implement stricter access controls and user training'
      });
    }

    const unencryptedPHI = logs.filter(log => log.containsPHI && log.transmissionType === 'unencrypted').length;
    if (unencryptedPHI > 0) {
      recommendations.push({
        type: 'encryption',
        priority: 'critical',
        description: `${unencryptedPHI} instances of unencrypted PHI transmission detected`,
        action: 'Implement mandatory encryption for all PHI transmissions'
      });
    }

    return recommendations;
  }
}

// Types for compliance management
export interface AuditEntry {
  timestamp: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  authorized: boolean;
  containsPHI: boolean;
  transmissionType?: 'encrypted' | 'unencrypted';
  complianceStatus?: 'compliant' | 'non_compliant';
}

export interface Permission {
  userId: string;
  resourceType: string;
  resourceId: string;
  actions: string[];
}

export interface ComplianceReport {
  period: { startDate: Date; endDate: Date };
  totalAccesses: number;
  unauthorizedAccesses: number;
  phiAccesses: number;
  complianceScore: number;
  violations: Violation[];
  recommendations: Recommendation[];
}

export interface Violation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userId: string;
  description: string;
}

export interface Recommendation {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
}

// FHIR Compliance Checker
export class FHIRComplianceChecker {
  
  /**
   * Validate FHIR resource compliance
   */
  static validateFHIRCompliance(resource: any, resourceType: string): { compliant: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields based on resource type
    switch (resourceType) {
      case 'Patient':
        if (!resource.identifier || resource.identifier.length === 0) {
          errors.push('Patient must have at least one identifier');
        }
        if (!resource.name || resource.name.length === 0) {
          errors.push('Patient must have at least one name');
        }
        break;

      case 'Practitioner':
        if (!resource.identifier || resource.identifier.length === 0) {
          errors.push('Practitioner must have at least one identifier');
        }
        if (!resource.name || resource.name.length === 0) {
          errors.push('Practitioner must have at least one name');
        }
        break;

      case 'Appointment':
        if (!resource.status) {
          errors.push('Appointment must have a status');
        }
        if (!resource.start) {
          errors.push('Appointment must have a start time');
        }
        if (!resource.participant || resource.participant.length === 0) {
          errors.push('Appointment must have at least one participant');
        }
        break;
    }

    // Check for PHI in resource
    if (HIPAAValidator.containsPHI(resource)) {
      errors.push('Resource contains PHI - ensure proper encryption and access controls');
    }

    return { compliant: errors.length === 0, errors };
  }

  /**
   * Validate FHIR bundle compliance
   */
  static validateBundleCompliance(bundle: any): { compliant: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bundle.resourceType || bundle.resourceType !== 'Bundle') {
      errors.push('Bundle must have resourceType set to "Bundle"');
    }

    if (!bundle.type) {
      errors.push('Bundle must have a type');
    }

    if (!bundle.entry || !Array.isArray(bundle.entry)) {
      errors.push('Bundle must have an entry array');
    }

    // Validate each entry
    bundle.entry?.forEach((entry: any, index: number) => {
      if (!entry.resource) {
        errors.push(`Bundle entry ${index} must have a resource`);
      } else {
        const resourceValidation = this.validateFHIRCompliance(
          entry.resource, 
          entry.resource.resourceType
        );
        errors.push(...resourceValidation.errors.map(e => `Entry ${index}: ${e}`));
      }
    });

    return { compliant: errors.length === 0, errors };
  }
} 