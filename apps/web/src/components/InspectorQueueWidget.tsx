import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { videosAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function InspectorQueueWidget() {
  const { user } = useAuth();

  const { data: pendingVideos, isLoading } = useQuery({
    queryKey: ['pending-inspections', user?.id],
    queryFn: () => videosAPI.getVideos({
      status: 'COMPLETED',
      assigned_to: user?.role === 'INSPECTOR' ? user.id : undefined,
      limit: 5
    }),
    enabled: user?.role === 'INSPECTOR' || user?.role === 'ADMIN',
    refetchInterval: 60000 // Refresh every minute
  });

  if (user?.role !== 'INSPECTOR' && user?.role !== 'ADMIN') {
    return null;
  }

  const getUrgencyLevel = (uploadDate: string) => {
    const hours = (Date.now() - new Date(uploadDate).getTime()) / (1000 * 60 * 60);
    if (hours > 24) return 'high';
    if (hours > 8) return 'medium';
    return 'low';
  };

  const urgentCount = pendingVideos?.filter((v: any) => getUrgencyLevel(v.created_at) === 'high').length || 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Inspector Queue</h3>
        <Link
          to="/inspector-queue"
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      ) : !pendingVideos || pendingVideos.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No pending inspections</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{pendingVideos.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
              <div className="text-xs text-gray-500">Urgent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pendingVideos.length - urgentCount}
              </div>
              <div className="text-xs text-gray-500">Normal</div>
            </div>
          </div>

          {/* Recent Videos */}
          <div className="space-y-3">
            {pendingVideos.slice(0, 3).map((video: any) => {
              const urgency = getUrgencyLevel(video.created_at);
              
              return (
                <div key={video.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {video.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {video.store?.name || 'Unknown Store'}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500">
                        {format(new Date(video.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-3">
                    {urgency === 'high' && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      urgency === 'high' 
                        ? 'text-red-600 bg-red-100' 
                        : urgency === 'medium'
                        ? 'text-yellow-600 bg-yellow-100'
                        : 'text-green-600 bg-green-100'
                    }`}>
                      {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Soon' : 'Normal'}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {pendingVideos.length > 3 && (
              <div className="pt-2">
                <Link
                  to="/inspector-queue"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  +{pendingVideos.length - 3} more videos awaiting inspection
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}