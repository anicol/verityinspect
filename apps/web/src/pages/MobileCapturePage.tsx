import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMobileCapture } from './MobileCaptureContext';
import { useQuery } from '@tanstack/react-query';
import { storesAPI, videosAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export default function MobileCapturePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile, hasCamera, isOptimalForCapture } = useMobileDetection();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [title, setTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    isRecording,
    isPaused,
    duration,
    settings,
    mediaStream,
    recordedBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    updateSettings
  } = useMobileCapture();

  // Get stores for selection
  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: storesAPI.getStores
  });

  // Set up video preview
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Auto-select user's store if available
  useEffect(() => {
    if (user?.store && stores) {
      const userStore = stores.find(s => s.id === user.store);
      if (userStore) {
        setSelectedStore(userStore.id.toString());
      }
    }
  }, [user, stores]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.min((duration / settings.maxDuration) * 100, 100);
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setShowPreview(false);
    } catch (error) {
      alert('Failed to access camera. Please check permissions and try again.');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    setShowPreview(true);
  };

  const handleRetake = () => {
    resetRecording();
    setShowPreview(false);
  };

  const handleUpload = async () => {
    if (!recordedBlob || !selectedStore || !title.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', recordedBlob, `${title}.webm`);
      formData.append('title', title);
      formData.append('store', selectedStore);
      formData.append('mode', settings.mode);

      await videosAPI.uploadVideo(formData);
      
      // Reset and navigate back
      resetRecording();
      navigate('/videos', { replace: true });
      
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Show compatibility warning for desktop/non-optimal devices
  if (!isOptimalForCapture) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Mobile Capture Optimized</h2>
          
          <div className="text-gray-300 space-y-2 mb-6">
            <p>This interface is optimized for mobile devices with cameras.</p>
            
            {!isMobile && (
              <p className="text-yellow-400">• Use a mobile device for best experience</p>
            )}
            {!hasCamera && (
              <p className="text-red-400">• Camera access required</p>
            )}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/videos/upload')}
              className="w-full py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Use File Upload Instead
            </button>
            <button
              onClick={() => navigate('/videos')}
              className="w-full py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Back to Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/videos')}
          className="p-2 hover:bg-gray-700 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h1 className="text-lg font-semibold">
          {settings.mode === 'inspection' ? 'Inspection Capture' : 'Coaching Capture'}
        </h1>
        
        <button
          onClick={() => updateSettings({ 
            mode: settings.mode === 'inspection' ? 'coaching' : 'inspection' 
          })}
          className="px-3 py-1 bg-indigo-600 rounded-lg text-sm"
        >
          {settings.mode === 'inspection' ? 'Switch to Coaching' : 'Switch to Inspection'}
        </button>
      </div>

      {/* Video Preview */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-64 object-cover"
        />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-white text-sm font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
              REC {formatDuration(duration)}
            </span>
          </div>
        )}
        
        {/* Duration Progress Bar */}
        {isRecording && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-600">
            <div 
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        )}

        {/* Mode Indicator */}
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            settings.mode === 'inspection' 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {settings.mode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {!showPreview ? (
          <>
            {/* Recording Controls */}
            <div className="flex justify-center items-center space-x-8">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <div className="w-6 h-6 bg-white rounded-full" />
                </button>
              ) : (
                <>
                  {/* Pause/Resume */}
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700"
                  >
                    {isPaused ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                    )}
                  </button>
                  
                  {/* Stop */}
                  <button
                    onClick={handleStopRecording}
                    className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <div className="w-6 h-6 bg-white rounded-sm" />
                  </button>
                </>
              )}
            </div>

            {/* Recording Info */}
            <div className="text-center text-gray-400 text-sm">
              {!isRecording && `Max Duration: ${formatDuration(settings.maxDuration)}`}
              {isRecording && !isPaused && 'Recording...'}
              {isPaused && 'Recording Paused'}
            </div>
          </>
        ) : (
          <>
            {/* Preview Controls */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Recording Complete</h3>
              
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={handleRetake}
                  className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Retake
                </button>
                <button
                  onClick={() => {/* Play preview */}}
                  className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Upload Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Enter video title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Store *</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select a store</option>
                  {stores?.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading || !title.trim() || !selectedStore}
                className="w-full py-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Settings Panel */}
      <div className="p-4 border-t border-gray-700">
        <h4 className="text-sm font-semibold mb-3">Capture Settings</h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-gray-400 mb-1">Quality</label>
            <select
              value={settings.quality}
              onChange={(e) => updateSettings({ quality: e.target.value as any })}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
              disabled={isRecording}
            >
              <option value="low">Low (480p)</option>
              <option value="medium">Medium (720p)</option>
              <option value="high">High (1080p)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 mb-1">Max Duration</label>
            <select
              value={settings.maxDuration}
              onChange={(e) => updateSettings({ maxDuration: parseInt(e.target.value) })}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
              disabled={isRecording}
            >
              <option value={60}>1 minute</option>
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
            </select>
          </div>
        </div>
        
        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            id="autoStop"
            checked={settings.autoStop}
            onChange={(e) => updateSettings({ autoStop: e.target.checked })}
            className="mr-2"
            disabled={isRecording}
          />
          <label htmlFor="autoStop" className="text-sm text-gray-400">
            Auto-stop at max duration
          </label>
        </div>
      </div>
    </div>
  );
}