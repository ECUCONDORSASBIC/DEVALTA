/**
 * Medical Compliance Validator
 * Replaces PhilosophicalCore with deterministic rule-based validation
 * Validates specifications against HIPAA, HL7 FHIR R4, OWASP Top 10, and FDA pre-cert safety rules
 */

import { EventEmitter } from 'events';

export interface ComplianceRule {
  id: string;
  name: string;
  category: 'HIPAA' | 'FHIR' | 'OWASP' | 'FDA' | 'GENERAL';
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  validate: (spec: any) => ComplianceResult;
  remediation: string;
}

export interface ComplianceResult {
  passed: boolean;
  ruleId: string;
  ruleName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  details?: string;
  remediation: string;
  evidence?: any;
}

export interface ValidationReport {
  timestamp: string;
  specId: string;
  overallCompliance: boolean;
  results: ComplianceResult[];
  summary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    criticalFailures: number;
    highFailures: number;
    mediumFailures: number;
    lowFailures: number;
  };
  recommendations: string[];
}

export class MedicalComplianceValidator extends EventEmitter {
  private rules: Map<string, ComplianceRule> = new Map();

  constructor() {
    super();
    this.initializeRules();
  }

  /**
   * Initialize all compliance rules
   */
  private initializeRules(): void {
    // HIPAA Rules
    this.addRule({
      id: 'HIPAA_001',
      name: 'PHI Encryption at Rest',
      category: 'HIPAA',
      description: 'All PHI must be encrypted when stored',
      severity: 'CRITICAL',
      validate: (spec) => this.validatePHIEncryption(spec),
      remediation: 'Implement AES-256 encryption for all PHI storage. Use envelope encryption for database fields containing medical data.'
    });

    this.addRule({
      id: 'HIPAA_002',
      name: 'PHI Encryption in Transit',
      category: 'HIPAA',
      description: 'All PHI transmissions must use TLS 1.2+',
      severity: 'CRITICAL',
      validate: (spec) => this.validatePHITransmissionSecurity(spec),
      remediation: 'Configure TLS 1.2+ for all API endpoints. Disable HTTP for medical data endpoints.'
    });

    this.addRule({
      id: 'HIPAA_003',
      name: 'Access Control Implementation',
      category: 'HIPAA',
      description: 'Role-based access control must be implemented for PHI',
      severity: 'HIGH',
      validate: (spec) => this.validateAccessControl(spec),
      remediation: 'Implement RBAC with principle of least privilege. Define roles: Patient, Doctor, Nurse, Admin with specific permissions.'
    });

    this.addRule({
      id: 'HIPAA_004',
      name: 'Audit Logging',
      category: 'HIPAA',
      description: 'All PHI access must be logged',
      severity: 'HIGH',
      validate: (spec) => this.validateAuditLogging(spec),
      remediation: 'Implement comprehensive audit logging for all PHI operations: CREATE, READ, UPDATE, DELETE with user identification and timestamps.'
    });

    this.addRule({
      id: 'HIPAA_005',
      name: 'Data Retention Policy',
      category: 'HIPAA',
      description: 'PHI retention policies must be defined and enforced',
      severity: 'MEDIUM',
      validate: (spec) => this.validateDataRetention(spec),
      remediation: 'Define retention periods: Medical records (7 years), Audit logs (6 years). Implement automated deletion processes.'
    });

    // HL7 FHIR R4 Rules
    this.addRule({
      id: 'FHIR_001',
      name: 'FHIR Resource Validation',
      category: 'FHIR',
      description: 'All medical data must conform to FHIR R4 resource definitions',
      severity: 'HIGH',
      validate: (spec) => this.validateFHIRCompliance(spec),
      remediation: 'Use official FHIR R4 resource schemas. Implement validation middleware for all medical data endpoints.'
    });

    this.addRule({
      id: 'FHIR_002',
      name: 'FHIR Security Labels',
      category: 'FHIR',
      description: 'Sensitive resources must include appropriate security labels',
      severity: 'MEDIUM',
      validate: (spec) => this.validateFHIRSecurityLabels(spec),
      remediation: 'Apply FHIR security labels: R (Restricted), N (Normal), V (Very restricted) based on data sensitivity.'
    });

    this.addRule({
      id: 'FHIR_003',
      name: 'FHIR Consent Resources',
      category: 'FHIR',
      description: 'Patient consent must be tracked using FHIR Consent resources',
      severity: 'HIGH',
      validate: (spec) => this.validateFHIRConsent(spec),
      remediation: 'Implement FHIR Consent resources to track patient permissions for data sharing and treatment.'
    });

    // OWASP Top 10 Rules
    this.addRule({
      id: 'OWASP_001',
      name: 'Injection Prevention',
      category: 'OWASP',
      description: 'All inputs must be validated and sanitized',
      severity: 'CRITICAL',
      validate: (spec) => this.validateInjectionPrevention(spec),
      remediation: 'Use parameterized queries, input validation, and ORM frameworks. Implement SQL injection detection.'
    });

    this.addRule({
      id: 'OWASP_002',
      name: 'Broken Authentication Prevention',
      category: 'OWASP',
      description: 'Strong authentication mechanisms must be implemented',
      severity: 'CRITICAL',
      validate: (spec) => this.validateAuthentication(spec),
      remediation: 'Implement MFA, secure session management, password policies, and account lockout mechanisms.'
    });

    this.addRule({
      id: 'OWASP_003',
      name: 'Sensitive Data Exposure Prevention',
      category: 'OWASP',
      description: 'Sensitive data must be properly protected',
      severity: 'CRITICAL',
      validate: (spec) => this.validateSensitiveDataProtection(spec),
      remediation: 'Encrypt sensitive data at rest and in transit. Implement data classification and protection policies.'
    });

    this.addRule({
      id: 'OWASP_004',
      name: 'Security Misconfiguration Prevention',
      category: 'OWASP',
      description: 'Security configurations must be hardened',
      severity: 'HIGH',
      validate: (spec) => this.validateSecurityConfiguration(spec),
      remediation: 'Harden all configurations, disable unnecessary features, implement security headers, and use secure defaults.'
    });

    // FDA Pre-Cert Safety Rules
    this.addRule({
      id: 'FDA_001',
      name: 'Clinical Decision Support Safety',
      category: 'FDA',
      description: 'AI/ML clinical decision support must have safety controls',
      severity: 'CRITICAL',
      validate: (spec) => this.validateClinicalDecisionSafety(spec),
      remediation: 'Implement human oversight for AI recommendations, confidence scores, and fail-safe mechanisms for critical decisions.'
    });

    this.addRule({
      id: 'FDA_002',
      name: 'Medical Device Integration Safety',
      category: 'FDA',
      description: 'Medical device integrations must include safety checks',
      severity: 'HIGH',
      validate: (spec) => this.validateMedicalDeviceSafety(spec),
      remediation: 'Implement device authentication, data validation, and error handling for all medical device integrations.'
    });

    this.addRule({
      id: 'FDA_003',
      name: 'Patient Safety Monitoring',
      category: 'FDA',
      description: 'Patient safety events must be monitored and reported',
      severity: 'HIGH',
      validate: (spec) => this.validatePatientSafetyMonitoring(spec),
      remediation: 'Implement adverse event reporting, safety signal detection, and automated alert systems.'
    });
  }

