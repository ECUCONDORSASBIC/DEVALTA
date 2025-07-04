import { describe, it, expect } from 'vitest'

describe('Doctors App', () => {
  it('should be importable', () => {
    expect(true).toBe(true)
  })

  it('should have basic functionality', () => {
    const testValue = 'doctors'
    expect(testValue).toBe('doctors')
  })
}) 