import { useQuery } from 'react-query';
import { format } from 'date-fns';
import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Server,
  PlayCircle,
  Pause,
  FileVideo,
  FileSearch,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { API_CONFIG } from '@/config/api';

interface QueueStats {
  active_tasks_count: number;
  scheduled_tasks_count: number;
  reserved_tasks_count: number;
  processing_uploads: number;
  processing_videos: number;
  pending_inspections: number;
  processing_inspections: number;
}

interface CeleryTask {
  id: string;
  name: string;
  args?: any[];
  kwargs?: any;
  worker?: string;
  time_start?: number;
  eta?: string;
}

interface QueueStatus {
  stats: QueueStats;
  active_tasks: CeleryTask[];
  scheduled_tasks: CeleryTask[];
  reserved_tasks: CeleryTask[];
  recent_uploads: any[];
  recent_videos: any[];
  recent_inspections: any[];
  timestamp: string;
  error?: string;
}

const fetchQueueStatus = async (): Promise<QueueStatus> => {
  const response = await fetch(`${API_CONFIG.baseURL}/admin/queue-status/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      ...API_CONFIG.headers,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch queue status');
  }

  return response.json();
};

export default function AdminQueuePage() {
  const { data, isLoading, error, refetch } = useQuery<QueueStatus>(
    'admin-queue-status',
    fetchQueueStatus,
    {
      refetchInterval: 3000, // Refresh every 3 seconds
      retry: 3,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading queue status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load queue status</h2>
        <p className="text-gray-600 mb-6">{(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const stats = data?.stats || {
    active_tasks_count: 0,
    scheduled_tasks_count: 0,
    reserved_tasks_count: 0,
    processing_uploads: 0,
    processing_videos: 0,
    pending_inspections: 0,
    processing_inspections: 0,
  };

  const getTaskDisplayName = (taskName: string) => {
    const parts = taskName.split('.');
    return parts[parts.length - 1] || taskName;
  };

  const formatTimestamp = (timestamp: string | number | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      const date = typeof timestamp === 'number'
        ? new Date(timestamp * 1000)
        : new Date(timestamp);
      return format(date, 'MMM d, HH:mm:ss');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processing Queue Monitor</h1>
          <p className="text-gray-600 mt-1">Real-time view of Celery task processing</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {data?.error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">Celery connection issue: {data.error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-green-600">{stats.active_tasks_count}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled_tasks_count}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing Videos</p>
              <p className="text-2xl font-bold text-purple-600">{stats.processing_videos}</p>
            </div>
            <FileVideo className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing Inspections</p>
              <p className="text-2xl font-bold text-orange-600">{stats.processing_inspections}</p>
            </div>
            <FileSearch className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <PlayCircle className="w-5 h-5 mr-2 text-green-600" />
            Active Tasks ({data?.active_tasks.length || 0})
          </h2>
        </div>
        <div className="p-6">
          {data?.active_tasks && data.active_tasks.length > 0 ? (
            <div className="space-y-3">
              {data.active_tasks.map((task) => (
                <div key={task.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                        <span className="font-medium text-gray-900">{getTaskDisplayName(task.name)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Task ID: {task.id}</p>
                      {task.args && task.args.length > 0 && (
                        <p className="text-sm text-gray-600">Args: {JSON.stringify(task.args)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <Server className="w-4 h-4 mr-1" />
                        {task.worker}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Started: {formatTimestamp(task.time_start)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active tasks</p>
          )}
        </div>
      </div>

      {/* Recent Processing Uploads */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            Recent Uploads ({data?.recent_uploads.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.recent_uploads && data.recent_uploads.length > 0 ? (
                data.recent_uploads.map((upload) => (
                  <tr key={upload.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{upload.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{upload.original_filename}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        upload.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {upload.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTimestamp(upload.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTimestamp(upload.updated_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No recent uploads
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileSearch className="w-5 h-5 mr-2 text-orange-600" />
            Recent Inspections ({data?.recent_inspections.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.recent_inspections && data.recent_inspections.length > 0 ? (
                data.recent_inspections.map((inspection) => (
                  <tr key={inspection.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspection.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{inspection.video_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{inspection.mode}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inspection.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        inspection.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTimestamp(inspection.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No recent inspections
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {data?.timestamp ? formatTimestamp(data.timestamp) : 'N/A'}
      </div>
    </div>
  );
}
