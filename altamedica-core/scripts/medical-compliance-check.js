#!/usr/bin/env node
// Script de Verificación de Compliance Médico HIPAA - Altamedica
// Verifica que el código cumple con regulaciones médicas y de privacidad

const fs = require('fs').promises
const path = require('path')

class MedicalComplianceChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overallCompliance: true,
      checks: {},
      violations: [],
      recommendations: [],
      summary: {}
    }
    
    // Patrones críticos para detectar en el código
    this.patterns = {
      // Datos PHI (Protected Health Information)
      phi_exposure: [
        /console\.log\([^)]*patient/i,
        /console\.log\([^)]*medical/i,
        /console\.warn\([^)]*patient/i,
        /alert\([^)]*patient/i,
        /localStorage\.setItem\([^)]*patient/i,
        /sessionStorage\.setItem\([^)]*patient/i
      ],
      
      // Encriptación requerida
      encryption_required: [
        /password\s*:\s*[^,}]+(?!encrypt|hash|bcrypt)/i,
        /ssn\s*:\s*[^,}]+(?!encrypt)/i,
        /medicalId\s*:\s*[^,}]+(?!encrypt)/i
      ],
      
      // Logging de auditoría requerido
      audit_logging: [
        /delete.*patient/i,
        /update.*patient/i,
        /access.*medical.*record/i
      ],
      
      // URLs inseguras
      insecure_urls: [
        /http:\/\/[^/]*medical/i,
        /http:\/\/[^/]*patient/i,
        /http:\/\/[^/]*health/i
      ],
      
      // APIs sin autenticación
      unauth_api: [
        /fetch\([^)]*\/api\/patient[^)]*\)/i,
        /axios\.[get|post|put|delete]+\([^)]*\/api\/medical[^)]*\)/i
      ]
    }
  }

  async runCompleteCheck() {
    console.log('🏥 Iniciando verificación de compliance médico HIPAA...\n')
    
    await this.checkPHIExposure()
    await this.checkEncryption()
    await this.checkAuditLogging()
    await this.checkAccessControls()
    await this.checkDataRetention()
    await this.checkSecureCommunication()
    await this.checkUserConsent()
    await this.checkBusinessAssociateAgreements()
    await this.checkIncidentResponse()
    await this.checkDataMinimization()
    
    this.generateSummary()
    await this.generateReport()
  }

  async checkPHIExposure() {
    console.log('🔍 Verificando exposición de PHI...')
    
    const check = {
      name: 'PHI Exposure Prevention',
      description: 'Verifica que no se expongan datos médicos sensibles',
      passed: true,
      violations: [],
      critical: true
    }
    
    try {
      const sourceFiles = await this.getAllSourceFiles()
      
      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        const fileName = path.relative(process.cwd(), filePath)
        
        // Verificar patrones de exposición PHI
        this.patterns.phi_exposure.forEach((pattern, index) => {
          const matches = content.match(pattern)
          if (matches) {
            check.violations.push({
              file: fileName,
              line: this.getLineNumber(content, matches[0]),
              pattern: `PHI_EXPOSURE_${index + 1}`,
              code: matches[0],
              severity: 'CRITICAL',
              message: 'Posible exposición de datos médicos sensibles en logs o outputs'
            })
            check.passed = false
          }
        })
        
        // Verificar localStorage/sessionStorage con datos médicos
        const storagePatterns = [
          /localStorage\.setItem\([^)]*patient/gi,
          /sessionStorage\.setItem\([^)]*medical/gi
        ]
        
        storagePatterns.forEach(pattern => {
          const matches = [...content.matchAll(pattern)]
          matches.forEach(match => {
            check.violations.push({
              file: fileName,
              line: this.getLineNumber(content, match[0]),
              pattern: 'INSECURE_STORAGE',
              code: match[0],
              severity: 'CRITICAL',
              message: 'Almacenamiento inseguro de datos médicos en browser storage'
            })
            check.passed = false
          })
        })
      }
      
      this.results.checks.phiExposure = check
      console.log(`   ${check.passed ? '✅' : '❌'} PHI Exposure: ${check.violations.length} violations`)
      
    } catch (error) {
      console.error('❌ Error verificando PHI exposure:', error.message)
      check.passed = false
      this.results.checks.phiExposure = check
    }
  }

  async checkEncryption() {
    console.log('🔐 Verificando implementación de encriptación...')
    
    const check = {
      name: 'Data Encryption',
      description: 'Verifica que los datos sensibles estén encriptados',
      passed: true,
      violations: [],
      critical: true
    }
    
    try {
      const sourceFiles = await this.getAllSourceFiles()
      const hasEncryptionImplementation = await this.hasEncryptionLibrary()
      
      if (!hasEncryptionImplementation) {
        check.violations.push({
          file: 'package.json',
          pattern: 'MISSING_ENCRYPTION_LIB',
          severity: 'CRITICAL',
          message: 'No se encontró biblioteca de encriptación (crypto-js, bcryptjs, etc.)'
        })
        check.passed = false
      }
      
      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        const fileName = path.relative(process.cwd(), filePath)
        
        // Verificar campos sensibles sin encriptación
        this.patterns.encryption_required.forEach((pattern, index) => {
          const matches = content.match(pattern)
          if (matches) {
            check.violations.push({
              file: fileName,
              line: this.getLineNumber(content, matches[0]),
              pattern: `UNENCRYPTED_SENSITIVE_DATA_${index + 1}`,
              code: matches[0],
              severity: 'HIGH',
              message: 'Campo sensible posiblemente sin encriptación'
            })
            check.passed = false
          }
        })
      }
      
      this.results.checks.encryption = check
      console.log(`   ${check.passed ? '✅' : '❌'} Encryption: ${check.violations.length} violations`)
      
    } catch (error) {
      console.error('❌ Error verificando encriptación:', error.message)
      check.passed = false
      this.results.checks.encryption = check
    }
  }

  async checkAuditLogging() {
    console.log('📋 Verificando logging de auditoría...')
    
    const check = {
      name: 'Audit Logging',
      description: 'Verifica que las acciones críticas tengan logging de auditoría',
      passed: true,
      violations: [],
      critical: true
    }
    
    try {
      const sourceFiles = await this.getAllSourceFiles()
      const hasAuditImplementation = await this.hasAuditLogging()
      
      if (!hasAuditImplementation) {
        check.violations.push({
          file: 'src/',
          pattern: 'MISSING_AUDIT_SYSTEM',
          severity: 'CRITICAL',
          message: 'No se encontró implementación de sistema de auditoría'
        })
        check.passed = false
      }
      
      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        const fileName = path.relative(process.cwd(), filePath)
        
        // Verificar operaciones críticas sin audit
        const criticalOperations = [
          /\.delete\([^)]*patient/gi,
          /\.update\([^)]*patient/gi,
          /\.create\([^)]*patient/gi
        ]
        
        criticalOperations.forEach((pattern, index) => {
          const matches = [...content.matchAll(pattern)]
          matches.forEach(match => {
            // Verificar si hay audit logging cerca
            const contextStart = Math.max(0, match.index - 500)
            const contextEnd = Math.min(content.length, match.index + 500)
            const context = content.substring(contextStart, contextEnd)
            
            if (!/audit|log.*hipaa|registrar.*evento/i.test(context)) {
              check.violations.push({
                file: fileName,
                line: this.getLineNumber(content, match[0]),
                pattern: `MISSING_AUDIT_${index + 1}`,
                code: match[0],
                severity: 'HIGH',
                message: 'Operación crítica sin logging de auditoría'
              })
              check.passed = false
            }
          })
        })
      }
      
      this.results.checks.auditLogging = check
      console.log(`   ${check.passed ? '✅' : '❌'} Audit Logging: ${check.violations.length} violations`)
      
    } catch (error) {
      console.error('❌ Error verificando audit logging:', error.message)
      check.passed = false
      this.results.checks.auditLogging = check
    }
  }

  async checkAccessControls() {
    console.log('🔒 Verificando controles de acceso...')
    
    const check = {
      name: 'Access Controls',
      description: 'Verifica implementación de controles de acceso apropiados',
      passed: true,
      violations: [],
      critical: true
    }
    
    try {
      // Verificar middleware de autenticación
      const hasAuthMiddleware = await this.hasAuthenticationMiddleware()
      if (!hasAuthMiddleware) {
        check.violations.push({
          file: 'middleware/',
          pattern: 'MISSING_AUTH_MIDDLEWARE',
          severity: 'CRITICAL',
          message: 'No se encontró middleware de autenticación'
        })
        check.passed = false
      }
      
      // Verificar protección de rutas API
      const apiFiles = await this.getAPIFiles()
      for (const filePath of apiFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        const fileName = path.relative(process.cwd(), filePath)
        
        // Verificar si las rutas médicas tienen protección
        if (/\/api\/(patient|medical|cita)/i.test(fileName)) {
          if (!/auth|verify|token|session/i.test(content)) {
            check.violations.push({
              file: fileName,
              pattern: 'UNPROTECTED_MEDICAL_API',
              severity: 'CRITICAL',
              message: 'API médica sin protección de autenticación aparente'
            })
            check.passed = false
          }
        }
      }
      
      this.results.checks.accessControls = check
      console.log(`   ${check.passed ? '✅' : '❌'} Access Controls: ${check.violations.length} violations`)
      
    } catch (error) {
      console.error('❌ Error verificando controles de acceso:', error.message)
      check.passed = false
      this.results.checks.accessControls = check
    }
  }

  async checkDataRetention() {
    console.log('📅 Verificando políticas de retención de datos...')
    
    const check = {
      name: 'Data Retention',
      description: 'Verifica implementación de políticas de retención de datos',
      passed: true,
      violations: [],
      critical: false
    }
    
    try {
      const sourceFiles = await this.getAllSourceFiles()
      let hasRetentionPolicy = false
      
      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        
        if (/retention|expire|cleanup|purge.*data/i.test(content)) {
          hasRetentionPolicy = true
          break
        }
      }
      
      if (!hasRetentionPolicy) {
        check.violations.push({
          file: 'src/',
          pattern: 'MISSING_RETENTION_POLICY',
          severity: 'MEDIUM',
          message: 'No se encontró implementación de políticas de retención de datos'
        })
        check.passed = false
      }
      
      this.results.checks.dataRetention = check
      console.log(`   ${check.passed ? '✅' : '❌'} Data Retention: ${check.violations.length} violations`)
      
    } catch (error) {
      console.error('❌ Error verificando retención de datos:', error.message)
      check.passed = false
      this.results.checks.dataRetention = check
    }
  }

  async checkSecureCommunication() {
    console.log('🔐 Verificando comunicación segura...')
    
    const check = {
      name: 'Secure Communication',
      description: 'Verifica que todas las comunicaciones usen HTTPS/TLS',
      passed: true,
      violations: [],
      critical: true
    }
    
    try {
      const sourceFiles = await this.getAllSourceFiles()
      
      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        const fileName = path.relative(process.cwd(), filePath)
        
        // Verificar URLs inseguras
        this.patterns.insecure_urls.forEach((pattern, index) => {
          const matches = [...content.matchAll(pattern)]
          matches.forEach(match => {
            check.violations.push({
              file: fileName,
              line: this.getLineNumber(content, match[0]),
              pattern: `INSECURE_URL_${index + 1}`,
              code: match[0],
              severity: 'HIGH',
              message: 'URL insegura (HTTP) para datos médicos'
            })
            check.passed = false
          })
        })
      }
      
      this.results.checks.secureCommunication = check
      console.log(`   ${check.passed ? '✅' : '❌'} Secure Communication: ${check.violations.length} violations`)
      
    } catch (error) {
      console.error('❌ Error verificando comunicación segura:', error.message)
      check.passed = false
      this.results.checks.secureCommunication = check
    }
  }

  async checkUserConsent() {
    console.log('✋ Verificando gestión de consentimiento...')
    
    const check = {
      name: 'User Consent',
      description: 'Verifica implementación de gestión de consentimiento de usuario',
      passed: false,
      violations: [],
      critical: true
    }
    
    try {
      const sourceFiles = await this.getAllSourceFiles()
      
      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        
        if (/consent|consentimiento|acepta.*terminos|privacy.*policy/i.test(content)) {
          check.passed = true
          break
        }
      }
      
      if (!check.passed) {
        check.violations.push({
          file: 'src/',
          pattern: 'MISSING_CONSENT_MANAGEMENT',
          severity: 'CRITICAL',
          message: 'No se encontró implementación de gestión de consentimiento'
        })
      }
      
      this.results.checks.userConsent = check
      console.log(`   ${check.passed ? '✅' : '❌'} User Consent: ${check.violations.length} violations`)
      
    } catch (error) {
      console.error('❌ Error verificando consentimiento:', error.message)
      check.passed = false
      this.results.checks.userConsent = check
    }
  }

  async checkBusinessAssociateAgreements() {
    console.log('🤝 Verificando acuerdos de socios comerciales...')
    
    const check = {
      name: 'Business Associate Agreements',
      description: 'Verifica documentación de acuerdos con terceros',
      passed: true,
      violations: [],
      critical: false
    }
    
    // Este check es más documental que técnico
    const docFiles = ['README.md', 'COMPLIANCE.md', 'docs/']
    let hasBAADocumentation = false
    
    for (const docFile of docFiles) {
      try {
        const filePath = path.join(process.cwd(), docFile)
        const stats = await fs.stat(filePath)
        if (stats.isFile()) {
          const content = await fs.readFile(filePath, 'utf8')
          if (/business.*associate|baa|third.*party.*agreement/i.test(content)) {
            hasBAADocumentation = true
            break
          }
        }
      } catch {
        // Archivo no existe, continuar
      }
    }
    
    if (!hasBAADocumentation) {
      check.violations.push({
        file: 'docs/',
        pattern: 'MISSING_BAA_DOCS',
        severity: 'LOW',
        message: 'No se encontró documentación de acuerdos con socios comerciales'
      })
      check.passed = false
    }
    
    this.results.checks.businessAssociateAgreements = check
    console.log(`   ${check.passed ? '✅' : '❌'} BAA Documentation: ${check.violations.length} violations`)
  }

  async checkIncidentResponse() {
    console.log('🚨 Verificando plan de respuesta a incidentes...')
    
    const check = {
      name: 'Incident Response',
      description: 'Verifica implementación de plan de respuesta a incidentes',
      passed: false,
      violations: [],
      critical: false
    }
    
    try {
      const sourceFiles = await this.getAllSourceFiles()
      
      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        
        if (/incident|breach.*detection|security.*alert|error.*reporting/i.test(content)) {
          check.passed = true
          break
        }
      }
      
      if (!check.passed) {
        check.violations.push({
          file: 'src/',
          pattern: 'MISSING_INCIDENT_RESPONSE',
          severity: 'MEDIUM',
          message: 'No se encontró implementación de respuesta a incidentes'
        })
      }
      
      this.results.checks.incidentResponse = check
      console.log(`   ${check.passed ? '✅' : '❌'} Incident Response: ${check.violations.length} violations`)
      
    } catch (error) {
      console.error('❌ Error verificando respuesta a incidentes:', error.message)
      check.passed = false
      this.results.checks.incidentResponse = check
    }
  }

  async checkDataMinimization() {
    console.log('📉 Verificando minimización de datos...')
    
    const check = {
      name: 'Data Minimization',
      description: 'Verifica principios de minimización de datos',
      passed: true,
      violations: [],
      critical: false
    }
    
    try {
      const sourceFiles = await this.getAllSourceFiles()
      
      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8')
        const fileName = path.relative(process.cwd(), filePath)
        
        // Buscar posibles recolecciones excesivas de datos
        const excessiveDataPatterns = [
          /select \* from.*patient/gi,
          /\.find\(\)\.populate\(/gi,
          /\.findAll\(\)/gi
        ]
        
        excessiveDataPatterns.forEach((pattern, index) => {
          const matches = [...content.matchAll(pattern)]
          matches.forEach(match => {
            check.violations.push({
              file: fileName,
              line: this.getLineNumber(content, match[0]),
              pattern: `POTENTIAL_EXCESSIVE_DATA_${index + 1}`,
              code: match[0],
              severity: 'LOW',
              message: 'Posible recolección excesiva de datos - revisar si es necesario'
            })
            // No marcar como failed para violaciones LOW
          })
        })
      }
      
      this.results.checks.dataMinimization = check
      console.log(`   ${check.passed ? '✅' : '⚠️ '} Data Minimization: ${check.violations.length} warnings`)
      
    } catch (error) {
      console.error('❌ Error verificando minimización de datos:', error.message)
      check.passed = false
      this.results.checks.dataMinimization = check
    }
  }

  generateSummary() {
    const checks = Object.values(this.results.checks)
    const totalChecks = checks.length
    const passedChecks = checks.filter(c => c.passed).length
    const criticalFailures = checks.filter(c => !c.passed && c.critical).length
    const totalViolations = checks.reduce((sum, c) => sum + c.violations.length, 0)
    
    this.results.overallCompliance = criticalFailures === 0
    this.results.summary = {
      totalChecks,
      passedChecks,
      failedChecks: totalChecks - passedChecks,
      criticalFailures,
      totalViolations,
      compliancePercentage: Math.round((passedChecks / totalChecks) * 100)
    }
    
    // Generar recomendaciones
    if (criticalFailures > 0) {
      this.results.recommendations.push({
        priority: 'CRITICAL',
        title: 'Resolver fallas críticas de compliance',
        description: `Se encontraron ${criticalFailures} fallas críticas que deben resolverse inmediatamente`
      })
    }
    
    if (this.results.summary.compliancePercentage < 90) {
      this.results.recommendations.push({
        priority: 'HIGH',
        title: 'Mejorar nivel general de compliance',
        description: `Compliance actual: ${this.results.summary.compliancePercentage}%. Objetivo: >90%`
      })
    }
  }

  async generateReport() {
    console.log('\n📝 Generando reporte de compliance...')
    
    const reportPath = path.join(process.cwd(), 'medical-compliance-report.json')
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2))
    
    const markdownReport = this.generateMarkdownReport()
    const markdownPath = path.join(process.cwd(), 'medical-compliance-report.md')
    await fs.writeFile(markdownPath, markdownReport)
    
    console.log('✅ Reportes de compliance generados:')
    console.log(`   📄 JSON: ${reportPath}`)
    console.log(`   📄 Markdown: ${markdownPath}`)
    
    this.printSummary()
  }

  generateMarkdownReport() {
    const { checks, summary, recommendations } = this.results
    
    return `# 🏥 Reporte de Compliance Médico HIPAA - Altamedica

## 📊 Resumen Ejecutivo

- **Compliance General:** ${this.results.overallCompliance ? '✅ APROBADO' : '❌ REQUIERE ATENCIÓN'}
- **Porcentaje de Compliance:** ${summary.compliancePercentage}%
- **Checks Totales:** ${summary.totalChecks}
- **Checks Aprobados:** ${summary.passedChecks}
- **Fallas Críticas:** ${summary.criticalFailures}
- **Total de Violaciones:** ${summary.totalViolations}

## 🔍 Resultados Detallados

${Object.entries(checks).map(([key, check]) => `
### ${check.passed ? '✅' : '❌'} ${check.name} ${check.critical ? '(CRÍTICO)' : ''}
**Descripción:** ${check.description}
**Estado:** ${check.passed ? 'APROBADO' : 'FALLO'}
**Violaciones:** ${check.violations.length}

${check.violations.map((v, i) => `
#### Violación ${i + 1} - ${v.severity}
- **Archivo:** ${v.file}
- **Línea:** ${v.line || 'N/A'}
- **Patrón:** ${v.pattern}
- **Mensaje:** ${v.message}
${v.code ? `- **Código:** \`${v.code}\`` : ''}
`).join('')}
`).join('')}