  /**
   * Add a compliance rule
   */
  public addRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a compliance rule
   */
  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get all rules by category
   */
  public getRulesByCategory(category: ComplianceRule['category']): ComplianceRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.category === category);
  }

  /**
   * Validate a specification against all rules
   */
  public async validateSpecification(spec: any, specId: string = 'unknown'): Promise<ValidationReport> {
    const results: ComplianceResult[] = [];
    const timestamp = new Date().toISOString();

    this.emit('validation:started', { specId, timestamp });

    // Run all rules
    for (const rule of this.rules.values()) {
      try {
        const result = rule.validate(spec);
        result.ruleId = rule.id;
        result.ruleName = rule.name;
        result.severity = rule.severity;
        result.remediation = rule.remediation;
        results.push(result);

        this.emit('rule:validated', { ruleId: rule.id, result });
      } catch (error) {
        // If rule validation fails, treat as critical failure
        results.push({
          passed: false,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: 'CRITICAL',
          message: `Rule validation failed: ${error.message}`,
          remediation: rule.remediation,
          details: error.stack
        });

        this.emit('rule:error', { ruleId: rule.id, error });
      }
    }

    // Generate summary
    const summary = this.generateSummary(results);
    const overallCompliance = summary.criticalFailures === 0;
    const recommendations = this.generateRecommendations(results);

    const report: ValidationReport = {
      timestamp,
      specId,
      overallCompliance,
      results,
      summary,
      recommendations
    };

    this.emit('validation:completed', { specId, report });

    return report;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(results: ComplianceResult[]) {
    const totalRules = results.length;
    const passedRules = results.filter(r => r.passed).length;
    const failedRules = totalRules - passedRules;
    const criticalFailures = results.filter(r => !r.passed && r.severity === 'CRITICAL').length;
    const highFailures = results.filter(r => !r.passed && r.severity === 'HIGH').length;
    const mediumFailures = results.filter(r => !r.passed && r.severity === 'MEDIUM').length;
    const lowFailures = results.filter(r => !r.passed && r.severity === 'LOW').length;

    return {
      totalRules,
      passedRules,
      failedRules,
      criticalFailures,
      highFailures,
      mediumFailures,
      lowFailures
    };
  }

  /**
   * Generate recommendations based on failures
   */
  private generateRecommendations(results: ComplianceResult[]): string[] {
    const recommendations: string[] = [];
    const failures = results.filter(r => !r.passed);

    if (failures.length === 0) {
      recommendations.push('Excellent! All compliance rules passed.');
      return recommendations;
    }

    // Critical failures
    const critical = failures.filter(r => r.severity === 'CRITICAL');
    if (critical.length > 0) {
      recommendations.push(`URGENT: ${critical.length} critical compliance failures must be addressed immediately before deployment.`);
    }

    // High severity failures
    const high = failures.filter(r => r.severity === 'HIGH');
    if (high.length > 0) {
      recommendations.push(`HIGH PRIORITY: ${high.length} high-severity issues should be resolved within 24 hours.`);
    }

    // Category-specific recommendations
    const hipaaFailures = failures.filter(r => r.ruleId.startsWith('HIPAA'));
    if (hipaaFailures.length > 0) {
      recommendations.push(`HIPAA Compliance: ${hipaaFailures.length} HIPAA violations found. Review privacy and security controls.`);
    }

    const fhirFailures = failures.filter(r => r.ruleId.startsWith('FHIR'));
    if (fhirFailures.length > 0) {
      recommendations.push(`FHIR Compliance: ${fhirFailures.length} FHIR R4 standard violations. Ensure medical data interoperability.`);
    }

    const owaspFailures = failures.filter(r => r.ruleId.startsWith('OWASP'));
    if (owaspFailures.length > 0) {
      recommendations.push(`Security: ${owaspFailures.length} OWASP Top 10 security issues found. Strengthen application security.`);
    }

    const fdaFailures = failures.filter(r => r.ruleId.startsWith('FDA'));
    if (fdaFailures.length > 0) {
      recommendations.push(`Patient Safety: ${fdaFailures.length} FDA pre-cert safety issues. Review clinical decision support systems.`);
    }

    return recommendations;
  }

  // Rule validation methods

  private validatePHIEncryption(spec: any): ComplianceResult {
    const hasEncryption = spec.security?.encryption?.enabled === true;
    const hasAES256 = spec.security?.encryption?.algorithm === 'AES-256';
    const encryptsPHI = spec.security?.encryption?.scope?.includes('PHI');

    const passed = hasEncryption && hasAES256 && encryptsPHI;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'CRITICAL',
      message: passed ? 'PHI encryption properly configured' : 'PHI encryption not properly configured',
      details: passed ? undefined : `Missing: ${!hasEncryption ? 'encryption enabled, ' : ''}${!hasAES256 ? 'AES-256 algorithm, ' : ''}${!encryptsPHI ? 'PHI scope' : ''}`,
      remediation: '',
      evidence: { hasEncryption, hasAES256, encryptsPHI }
    };
  }

  private validatePHITransmissionSecurity(spec: any): ComplianceResult {
    const hasTLS = spec.network?.tls?.enabled === true;
    const tlsVersion = spec.network?.tls?.version;
    const validTLS = tlsVersion === '1.2' || tlsVersion === '1.3';
    const httpsOnly = spec.network?.httpsOnly === true;

    const passed = hasTLS && validTLS && httpsOnly;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'CRITICAL',
      message: passed ? 'PHI transmission security properly configured' : 'PHI transmission security insufficient',
      details: passed ? undefined : `Issues: ${!hasTLS ? 'TLS not enabled, ' : ''}${!validTLS ? 'TLS version insufficient, ' : ''}${!httpsOnly ? 'HTTP allowed' : ''}`,
      remediation: ''
    };
  }

  private validateAccessControl(spec: any): ComplianceResult {
    const hasRBAC = spec.auth?.rbac?.enabled === true;
    const hasRoles = Array.isArray(spec.auth?.rbac?.roles) && spec.auth?.rbac?.roles.length > 0;
    const hasPermissions = spec.auth?.rbac?.permissions !== undefined;

    const passed = hasRBAC && hasRoles && hasPermissions;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'HIGH',
      message: passed ? 'Access control properly implemented' : 'Access control implementation insufficient',
      remediation: ''
    };
  }

  private validateAuditLogging(spec: any): ComplianceResult {
    const auditEnabled = spec.logging?.audit?.enabled === true;
    const tracksPHI = spec.logging?.audit?.tracksPHI === true;
    const hasRetention = spec.logging?.audit?.retention !== undefined;

    const passed = auditEnabled && tracksPHI && hasRetention;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'HIGH',
      message: passed ? 'Audit logging properly configured' : 'Audit logging insufficient',
      remediation: ''
    };
  }

  private validateDataRetention(spec: any): ComplianceResult {
    const hasPolicy = spec.dataRetention?.policy !== undefined;
    const hasSchedule = spec.dataRetention?.automatedDeletion === true;

    const passed = hasPolicy && hasSchedule;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'MEDIUM',
      message: passed ? 'Data retention policy properly configured' : 'Data retention policy missing or incomplete',
      remediation: ''
    };
  }

  private validateFHIRCompliance(spec: any): ComplianceResult {
    const usesFHIR = spec.standards?.fhir?.enabled === true;
    const fhirVersion = spec.standards?.fhir?.version;
    const validVersion = fhirVersion === 'R4';

    const passed = usesFHIR && validVersion;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'HIGH',
      message: passed ? 'FHIR R4 compliance configured' : 'FHIR R4 compliance missing',
      remediation: ''
    };
  }

  private validateFHIRSecurityLabels(spec: any): ComplianceResult {
    const hasSecurityLabels = spec.standards?.fhir?.securityLabels === true;

    return {
      passed: hasSecurityLabels,
      ruleId: '',
      ruleName: '',
      severity: 'MEDIUM',
      message: hasSecurityLabels ? 'FHIR security labels configured' : 'FHIR security labels missing',
      remediation: ''
    };
  }

  private validateFHIRConsent(spec: any): ComplianceResult {
    const hasConsentManagement = spec.standards?.fhir?.consentManagement === true;

    return {
      passed: hasConsentManagement,
      ruleId: '',
      ruleName: '',
      severity: 'HIGH',
      message: hasConsentManagement ? 'FHIR consent management configured' : 'FHIR consent management missing',
      remediation: ''
    };
  }

  private validateInjectionPrevention(spec: any): ComplianceResult {
    const hasInputValidation = spec.security?.inputValidation === true;
    const usesParameterizedQueries = spec.database?.parameterizedQueries === true;
    const hasWAF = spec.security?.waf?.enabled === true;

    const passed = hasInputValidation && usesParameterizedQueries;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'CRITICAL',
      message: passed ? 'Injection prevention controls implemented' : 'Injection prevention insufficient',
      remediation: ''
    };
  }

  private validateAuthentication(spec: any): ComplianceResult {
    const hasMFA = spec.auth?.mfa?.enabled === true;
    const hasPasswordPolicy = spec.auth?.passwordPolicy !== undefined;
    const hasSessionSecurity = spec.auth?.session?.security === true;

    const passed = hasMFA && hasPasswordPolicy && hasSessionSecurity;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'CRITICAL',
      message: passed ? 'Authentication controls properly implemented' : 'Authentication controls insufficient',
      remediation: ''
    };
  }

  private validateSensitiveDataProtection(spec: any): ComplianceResult {
    const hasDataClassification = spec.data?.classification !== undefined;
    const hasEncryption = spec.security?.encryption?.enabled === true;
    const hasDLP = spec.security?.dlp?.enabled === true;

    const passed = hasDataClassification && hasEncryption;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'CRITICAL',
      message: passed ? 'Sensitive data protection implemented' : 'Sensitive data protection insufficient',
      remediation: ''
    };
  }

  private validateSecurityConfiguration(spec: any): ComplianceResult {
    const hasSecurityHeaders = spec.security?.headers?.enabled === true;
    const hasSecureDefaults = spec.security?.secureDefaults === true;
    const disablesDebug = spec.environment?.debug === false;

    const passed = hasSecurityHeaders && hasSecureDefaults;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'HIGH',
      message: passed ? 'Security configuration hardened' : 'Security configuration needs hardening',
      remediation: ''
    };
  }

  private validateClinicalDecisionSafety(spec: any): ComplianceResult {
    const hasHumanOversight = spec.ai?.humanOversight === true;
    const hasConfidenceThresholds = spec.ai?.confidenceThresholds !== undefined;
    const hasFailsafes = spec.ai?.failsafeMechanisms === true;

    const passed = hasHumanOversight && hasConfidenceThresholds && hasFailsafes;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'CRITICAL',
      message: passed ? 'Clinical decision support safety controls implemented' : 'Clinical decision support safety controls missing',
      remediation: ''
    };
  }

  private validateMedicalDeviceSafety(spec: any): ComplianceResult {
    const hasDeviceAuth = spec.devices?.authentication === true;
    const hasDataValidation = spec.devices?.dataValidation === true;
    const hasErrorHandling = spec.devices?.errorHandling === true;

    const passed = hasDeviceAuth && hasDataValidation && hasErrorHandling;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'HIGH',
      message: passed ? 'Medical device integration safety implemented' : 'Medical device integration safety insufficient',
      remediation: ''
    };
  }

  private validatePatientSafetyMonitoring(spec: any): ComplianceResult {
    const hasAdverseEventReporting = spec.safety?.adverseEventReporting === true;
    const hasAlertSystem = spec.safety?.alertSystem === true;
    const hasMonitoring = spec.safety?.continuousMonitoring === true;

    const passed = hasAdverseEventReporting && hasAlertSystem && hasMonitoring;

    return {
      passed,
      ruleId: '',
      ruleName: '',
      severity: 'HIGH',
      message: passed ? 'Patient safety monitoring implemented' : 'Patient safety monitoring insufficient',
      remediation: ''
    };
  }

  /**
   * Export validation report to JSON
   */
  public exportReport(report: ValidationReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export validation report to human-readable format
   */
  public exportReportHuman(report: ValidationReport): string {
    const { timestamp, specId, overallCompliance, results, summary, recommendations } = report;
    
    let output = `Medical Compliance Validation Report\n`;
    output += `==========================================\n\n`;
    output += `Specification ID: ${specId}\n`;
    output += `Timestamp: ${timestamp}\n`;
    output += `Overall Compliance: ${overallCompliance ? 'PASS' : 'FAIL'}\n\n`;
    
    output += `Summary:\n`;
    output += `- Total Rules: ${summary.totalRules}\n`;
    output += `- Passed: ${summary.passedRules}\n`;
    output += `- Failed: ${summary.failedRules}\n`;
    output += `- Critical Failures: ${summary.criticalFailures}\n`;
    output += `- High Failures: ${summary.highFailures}\n`;
    output += `- Medium Failures: ${summary.mediumFailures}\n`;
    output += `- Low Failures: ${summary.lowFailures}\n\n`;

    if (results.filter(r => !r.passed).length > 0) {
      output += `Failed Rules:\n`;
      output += `=============\n`;
      results.filter(r => !r.passed).forEach(result => {
        output += `\n[${result.severity}] ${result.ruleId}: ${result.ruleName}\n`;
        output += `Message: ${result.message}\n`;
        if (result.details) {
          output += `Details: ${result.details}\n`;
        }
        output += `Remediation: ${result.remediation}\n`;
      });
    }

    if (recommendations.length > 0) {
      output += `\nRecommendations:\n`;
      output += `================\n`;
      recommendations.forEach((rec, index) => {
        output += `${index + 1}. ${rec}\n`;
      });
    }

    return output;
  }
}

// Export default instance
export const medicalComplianceValidator = new MedicalComplianceValidator();
export default medicalComplianceValidator;
