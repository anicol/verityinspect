import { useState, useRef, useEffect } from 'react';
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
  const [adjustedPosition, setAdjustedPosition] = useState(tip.position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

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
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
    }
  };

  // Adjust tooltip position based on viewport
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let newPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = tip.position;
      
      // Check if tooltip goes off right edge
      if (rect.right + tooltipRect.width > window.innerWidth - 20) {
        if (tip.position.includes('left')) {
          newPosition = tip.position.replace('left', 'right') as 'top-right' | 'bottom-right';
        }
      }
      
      // Check if tooltip goes off left edge
      if (rect.left - tooltipRect.width < 20) {
        if (tip.position.includes('right')) {
          newPosition = tip.position.replace('right', 'left') as 'top-left' | 'bottom-left';
        }
      }
      
      // Check if tooltip goes off top edge
      if (rect.top - tooltipRect.height < 20) {
        if (tip.position.includes('top')) {
          newPosition = tip.position.replace('top', 'bottom') as 'bottom-left' | 'bottom-right';
        }
      }
      
      // Check if tooltip goes off bottom edge
      if (rect.bottom + tooltipRect.height > window.innerHeight - 20) {
        if (tip.position.includes('bottom')) {
          newPosition = tip.position.replace('bottom', 'top') as 'top-left' | 'top-right';
        }
      }
      
      setAdjustedPosition(newPosition);
    }
  }, [isVisible, tip.position]);

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
    <div className="relative inline-block" ref={triggerRef}>
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
          ref={tooltipRef}
          className={`absolute z-50 w-80 max-w-screen-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${getPositionClasses(
            adjustedPosition
          )} animate-fadeIn`}
          style={{
            // Ensure tooltip doesn't go off-screen
            maxWidth: 'min(320px, calc(100vw - 2rem))',
            transform: adjustedPosition.includes('right') ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-sm pr-2">{tip.title}</h4>
            {tip.trigger === 'click' && (
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{tip.content}</p>
          
          {/* Arrow pointer */}
          <div
            className={`absolute w-3 h-3 bg-white border-gray-200 transform rotate-45 ${
              adjustedPosition.includes('top')
                ? 'top-full -mt-2 border-b border-r'
                : 'bottom-full -mb-2 border-t border-l'
            } ${
              adjustedPosition.includes('left') 
                ? 'left-4' 
                : adjustedPosition.includes('right')
                ? 'right-4'
                : 'left-1/2 -translate-x-1/2'
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