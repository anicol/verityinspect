import { AlertTriangle, Upload, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UploadLimitGuardProps {
  onUpgradeClick?: () => void;
  children: React.ReactNode;
}

export default function UploadLimitGuard({ onUpgradeClick, children }: UploadLimitGuardProps) {
  const { user } = useAuth();
  
  // Only applies to trial users
  if (!user?.trial_status?.is_trial) {
    return <>{children}</>;
  }

  const trial = user.trial_status;
  
  // Check if user has reached video limit
  const hasReachedLimit = !trial.can_upload_video;
  const videosRemaining = trial.videos_remaining || 0;
  const isCloseToLimit = videosRemaining <= 2;

  if (hasReachedLimit) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Trial Limit Reached
            </h3>
            <p className="text-red-700 mb-4">
              You've used all {trial.videos_used} videos in your trial. Upgrade to continue uploading and analyzing videos with AI-powered inspections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onUpgradeClick}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              
              <div className="text-sm text-red-600 flex items-center">
                <div className="bg-red-100 rounded-full px-3 py-1">
                  {trial.days_remaining || 0} days remaining in trial
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCloseToLimit) {
    return (
      <div className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Upload className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-800">
                Only {videosRemaining} video{videosRemaining !== 1 ? 's' : ''} remaining
              </h4>
              <p className="text-orange-700 text-sm mt-1">
                You're close to your trial limit. Consider upgrading to continue with unlimited uploads.
              </p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-orange-700">
                    Progress: {trial.videos_used}/10 videos used
                  </div>
                  <div className="w-32 bg-orange-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${((trial.videos_used || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={onUpgradeClick}
                  className="text-sm bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {children}
      </div>
    );
  }

  return <>{children}</>;
}