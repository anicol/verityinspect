import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import InspectorQueueWidget from './InspectorQueueWidget'
import { mockApiResponses, createTestQueryClient } from '../test/setup'
import * as apiModule from '@/services/api'
import * as useAuthModule from '@/hooks/useAuth'

// Mock the API module
vi.mock('@/services/api', () => ({
  videosAPI: {
    getVideos: vi.fn()
  }
}))

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('InspectorQueueWidget', () => {
  let mockGetVideos: any
  let mockUseAuth: any

  beforeEach(() => {
    mockGetVideos = vi.mocked(apiModule.videosAPI.getVideos)
    mockUseAuth = vi.mocked(useAuthModule.useAuth)
  })

  it('should not render for non-inspector users', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'GM', id: 1 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    const { container } = render(
      <TestWrapper>
        <InspectorQueueWidget />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render for inspector users', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'INSPECTOR', id: 1 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    mockGetVideos.mockResolvedValue([
      {
        id: 1,
        title: 'Test Inspection Video',
        created_at: '2024-01-01T12:00:00Z',
        store: { name: 'Test Store' }
      }
    ])

    render(
      <TestWrapper>
        <InspectorQueueWidget />
      </TestWrapper>
    )

    expect(screen.getByText('Inspector Queue')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('View All')).toBeInTheDocument()
    })
  })

  it('should render for admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'ADMIN', id: 1 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    mockGetVideos.mockResolvedValue([])

    render(
      <TestWrapper>
        <InspectorQueueWidget />
      </TestWrapper>
    )

    expect(screen.getByText('Inspector Queue')).toBeInTheDocument()
    
    // Wait for the loading state to resolve and check for empty state or content
    await waitFor(() => {
      // The component might show loading initially, so check for either loading or empty state
      const hasContent = screen.queryByText('No pending inspections') || 
                        screen.queryByText('View All') ||
                        screen.queryByText('Total')
      expect(hasContent).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('should display video list when data is available', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'INSPECTOR', id: 1 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    const mockVideos = [
      {
        id: 1,
        title: 'Urgent Inspection',
        created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        store: { name: 'Store A' }
      },
      {
        id: 2,
        title: 'Normal Inspection',
        created_at: new Date().toISOString(),
        store: { name: 'Store B' }
      }
    ]

    mockGetVideos.mockResolvedValue(mockVideos)

    render(
      <TestWrapper>
        <InspectorQueueWidget />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Urgent Inspection')).toBeInTheDocument()
      expect(screen.getByText('Normal Inspection')).toBeInTheDocument()
    })

    // Check urgency indicators - use getAllByText since there are multiple elements
    expect(screen.getAllByText('Urgent')).toHaveLength(2) // One in summary, one in badge
    expect(screen.getAllByText('Normal')).toHaveLength(2) // One in summary, one in badge
  })

  it('should show loading state', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'INSPECTOR', id: 1 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    mockGetVideos.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <TestWrapper>
        <InspectorQueueWidget />
      </TestWrapper>
    )

    expect(screen.getByText('Inspector Queue')).toBeInTheDocument()
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should calculate urgency levels correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'INSPECTOR', id: 1 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    const now = new Date()
    const mockVideos = [
      {
        id: 1,
        title: 'High Urgency',
        created_at: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        store: { name: 'Store A' }
      },
      {
        id: 2,
        title: 'Medium Urgency',
        created_at: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
        store: { name: 'Store B' }
      },
      {
        id: 3,
        title: 'Low Urgency',
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        store: { name: 'Store C' }
      }
    ]

    mockGetVideos.mockResolvedValue(mockVideos)

    render(
      <TestWrapper>
        <InspectorQueueWidget />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('High Urgency')).toBeInTheDocument()
      expect(screen.getByText('Medium Urgency')).toBeInTheDocument() 
      expect(screen.getByText('Low Urgency')).toBeInTheDocument()
    })

    // Check urgency badges - use getAllByText for multiple elements
    expect(screen.getAllByText('Urgent')).toHaveLength(2) // High urgency (summary + badge)
    expect(screen.getByText('Soon')).toBeInTheDocument() // Medium urgency
    expect(screen.getAllByText('Normal')).toHaveLength(2) // Low urgency (summary + badge)
  })

  it('should display summary stats correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'INSPECTOR', id: 1 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    const mockVideos = Array(5).fill(null).map((_, i) => ({
      id: i + 1,
      title: `Video ${i + 1}`,
      created_at: i < 2 ? 
        new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() : // 2 urgent
        new Date().toISOString(), // 3 normal
      store: { name: `Store ${i + 1}` }
    }))

    mockGetVideos.mockResolvedValue(mockVideos)

    render(
      <TestWrapper>
        <InspectorQueueWidget />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument() // Total
      expect(screen.getByText('2')).toBeInTheDocument() // Urgent
      expect(screen.getByText('3')).toBeInTheDocument() // Normal
    })

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getAllByText('Urgent')).toHaveLength(3) // Summary and multiple badges
    expect(screen.getAllByText('Normal')).toHaveLength(2) // Normal elements in this test
  })
})