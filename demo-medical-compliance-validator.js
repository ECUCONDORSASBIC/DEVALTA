#!/usr/bin/env node
/**
 * Demo: MedicalComplianceValidator replacing PhilosophicalCore
 * 
 * This script demonstrates the new deterministic rule-based validation system
 * that replaces the score-based simulation approach.
 */

const { MedicalComplianceValidator } = require('./packages/medical-security/src/MedicalComplianceValidator.ts');

// Sample specification that should pass all rules
const compliantSpec = {
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256',
      scope: ['PHI']
    },
    headers: { enabled: true },
    secureDefaults: true,
    inputValidation: true
  },
  network: {
    tls: { enabled: true, version: '1.2' },
    httpsOnly: true
  },
  auth: {
    rbac: {
      enabled: true,
      roles: ['patient', 'doctor', 'nurse', 'admin'],
      permissions: { read: true, write: true }
    },
    mfa: { enabled: true },
    passwordPolicy: { minLength: 8 },
    session: { security: true }
  },
  logging: {
    audit: {
      enabled: true,
      tracksPHI: true,
      retention: '6y'
    }
  },
  standards: {
    fhir: {
      enabled: true,
      version: 'R4',
      securityLabels: true,
      consentManagement: true
    }
  },
  dataRetention: {
    policy: '7y',
    automatedDeletion: true
  },
  database: {
    parameterizedQueries: true
  },
  data: {
    classification: 'PHI'
  },
  ai: {
    humanOversight: true,
    confidenceThresholds: { low: 0.3, high: 0.8 },
    failsafeMechanisms: true
  },
  devices: {
    authentication: true,
    dataValidation: true,
    errorHandling: true
  },
  safety: {
    adverseEventReporting: true,
    alertSystem: true,
    continuousMonitoring: true
  },
  environment: {
    debug: false
  }
};

// Sample specification with security gaps
const nonCompliantSpec = {
  security: {
    encryption: { enabled: false }, // CRITICAL FAILURE
    headers: { enabled: false }
  },
  network: {
    httpsOnly: false // CRITICAL FAILURE
  },
  auth: {
    mfa: { enabled: false }, // CRITICAL FAILURE
    rbac: { enabled: false }
  },
  logging: {
    audit: { enabled: false }
  },
  standards: {
    fhir: { enabled: false }
  }
};

