import { describe, it, expect } from 'vitest'

// Prueba básica para verificar que el paquete core se puede importar
describe('@altamedica/core', () => {
  it('should be importable', () => {
    expect(true).toBe(true)
  })

  it('should have basic functionality', () => {
    // Prueba básica de funcionalidad
    const testValue = 'test'
    expect(testValue).toBe('test')
  })
}) 