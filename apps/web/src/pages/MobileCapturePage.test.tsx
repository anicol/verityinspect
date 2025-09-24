import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import MobileCapturePage from './MobileCapturePage'
import { mockApiResponses, createTestQueryClient } from '../test/setup'
import * as apiModule from '@/services/api'
import * as useAuthModule from '@/hooks/useAuth'
import * as useMobileDetectionModule from '@/hooks/useMobileDetection'
import * as MobileCaptureContextModule from './MobileCaptureContext'

// Mock modules
vi.mock('@/services/api', () => ({
  storesAPI: {
    getStores: vi.fn()
  },
  videosAPI: {
    uploadVideo: vi.fn()
  }
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('@/hooks/useMobileDetection', () => ({
  useMobileDetection: vi.fn()
}))

vi.mock('./MobileCaptureContext', () => ({
  useMobileCapture: vi.fn()
}))

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

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

describe('MobileCapturePage', () => {
  let mockUseAuth: any
  let mockUseMobileDetection: any
  let mockUseMobileCapture: any
  let mockGetStores: any

  beforeEach(() => {
    mockUseAuth = vi.mocked(useAuthModule.useAuth)
    mockUseMobileDetection = vi.mocked(useMobileDetectionModule.useMobileDetection)
    mockUseMobileCapture = vi.mocked(MobileCaptureContextModule.useMobileCapture)
    mockGetStores = vi.mocked(apiModule.storesAPI.getStores)

    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: { id: 1, store: 1 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    mockGetStores.mockResolvedValue([
      { id: 1, name: 'Test Store' },
      { id: 2, name: 'Another Store' }
    ])

    mockUseMobileCapture.mockReturnValue({
      isRecording: false,
      isPaused: false,
      duration: 0,
      settings: {
        mode: 'inspection',
        maxDuration: 300,
        quality: 'medium',
        autoStop: true
      },
      mediaStream: null,
      recordedBlob: null,
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      pauseRecording: vi.fn(),
      resumeRecording: vi.fn(),
      resetRecording: vi.fn(),
      updateSettings: vi.fn()
    })

    vi.clearAllMocks()
  })

  it('should show compatibility warning on non-optimal devices', () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: false,
      hasCamera: false,
      isOptimalForCapture: false
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    expect(screen.getByText('Mobile Capture Optimized')).toBeInTheDocument()
    expect(screen.getByText('Use a mobile device for best experience')).toBeInTheDocument()
    expect(screen.getByText('Camera access required')).toBeInTheDocument()
    expect(screen.getByText('Use File Upload Instead')).toBeInTheDocument()
  })

  it('should render capture interface on optimal devices', () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    expect(screen.getByText('Inspection Capture')).toBeInTheDocument()
    expect(screen.getByText('Switch to Coaching')).toBeInTheDocument()
    expect(screen.getByText('Capture Settings')).toBeInTheDocument()
  })

  it('should start recording when record button is clicked', async () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    const mockStartRecording = vi.fn().mockResolvedValue(true)
    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      isRecording: false,
      startRecording: mockStartRecording
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    const recordButton = screen.getByRole('button', { name: /start recording/i })
    fireEvent.click(recordButton)

    await waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled()
    })
  })

  it('should show recording controls when recording', () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      isRecording: true,
      isPaused: false,
      duration: 30
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    expect(screen.getByText('REC 0:30')).toBeInTheDocument()
    expect(screen.getByText('Recording...')).toBeInTheDocument()
  })

  it('should show pause/resume controls during recording', () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    const mockPauseRecording = vi.fn()
    const mockResumeRecording = vi.fn()

    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      isRecording: true,
      isPaused: false,
      duration: 45,
      pauseRecording: mockPauseRecording,
      resumeRecording: mockResumeRecording
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    // Should show pause button
    const pauseButton = document.querySelector('svg path[d*="19h4V5H6v14zm8-14v14h4V5h-4z"]')?.closest('button')
    expect(pauseButton).toBeInTheDocument()

    fireEvent.click(pauseButton!)
    expect(mockPauseRecording).toHaveBeenCalled()
  })

  it('should show preview screen after recording stops', () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      isRecording: false,
      recordedBlob: new Blob(['fake video'], { type: 'video/webm' })
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    expect(screen.getByText('Recording Complete')).toBeInTheDocument()
    expect(screen.getByText('Retake')).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByLabelText('Title *')).toBeInTheDocument()
    expect(screen.getByLabelText('Store *')).toBeInTheDocument()
  })

  it('should validate upload form before submission', async () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      isRecording: false,
      recordedBlob: new Blob(['fake video'], { type: 'video/webm' })
    })

    // Mock window.alert
    const mockAlert = vi.fn()
    vi.stubGlobal('alert', mockAlert)

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    const uploadButton = screen.getByText('Upload Video')
    fireEvent.click(uploadButton)

    expect(mockAlert).toHaveBeenCalledWith('Please fill in all required fields')
  })

  it('should submit upload with valid form data', async () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    const mockUploadVideo = vi.mocked(apiModule.videosAPI.uploadVideo).mockResolvedValue({ id: 1 })
    const mockResetRecording = vi.fn()

    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      isRecording: false,
      recordedBlob: new Blob(['fake video'], { type: 'video/webm' }),
      resetRecording: mockResetRecording
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    // Fill in form
    const titleInput = screen.getByLabelText('Title *')
    const storeSelect = screen.getByLabelText('Store *')

    fireEvent.change(titleInput, { target: { value: 'Test Recording' } })
    
    await waitFor(() => {
      const storeOptions = screen.getAllByRole('option')
      expect(storeOptions.length).toBeGreaterThan(1)
    })
    
    fireEvent.change(storeSelect, { target: { value: '1' } })

    const uploadButton = screen.getByText('Upload Video')
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(mockUploadVideo).toHaveBeenCalled()
      expect(mockResetRecording).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/videos', { replace: true })
    })
  })

  it('should switch between inspection and coaching modes', () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    const mockUpdateSettings = vi.fn()
    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      settings: {
        mode: 'inspection',
        maxDuration: 300,
        quality: 'medium',
        autoStop: true
      },
      updateSettings: mockUpdateSettings
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    const switchButton = screen.getByText('Switch to Coaching')
    fireEvent.click(switchButton)

    expect(mockUpdateSettings).toHaveBeenCalledWith({ mode: 'coaching' })
  })

  it('should update capture settings', () => {
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    const mockUpdateSettings = vi.fn()
    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      updateSettings: mockUpdateSettings
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    // Change quality setting
    const qualitySelect = screen.getByDisplayValue('Medium (720p)')
    fireEvent.change(qualitySelect, { target: { value: 'high' } })

    expect(mockUpdateSettings).toHaveBeenCalledWith({ quality: 'high' })

    // Change max duration
    const durationSelect = screen.getByDisplayValue('5 minutes')
    fireEvent.change(durationSelect, { target: { value: '600' } })

    expect(mockUpdateSettings).toHaveBeenCalledWith({ maxDuration: 600 })

    // Toggle auto-stop
    const autoStopCheckbox = screen.getByLabelText('Auto-stop at max duration')
    fireEvent.click(autoStopCheckbox)

    expect(mockUpdateSettings).toHaveBeenCalledWith({ autoStop: false })
  })

  it('should auto-select user store', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, store: 2 },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      hasCamera: true,
      isOptimalForCapture: true
    })

    mockUseMobileCapture.mockReturnValue({
      ...mockUseMobileCapture(),
      isRecording: false,
      recordedBlob: new Blob(['fake video'], { type: 'video/webm' })
    })

    render(
      <TestWrapper>
        <MobileCapturePage />
      </TestWrapper>
    )

    await waitFor(() => {
      const storeSelect = screen.getByLabelText('Store *') as HTMLSelectElement
      expect(storeSelect.value).toBe('2')
    })
  })
})