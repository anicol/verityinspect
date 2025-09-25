import { Upload, ArrowRight } from 'lucide-react';
import { ClickEvent, Violation } from '@/components/video';
import { useAuth } from '@/hooks/useAuth';
import DemoProgress from '../DemoProgress';
import TrialStatusBanner from '@/components/TrialStatusBanner';

interface ValidationResult {
  found_violations: Array<{
    id: number;
    title: string;
    category: string;
    severity: string;
  }>;
  missed_violations: Array<{
    id: number;
    title: string;
    category: string;
    severity: string;
    bbox: { x: number; y: number; width: number; height: number };
    timestamp: number;
    why_missed: string;
  }>;
  score: number;
  total: number;
  score_percentage: number;
  feedback: string;
}

interface DoStageProps {
  userClicks: ClickEvent[];
  validationResult: ValidationResult;
  onUploadClick: () => void;
  onBackToDashboard?: () => void;
}

export default function DoStage({ 
  userClicks, 
  validationResult, 
  onUploadClick,
  onBackToDashboard 
}: DoStageProps) {
  const { user } = useAuth();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className="bg-white min-h-screen">
      {/* Progress indicator */}
      <DemoProgress currentStage="first-run" welcomeCompleted={true} howItWorksCompleted={true} whyManagersCompleted={true} />
      
      {/* Header */}
      <div className="text-center py-6 md:py-8 px-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          You found {validationResult.score} of {validationResult.total}!
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Simple Results List */}
        <div className="space-y-4 mb-12">
          {/* Found Violations */}
          {validationResult.found_violations.map((violation, index) => (
            <div key={violation.id} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{violation.title}</div>
                <div className="text-green-600 text-sm">
                  Found at {formatTime(userClicks[index]?.timestamp || 0)}
                </div>
              </div>
            </div>
          ))}

          {/* Missed Violations */}
          {validationResult.missed_violations.map((violation) => (
            <div key={violation.id} className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✕</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{violation.title}</div>
                <div className="text-red-600 text-sm">
                  You missed this at {formatTime(violation.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Simple AI Message */}
        {validationResult.missed_violations.length > 0 && (
          <div className="text-center mb-12">
            <p className="text-lg text-gray-700 mb-2">
              The AI caught these tricky ones:
            </p>
            <p className="text-gray-600">
              The AI catches subtle issues like this every time.
            </p>
          </div>
        )}

        {/* Trial Banner */}
        {user?.trial_status?.is_trial && (
          <div className="mb-8">
            <TrialStatusBanner
              onUpgradeClick={() => {
                console.log('Navigate to upgrade page from demo completion');
              }}
            />
          </div>
        )}

        {/* Simple Upload Button - Mobile optimized */}
        <div className="text-center">
          <button 
            onClick={onUploadClick}
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 md:py-4 md:px-8 rounded-lg font-medium text-lg transition-colors inline-flex items-center min-h-[50px] min-w-[200px] justify-center"
          >
            Upload Your Video
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          <p className="text-gray-600 mt-4">
            30 seconds is all you need
          </p>
        </div>
      </div>
    </div>
  );
}
