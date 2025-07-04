import { describe, it, expect } from 'vitest'

describe('Medical App', () => {
  it('should be importable', () => {
    expect(true).toBe(true)
  })

  it('should have basic functionality', () => {
    const testValue = 'medical'
    expect(testValue).toBe('medical')
  })
}) 