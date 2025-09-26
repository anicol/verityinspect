import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import type { Finding } from '@/types';

interface VideoPlayerWithMarkersProps {
  videoUrl: string;
  findings: Finding[];
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export default function VideoPlayerWithMarkers({ 
  videoUrl, 
  findings, 
  currentTime = 0, 
  onTimeUpdate,
  className = "w-full max-w-2xl" 
}: VideoPlayerWithMarkersProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Jump to specific time when currentTime prop changes
  useEffect(() => {
    if (videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const jumpToTime = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
    }
  };

  // Get markers from findings with timestamps
  const markers = findings
    .filter(f => f.frame_timestamp !== null && f.frame_timestamp !== undefined)
    .map(f => ({
      timestamp: f.frame_timestamp!,
      severity: f.severity,
      title: f.title
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Simple Video Element with Native Controls */}
      <div className="bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto"
          controls
          preload="metadata"
          playsInline
          style={{ maxHeight: '70vh' }}
        />
      </div>

      {/* Markers/Issues Timeline */}
      {markers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Issues found in video:</h3>
          <div className="flex flex-wrap gap-2">
            {markers.map((marker, index) => (
              <button
                key={index}
                onClick={() => jumpToTime(marker.timestamp)}
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  marker.severity === 'CRITICAL' 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : marker.severity === 'HIGH'
                    ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                <span>{formatTime(marker.timestamp)}</span>
                <span>•</span>
                <span>{marker.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}