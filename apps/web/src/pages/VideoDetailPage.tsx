import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Download, 
  Share2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Bug
} from 'lucide-react';
import { format } from 'date-fns';
import { videosAPI } from '@/services/api';
import type { Video, Inspection, Finding } from '@/types';

// Import video player component
import VideoPlayerWithMarkers from '@/components/inspection/VideoPlayerWithMarkers';

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Fetch video details
  const { data: video, isLoading: videoLoading, error: videoError } = useQuery<Video>(
    ['video', id],
    () => videosAPI.getVideo(Number(id)),
    { enabled: !!id }
  );

  // Fetch inspection results
  const { data: inspection, isLoading: inspectionLoading } = useQuery<Inspection | null>(
    ['videoInspection', id],
    () => videosAPI.getVideoInspection(Number(id)),
    { enabled: !!id }
  );

  const handleTimestampClick = (timestamp: number) => {
    setCurrentVideoTime(timestamp);
    // Smooth scroll to video player
    const videoElement = document.getElementById('video-player');
    if (videoElement) {
      videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReprocess = async () => {
    if (!id) return;

    setIsReprocessing(true);
    try {
      await videosAPI.reprocessVideo(Number(id));
      // Optionally show a success message or redirect
      alert('Video reprocessing started. Results will be updated shortly.');
    } catch (error: any) {
      console.error('Failed to reprocess video:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to start reprocessing. Please try again.';
      alert(errorMessage);
    } finally {
      setIsReprocessing(false);
    }
  };

  if (videoLoading || !id) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading video details...</p>
        </div>
      </div>
    );
  }

  if (videoError || !video) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Video not found</h2>
        <p className="text-gray-600 mb-6">The video you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/videos')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Videos
        </button>
      </div>
    );
  }

  const roundScore = (score: number) => {
    return Number(score.toFixed(1));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-200';
    if (score >= 80) return 'bg-blue-100 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-100 border-red-200';
      case 'HIGH': return 'text-red-600 bg-red-100 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="w-4 h-4" />;
      case 'HIGH': return <XCircle className="w-4 h-4" />;
      case 'MEDIUM': return <AlertTriangle className="w-4 h-4" />;
      case 'LOW': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  // Create categories from inspection data
  const categories = inspection ? [
    {
      name: 'PPE Compliance',
      score: roundScore(inspection.ppe_score || 0),
      maxScore: 100,
      status: (inspection.ppe_score || 0) >= 90 ? 'excellent' : (inspection.ppe_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'PPE').length || 0,
      color: (inspection.ppe_score || 0) >= 90 ? 'green' : (inspection.ppe_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Safety',
      score: roundScore(inspection.safety_score || 0),
      maxScore: 100,
      status: (inspection.safety_score || 0) >= 90 ? 'excellent' : (inspection.safety_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'SAFETY').length || 0,
      color: (inspection.safety_score || 0) >= 90 ? 'green' : (inspection.safety_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Cleanliness',
      score: roundScore(inspection.cleanliness_score || 0),
      maxScore: 100,
      status: (inspection.cleanliness_score || 0) >= 90 ? 'excellent' : (inspection.cleanliness_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'CLEANLINESS').length || 0,
      color: (inspection.cleanliness_score || 0) >= 90 ? 'green' : (inspection.cleanliness_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Food Safety',
      score: roundScore(inspection.food_safety_score || 0),
      maxScore: 100,
      status: (inspection.food_safety_score || 0) >= 90 ? 'excellent' : (inspection.food_safety_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'FOOD_SAFETY').length || 0,
      color: (inspection.food_safety_score || 0) >= 90 ? 'green' : (inspection.food_safety_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Equipment',
      score: roundScore(inspection.equipment_score || 0),
      maxScore: 100,
      status: (inspection.equipment_score || 0) >= 90 ? 'excellent' : (inspection.equipment_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'EQUIPMENT').length || 0,
      color: (inspection.equipment_score || 0) >= 90 ? 'green' : (inspection.equipment_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Operational',
      score: roundScore(inspection.operational_score || 0),
      maxScore: 100,
      status: (inspection.operational_score || 0) >= 90 ? 'excellent' : (inspection.operational_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'OPERATIONAL').length || 0,
      color: (inspection.operational_score || 0) >= 90 ? 'green' : (inspection.operational_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Food Quality',
      score: roundScore(inspection.food_quality_score || 0),
      maxScore: 100,
      status: (inspection.food_quality_score || 0) >= 90 ? 'excellent' : (inspection.food_quality_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'FOOD_QUALITY').length || 0,
      color: (inspection.food_quality_score || 0) >= 90 ? 'green' : (inspection.food_quality_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Staff Behavior',
      score: roundScore(inspection.staff_behavior_score || 0),
      maxScore: 100,
      status: (inspection.staff_behavior_score || 0) >= 90 ? 'excellent' : (inspection.staff_behavior_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'STAFF_BEHAVIOR').length || 0,
      color: (inspection.staff_behavior_score || 0) >= 90 ? 'green' : (inspection.staff_behavior_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Uniform Standards',
      score: roundScore(inspection.uniform_score || 0),
      maxScore: 100,
      status: (inspection.uniform_score || 0) >= 90 ? 'excellent' : (inspection.uniform_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'UNIFORM').length || 0,
      color: (inspection.uniform_score || 0) >= 90 ? 'green' : (inspection.uniform_score || 0) >= 80 ? 'blue' : 'yellow'
    },
    {
      name: 'Menu Board',
      score: roundScore(inspection.menu_board_score || 0),
      maxScore: 100,
      status: (inspection.menu_board_score || 0) >= 90 ? 'excellent' : (inspection.menu_board_score || 0) >= 80 ? 'good' : 'needs-attention',
      issues: inspection.findings?.filter(f => f.category === 'MENU_BOARD').length || 0,
      color: (inspection.menu_board_score || 0) >= 90 ? 'green' : (inspection.menu_board_score || 0) >= 80 ? 'blue' : 'yellow'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/videos')}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Videos
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setDebugMode(!debugMode)}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  debugMode 
                    ? 'text-orange-700 border-orange-300 bg-orange-50' 
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Bug className="w-4 h-4 mr-2" />
                Debug
              </button>
              <button 
                onClick={handleReprocess}
                disabled={isReprocessing}
                className="flex items-center px-4 py-2 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isReprocessing ? 'animate-spin' : ''}`} />
                {isReprocessing ? 'Reprocessing...' : 'Reprocess'}
              </button>
              <button className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Inspection Overview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{video.store_name}</h1>
                    <div className="flex items-center text-blue-100 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      {video.title}
                    </div>
                    <div className="flex items-center space-x-4 text-blue-100 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(video.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      {video.duration && (
                        <div>Duration: {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">
                      {inspection?.overall_score ? `${roundScore(inspection.overall_score)}%` : 'N/A'}
                    </div>
                    <div className="text-blue-100">Overall Score</div>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div className="p-6 border-b border-gray-200">
                {video.file ? (
                  <div>
                    <div id="video-player" className="bg-gray-900 rounded-lg overflow-hidden">
                      <VideoPlayerWithMarkers
                        videoUrl={video.file}
                        findings={inspection?.findings || []}
                        currentTime={currentVideoTime}
                        onTimeUpdate={setCurrentVideoTime}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      This video will be automatically deleted after 7 days for privacy protection
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-white text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                      <p>Video not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Scores */}
              {inspection?.status === 'COMPLETED' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {categories.map((category, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getScoreBgColor(category.score)}`}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                            {category.score}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full ${
                              category.score >= 90 ? 'bg-green-600' :
                              category.score >= 80 ? 'bg-blue-600' :
                              category.score >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${category.score}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{category.issues} issues found</span>
                          <span>{category.score}/{category.maxScore}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Issues List */}
            {inspection?.status === 'COMPLETED' && inspection.findings && inspection.findings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      AI-Identified Issues ({inspection.findings.length})
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        High Priority
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        Medium Priority
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        Low Priority
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {inspection.findings.map((finding: Finding) => {
                    const isConsolidated = finding.affected_frame_count > 1;
                    const formatTime = (seconds: number) => {
                      const mins = Math.floor(seconds / 60);
                      const secs = Math.floor(seconds % 60);
                      return `${mins}:${String(secs).padStart(2, '0')}`;
                    };

                    return (
                      <div key={finding.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(finding.severity)}`}>
                              {getSeverityIcon(finding.severity)}
                              <span className="ml-1 capitalize">{finding.severity.toLowerCase()}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">{finding.title}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2 flex-wrap">
                                <span className="bg-gray-100 px-2 py-1 rounded">{finding.category}</span>
                                {isConsolidated ? (
                                  <>
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                                      {finding.affected_frame_count} frames
                                    </span>
                                    {finding.first_timestamp !== null && finding.last_timestamp !== null && (
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {formatTime(finding.first_timestamp)} - {formatTime(finding.last_timestamp)}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  finding.frame_timestamp !== null && (
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatTime(finding.frame_timestamp)}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {isConsolidated && finding.average_confidence ? (
                              <>
                                <div>AI Confidence: {Math.round(finding.confidence * 100)}% max</div>
                                <div className="text-xs text-gray-400">{Math.round(finding.average_confidence * 100)}% avg</div>
                              </>
                            ) : (
                              <div>AI Confidence: {Math.round(finding.confidence * 100)}%</div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{finding.description}</p>

                        {/* Frame Image Preview */}
                        {finding.frame_image && (
                          <div className="mb-4">
                            <div className="relative inline-block">
                              <img
                                src={finding.frame_image}
                                alt={`Frame at ${finding.frame_timestamp ? formatTime(finding.frame_timestamp) : 'unknown time'}`}
                                className="rounded-lg border border-gray-300 max-w-md w-full cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(finding.frame_image || '', '_blank')}
                              />
                              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                                {isConsolidated ? (
                                  <span>Representative frame</span>
                                ) : (
                                  <span>Frame @ {finding.frame_timestamp ? formatTime(finding.frame_timestamp) : '0:00'}</span>
                                )}
                              </div>
                              {finding.bounding_box && (
                                <div className="absolute top-2 left-2 bg-red-500 bg-opacity-80 text-white px-2 py-1 rounded text-xs">
                                  Detection zone marked
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
                          </div>
                        )}

                        {finding.recommended_action && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Recommended Action</h4>
                            <p className="text-blue-800 text-sm mb-2">{finding.recommended_action}</p>
                            <div className="flex justify-between items-center text-xs text-blue-700">
                              {finding.estimated_minutes ? (
                                <span>Estimated time: ~{finding.estimated_minutes} minutes</span>
                              ) : (
                                <span>Estimated time: varies</span>
                              )}
                              <button
                                onClick={() => handleTimestampClick(
                                  isConsolidated && finding.first_timestamp !== null
                                    ? finding.first_timestamp
                                    : finding.frame_timestamp || 0
                                )}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                View in Video
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overall Score</span>
                  <span className={`text-2xl font-bold ${inspection?.overall_score ? getScoreColor(inspection.overall_score) : 'text-gray-400'}`}>
                    {inspection?.overall_score ? `${roundScore(inspection.overall_score)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Issues</span>
                  <span className="text-xl font-semibold text-gray-900">{inspection?.findings?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">High Priority</span>
                  <span className="text-xl font-semibold text-red-600">
                    {inspection?.findings?.filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Medium Priority</span>
                  <span className="text-xl font-semibold text-yellow-600">
                    {inspection?.findings?.filter(f => f.severity === 'MEDIUM').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Low Priority</span>
                  <span className="text-xl font-semibold text-blue-600">
                    {inspection?.findings?.filter(f => f.severity === 'LOW').length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Summary */}
            {inspection?.status === 'COMPLETED' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Estimated Total Time</span>
                    <span className="font-medium text-gray-900">{(inspection.findings?.length || 0) * 8} minutes</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Immediate Actions</span>
                    <span className="font-medium text-red-600">{inspection.findings?.filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL').length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-medium text-yellow-600">{inspection.findings?.filter(f => f.severity === 'MEDIUM').length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Ongoing</span>
                    <span className="font-medium text-blue-600">{inspection.findings?.filter(f => f.severity === 'LOW').length || 0}</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Create Action Plan
                </button>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Address high-priority issues first</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Schedule follow-up inspection in 1 week</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Update team on improvement areas</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Review cleaning procedures</span>
                </li>
              </ul>
            </div>

            {/* Debug Panel */}
            {debugMode && (
              <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 text-white">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Bug className="w-5 h-5 mr-2 text-orange-400" />
                  AI Analysis Debug Data
                </h3>

                {inspection?.ai_analysis ? (
                  <div className="space-y-6">
                    {/* Frame Gallery */}
                    {video?.frames && video.frames.length > 0 && (
                      <div>
                        <h4 className="font-medium text-orange-400 mb-3 flex items-center justify-between">
                          <span>Extracted Frames ({video.frames.length})</span>
                          <span className="text-xs text-gray-400 font-normal">
                            Click frame to view full size
                          </span>
                        </h4>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-96 overflow-y-auto p-2 bg-gray-800 rounded">
                          {video.frames.map((frame: any, index: number) => {
                            const hasFindings = inspection.findings?.some((f: any) => f.frame === frame.id);
                            return (
                              <div
                                key={frame.id}
                                className={`relative group cursor-pointer rounded overflow-hidden border-2 transition-all ${
                                  hasFindings
                                    ? 'border-red-500 shadow-lg shadow-red-500/50'
                                    : 'border-gray-600 hover:border-gray-400'
                                }`}
                                onClick={() => window.open(frame.image, '_blank')}
                              >
                                <img
                                  src={frame.image}
                                  alt={`Frame ${frame.frame_number}`}
                                  className="w-full h-20 object-cover group-hover:opacity-75 transition-opacity"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-[10px] px-1 py-0.5 text-center">
                                  {Math.floor(frame.timestamp / 60)}:{String(Math.floor(frame.timestamp % 60)).padStart(2, '0')}
                                </div>
                                {hasFindings && (
                                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1 rounded-bl">
                                    !
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          <span className="text-red-400">Red border</span> = Frame has findings
                        </p>
                      </div>
                    )}

                    {/* Analysis Summary */}
                    <div>
                      <h4 className="font-medium text-orange-400 mb-2">Analysis Summary</h4>
                      <pre className="text-xs bg-gray-800 p-3 rounded overflow-x-auto">
                        {JSON.stringify(inspection.ai_analysis.analysis_summary, null, 2)}
                      </pre>
                    </div>

                    {/* Frame Analyses */}
                    <div>
                      <h4 className="font-medium text-orange-400 mb-2">
                        Frame Analyses ({inspection.ai_analysis.frame_analyses?.length || 0} frames)
                      </h4>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {inspection.ai_analysis.frame_analyses?.map((frameAnalysis: any, index: number) => (
                          <details key={index} className="bg-gray-800 rounded p-3">
                            <summary className="cursor-pointer text-sm font-medium mb-2">
                              Frame {index + 1} - Score: {frameAnalysis.overall_score?.toFixed(1) || 'N/A'}%
                            </summary>
                            <div className="text-xs space-y-2">
                              {/* PPE Analysis */}
                              {frameAnalysis.ppe_analysis && (
                                <div>
                                  <span className="text-blue-300 font-medium">PPE Detection:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.ppe_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Safety Objects */}
                              {frameAnalysis.safety_analysis?.length > 0 && (
                                <div>
                                  <span className="text-red-300 font-medium">Safety Objects:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.safety_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Cleanliness Objects */}
                              {frameAnalysis.cleanliness_analysis?.length > 0 && (
                                <div>
                                  <span className="text-green-300 font-medium">Cleanliness Objects:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.cleanliness_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Food Safety Objects */}
                              {frameAnalysis.food_safety_analysis?.length > 0 && (
                                <div>
                                  <span className="text-teal-300 font-medium">Food Safety Objects:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.food_safety_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Equipment Objects */}
                              {frameAnalysis.equipment_analysis?.length > 0 && (
                                <div>
                                  <span className="text-orange-300 font-medium">Equipment Objects:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.equipment_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Operational Objects */}
                              {frameAnalysis.operational_analysis?.length > 0 && (
                                <div>
                                  <span className="text-cyan-300 font-medium">Operational Objects:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.operational_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Food Quality Objects */}
                              {frameAnalysis.food_quality_analysis?.length > 0 && (
                                <div>
                                  <span className="text-pink-300 font-medium">Food Quality Objects:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.food_quality_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Staff Behavior Objects */}
                              {frameAnalysis.staff_behavior_analysis?.length > 0 && (
                                <div>
                                  <span className="text-indigo-300 font-medium">Staff Behavior Objects:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.staff_behavior_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Text Analysis */}
                              {frameAnalysis.text_analysis && Object.keys(frameAnalysis.text_analysis).length > 0 && (
                                <div>
                                  <span className="text-lime-300 font-medium">Text Detection:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.text_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* People Analysis */}
                              {frameAnalysis.people_analysis && Object.keys(frameAnalysis.people_analysis).length > 0 && (
                                <div>
                                  <span className="text-amber-300 font-medium">People Detection:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.people_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Uniform Analysis */}
                              {frameAnalysis.uniform_analysis && (
                                <div>
                                  <span className="text-purple-300 font-medium">Uniform Analysis:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.uniform_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Menu Board Analysis */}
                              {frameAnalysis.menu_board_analysis && (
                                <div>
                                  <span className="text-yellow-300 font-medium">Menu Board Analysis:</span>
                                  <pre className="ml-2 mt-1 text-gray-300">
                                    {JSON.stringify(frameAnalysis.menu_board_analysis, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        )) || <p className="text-gray-400 text-sm">No frame analyses available</p>}
                      </div>
                    </div>

                    {/* Configuration Info */}
                    <div>
                      <h4 className="font-medium text-orange-400 mb-2">Detection Configuration</h4>
                      <div className="text-xs space-y-1 text-gray-300">
                        <p>• AWS Rekognition: PPE Detection + Object Detection + Text Detection + People Counting</p>
                        <p>• Detection Categories: 10 categories (PPE, Safety, Cleanliness, Food Safety, Equipment, Operational, Food Quality, Staff Behavior, Uniform, Menu Board)</p>
                        <p>• EasyOCR: Menu Board Analysis (enabled)</p>
                        <p>• YOLO: Enhanced Object Detection (disabled)</p>
                        <p>• Confidence Thresholds: PPE 80%, Objects 70%, Text 80%</p>
                        <p>• Max People in Kitchen: 10 persons</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bug className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No AI analysis data available</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try reprocessing the video to generate debug data
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}