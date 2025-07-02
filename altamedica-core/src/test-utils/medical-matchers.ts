// Custom matchers para testing médico - Altamedica
// Matchers específicos para compliance HIPAA y funcionalidad médica

import { expect } from '@jest/globals'

// Matcher para verificar compliance HIPAA en componentes
function toBeHIPAACompliant(received) {
  const pass = this.isNot
    ? !isHIPAACompliant(received)
    : isHIPAACompliant(received)

  if (pass) {
    return {
      message: () =>
        `expected ${received} ${this.isNot ? 'not ' : ''}to be HIPAA compliant`,
      pass: true
    }
  } else {
    return {
      message: () =>
        `expected ${received} ${this.isNot ? 'not ' : ''}to be HIPAA compliant\n\n` +
        `Issues found:\n${getHIPAAViolations(received).map(v => `  - ${v}`).join('\n')}`,
      pass: false
    }
  }
}

// Matcher para verificar encriptación de datos sensibles
function toHaveEncryptedData(received, fieldName) {
  const field = received[fieldName]
  const isEncrypted = field && typeof field === 'string' && isEncryptedString(field)
  
  const pass = this.isNot ? !isEncrypted : isEncrypted

  if (pass) {
    return {
      message: () =>
        `expected field "${fieldName}" ${this.isNot ? 'not ' : ''}to be encrypted`,
      pass: true
    }
  } else {
    return {
      message: () =>
        `expected field "${fieldName}" ${this.isNot ? 'not ' : ''}to be encrypted\n\n` +
        `Received: ${field}\n` +
        `Type: ${typeof field}`,
      pass: false
    }
  }
}

// Matcher para verificar audit logging
function toHaveAuditLog(received, action) {
  const hasAuditLog = checkForAuditLog(received, action)
  
  const pass = this.isNot ? !hasAuditLog : hasAuditLog

  if (pass) {
    return {
      message: () =>
        `expected action "${action}" ${this.isNot ? 'not ' : ''}to have audit log`,
      pass: true
    }
  } else {
    return {
      message: () =>
        `expected action "${action}" ${this.isNot ? 'not ' : ''}to have audit log\n\n` +
        `No audit log found for action: ${action}`,
      pass: false
    }
  }
}

// Matcher para verificar datos médicos válidos
function toBeValidMedicalData(received, dataType) {
  const validation = validateMedicalData(received, dataType)
  
  const pass = this.isNot ? !validation.isValid : validation.isValid

  if (pass) {
    return {
      message: () =>
        `expected data ${this.isNot ? 'not ' : ''}to be valid ${dataType} medical data`,
      pass: true
    }
  } else {
    return {
      message: () =>
        `expected data ${this.isNot ? 'not ' : ''}to be valid ${dataType} medical data\n\n` +
        `Validation errors:\n${validation.errors.map(e => `  - ${e}`).join('\n')}`,
      pass: false
    }
  }
}

// Matcher para verificar performance de micro-frontends
function toLoadWithinPerformanceBudget(received, budgetMs = 3000) {
  const loadTime = received.loadTime || received.duration || 0
  const withinBudget = loadTime <= budgetMs
  
  const pass = this.isNot ? !withinBudget : withinBudget

  if (pass) {
    return {
      message: () =>
        `expected component ${this.isNot ? 'not ' : ''}to load within ${budgetMs}ms budget`,
      pass: true
    }
  } else {
    return {
      message: () =>
        `expected component ${this.isNot ? 'not ' : ''}to load within ${budgetMs}ms budget\n\n` +
        `Actual load time: ${loadTime}ms\n` +
        `Budget: ${budgetMs}ms\n` +
        `Exceeded by: ${loadTime - budgetMs}ms`,
      pass: false
    }
  }
}

// Matcher para verificar accesibilidad médica
function toBeAccessibleForMedicalUse(received) {
  const accessibilityIssues = checkMedicalAccessibility(received)
  const isAccessible = accessibilityIssues.length === 0
  
  const pass = this.isNot ? !isAccessible : isAccessible

  if (pass) {
    return {
      message: () =>
        `expected component ${this.isNot ? 'not ' : ''}to be accessible for medical use`,
      pass: true
    }
  } else {
    return {
      message: () =>
        `expected component ${this.isNot ? 'not ' : ''}to be accessible for medical use\n\n` +
        `Accessibility issues:\n${accessibilityIssues.map(issue => `  - ${issue}`).join('\n')}`,
      pass: false
    }
  }
}

// Funciones auxiliares para validación

function isHIPAACompliant(component) {
  const violations = getHIPAAViolations(component)
  return violations.length === 0
}

