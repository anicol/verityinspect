import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/city/index.css';

export interface ClickEvent {
  x: number;      // Normalized coordinates (0-1)
  y: number;      // Normalized coordinates (0-1)
  timestamp: number;
  id: string;
}

interface ClickableVideoPlayerProps {
  src: string;
  onVideoClick?: (click: ClickEvent) => void;
  onVideoEnd?: () => void;
  maxClicks?: number;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
  instructionText?: string;
}

export default function ClickableVideoPlayer({
  src,
  onVideoClick,
  onVideoEnd,
  maxClicks = 10,
  autoplay = false,
  controls = true,
  className = '',
  instructionText = "Click on violations as you spot them"
}: ClickableVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    console.log('Initializing ClickableVideoPlayer with src:', src);
    
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

      // Handle video end
      player.on('ended', () => {
        onVideoEnd?.();
      });


      // Handle errors
      player.on('error', (error) => {
        console.error('ClickableVideoPlayer error:', error);
      });

      player.on('ready', () => {
        console.log('ClickableVideoPlayer ready');
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
  }, [src]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || clicks.length >= maxClicks) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;  // Normalize to 0-1
    const y = (event.clientY - rect.top) / rect.height;   // Normalize to 0-1
    const timestamp = playerRef.current.currentTime();

    const newClick: ClickEvent = {
      x,
      y,
      timestamp,
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setClicks(prev => [...prev, newClick]);
    onVideoClick?.(newClick);

    // Add visual feedback
    showClickFeedback(event.clientX - rect.left, event.clientY - rect.top);
  };

  const showClickFeedback = (x: number, y: number) => {
    if (!overlayRef.current) return;

    const indicator = document.createElement('div');
    indicator.className = 'absolute pointer-events-none animate-ping';
    indicator.innerHTML = `
      <div class="w-6 h-6 bg-blue-500 rounded-full opacity-75 flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    `;
    indicator.style.left = `${x - 12}px`;
    indicator.style.top = `${y - 12}px`;

    overlayRef.current.appendChild(indicator);

    // Remove after animation
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 1000);
  };

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

      {/* Clickable Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 cursor-crosshair"
        onClick={handleOverlayClick}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >

        {/* Click Indicators */}
        {clicks.map((click, index) => (
          <div
            key={click.id}
            className="absolute pointer-events-none"
            style={{
              left: `${click.x * 100}%`,
              top: `${click.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              {/* Click marker */}
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              
              {/* Timestamp label */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {Math.floor(click.timestamp / 60)}:{Math.floor(click.timestamp % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Click Counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
          <div className="text-sm font-medium">
            Clicks: {clicks.length}/{maxClicks}
          </div>
        </div>

        {/* Max clicks reached message */}
        {clicks.length >= maxClicks && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <p className="font-medium">Maximum clicks reached!</p>
              <p className="text-sm opacity-90">Ready to see how you did?</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}