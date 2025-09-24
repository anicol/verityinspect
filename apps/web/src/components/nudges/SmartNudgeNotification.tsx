import { useState } from 'react';
import { X, ArrowRight, Clock, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartNudge {
  id: number;
  nudge_type: string;
  title: string;
  message: string;
  cta_text?: string;
  cta_url?: string;
  priority: number;
  show_after: string;
  expires_at?: string;
  status: 'PENDING' | 'SHOWN' | 'CLICKED' | 'DISMISSED' | 'EXPIRED';
}

interface SmartNudgeNotificationProps {
  nudge: SmartNudge;
  onDismiss: (nudgeId: number) => void;
  onAction: (nudgeId: number, actionUrl?: string) => void;
}

export default function SmartNudgeNotification({ nudge, onDismiss, onAction }: SmartNudgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(nudge.id), 300); // Allow animation to complete
  };

  const handleAction = () => {
    onAction(nudge.id, nudge.cta_url);
    if (nudge.cta_url) {
      window.location.href = nudge.cta_url;
    }
  };

  const getNudgeIcon = () => {
    switch (nudge.nudge_type) {
      case 'UPLOAD_FIRST_VIDEO':
      case 'TRY_SECOND_VIDEO':
        return <Target className="w-5 h-5" />;
      case 'TRIAL_EXPIRING_SOON':
      case 'FEATURE_LIMIT_REACHED':
        return <Clock className="w-5 h-5" />;
      case 'RETURN_AFTER_UPLOAD':
      case 'VIEW_DETAILED_REPORT':
        return <CheckCircle className="w-5 h-5" />;
      case 'COMPLETE_DEMO':
      case 'EXPLORE_FEATURES':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <ArrowRight className="w-5 h-5" />;
    }
  };

  const getNudgeStyle = () => {
    if (nudge.nudge_type.includes('TRIAL_EXPIRING') || nudge.nudge_type.includes('LIMIT_REACHED')) {
      return 'border-yellow-200 bg-yellow-50';
    }
    if (nudge.priority === 1) {
      return 'border-indigo-200 bg-indigo-50';
    }
    return 'border-blue-200 bg-blue-50';
  };

  const getIconStyle = () => {
    if (nudge.nudge_type.includes('TRIAL_EXPIRING') || nudge.nudge_type.includes('LIMIT_REACHED')) {
      return 'text-yellow-600';
    }
    if (nudge.priority === 1) {
      return 'text-indigo-600';
    }
    return 'text-blue-600';
  };

  const getButtonStyle = () => {
    if (nudge.nudge_type.includes('TRIAL_EXPIRING') || nudge.nudge_type.includes('LIMIT_REACHED')) {
      return 'bg-yellow-600 hover:bg-yellow-700 text-white';
    }
    if (nudge.priority === 1) {
      return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  if (!isVisible) return null;

  return (
    <div className={`
      border rounded-lg p-4 mb-4 shadow-sm transition-all duration-300 ${getNudgeStyle()}
      ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`flex-shrink-0 ${getIconStyle()}`}>
            {getNudgeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {nudge.title}
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              {nudge.message}
            </p>
            <div className="flex items-center space-x-3">
              {nudge.cta_text && nudge.cta_url && (
                <button
                  onClick={handleAction}
                  className={`
                    inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
                    transition-colors ${getButtonStyle()}
                  `}
                >
                  {nudge.cta_text}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-4"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function SmartNudgeContainer({ nudges, onDismiss, onAction }: {
  nudges: SmartNudge[];
  onDismiss: (nudgeId: number) => void;
  onAction: (nudgeId: number, actionUrl?: string) => void;
}) {
  if (!nudges || nudges.length === 0) return null;

  return (
    <div className="space-y-4">
      {nudges
        .filter(nudge => nudge.status === 'PENDING')
        .sort((a, b) => a.priority - b.priority) // Sort by priority (1 = highest)
        .slice(0, 2) // Show max 2 nudges at once
        .map(nudge => (
          <SmartNudgeNotification
            key={nudge.id}
            nudge={nudge}
            onDismiss={onDismiss}
            onAction={onAction}
          />
        ))
      }
    </div>
  );
}