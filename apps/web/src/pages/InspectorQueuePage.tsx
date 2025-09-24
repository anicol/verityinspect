import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { videosAPI, inspectionsAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Filter,
  Search,
  Star,
  Timer,
  Building2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface QueueFilters {
  priority: string;
  mode: string;
  store: string;
  status: string;
  search: string;
}

export default function InspectorQueuePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [filters, setFilters] = useState<QueueFilters>({
    priority: '',
    mode: '',
    store: '',
    status: 'pending',
    search: ''
  });

  // Get videos awaiting inspection
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['inspector-queue', filters],
    queryFn: () => videosAPI.getVideos({
      status: 'COMPLETED', // Videos ready for inspection
      assigned_to: user?.role === 'INSPECTOR' ? user.id : undefined,
      priority: filters.priority,
      mode: filters.mode,
      store: filters.store,
      search: filters.search
    }),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get inspector's active inspections
  const { data: activeInspections } = useQuery({
    queryKey: ['active-inspections', user?.id],
    queryFn: () => inspectionsAPI.getInspections({
      inspector: user?.id,
      status: 'PROCESSING'
    })
  });

  // Start inspection mutation
  const startInspectionMutation = useMutation({
    mutationFn: ({ videoId, mode }: { videoId: number; mode: string }) =>
      inspectionsAPI.startInspection(videoId, mode as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspector-queue'] });
      queryClient.invalidateQueries({ queryKey: ['active-inspections'] });
    }
  });

  // Filter and sort videos
  const processedVideos = useMemo(() => {
    if (!videos) return [];

    let filtered = videos.filter((video: any) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesTitle = video.title.toLowerCase().includes(searchTerm);
        const matchesStore = video.store?.name?.toLowerCase().includes(searchTerm);
        if (!matchesTitle && !matchesStore) return false;
      }

      // Other filters would go here
      return true;
    });

    // Sort by priority and upload time
    return filtered.sort((a: any, b: any) => {
      // Priority sorting logic (could be based on store importance, urgency, etc.)
      const aPriority = getVideoPriority(a);
      const bPriority = getVideoPriority(b);
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      // Sort by upload time (oldest first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [videos, filters]);

  const handleStartInspection = async (videoId: number, mode: string) => {
    try {
      await startInspectionMutation.mutateAsync({ videoId, mode });
      setSelectedVideo(null);
    } catch (error) {
      alert('Failed to start inspection. Please try again.');
    }
  };

  const getVideoPriority = (video: any): number => {
    // Priority calculation logic
    const hoursSinceUpload = (Date.now() - new Date(video.created_at).getTime()) / (1000 * 60 * 60);
    
    // Higher priority for older videos
    let priority = Math.min(hoursSinceUpload / 24, 5); // Max 5 points for age
    
    // Add priority based on store (could be configurable)
    if (video.store?.priority === 'high') priority += 3;
    if (video.store?.priority === 'medium') priority += 1;
    
    return priority;
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 4) return 'text-red-600 bg-red-100';
    if (priority >= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPriorityLabel = (priority: number): string => {
    if (priority >= 4) return 'High';
    if (priority >= 2) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspector Queue</h1>
          <p className="text-gray-600">
            {processedVideos.length} videos awaiting inspection
            {activeInspections && activeInspections.length > 0 && `, ${activeInspections.length} in progress`}
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{processedVideos.length}</div>
            <div className="text-sm text-blue-600">Pending</div>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activeInspections?.length || 0}</div>
            <div className="text-sm text-green-600">In Progress</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search videos..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={filters.mode}
            onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
            className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Modes</option>
            <option value="inspection">Inspection</option>
            <option value="coaching">Coaching</option>
          </select>

          <select
            value={filters.store}
            onChange={(e) => setFilters({ ...filters, store: e.target.value })}
            className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Stores</option>
            {/* Store options would be populated from API */}
          </select>

          <button
            onClick={() => setFilters({
              priority: '',
              mode: '',
              store: '',
              status: 'pending',
              search: ''
            })}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2 inline" />
            Clear
          </button>
        </div>
      </div>

      {/* Video Queue */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {videosLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading videos...</p>
          </div>
        ) : processedVideos.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No videos awaiting inspection at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {processedVideos.map((video: any) => {
              const priority = getVideoPriority(video);
              const isSelected = selectedVideo === video.id.toString();
              
              return (
                <div
                  key={video.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedVideo(isSelected ? null : video.id.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Video Thumbnail Placeholder */}
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-500" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {video.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <Building2 className="w-4 h-4 mr-1" />
                            {video.store?.name || 'Unknown Store'}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(video.created_at), 'MMM d, h:mm a')}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Timer className="w-4 h-4 mr-1" />
                            {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Priority Badge */}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(priority)}`}>
                        {getPriorityLabel(priority)}
                      </span>
                      
                      {/* Mode Badge */}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        video.mode === 'inspection' 
                          ? 'text-red-600 bg-red-100' 
                          : 'text-blue-600 bg-blue-100'
                      }`}>
                        {video.mode?.toUpperCase() || 'INSPECTION'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Expanded Actions */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartInspection(video.id, 'inspection');
                          }}
                          disabled={startInspectionMutation.isLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Start Inspection
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartInspection(video.id, 'coaching');
                          }}
                          disabled={startInspectionMutation.isLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Start Coaching
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/videos/${video.id}`, '_blank');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Preview Video
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Inspections Section */}
      {activeInspections && activeInspections.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="text-lg font-medium text-gray-900">Active Inspections</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {activeInspections.map((inspection: any) => (
              <div key={inspection.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {inspection.video?.title || `Inspection #${inspection.id}`}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Started {format(new Date(inspection.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-yellow-600 bg-yellow-100">
                      IN PROGRESS
                    </span>
                    <button
                      onClick={() => window.open(`/inspections/${inspection.id}`, '_blank')}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}