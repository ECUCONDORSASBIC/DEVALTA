/**
 * 🧪 ALTAMEDICA - HEALTH API TESTS
 * Tests críticos para health endpoint
 * Límite PROACTIVO: 250 líneas
 */
import { describe, test, expect, beforeAll } from 'vitest'
import { testUtils } from './test-utils'

describe('Health API', () => {
  beforeAll(() => {
    console.log('🏥 Testing Health API endpoints...')
  })

  test('GET /api/v1/health should return healthy status', async () => {    const response = await testUtils.makeRequest('/health')
    
    expect((response as any).status).toBe(200)
    expect(response.ok).toBe(true)
    expect(testUtils.validateApiResponse(response)).toBe(true)
    expect((response.data as any).status).toBe('healthy')
  })

  test('Health endpoint should include timestamp', async () => {
    const response = await testUtils.makeRequest('/health')
    
    expect(response.data.data.timestamp).toBeDefined()
    expect(typeof response.data.data.timestamp).toBe('string')
  })

  test('Health endpoint should include environment info', async () => {
    const response = await testUtils.makeRequest('/health')
    
    expect(response.data.data.environment).toBeDefined()
    expect(response.data.data.version).toBeDefined()
  })
  test('Health endpoint should have proper CORS headers', async () => {
    const response = await testUtils.makeRequest('/health')
    
    expect(response.headers['access-control-allow-origin']).toBeDefined()
  })

  test('Health endpoint should respond under 1000ms', async () => {
    const start = Date.now()
    const response = await testUtils.makeRequest('/health')
    const duration = Date.now() - start
    
    expect((response as any).status).toBe(200)
    expect(duration).toBeLessThan(1000)
  })
})
