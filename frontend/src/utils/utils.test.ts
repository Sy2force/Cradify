import { describe, it, expect } from 'vitest'

// Basic utility functions tests
describe('Utils Functions', () => {
  it('should work with basic string operations', () => {
    const testString = 'Hello World'
    expect(testString.toLowerCase()).toBe('hello world')
    expect(testString.toUpperCase()).toBe('HELLO WORLD')
  })

  it('should work with arrays', () => {
    const testArray = [1, 2, 3, 4, 5]
    expect(testArray.length).toBe(5)
    expect(testArray.filter(n => n > 3)).toEqual([4, 5])
  })

  it('should work with objects', () => {
    const testObject = { name: 'Test', value: 42 }
    expect(testObject.name).toBe('Test')
    expect(testObject.value).toBe(42)
  })
})
