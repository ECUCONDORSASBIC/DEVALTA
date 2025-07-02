#!/usr/bin/env node
/**
 * 🧪 ALTAMEDICA - TESTING SUITE RUNNER
 * Script proactivo para ejecutar todos los tests
 * Límite PROACTIVO: 200 líneas
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function runTestSuite() {
  log('🧪 ALTAMEDICA - EJECUTANDO SUITE COMPLETA DE TESTS', 'bold')
  log('=' .repeat(60), 'blue')
  
  const startTime = Date.now()
  const results = {
    unit: { passed: 0, failed: 0, time: 0 },
    integration: { passed: 0, failed: 0, time: 0 },
    security: { passed: 0, failed: 0, time: 0 },
    api: { passed: 0, failed: 0, time: 0 }
  }

  try {
    // 1. Tests unitarios con Vitest
    log('\n🔬 1. EJECUTANDO TESTS UNITARIOS...', 'yellow')
    
    const unitStart = Date.now()
    try {
      const output = execSync('pnpm test --run --reporter=verbose', {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      // Parsear resultados de Vitest
      const unitResults = parseVitestOutput(output)
      results.unit = { ...unitResults, time: Date.now() - unitStart }
        log(`✅ Tests unitarios completados: ${results.unit.passed} passed, ${results.unit.failed} failed`, 'green')
    } catch (error) {
      log(`❌ Error en tests unitarios: ${error.message}`, 'red')
      results.unit = { passed: 0, failed: 1, time: Date.now() - unitStart }
    }

    // 2. Tests de integración API
    log('\n🔗 2. EJECUTANDO TESTS DE INTEGRACIÓN API...', 'yellow')
    
    const apiStart = Date.now()
    try {
      // Verificar que el servidor esté ejecutándose
      await checkServerRunning()
      
      // Ejecutar tests de API custom existentes
      const apiTests = [
        'test-complete-ecosystem.cjs',
        'comprehensive-lab-results-test.mjs',
        'test-appointments-complete.js'
      ]
      
      let apiPassed = 0
      let apiFailed = 0
      
      for (const testFile of apiTests) {
        if (existsSync(testFile)) {
          try {
            log(`  📋 Ejecutando ${testFile}...`, 'cyan')
            execSync(`node ${testFile}`, { 
              cwd: process.cwd(),
              stdio: 'pipe',
              timeout: 30000
            })
            apiPassed++
            log(`  ✅ ${testFile} - PASSED`, 'green')
          } catch {
            apiFailed++
            log(`  ❌ ${testFile} - FAILED`, 'red')
          }
        }
      }
        results.api = { passed: apiPassed, failed: apiFailed, time: Date.now() - apiStart }
      
    } catch (error) {
      log(`❌ Error en tests de API: ${error.message}`, 'red')
      results.api = { passed: 0, failed: 1, time: Date.now() - apiStart }
    }

    // 3. Tests de seguridad
    log('\n🛡️ 3. EJECUTANDO TESTS DE SEGURIDAD...', 'yellow')
    
    const securityStart = Date.now()
    try {
      const output = execSync('pnpm test security --run', {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const securityResults = parseVitestOutput(output)
      results.security = { ...securityResults, time: Date.now() - securityStart }
        log(`✅ Tests de seguridad completados: ${results.security.passed} passed, ${results.security.failed} failed`, 'green')
    } catch (error) {
      log(`❌ Error en tests de seguridad: ${error.message}`, 'red')
      results.security = { passed: 0, failed: 1, time: Date.now() - securityStart }
    }

    // 4. Generar reporte final
    const totalTime = Date.now() - startTime
    generateReport(results, totalTime)
    
  } catch (error) {
    log(`💥 ERROR CRÍTICO: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red')
    process.exit(1)
  }
}

function parseVitestOutput(output) {
  const passedMatch = output.match(/(\d+) passed/)
  const failedMatch = output.match(/(\d+) failed/)
  
  return {
    passed: passedMatch ? parseInt(passedMatch[1]) : 0,
    failed: failedMatch ? parseInt(failedMatch[1]) : 0
  }
}

async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3001/api/v1/health', {
      timeout: 5000
    })
    
    if (!response.ok) {
      throw new Error('Server not responding')
    }
  } catch {
    log('⚠️  Servidor API no está ejecutándose. Iniciando...', 'yellow')
    
    // Intentar iniciar el servidor
    try {
      execSync('pnpm --filter ./apps/api-server dev &', {
        stdio: 'ignore',
        detached: true
      })
      
      // Esperar a que se inicie
      await new Promise(resolve => setTimeout(resolve, 10000))
      
      // Verificar nuevamente
      await fetch('http://localhost:3001/api/v1/health')
      log('✅ Servidor iniciado correctamente', 'green')
    } catch {
      throw new Error('No se pudo iniciar el servidor API')
    }
  }
}

function generateReport(results, totalTime) {
  log('\n' + '=' .repeat(60), 'blue')
  log('📊 REPORTE FINAL DE TESTING', 'bold')
  log('=' .repeat(60), 'blue')
  
  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0)
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0)
  const totalTests = totalPassed + totalFailed
  
  // Resumen por categoría
  for (const [category, result] of Object.entries(results)) {
    const { passed, failed, time } = result
    const status = failed === 0 ? '✅' : '❌'
    const total = passed + failed
    const percentage = total === 0 ? 0 : Math.round((passed / total) * 100)
    
    log(`${status} ${category.toUpperCase()}: ${passed}/${passed + failed} (${percentage}%) - ${time}ms`, 
        failed === 0 ? 'green' : 'red')
  }
  
  log('\n📈 RESUMEN GENERAL:', 'bold')
  log(`  Total Tests: ${totalTests}`, 'white')
  log(`  ✅ Passed: ${totalPassed}`, 'green')
  log(`  ❌ Failed: ${totalFailed}`, totalFailed === 0 ? 'green' : 'red')
  log(`  ⏱️  Total Time: ${totalTime}ms`, 'cyan')
  
  const successRate = totalTests === 0 ? 0 : Math.round((totalPassed / totalTests) * 100)
  log(`  📊 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red')
  
  if (totalFailed === 0) {
    log('\n🎉 ¡TODOS LOS TESTS PASARON!', 'green')
    log('🚀 La plataforma ALTAMEDICA está lista para producción', 'green')
  } else {
    log('\n⚠️  ALGUNOS TESTS FALLARON', 'yellow')
    log('🔧 Revisar y corregir antes de desplegar', 'yellow')
  }
  
  // Exit code según resultados
  process.exit(totalFailed === 0 ? 0 : 1)
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTestSuite().catch(error => {
    log(`💥 Error ejecutando tests: ${error.message}`, 'red')
    process.exit(1)
  })
}