## 💡 Recomendaciones

${recommendations.map((rec, i) => `
### ${i + 1}. ${rec.title} (${rec.priority})
${rec.description}
`).join('')}

## 📋 Checklist de Compliance HIPAA

- [${checks.phiExposure?.passed ? 'x' : ' '}] Prevención de exposición de PHI
- [${checks.encryption?.passed ? 'x' : ' '}] Encriptación de datos sensibles  
- [${checks.auditLogging?.passed ? 'x' : ' '}] Logging de auditoría
- [${checks.accessControls?.passed ? 'x' : ' '}] Controles de acceso
- [${checks.dataRetention?.passed ? 'x' : ' '}] Políticas de retención
- [${checks.secureCommunication?.passed ? 'x' : ' '}] Comunicación segura
- [${checks.userConsent?.passed ? 'x' : ' '}] Gestión de consentimiento
- [${checks.businessAssociateAgreements?.passed ? 'x' : ' '}] Acuerdos BAA
- [${checks.incidentResponse?.passed ? 'x' : ' '}] Respuesta a incidentes
- [${checks.dataMinimization?.passed ? 'x' : ' '}] Minimización de datos

---
*Reporte generado el ${this.results.timestamp}*`
  }

  printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('🏥 RESUMEN DE COMPLIANCE MÉDICO HIPAA')
    console.log('='.repeat(60))
    
    const { summary } = this.results
    
    console.log(`\n📊 Compliance General: ${this.results.overallCompliance ? '✅ APROBADO' : '❌ FALLO'}`)
    console.log(`📈 Porcentaje: ${summary.compliancePercentage}%`)
    console.log(`📋 Checks: ${summary.passedChecks}/${summary.totalChecks} aprobados`)
    console.log(`🚨 Fallas Críticas: ${summary.criticalFailures}`)
    console.log(`⚠️  Total Violaciones: ${summary.totalViolations}`)
    
    if (summary.criticalFailures > 0) {
      console.log('\n🚨 FALLAS CRÍTICAS:')
      Object.values(this.results.checks).forEach(check => {
        if (!check.passed && check.critical) {
          console.log(`   ❌ ${check.name}: ${check.violations.length} violaciones`)
        }
      })
    }
    
    console.log('\n' + '='.repeat(60))
  }

  // Métodos auxiliares
  async getAllSourceFiles() {
    const srcDir = path.join(process.cwd(), 'src')
    return await this.getFilesRecursively(srcDir, ['.ts', '.tsx', '.js', '.jsx'])
  }

  async getAPIFiles() {
    const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
    try {
      return await this.getFilesRecursively(apiDir, ['.ts', '.js'])
    } catch {
      return []
    }
  }

  async getFilesRecursively(dir, extensions) {
    const files = []
    try {
      const items = await fs.readdir(dir, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name)
        if (item.isDirectory()) {
          files.push(...await this.getFilesRecursively(fullPath, extensions))
        } else if (extensions.some(ext => item.name.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    } catch {
      // Directorio no existe
    }
    
    return files
  }

  async hasEncryptionLibrary() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json')
      const packageContent = await fs.readFile(packagePath, 'utf8')
      const packageJson = JSON.parse(packageContent)
      
      const encryptionLibs = ['crypto-js', 'bcryptjs', 'node-forge', 'crypto']
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      
      return encryptionLibs.some(lib => allDeps[lib])
    } catch {
      return false
    }
  }

  async hasAuditLogging() {
    const sourceFiles = await this.getAllSourceFiles()
    
    for (const filePath of sourceFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8')
        if (/audit|hipaa.*log|registrar.*evento/i.test(content)) {
          return true
        }
      } catch {
        continue
      }
    }
    
    return false
  }

  async hasAuthenticationMiddleware() {
    try {
      const middlewareDir = path.join(process.cwd(), 'src', 'middleware')
      const files = await this.getFilesRecursively(middlewareDir, ['.ts', '.js'])
      
      for (const filePath of files) {
        const content = await fs.readFile(filePath, 'utf8')
        if (/auth|verify|token|session/i.test(content)) {
          return true
        }
      }
    } catch {
      // Directorio middleware no existe
    }
    
    return false
  }

  getLineNumber(content, searchString) {
    const index = content.indexOf(searchString)
    if (index === -1) return 'N/A'
    
    const lines = content.substring(0, index).split('\n')
    return lines.length
  }
}

// Ejecutar verificación
async function main() {
  const checker = new MedicalComplianceChecker()
  
  try {
    await checker.runCompleteCheck()
    
    // Exit code basado en compliance
    if (!checker.results.overallCompliance) {
      console.log('\n⚠️  Compliance check failed - se encontraron fallas críticas')
      process.exit(1)
    } else {
      console.log('\n🎉 Compliance check passed!')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('\n❌ Error durante verificación de compliance:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = MedicalComplianceChecker