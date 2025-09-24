import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8000',
    VITE_ENV: 'test'
  },
  writable: true
})

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock react-query client for tests
import { QueryClient } from 'react-query'

export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

// Mock API responses
export const mockApiResponses = {
  auth: {
    login: {
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: {
        id: 1,
        username: 'testuser',
        role: 'INSPECTOR',
        store: 1
      }
    },
    profile: {
      id: 1,
      username: 'testuser',
      role: 'INSPECTOR',
      store: 1
    }
  },
  videos: {
    list: {
      results: [
        {
          id: 1,
          title: 'Test Video',
          status: 'COMPLETED',
          created_at: '2024-01-01T12:00:00Z',
          store: { id: 1, name: 'Test Store' }
        }
      ],
      count: 1
    }
  },
  stores: [
    { id: 1, name: 'Test Store', code: 'TS001' },
    { id: 2, name: 'Another Store', code: 'AS002' }
  ]
}