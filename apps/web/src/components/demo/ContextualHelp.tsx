import { useState } from 'react';
import { HelpCircle, X, ChevronRight } from 'lucide-react';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  trigger?: 'click' | 'hover';
}

interface ContextualHelpProps {
  tip: HelpTip;
  children?: React.ReactNode;
}

export default function ContextualHelp({ tip, children }: ContextualHelpProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top-left':
        return 'bottom-full left-0 mb-2';
      case 'top-right':
        return 'bottom-full right-0 mb-2';
      case 'bottom-left':
        return 'top-full left-0 mt-2';
      case 'bottom-right':
        return 'top-full right-0 mt-2';
      default:
        return 'top-full left-0 mt-2';
    }
  };

  const handleMouseEnter = () => {
    if (tip.trigger === 'hover' || !tip.trigger) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (tip.trigger === 'hover' || !tip.trigger) {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (tip.trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div className="relative inline-block">
      {children ? (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="cursor-help"
        >
          {children}
        </div>
      ) : (
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      )}

      {/* Help Tooltip */}
      {isVisible && (
        <div
          className={`absolute z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${getPositionClasses(
            tip.position
          )} animate-fadeIn`}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">{tip.title}</h4>
            {tip.trigger === 'click' && (
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{tip.content}</p>
          
          {/* Arrow pointer */}
          <div
            className={`absolute w-3 h-3 bg-white border-gray-200 transform rotate-45 ${
              tip.position.includes('top')
                ? 'top-full -mt-2 border-b border-r'
                : 'bottom-full -mb-2 border-t border-l'
            } ${
              tip.position.includes('left') 
                ? 'left-4' 
                : 'right-4'
            }`}
          />
        </div>
      )}
    </div>
  );
}

// Pre-configured help tips for the demo experience
export const DemoHelpTips = {
  VIDEO_PLAYER: {
    id: 'video-player',
    title: 'Interactive Demo Video',
    content: 'This is a simulated inspection video. Click play to see how our AI analyzes restaurant operations in real-time, identifying compliance issues automatically.',
    position: 'bottom-left' as const,
  },
  
  LIVE_ANALYSIS: {
    id: 'live-analysis',
    title: 'Real-Time AI Analysis',
    content: 'Watch as our AI identifies safety, cleanliness, and compliance issues as the video plays. Each finding shows confidence levels and specific locations.',
    position: 'bottom-left' as const,
  },
  
  RESULTS_SUMMARY: {
    id: 'results-summary',
    title: 'Compliance Scores',
    content: 'Get instant compliance scores across key categories: PPE, Safety, Cleanliness, and Uniforms. These scores help you identify areas needing attention.',
    position: 'top-right' as const,
  },
  
  UPLOAD_BUTTON: {
    id: 'upload-button',
    title: 'Ready to Try Your Own Video?',
    content: 'Upload your own restaurant footage to get real AI analysis. Our guided scenarios help you choose the best type of video for maximum insights.',
    position: 'top-right' as const,
  },
};