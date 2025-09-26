import { CheckCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import type { Finding } from '@/types';

interface QuickFixCardProps {
  finding: Finding;
  onTimestampClick: (timestamp: number) => void;
}

interface QuickFixesGridProps {
  findings: Finding[];
  onTimestampClick: (timestamp: number) => void;
}

function QuickFixCard({ finding, onTimestampClick }: QuickFixCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'border-red-500 bg-red-50';
      case 'HIGH': return 'border-orange-500 bg-orange-50';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': 
      case 'HIGH': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'MEDIUM': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'PPE': return '🦺';
      case 'SAFETY': return '⚠️';
      case 'CLEANLINESS': return '🧽';
      case 'UNIFORM': return '👕';
      case 'MENU_BOARD': return '📋';
      default: return '📝';
    }
  };

  return (
    <div 
      className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${getSeverityColor(finding.severity)}`}
      onClick={() => finding.frame_timestamp && onTimestampClick(finding.frame_timestamp)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryEmoji(finding.category)}</span>
          {getSeverityIcon(finding.severity)}
        </div>
        {finding.frame_timestamp && (
          <div className="flex items-center space-x-1 text-xs text-gray-600 bg-white px-2 py-1 rounded">
            <ExternalLink className="h-3 w-3" />
            <span>{formatTimestamp(finding.frame_timestamp)}</span>
          </div>
        )}
      </div>
      
      {finding.frame_image && (
        <div className="mb-3">
          <img 
            src={finding.frame_image} 
            alt="Issue frame"
            className="w-full h-20 object-cover rounded border"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm">
          {finding.title}
        </h3>
        <p className="text-xs text-gray-700 line-clamp-2">
          {finding.recommended_action || finding.description}
        </p>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Click to view in video →
      </div>
    </div>
  );
}

function PositiveCard() {
  const positiveMessages = [
    { emoji: '✅', title: 'Great uniforms!', message: 'Team is looking professional today' },
    { emoji: '👏', title: 'Clean workspace!', message: 'Work area is well organized' },
    { emoji: '🌟', title: 'Good safety habits!', message: 'Team following protocols well' },
    { emoji: '💪', title: 'Strong teamwork!', message: 'Everyone working together' },
    { emoji: '🎯', title: 'On target!', message: 'Meeting quality standards' }
  ];
  
  const positive = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
  
  return (
    <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{positive.emoji}</span>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm">
          {positive.title}
        </h3>
        <p className="text-xs text-gray-700">
          {positive.message}
        </p>
      </div>
      
      <div className="mt-3 text-xs text-green-600 font-medium">
        Keep up the excellent work! 🎉
      </div>
    </div>
  );
}

export default function QuickFixesGrid({ findings, onTimestampClick }: QuickFixesGridProps) {
  // Sort findings by severity and confidence, take top 3
  const topFindings = findings
    .filter(f => f.severity !== 'LOW') // Filter out low severity
    .sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    })
    .slice(0, 3);

  if (topFindings.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🎉 Excellent Work!
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PositiveCard />
          <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center text-green-700">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">All systems go!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Quick Fixes Today
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {topFindings.map((finding) => (
          <QuickFixCard 
            key={finding.id} 
            finding={finding} 
            onTimestampClick={onTimestampClick}
          />
        ))}
        <PositiveCard />
      </div>
      {findings.length > 3 && (
        <p className="text-sm text-gray-600 text-center">
          Showing top {topFindings.length} priority items • {findings.length - topFindings.length} more in detailed report
        </p>
      )}
    </div>
  );
}