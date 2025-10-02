import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { inspectionsAPI } from '@/services/api';
import { format } from 'date-fns';
import {
  Shield,
  AlertTriangle,
  Sparkles,
  Shirt,
  Menu,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  Target,
  Camera,
  UtensilsCrossed,
  Wrench,
  Activity,
  ChefHat,
  Users,
} from 'lucide-react';
import type { Inspection, Finding, ActionItem } from '@/types';

const categoryIcons = {
  PPE: Shield,
  SAFETY: AlertTriangle,
  CLEANLINESS: Sparkles,
  UNIFORM: Shirt,
  MENU_BOARD: Menu,
  FOOD_SAFETY: UtensilsCrossed,
  EQUIPMENT: Wrench,
  OPERATIONAL: Activity,
  FOOD_QUALITY: ChefHat,
  STAFF_BEHAVIOR: Users,
  OTHER: FileText,
};

const severityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusColors = {
  OPEN: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DISMISSED: 'bg-gray-100 text-gray-800',
};

const modeColors = {
  COACHING: 'bg-green-100 text-green-800',
  INSPECTION: 'bg-blue-100 text-blue-800',
};

const statusIcons = {
  PENDING: Clock,
  PROCESSING: Clock,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
};

function ScoreBar({ score, label }: { score: number | null; label: string }) {
  const percentage = score || 0;
  const colorClass = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-900">{score !== null ? `${score}%` : 'N/A'}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface FindingCardProps {
  finding: Finding;
  onApprove: (findingId: number) => void;
  onReject: (findingId: number) => void;
}

