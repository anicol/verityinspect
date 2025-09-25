import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useDemoVideo, useValidateClicks } from '@/hooks/useDemoApi';
import { ClickEvent } from '@/components/video';
import { WatchStage, TryStage, DoStage } from './stages';

type DemoStage = 'watch' | 'try' | 'do';

interface InteractiveTwoVideoDemoContainerProps {
  onClose?: () => void;
  onComplete?: () => void;
  initialStage?: DemoStage;
}

export default function InteractiveTwoVideoDemoContainer({
  onClose,
  onComplete,
  initialStage = 'watch'
}: InteractiveTwoVideoDemoContainerProps) {
  const navigate = useNavigate();
  const { trackDemoStarted, trackDemoCompleted, trackDemoSkipped, trackUploadInitiated } = useBehaviorTracking();
  
  const [currentStage, setCurrentStage] = useState<DemoStage>(initialStage);
  const [userClicks, setUserClicks] = useState<ClickEvent[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [demoStarted, setDemoStarted] = useState(false);
  const [watchCompleted, setWatchCompleted] = useState(false);
  const [tryCompleted, setTryCompleted] = useState(false);

  // Fetch demo video data
  const { 
    data: watchVideoData, 
    isLoading: isWatchLoading, 
    error: watchError 
  } = useDemoVideo('watch');
  
  const { 
    data: tryVideoData, 
    isLoading: isTryLoading, 
    error: tryError 
  } = useDemoVideo('try');

  // Click validation mutation
  const validateClicksMutation = useValidateClicks();

  // Track demo started on mount
  useEffect(() => {
    if (!demoStarted && currentStage === 'watch') {
      trackDemoStarted();
      setDemoStarted(true);
    }
  }, [currentStage, demoStarted]); // Removed trackDemoStarted to prevent infinite loop

  const handleWatchComplete = () => {
    setWatchCompleted(true);
    setCurrentStage('try');
  };

  const handleTryComplete = async (clicks: ClickEvent[]) => {
    setUserClicks(clicks);
    
    if (tryVideoData) {
      try {
        const result = await validateClicksMutation.mutateAsync({
          videoId: tryVideoData.id,
          clicks: clicks
        });
        setValidationResult(result);
      } catch (error) {
        console.error('Failed to validate clicks:', error);
        // Create fallback result
        setValidationResult({
          found_violations: [],
          missed_violations: [],
          score: 0,
          total: tryVideoData.total_violations || 0,
          score_percentage: 0,
          feedback: "Unable to validate your performance, but you can still try uploading your own video!"
        });
      }
    }
    
    setTryCompleted(true);
    setCurrentStage('do');
  };

  const handleUploadClick = () => {
    trackUploadInitiated({ source: 'interactive_demo' });
    
    // Mark demo as completed
    trackDemoCompleted();
    
    // Navigate directly to upload page
    navigate('/videos/upload');
    
    if (onComplete) {
      onComplete();
    }
  };


  const handleSkipToDashboard = () => {
    trackDemoSkipped();
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  const handleBackToDashboard = () => {
    trackDemoCompleted();
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  // Loading states
  if (isWatchLoading || isTryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading demo experience...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (watchError || tryError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <X className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Demo Unavailable</h3>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the demo videos. Please try again later.
          </p>
          <button
            onClick={handleSkipToDashboard}
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Stage Content */}
      {currentStage === 'watch' && watchVideoData && (
        <WatchStage
          videoData={watchVideoData}
          onComplete={handleWatchComplete}
          onViolationRevealed={(violation) => {
            // Track individual violations being revealed
            console.log('Violation revealed:', violation);
          }}
        />
      )}

      {currentStage === 'try' && tryVideoData && (
        <TryStage
          videoData={tryVideoData}
          onComplete={handleTryComplete}
          onValidateClicks={async (clicks) => {
            // This is called if we want to show intermediate validation
            return validateClicksMutation.mutateAsync({
              videoId: tryVideoData.id,
              clicks: clicks
            });
          }}
        />
      )}

      {currentStage === 'do' && validationResult && (
        <DoStage
          userClicks={userClicks}
          validationResult={validationResult}
          onUploadClick={handleUploadClick}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

    </div>
  );
}