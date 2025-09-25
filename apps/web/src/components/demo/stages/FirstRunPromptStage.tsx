import { useState, useEffect } from 'react';
import { ArrowRight, Play, Pause } from 'lucide-react';
import { AnnotatedVideoPlayer, Violation } from '@/components/video';
import { useDemoVideo } from '@/hooks/useDemoApi';
import DemoProgress from '../DemoProgress';

interface DemoDetectionStageProps {
  onComplete: () => void;
}

export default function DemoDetectionStage({ onComplete }: DemoDetectionStageProps) {
  const [revealedViolations, setRevealedViolations] = useState<Violation[]>([]);
  const [videoEnded, setVideoEnded] = useState(false);

  // Fetch demo video data
  const { 
    data: videoData, 
    isLoading, 
    error 
  } = useDemoVideo('watch');

  const handleViolationRevealed = (violation: Violation) => {
    setRevealedViolations(prev => {
      if (!prev.find(v => v.id === violation.id)) {
        return [...prev, violation];
      }
      return prev;
    });
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading demo...</p>
        </div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Demo unavailable</p>
          <button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg"
          >
            Continue to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Progress indicator */}
      <DemoProgress 
        currentStage="first-run" 
        welcomeCompleted={true} 
        howItWorksCompleted={true} 
        whyManagersCompleted={true} 
      />
      
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Here's what VerityInspect will spot in your walkthroughs
          </h1>
          <p className="text-gray-600 text-lg">
            Watch as our AI identifies potential issues in real-time
          </p>
        </div>

        {/* Demo Video */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-8">
          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            {/* Detection counter */}
            <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
              <div className="bg-black bg-opacity-70 text-white px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                <span className="text-gray-300">AI Detected:</span>
                <span className="ml-1 md:ml-2 font-bold text-red-400">{revealedViolations.length} issues</span>
              </div>
            </div>
            
            <AnnotatedVideoPlayer
              src={videoData.video_url}
              violations={videoData.violations || []}
              onViolationRevealed={handleViolationRevealed}
              onVideoEnd={handleVideoEnd}
              autoplay={true}
              className="aspect-video w-full"
            />
          </div>
        </div>

        {/* Results and CTA */}
        {videoEnded && (
          <div className="text-center">
            <div className="mb-8">
              <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                {videoData.violations?.length || 0}
              </div>
              <p className="text-gray-700 text-lg mb-4">
                issues detected automatically
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From blocked exits to missing PPE, VerityInspect catches what the human eye might miss. 
                Now let's see what it finds in your store.
              </p>
            </div>
            
            <button 
              onClick={onComplete}
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 md:py-4 md:px-8 rounded-lg font-medium text-lg transition-colors inline-flex items-center min-h-[50px] min-w-[250px] justify-center"
            >
              Now try it in your own store
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
        
        {/* Show CTA immediately if video fails to autoplay */}
        {!videoEnded && (
          <div className="text-center">
            <button 
              onClick={onComplete}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              Skip Demo - Try in Your Store
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}