async function demonstrateComplianceValidation() {
  console.log('🏥 Medical Compliance Validator Demo');
  console.log('=====================================\n');

  const validator = new MedicalComplianceValidator();

  console.log('📋 Available Rule Categories:');
  console.log('- HIPAA: Privacy and security rules for healthcare data');
  console.log('- FHIR: HL7 FHIR R4 interoperability standards');
  console.log('- OWASP: Top 10 security vulnerabilities');
  console.log('- FDA: Pre-certification safety rules for medical software\n');

  // Test compliant specification
  console.log('✅ Testing Compliant Specification...');
  console.log('=====================================');
  
  const compliantReport = await validator.validateSpecification(compliantSpec, 'compliant-system-v1');
  
  console.log(`Overall Compliance: ${compliantReport.overallCompliance ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`Total Rules: ${compliantReport.summary.totalRules}`);
  console.log(`Passed: ${compliantReport.summary.passedRules}`);
  console.log(`Failed: ${compliantReport.summary.failedRules}`);
  console.log(`Critical Failures: ${compliantReport.summary.criticalFailures}`);
  
  if (compliantReport.results.filter(r => !r.passed).length > 0) {
    console.log('\nFailed Rules:');
    compliantReport.results.filter(r => !r.passed).forEach(result => {
      console.log(`  [${result.severity}] ${result.ruleId}: ${result.message}`);
    });
  }
  
  console.log('\nRecommendations:');
  compliantReport.recommendations.forEach(rec => {
    console.log(`  - ${rec}`);
  });

  console.log('\n');

  // Test non-compliant specification
  console.log('❌ Testing Non-Compliant Specification...');
  console.log('=========================================');
  
  const nonCompliantReport = await validator.validateSpecification(nonCompliantSpec, 'insecure-system-v1');
  
  console.log(`Overall Compliance: ${nonCompliantReport.overallCompliance ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`Total Rules: ${nonCompliantReport.summary.totalRules}`);
  console.log(`Passed: ${nonCompliantReport.summary.passedRules}`);
  console.log(`Failed: ${nonCompliantReport.summary.failedRules}`);
  console.log(`Critical Failures: ${nonCompliantReport.summary.criticalFailures}`);
  console.log(`High Failures: ${nonCompliantReport.summary.highFailures}`);
  
  if (nonCompliantReport.results.filter(r => !r.passed).length > 0) {
    console.log('\nFailed Rules:');
    nonCompliantReport.results.filter(r => !r.passed).slice(0, 5).forEach(result => {
      console.log(`  [${result.severity}] ${result.ruleId}: ${result.message}`);
      console.log(`    Remediation: ${result.remediation}`);
    });
    
    if (nonCompliantReport.results.filter(r => !r.passed).length > 5) {
      console.log(`  ... and ${nonCompliantReport.results.filter(r => !r.passed).length - 5} more failures`);
    }
  }
  
  console.log('\nRecommendations:');
  nonCompliantReport.recommendations.forEach(rec => {
    console.log(`  - ${rec}`);
  });

  console.log('\n');

  // Demonstrate rule categories
  console.log('📊 Rules by Category:');
  console.log('====================');
  
  const categories = ['HIPAA', 'FHIR', 'OWASP', 'FDA'];
  categories.forEach(category => {
    const rules = validator.getRulesByCategory(category);
    console.log(`\n${category} Rules (${rules.length}):`);
    rules.forEach(rule => {
      console.log(`  - ${rule.id}: ${rule.name} [${rule.severity}]`);
    });
  });

  console.log('\n');

  // Export reports
  console.log('📄 Exporting Reports...');
  console.log('========================');
  
  const fs = require('fs').promises;
  
  // Export JSON report
  await fs.writeFile(
    'compliance-report-compliant.json', 
    validator.exportReport(compliantReport)
  );
  
  await fs.writeFile(
    'compliance-report-non-compliant.json', 
    validator.exportReport(nonCompliantReport)
  );
  
  // Export human-readable report
  await fs.writeFile(
    'compliance-report-compliant.txt', 
    validator.exportReportHuman(compliantReport)
  );
  
  await fs.writeFile(
    'compliance-report-non-compliant.txt', 
    validator.exportReportHuman(nonCompliantReport)
  );
  
  console.log('✅ Reports exported:');
  console.log('  - compliance-report-compliant.json');
  console.log('  - compliance-report-non-compliant.json');
  console.log('  - compliance-report-compliant.txt');
  console.log('  - compliance-report-non-compliant.txt');

  console.log('\n🎉 Demo completed successfully!');
  console.log('\nKey Benefits of MedicalComplianceValidator:');
  console.log('  ✅ Deterministic pass/fail results (no more scoring)');
  console.log('  ✅ Rule-based validation with specific remediation');
  console.log('  ✅ HIPAA, FHIR R4, OWASP, and FDA compliance rules');
  console.log('  ✅ Structured reporting with severity levels');
  console.log('  ✅ Extensible rule system for custom requirements');
}

// Handle events from the validator
function setupEventHandlers(validator) {
  validator.on('validation:started', ({ specId, timestamp }) => {
    console.log(`🔍 Validation started for ${specId} at ${timestamp}`);
  });

  validator.on('validation:completed', ({ specId, report }) => {
    console.log(`✅ Validation completed for ${specId}: ${report.overallCompliance ? 'PASS' : 'FAIL'}`);
  });

  validator.on('rule:error', ({ ruleId, error }) => {
    console.error(`❌ Rule ${ruleId} failed: ${error.message}`);
  });
}

if (require.main === module) {
  demonstrateComplianceValidation().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

module.exports = {
  demonstrateComplianceValidation,
  compliantSpec,
  nonCompliantSpec
};
