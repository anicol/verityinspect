import { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/city/index.css';

export interface Violation {
  id: number;
  timestamp: number;
  duration?: number;
  bbox: {
    x: number;    // Percentage from left
    y: number;    // Percentage from top
    width: number;  // Percentage width
    height: number; // Percentage height
  };
  title: string;
  category: 'PPE' | 'SAFETY' | 'CLEANLINESS' | 'UNIFORM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence?: number;
}

interface AnnotatedVideoPlayerProps {
  src: string;
  violations: Violation[];
  onViolationRevealed?: (violation: Violation) => void;
  onVideoEnd?: () => void;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
}

export default function AnnotatedVideoPlayer({
  src,
  violations,
  onViolationRevealed,
  onVideoEnd,
  autoplay = false,
  controls = true,
  className = ''
}: AnnotatedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [revealedViolations, setRevealedViolations] = useState<Set<number>>(new Set());
  const [currentTime, setCurrentTime] = useState(0);

  const handleViolationRevealed = useCallback((violation: Violation) => {
    onViolationRevealed?.(violation);
  }, [onViolationRevealed]);

  const handleVideoEnd = useCallback(() => {
    onVideoEnd?.();
  }, [onVideoEnd]);

  // Handle violation detection based on current time
  useEffect(() => {
    violations.forEach(violation => {
      if (
        currentTime >= violation.timestamp &&
        currentTime <= violation.timestamp + (violation.duration || 3) &&
        !revealedViolations.has(violation.id)
      ) {
        setRevealedViolations(prev => new Set(prev).add(violation.id));
        handleViolationRevealed(violation);
      }
    });
  }, [currentTime, violations, revealedViolations, handleViolationRevealed]);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    console.log('Initializing Video.js with src:', src);
    
    // Initialize Video.js properly with a timeout to ensure DOM is ready
    const initializePlayer = () => {
      const player = videojs(videoRef.current!, {
        controls,
        responsive: true,
        fluid: true,
        fill: true,
        autoplay,
        preload: 'metadata',
        sources: [{ src, type: 'video/mp4' }],
        playbackRates: [0.5, 1, 1.25, 1.5],
        aspectRatio: '16:9'
      });

      playerRef.current = player;

      // Handle time updates
      player.on('timeupdate', () => {
        const time = player.currentTime();
        if (time !== undefined) {
          setCurrentTime(time);
        }
      });

      // Handle video end
      player.on('ended', handleVideoEnd);

      // Handle errors
      player.on('error', (error: any) => {
        console.error('Video.js error:', error);
      });

      player.on('ready', () => {
        console.log('Video.js player ready');
      });
    };

    // Small delay to ensure DOM is ready
    setTimeout(initializePlayer, 100);

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, controls, autoplay, handleVideoEnd]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'border-red-600 bg-red-600';
      case 'HIGH': return 'border-red-500 bg-red-500';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-500';
      case 'LOW': return 'border-blue-500 bg-blue-500';
      default: return 'border-gray-500 bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PPE': return '🥽';
      case 'SAFETY': return '⚠️';
      case 'CLEANLINESS': return '🧹';
      case 'UNIFORM': return '👕';
      default: return '📋';
    }
  };

  // Get currently visible violations
  const visibleViolations = violations.filter(violation => {
    const startTime = violation.timestamp;
    const endTime = violation.timestamp + (violation.duration || 3);
    return currentTime >= startTime && currentTime <= endTime && revealedViolations.has(violation.id);
  });

  return (
    <div className={`relative ${className} w-full aspect-video`}>
      {/* Video Player */}
      <div data-vjs-player className="w-full h-full">
        <video
          ref={videoRef}
          className="video-js vjs-theme-city w-full h-full"
          data-setup='{"fluid": true, "responsive": true}'
        />
      </div>

      {/* Violation Overlays */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {visibleViolations.map(violation => (
          <div key={violation.id} className="absolute">
            {/* Bounding Box */}
            <div
              className={`absolute border-2 ${getSeverityColor(violation.severity)} opacity-80 animate-pulse`}
              style={{
                left: `${violation.bbox.x}%`,
                top: `${violation.bbox.y}%`,
                width: `${violation.bbox.width}%`,
                height: `${violation.bbox.height}%`,
              }}
            />
            
            {/* Violation Label */}
            <div
              className={`absolute text-white text-xs px-2 py-1 rounded-md shadow-lg ${getSeverityColor(violation.severity)} animate-fadeIn`}
              style={{
                left: `${violation.bbox.x}%`,
                top: `${Math.max(0, violation.bbox.y - 6)}%`,
                transform: violation.bbox.y < 10 ? 'translateY(100%)' : 'translateY(-100%)',
              }}
            >
              <div className="flex items-center space-x-1">
                <span>{getCategoryIcon(violation.category)}</span>
                <span className="font-medium">{violation.title}</span>
                {violation.confidence && (
                  <span className="text-xs opacity-75">
                    {Math.round(violation.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Markers */}
      <div className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none">
        {violations.map(violation => (
          <div
            key={`marker-${violation.id}`}
            className={`absolute top-0 w-1 h-full ${getSeverityColor(violation.severity)} opacity-60`}
            style={{
              left: `${(violation.timestamp / (playerRef.current?.duration() || 1)) * 100}%`,
            }}
            title={`${violation.title} at ${Math.floor(violation.timestamp / 60)}:${Math.floor(violation.timestamp % 60).toString().padStart(2, '0')}`}
          />
        ))}
      </div>
    </div>
  );
}