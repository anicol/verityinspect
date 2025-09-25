import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { AnnotatedVideoPlayer, Violation } from '@/components/video';
import DemoProgress from '../DemoProgress';

interface DemoVideoData {
  id: number;
  title: string;
  description: string;
  duration: number;
  video_url: string;
  thumbnail_url?: string;
  violations: Violation[];
  overall_score: number;
  category_scores: {
    ppe: number;
    safety: number;
    cleanliness: number;
    uniform: number;
  };
}

interface WatchStageProps {
  videoData: DemoVideoData;
  onComplete: () => void;
  onViolationRevealed: (violation: Violation) => void;
}

export default function WatchStage({ 
  videoData, 
  onComplete, 
  onViolationRevealed 
}: WatchStageProps) {
  const [revealedViolations, setRevealedViolations] = useState<Violation[]>([]);
  const [videoEnded, setVideoEnded] = useState(false);

  const handleViolationRevealed = (violation: Violation) => {
    setRevealedViolations(prev => {
      if (!prev.find(v => v.id === violation.id)) {
        const newViolations = [...prev, violation];
        onViolationRevealed(violation);
        return newViolations;
      }
      return prev;
    });
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Progress indicator */}
      <DemoProgress currentStage="watch" watchCompleted={videoEnded} />
      
      {/* Header */}
      <div className="text-center py-6 md:py-8 px-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Watch AI catch {videoData.violations.length} violations</h1>
      </div>

      {/* Clean video section */}
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            {/* Floating counter - Mobile optimized */}
            <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
              <div className="bg-black bg-opacity-70 text-white px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                <span className="text-gray-300">AI Finding:</span>
                <span className="ml-1 md:ml-2 font-bold">{revealedViolations.length} of {videoData.violations.length}</span>
              </div>
            </div>
            
            <AnnotatedVideoPlayer
              src={videoData.video_url}
              violations={videoData.violations}
              onViolationRevealed={handleViolationRevealed}
              onVideoEnd={handleVideoEnd}
              autoplay={false}
              className="aspect-video w-full"
            />
          </div>
        </div>
      </div>

      {/* Minimal completion section */}
      {videoEnded && (
        <div className="bg-white py-16">
          <div className="max-w-xl mx-auto px-4 text-center">
            {/* Main result */}
            <div className="mb-8">
              <div className="text-7xl font-bold text-gray-900 mb-2">
                {videoData.violations.length}
              </div>
              <div className="text-gray-600 text-lg font-medium">
                violations found
              </div>
            </div>
            
            {/* Single CTA - Mobile optimized touch target */}
            <button 
              onClick={onComplete}
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 md:py-4 md:px-8 rounded-lg font-medium text-lg transition-colors inline-flex items-center min-h-[50px] min-w-[200px] justify-center"
            >
              Test Your Skills
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}