function getHIPAAViolations(component) {
  const violations = []
  
  // Verificar si hay datos PHI expuestos
  if (component && component.innerHTML) {
    const html = component.innerHTML
    
    // Buscar patrones de datos sensibles
    const sensitivePatterns = [
      /\b\d{2,3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{8,}\b/, // DNI pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email pattern
    ]
    
    sensitivePatterns.forEach((pattern, index) => {
      if (pattern.test(html)) {
        violations.push(`Sensitive data pattern ${index + 1} found in component HTML`)
      }
    })
  }
  
  // Verificar atributos de seguridad
  if (component && component.getAttribute) {
    const dataAttributes = ['data-patient-id', 'data-medical-record', 'data-ssn']
    dataAttributes.forEach(attr => {
      if (component.getAttribute(attr)) {
        violations.push(`Insecure data attribute "${attr}" found`)
      }
    })
  }
  
  return violations
}

function isEncryptedString(str) {
  // Verificar si el string parece estar encriptado
  // Para el propósito del test, verificamos si es base64 o similar
  try {
    return btoa(atob(str)) === str && str.length > 10
  } catch {
    return false
  }
}

function checkForAuditLog(context, action) {
  // Mock check para audit logging
  // En implementación real verificaría llamadas a sistema de audit
  return global.mockAuditLogs && 
         global.mockAuditLogs.some(log => 
           log.action === action && log.timestamp
         )
}

function validateMedicalData(data, dataType) {
  const errors = []
  
  switch (dataType) {
    case 'patient':
      if (!data.id) errors.push('Patient ID is required')
      if (!data.nombres) errors.push('Patient names are required')
      if (!data.apellidos) errors.push('Patient surnames are required')
      if (!data.numeroDocumento) errors.push('Document number is required')
      if (!data.fechaNacimiento) errors.push('Birth date is required')
      if (!data.consentimientoTratamientoDatos) errors.push('Data treatment consent is required')
      break
      
    case 'appointment':
      if (!data.id) errors.push('Appointment ID is required')
      if (!data.pacienteId) errors.push('Patient ID is required')
      if (!data.medicoId) errors.push('Doctor ID is required')
      if (!data.fechaCita) errors.push('Appointment date is required')
      if (!data.motivo) errors.push('Appointment reason is required')
      break
      
    case 'medical-record':
      if (!data.pacienteId) errors.push('Patient ID is required')
      if (!data.fecha) errors.push('Record date is required')
      if (!data.contenido) errors.push('Record content is required')
      break
      
    default:
      errors.push(`Unknown medical data type: ${dataType}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

function checkMedicalAccessibility(component) {
  const issues = []
  
  if (!component) return ['Component is null or undefined']
  
  // Verificar elementos críticos para accesibilidad médica
  const inputs = component.querySelectorAll('input, select, textarea')
  inputs.forEach((input, index) => {
    // Verificar labels
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    component.querySelector(`label[for="${input.id}"]`)
    
    if (!hasLabel) {
      issues.push(`Input element ${index + 1} missing accessible label`)
    }
    
    // Verificar contraste para elementos médicos críticos
    if (input.type === 'text' || input.type === 'email') {
      const styles = window.getComputedStyle && window.getComputedStyle(input)
      if (styles && !hasGoodContrast(styles.color, styles.backgroundColor)) {
        issues.push(`Input element ${index + 1} may have insufficient contrast`)
      }
    }
  })
  
  // Verificar navegación por teclado
  const interactiveElements = component.querySelectorAll(
    'button, input, select, textarea, a, [tabindex]'
  )
  
  interactiveElements.forEach((element, index) => {
    const tabIndex = element.getAttribute('tabindex')
    if (tabIndex && parseInt(tabIndex) > 0) {
      issues.push(`Element ${index + 1} has positive tabindex, which can disrupt tab order`)
    }
  })
  
  // Verificar elementos médicos críticos
  const medicalElements = component.querySelectorAll('[data-medical-critical]')
  medicalElements.forEach((element, index) => {
    if (!element.getAttribute('role') && !element.getAttribute('aria-label')) {
      issues.push(`Critical medical element ${index + 1} missing accessibility attributes`)
    }
  })
  
  return issues
}

function hasGoodContrast(color, backgroundColor) {
  // Implementación simplificada de verificación de contraste
  // En implementación real usaría algoritmo WCAG
  return true // Mock implementation
}

// Registrar matchers personalizados
expect.extend({
  toBeHIPAACompliant,
  toHaveEncryptedData,
  toHaveAuditLog,
  toBeValidMedicalData,
  toLoadWithinPerformanceBudget,
  toBeAccessibleForMedicalUse
})

// Configurar mocks globales para audit logging
global.mockAuditLogs = []

// Helper para registrar audit logs en tests
global.registerMockAuditLog = (action, details = {}) => {
  global.mockAuditLogs.push({
    action,
    timestamp: new Date(),
    ...details
  })
}

// Helper para limpiar audit logs
global.clearMockAuditLogs = () => {
  global.mockAuditLogs = []
}

export {
  toBeHIPAACompliant,
  toHaveEncryptedData,
  toHaveAuditLog,
  toBeValidMedicalData,
  toLoadWithinPerformanceBudget,
  toBeAccessibleForMedicalUse
}