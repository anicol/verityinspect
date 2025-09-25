import { Violation } from './AnnotatedVideoPlayer';

interface ViolationOverlayProps {
  violation: Violation;
  showLabel?: boolean;
  animate?: boolean;
}

export default function ViolationOverlay({ 
  violation, 
  showLabel = true, 
  animate = true 
}: ViolationOverlayProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'border-red-600 bg-red-600';
      case 'HIGH': return 'border-red-500 bg-red-500';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-500';
      case 'LOW': return 'border-blue-500 bg-blue-500';
      default: return 'border-gray-500 bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PPE': return '🥽';
      case 'SAFETY': return '⚠️';
      case 'CLEANLINESS': return '🧹';
      case 'UNIFORM': return '👕';
      default: return '📋';
    }
  };

  const getSeverityPulse = (severity: string) => {
    if (!animate) return '';
    switch (severity) {
      case 'CRITICAL': return 'animate-pulse';
      case 'HIGH': return 'animate-pulse';
      default: return '';
    }
  };

  return (
    <div className="absolute pointer-events-none">
      {/* Bounding Box */}
      <div
        className={`absolute border-2 ${getSeverityColor(violation.severity)} opacity-80 ${getSeverityPulse(violation.severity)}`}
        style={{
          left: `${violation.bbox.x}%`,
          top: `${violation.bbox.y}%`,
          width: `${violation.bbox.width}%`,
          height: `${violation.bbox.height}%`,
        }}
      />
      
      {/* Violation Label */}
      {showLabel && (
        <div
          className={`absolute text-white text-xs px-2 py-1 rounded-md shadow-lg ${getSeverityColor(violation.severity)} ${animate ? 'animate-fadeIn' : ''}`}
          style={{
            left: `${violation.bbox.x}%`,
            top: `${Math.max(0, violation.bbox.y - 6)}%`,
            transform: violation.bbox.y < 10 ? 'translateY(100%)' : 'translateY(-100%)',
            minWidth: 'max-content',
          }}
        >
          <div className="flex items-center space-x-1">
            <span>{getCategoryIcon(violation.category)}</span>
            <span className="font-medium">{violation.title}</span>
            {violation.confidence && (
              <span className="text-xs opacity-75">
                {Math.round(violation.confidence * 100)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Severity indicator dot */}
      <div
        className={`absolute w-3 h-3 rounded-full ${getSeverityColor(violation.severity)} border border-white shadow-md`}
        style={{
          left: `${violation.bbox.x + violation.bbox.width / 2}%`,
          top: `${violation.bbox.y + violation.bbox.height / 2}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}