import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { WelcomeStage, HowItWorksStage, WhyManagersLoveItStage, DemoDetectionStage } from './stages';

type DemoStage = 'welcome' | 'how-it-works' | 'why-managers' | 'first-run';

interface InteractiveTwoVideoDemoContainerProps {
  onClose?: () => void;
  onComplete?: () => void;
  initialStage?: DemoStage;
}

export default function InteractiveTwoVideoDemoContainer({
  onClose,
  onComplete,
  initialStage = 'welcome'
}: InteractiveTwoVideoDemoContainerProps) {
  const navigate = useNavigate();
  const { trackDemoStarted, trackDemoCompleted, trackDemoSkipped, trackUploadInitiated } = useBehaviorTracking();
  
  const [currentStage, setCurrentStage] = useState<DemoStage>(initialStage);
  const [demoStarted, setDemoStarted] = useState(false);
  const [welcomeCompleted, setWelcomeCompleted] = useState(false);
  const [howItWorksCompleted, setHowItWorksCompleted] = useState(false);
  const [whyManagersCompleted, setWhyManagersCompleted] = useState(false);

  // Track demo started on mount
  useEffect(() => {
    if (!demoStarted && currentStage === 'welcome') {
      trackDemoStarted();
      setDemoStarted(true);
    }
  }, [currentStage, demoStarted, trackDemoStarted]);

  const handleWelcomeComplete = () => {
    setWelcomeCompleted(true);
    setCurrentStage('how-it-works');
  };

  const handleHowItWorksComplete = () => {
    setHowItWorksCompleted(true);
    setCurrentStage('why-managers');
  };

  const handleWhyManagersComplete = () => {
    setWhyManagersCompleted(true);
    setCurrentStage('first-run');
  };

  const handleFirstRunPromptComplete = () => {
    trackUploadInitiated({ source: 'onboarding_completed' });
    
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

  return (
    <div className="min-h-screen bg-white">
      {/* Stage Content */}
      {currentStage === 'welcome' && (
        <WelcomeStage
          onComplete={handleWelcomeComplete}
        />
      )}

      {currentStage === 'how-it-works' && (
        <HowItWorksStage
          onComplete={handleHowItWorksComplete}
        />
      )}

      {currentStage === 'why-managers' && (
        <WhyManagersLoveItStage
          onComplete={handleWhyManagersComplete}
        />
      )}

      {currentStage === 'first-run' && (
        <DemoDetectionStage
          onComplete={handleFirstRunPromptComplete}
        />
      )}

    </div>
  );
}