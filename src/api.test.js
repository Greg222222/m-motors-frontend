import { describe, expect, it } from 'vitest'
import { api, setAuthToken } from './api'

describe('api', () => {
  it('sets the Authorization header when a token is provided', () => {
    setAuthToken('abc123')
    expect(api.defaults.headers.common.Authorization).toBe('Bearer abc123')
  })

  it('removes the Authorization header when no token is provided', () => {
    setAuthToken('abc123')
    setAuthToken(null)
    expect(api.defaults.headers.common.Authorization).toBeUndefined()
  })
})
