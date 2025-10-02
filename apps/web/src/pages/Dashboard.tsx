import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { inspectionsAPI, videosAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useSmartNudges } from '@/hooks/useSmartNudges';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';
import InspectorQueueWidget from '@/components/InspectorQueueWidget';
import InteractiveTwoVideoDemoContainer from '@/components/demo/InteractiveTwoVideoDemoContainer';
import { SmartNudgeContainer } from '@/components/nudges/SmartNudgeNotification';
import TrialStatusBanner from '@/components/TrialStatusBanner';
import {
  BarChart3,
  Video,
  FileSearch,
  AlertTriangle,
  CheckSquare,
  Plus,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [demoRequested, setDemoRequested] = useState(false);
  
  // Behavior tracking and smart nudges
  const { trackDashboardView } = useBehaviorTracking();
  const { nudges, handleNudgeAction, dismissNudge } = useSmartNudges();
  const { trackPageView, track } = useAnalytics();

  // Track dashboard view on mount
  useEffect(() => {
    if (user) {
      trackDashboardView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const { data: stats } = useQuery('inspection-stats', inspectionsAPI.getStats);
  
  const { data: recentVideos } = useQuery(
    'recent-videos',
    () => videosAPI.getVideos({ ordering: '-created_at', limit: 5 })
  );

  const { data: recentInspections } = useQuery(
    'recent-inspections',
    () => inspectionsAPI.getInspections({ ordering: '-created_at', limit: 5 })
  );

  // MVP Demo Experience Logic
  const shouldShowDemo = user && !user.demo_completed_at && (
    (user.is_trial_user && (stats?.total_inspections || 0) < 3) ||  // Trial users with <3 real inspections
    (user.created_at && getHoursSinceSignup(user.created_at) < 48) || // Brand new users (including admins)
    user.requested_demo ||                                            // Explicit demo request from backend
    demoRequested                                                     // Local demo request
  );

  // Helper function to calculate hours since signup
  function getHoursSinceSignup(createdAt: string): number {
    const signup = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - signup.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  const statCards = [
    {
      title: 'Total Inspections',
      value: stats?.total_inspections || 0,
      icon: FileSearch,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Avg Score',
      value: stats?.average_score ? `${stats.average_score}%` : 'N/A',
      icon: BarChart3,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Critical Findings',
      value: stats?.critical_findings || 0,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
    },
    {
      title: 'Open Actions',
      value: stats?.open_action_items || 0,
      icon: CheckSquare,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ];

  // Handle skip to dashboard
  const handleSkipToDashboard = () => {
    setDemoRequested(false);
    // Could also set a flag in localStorage to remember user preference
  };

  // Show interactive demo for trial users or new users
  if (shouldShowDemo) {
    return <InteractiveTwoVideoDemoContainer onClose={handleSkipToDashboard} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name}</p>
        </div>
        <div className="flex space-x-3">
          {user?.is_trial_user && !shouldShowDemo && (
            <button
              onClick={() => setDemoRequested(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              🎬 View Demo
            </button>
          )}
          <Link
            to="/videos/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </Link>
        </div>
      </div>

      {/* Smart Nudges */}
      <SmartNudgeContainer
        nudges={nudges}
        onDismiss={dismissNudge}
        onAction={handleNudgeAction}
      />

      {/* Trial Status Banner */}
      <TrialStatusBanner
        onUpgradeClick={() => {
          // TODO: Navigate to upgrade/pricing page
          console.log('Navigate to upgrade page');
        }}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Inspector Queue Widget - Only for inspectors and admins */}
        {(user?.role === 'INSPECTOR' || user?.role === 'ADMIN') && (
          <InspectorQueueWidget />
        )}
        {/* Recent Videos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Videos</h2>
            <Link
              to="/videos"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentVideos?.slice(0, 5).map((video) => (
              <div key={video.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <Video className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/videos/${video.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
                    title={video.title}
                  >
                    {video.title}
                  </Link>
                  <p className="text-xs text-gray-500 truncate" title={video.store_name}>{video.store_name}</p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      video.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : video.status === 'PROCESSING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : video.status === 'FAILED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {video.status}
                  </span>
                </div>
              </div>
            ))}
            {(!recentVideos || recentVideos.length === 0) && (
              <p className="text-sm text-gray-500">No videos uploaded yet</p>
            )}
          </div>
        </div>

        {/* Recent Inspections */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Inspections</h2>
            <Link
              to="/inspections"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentInspections?.slice(0, 5).map((inspection) => (
              <div key={inspection.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <FileSearch className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/inspections/${inspection.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
                    title={inspection.video_title}
                  >
                    {inspection.video_title}
                  </Link>
                  <p className="text-xs text-gray-500 truncate" title={`${inspection.store_name} • ${inspection.mode}`}>
                    {inspection.store_name} • {inspection.mode}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {inspection.overall_score && (
                    <p className="text-sm font-medium text-gray-900">
                      {Math.round(inspection.overall_score)}%
                    </p>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inspection.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : inspection.status === 'PROCESSING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : inspection.status === 'FAILED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {inspection.status}
                  </span>
                </div>
              </div>
            ))}
            {(!recentInspections || recentInspections.length === 0) && (
              <p className="text-sm text-gray-500">No inspections completed yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}