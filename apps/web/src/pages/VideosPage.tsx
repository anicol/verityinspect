import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { videosAPI } from '@/services/api';
import { Video, Upload, Play, Calendar, FileText, Target, Users } from 'lucide-react';
import { format } from 'date-fns';

const modeColors = {
  COACHING: 'bg-green-100 text-green-800',
  ENTERPRISE: 'bg-blue-100 text-blue-800',
};

const modeIcons = {
  COACHING: Target,
  ENTERPRISE: Users,
};

export default function VideosPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  
  const { data: videos, isLoading } = useQuery(
    ['videos', { status: statusFilter }],
    () => videosAPI.getVideos({ status: statusFilter || undefined }),
    {
      refetchOnWindowFocus: true,
      refetchInterval: (data) => {
        // Auto-refetch every 5 seconds if there are any processing videos
        const hasProcessing = data?.some(v => v.status === 'PROCESSING' || v.status === 'UPLOADED');
        return hasProcessing ? 5000 : false;
      }
    }
  );

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'UPLOADED', label: 'Uploaded' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
  ];

  const modeOptions = [
    { value: '', label: 'All Modes' },
    { value: 'COACHING', label: 'Coaching (Self-Review)' },
    { value: 'ENTERPRISE', label: 'Enterprise (Inspector)' },
  ];

  // Client-side filter for mode
  const filteredVideos = videos?.filter(video => {
    if (!modeFilter) return true;
    return video.mode === modeFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
          <p className="text-gray-600">Manage your uploaded videos</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/capture"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Video className="w-4 h-4 mr-2" />
            Mobile Capture
          </Link>
          <Link
            to="/videos/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
              Mode
            </label>
            <select
              id="mode"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {modeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos?.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      video.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : video.status === 'PROCESSING'
                        ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                        : video.status === 'FAILED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {video.status === 'PROCESSING' && (
                      <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {video.status}
                  </span>
                  {video.mode && (() => {
                    const ModeIcon = modeIcons[video.mode];
                    return (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${modeColors[video.mode]}`}>
                        <ModeIcon className="w-3 h-3 mr-1" />
                        {video.mode === 'COACHING' ? 'Self-Review' : 'Inspector'}
                      </span>
                    );
                  })()}
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <Link
                    to={`/videos/${video.id}`}
                    className="hover:text-indigo-600"
                  >
                    {video.title}
                  </Link>
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {video.store_name}
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(video.created_at), 'MMM d, yyyy')}
                  </div>
                  
                  {video.file_size_mb && (
                    <div className="text-xs text-gray-500">
                      {video.file_size_mb} MB
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/videos/${video.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                  
                  {video.status === 'COMPLETED' && (
                    <span className="text-xs text-green-600 font-medium">
                      Ready for inspection
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredVideos && filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first video.
          </p>
          <div className="mt-6">
            <Link
              to="/videos/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}