function FindingCard({ finding, onApprove, onReject }: FindingCardProps) {
  const CategoryIcon = categoryIcons[finding.category] || FileText;

  // Format timestamp helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Check if this is a consolidated finding
  const isConsolidated = finding.affected_frame_count > 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <CategoryIcon className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">{finding.title}</h4>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[finding.severity]}`}>
            {finding.severity}
          </span>
          {isConsolidated && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {finding.affected_frame_count} frames
            </span>
          )}
        </div>
      </div>

      {finding.frame_image ? (
        <div className="relative">
          <img
            src={finding.frame_image}
            alt="Finding evidence"
            className="w-full h-48 object-cover rounded-md"
            onError={(e) => {
              // Hide broken image and show fallback
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback') as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="image-fallback hidden w-full h-48 bg-gray-200 rounded-md items-center justify-center text-gray-500">
            <div className="text-center">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Frame image unavailable</span>
            </div>
          </div>
          {/* Show time range or single timestamp */}
          {isConsolidated && finding.first_timestamp !== null && finding.last_timestamp !== null ? (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
              {formatTime(finding.first_timestamp)} - {formatTime(finding.last_timestamp)}
            </div>
          ) : finding.frame_timestamp !== null && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
              {formatTime(finding.frame_timestamp)}
            </div>
          )}
          {finding.bounding_box && (
            <div
              className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
              style={{
                left: `${(finding.bounding_box.x || 0) * 100}%`,
                top: `${(finding.bounding_box.y || 0) * 100}%`,
                width: `${(finding.bounding_box.width || 0) * 100}%`,
                height: `${(finding.bounding_box.height || 0) * 100}%`,
              }}
            />
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Frame image not available</span>
            {isConsolidated && finding.first_timestamp !== null && finding.last_timestamp !== null ? (
              <div className="text-xs text-gray-400 mt-1">
                Detected {formatTime(finding.first_timestamp)} - {formatTime(finding.last_timestamp)}
              </div>
            ) : finding.frame_timestamp !== null && (
              <div className="text-xs text-gray-400 mt-1">
                Detection at {formatTime(finding.frame_timestamp)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-gray-600">{finding.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          {isConsolidated && finding.average_confidence ? (
            <span>Confidence: {Math.round(finding.average_confidence * 100)}% avg, {Math.round(finding.confidence * 100)}% max</span>
          ) : (
            <span>Confidence: {Math.round(finding.confidence * 100)}%</span>
          )}
          {isConsolidated && finding.first_timestamp !== null && finding.last_timestamp !== null ? (
            <span>{formatTime(finding.first_timestamp)} - {formatTime(finding.last_timestamp)}</span>
          ) : finding.frame_timestamp !== null && (
            <span>@ {formatTime(finding.frame_timestamp)}</span>
          )}
        </div>

        {finding.recommended_action && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Recommended Action:</strong> {finding.recommended_action}
            </p>
          </div>
        )}

        {/* Approve/Reject buttons for manager review */}
        {!finding.is_manual && !finding.is_approved && !finding.is_rejected && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onApprove(finding.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Correct - Keep This
            </button>
            <button
              onClick={() => onReject(finding.id)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            >
              <XCircle className="w-4 h-4 mr-2" />
              False Alarm - Remove
            </button>
          </div>
        )}

        {/* Status indicators */}
        {finding.is_approved && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md text-sm font-medium text-center flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            ✓ Confirmed by you
          </div>
        )}

        {finding.is_rejected && (
          <div className="bg-gray-100 border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm text-center flex items-center justify-center line-through">
            <XCircle className="w-4 h-4 mr-2" />
            Dismissed as false positive
          </div>
        )}

        {finding.is_manual && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-md text-sm font-medium text-center flex items-center justify-center">
            <User className="w-4 h-4 mr-2" />
            ✓ Added by you (100% confidence)
          </div>
        )}
      </div>
    </div>
  );
}

function ActionItemCard({ actionItem }: { actionItem: ActionItem }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-gray-900">{actionItem.title}</h4>
        <div className="flex space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[actionItem.priority]}`}>
            {actionItem.priority}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[actionItem.status]}`}>
            {actionItem.status}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{actionItem.description}</p>
      
      <div className="space-y-2 text-sm text-gray-500">
        {actionItem.assigned_to_name && (
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Assigned to: {actionItem.assigned_to_name}
          </div>
        )}
        
        {actionItem.due_date && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Due: {format(new Date(actionItem.due_date), 'MMM d, yyyy')}
          </div>
        )}
        
        {actionItem.completed_at && actionItem.completed_by_name && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed by {actionItem.completed_by_name} on {format(new Date(actionItem.completed_at), 'MMM d, yyyy')}
          </div>
        )}
      </div>
      
      {actionItem.notes && (
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-700">{actionItem.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function InspectionDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: inspection, isLoading, error } = useQuery(
    ['inspection', id],
    () => inspectionsAPI.getInspection(Number(id)),
    {
      enabled: !!id,
      retry: (failureCount, error: any) => {
        // Don't retry on 404 errors
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      }
    }
  );

  // Mutation for approving findings
  const approveMutation = useMutation(
    (findingId: number) => inspectionsAPI.approveFinding(findingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inspection', id]);
      }
    }
  );

  // Mutation for rejecting findings
  const rejectMutation = useMutation(
    (findingId: number) => inspectionsAPI.rejectFinding(findingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inspection', id]);
      }
    }
  );

  // Handlers
  const handleApproveFinding = (findingId: number) => {
    approveMutation.mutate(findingId);
  };

  const handleRejectFinding = (findingId: number) => {
    if (window.confirm('Are you sure this detection is incorrect?')) {
      rejectMutation.mutate(findingId);
    }
  };

  // Use findings from inspection response instead of separate API call
  const findings = inspection?.findings || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading inspection</h3>
        <p className="mt-1 text-sm text-gray-500">
          Unable to load inspection details. Please try again.
        </p>
      </div>
    );
  }

  const StatusIcon = statusIcons[inspection.status];
  const findingsByCategory = findings.reduce((acc, finding) => {
    if (!acc[finding.category]) acc[finding.category] = [];
    acc[finding.category].push(finding);
    return acc;
  }, {} as Record<string, Finding[]>);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspection Report</h1>
            <p className="text-gray-600">{inspection.store_name} • {inspection.video_title}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${modeColors[inspection.mode]}`}>
              {inspection.mode}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              inspection.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              inspection.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
              inspection.status === 'FAILED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {inspection.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(inspection.created_at), 'MMM d, yyyy h:mm a')}
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            {inspection.findings_count || 0} findings
          </div>
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {inspection.critical_findings_count || 0} critical
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {inspection.open_actions_count || 0} open actions
          </div>
        </div>
      </div>

      {/* Overall Score */}
      {inspection.overall_score !== null && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h2>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {inspection.overall_score}%
              </div>
              <div className={`text-sm font-medium ${
                inspection.overall_score >= 80 ? 'text-green-600' :
                inspection.overall_score >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {inspection.overall_score >= 80 ? 'Excellent' :
                 inspection.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Scores */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ScoreBar score={inspection.ppe_score} label="PPE Compliance" />
          <ScoreBar score={inspection.safety_score} label="Safety" />
          <ScoreBar score={inspection.cleanliness_score} label="Cleanliness" />
          <ScoreBar score={inspection.uniform_score} label="Uniform Standards" />
          <ScoreBar score={inspection.menu_board_score} label="Menu Board" />
        </div>
      </div>

      {/* Findings */}
      {findings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Findings</h2>
          
          {Object.entries(findingsByCategory).map(([category, categoryFindings]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                {React.createElement(categoryIcons[category as keyof typeof categoryIcons] || FileText, { className: "w-5 h-5 mr-2" })}
                {category.replace('_', ' ')} ({categoryFindings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onApprove={handleApproveFinding}
                    onReject={handleRejectFinding}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Items */}
      {inspection.action_items && inspection.action_items.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspection.action_items.map((actionItem) => (
              <ActionItemCard key={actionItem.id} actionItem={actionItem} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {findings.length === 0 && (!inspection.action_items || inspection.action_items.length === 0) && inspection.status === 'COMPLETED' && (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Issues Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            This inspection completed successfully with no findings or action items.
          </p>
        </div>
      )}
    </div>
  );
}
