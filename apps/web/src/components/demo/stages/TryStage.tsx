import { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { ClickableVideoPlayer, ClickEvent } from '@/components/video';
import DemoProgress from '../DemoProgress';

interface TryVideoData {
  id: number;
  title: string;
  description: string;
  duration: number;
  video_url: string;
  thumbnail_url?: string;
  total_violations: number;
}

interface TryStageProps {
  videoData: TryVideoData;
  onComplete: (clicks: ClickEvent[]) => void;
  onValidateClicks?: (clicks: ClickEvent[]) => Promise<any>;
}

export default function TryStage({ 
  videoData, 
  onComplete,
  onValidateClicks
}: TryStageProps) {
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleStartChallenge = () => {
    setHasStarted(true);
  };

  const handleVideoClick = (click: ClickEvent) => {
    setClicks(prev => [...prev, click]);
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleSubmitClicks = async () => {
    setIsValidating(true);
    
    try {
      // Validate clicks if function provided (even if empty array)
      if (onValidateClicks) {
        await onValidateClicks(clicks);
      }
      
      onComplete(clicks);
    } catch (error) {
      console.error('Error validating clicks:', error);
      // Still proceed to results
      onComplete(clicks);
    } finally {
      setIsValidating(false);
    }
  };


  return (
    <div className="bg-white min-h-screen">
      {/* Progress indicator */}
      <DemoProgress currentStage="first-run" welcomeCompleted={true} howItWorksCompleted={true} whyManagersCompleted={true} />
      
      {/* Header */}
      <div className="text-center py-6 md:py-8 px-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Can you spot all {videoData.total_violations} violations?</h1>
      </div>

      {/* Clean video layout */}
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            {/* Floating counter - Mobile optimized */}
            {hasStarted && (
              <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
                <div className="bg-black bg-opacity-70 text-white px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                  <span className="font-bold">{clicks.length}/{videoData.total_violations}</span>
                  <span className="ml-1 md:ml-2 text-gray-300">violations found</span>
                </div>
              </div>
            )}
            
            {!hasStarted ? (
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                {videoData.thumbnail_url && (
                  <img 
                    src={videoData.thumbnail_url} 
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="relative z-10 text-center px-4">
                  <div className="mb-6">
                    <p className="text-white text-base md:text-lg mb-4">Click on violations</p>
                  </div>
                  <button
                    onClick={handleStartChallenge}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto min-h-[50px] min-w-[120px]"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Start
                  </button>
                </div>
              </div>
            ) : (
              <ClickableVideoPlayer
                src={videoData.video_url}
                onVideoClick={handleVideoClick}
                onVideoEnd={handleVideoEnd}
                maxClicks={videoData.total_violations + 3}
                autoplay={true}
                className="aspect-video"
              />
            )}
          </div>
        </div>
      </div>

      {/* Simple completion section */}
      {hasStarted && (videoEnded || clicks.length >= videoData.total_violations) && (
        <div className="bg-white py-16">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="mb-8">
              <div className="text-7xl font-bold text-gray-900 mb-2">
                {clicks.length}
              </div>
              <div className="text-gray-600 text-lg font-medium">
                violations found by you
              </div>
            </div>
            
            <button 
              onClick={handleSubmitClicks}
              disabled={isValidating}
              className={`py-3 px-6 md:py-4 md:px-8 rounded-lg font-medium text-lg transition-colors inline-flex items-center min-h-[50px] min-w-[160px] justify-center ${
                isValidating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  See Results
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}