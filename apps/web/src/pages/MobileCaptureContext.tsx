import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CaptureSettings {
  mode: 'inspection' | 'coaching';
  maxDuration: number; // seconds
  quality: 'low' | 'medium' | 'high';
  autoStop: boolean;
}

interface MobileCaptureContextType {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  settings: CaptureSettings;
  mediaStream: MediaStream | null;
  recordedBlob: Blob | null;
  
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  updateSettings: (settings: Partial<CaptureSettings>) => void;
}

const MobileCaptureContext = createContext<MobileCaptureContextType | null>(null);

export const useMobileCapture = () => {
  const context = useContext(MobileCaptureContext);
  if (!context) {
    throw new Error('useMobileCapture must be used within MobileCaptureProvider');
  }
  return context;
};

export const MobileCaptureProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [settings, setSettings] = useState<CaptureSettings>({
    mode: 'inspection',
    maxDuration: 300, // 5 minutes default
    quality: 'medium',
    autoStop: true
  });

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [mediaRecorder, isRecording]);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          
          // Auto-stop when max duration reached
          if (settings.autoStop && newDuration >= settings.maxDuration) {
            stopRecording();
            return settings.maxDuration;
          }
          
          return newDuration;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, settings.maxDuration, settings.autoStop, stopRecording]);

  const startRecording = async () => {
    try {
      // Get camera constraints based on quality setting
      const constraints = getVideoConstraints(settings.quality);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      
      const recorder = new MediaRecorder(stream, {
        mimeType: getSupportedMimeType()
      });
      
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        setRecordedBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      };
      
      setMediaRecorder(recorder);
      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording && !isPaused) {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && isRecording && isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const resetRecording = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setMediaStream(null);
    setMediaRecorder(null);
    setRecordedBlob(null);
  };

  const updateSettings = (newSettings: Partial<CaptureSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <MobileCaptureContext.Provider
      value={{
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
      }}
    >
      {children}
    </MobileCaptureContext.Provider>
  );
};

// Helper functions
function getVideoConstraints(quality: 'low' | 'medium' | 'high') {
  const baseConstraints = {
    audio: true,
    video: {
      facingMode: { ideal: 'environment' }, // Prefer back camera
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };

  switch (quality) {
    case 'low':
      return {
        ...baseConstraints,
        video: {
          ...baseConstraints.video,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
    case 'high':
      return {
        ...baseConstraints,
        video: {
          ...baseConstraints.video,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
    default:
      return baseConstraints;
  }
}

function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=h264,aac',
    'video/mp4'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return 'video/webm'; // Fallback
}