import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Brain, Eye, CheckCircle, Clock, Shield, Zap } from 'lucide-react';
import { uploadsAPI, videosAPI } from '@/services/api';

export default function ProcessingPage() {
  const { uploadId } = useParams<{ uploadId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const stages = [
    { name: 'Uploading video', icon: Clock, key: 'uploading' },
    { name: 'Extracting frames', icon: Eye, key: 'extracting' },
    { name: 'AI analyzing video', icon: Brain, key: 'analyzing' },
    { name: 'Generating report', icon: CheckCircle, key: 'generating' }
  ];

  // Redirect if no uploadId
  useEffect(() => {
    if (!uploadId) {
      console.error('No upload ID provided');
      navigate('/videos');
    }
  }, [uploadId, navigate]);

  // Poll upload status
  const { data: upload, isError } = useQuery(
    ['upload', uploadId],
    () => uploadsAPI.getUpload(Number(uploadId)),
    {
      enabled: !!uploadId && !isNaN(Number(uploadId)),
      refetchInterval: (data) => {
        // Refetch every 2 seconds until complete or failed
        if (!data) return 2000;
        return data.status === 'complete' || data.status === 'failed' ? false : 2000;
      },
      retry: 3
    }
  );

  // Poll all videos to track processing progress
  const { data: videos } = useQuery(
    'videos',
    () => videosAPI.getVideos(),
    {
      enabled: !!upload && upload.status !== 'failed',
      refetchInterval: 2000
    }
  );

  // Find the video associated with this upload
  const video = videos?.find(
    v => v.title === upload?.original_filename && v.store === upload?.store
  );

  // Poll inspection data if video exists
  const { data: inspection } = useQuery(
    ['inspection', video?.id],
    () => videosAPI.getVideoInspection(video!.id),
    {
      enabled: !!video,
      refetchInterval: 2000
    }
  );

  // Calculate current stage and progress based on actual data
  const getCurrentStage = () => {
    if (!upload) return 0;

    // Stage 0: Uploading (upload exists but processing hasn't started)
    if (upload.status === 'uploaded') return 0;

    // Stage 1: Extracting frames (processing started but no video yet)
    if (upload.status === 'processing' && !video) return 1;

    // Stage 2: AI analyzing (video exists but not complete)
    if (video && video.status === 'PROCESSING') return 2;

    // Stage 3: Generating report (video complete, inspection processing)
    if (video?.status === 'COMPLETED' && (!inspection || inspection.status === 'PROCESSING')) return 3;

    // Complete
    if (inspection?.status === 'COMPLETED') return 4;

    return 1; // Default to extracting
  };

  const getProgress = () => {
    const stage = getCurrentStage();
    // Each stage represents 25% progress
    return Math.min((stage / stages.length) * 100, 95);
  };

  // Update progress and stage based on real data
  useEffect(() => {
    const stage = getCurrentStage();
    const prog = getProgress();
    setCurrentStage(stage);
    setProgress(prog);
  }, [upload, video, inspection]);

  // Navigate to video detail page when completely done
  useEffect(() => {
    if (video?.status === 'COMPLETED' && inspection?.status === 'COMPLETED') {
      setTimeout(() => {
        navigate(`/videos/${video.id}`);
      }, 1500);
    }
  }, [video, inspection, navigate]);

  // Handle upload failure
  useEffect(() => {
    if (upload?.status === 'failed' || isError) {
      setTimeout(() => {
        navigate('/videos', {
          state: { error: 'Video processing failed. Please try again.' }
        });
      }, 2000);
    }
  }, [upload?.status, isError, navigate]);

  // Timer for elapsed time display
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state while fetching upload
  if (!upload && !isError) {
    return (
      <div className="p-4 lg:p-8 bg-gradient-to-br from-blue-50 to-teal-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Loading...
          </h1>
          <p className="text-lg text-gray-600">
            Preparing your video for processing
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (upload?.status === 'failed' || isError) {
    return (
      <div className="p-4 lg:p-8 bg-gradient-to-br from-red-50 to-orange-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Processing Failed
          </h1>
          <p className="text-lg text-gray-600">
            There was an error processing your video. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            AI is analyzing your video
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-2">
            This usually takes 2-3 minutes
          </p>
          <div className="text-base lg:text-lg font-semibold text-blue-600">
            {formatTime(timeElapsed / 10)} elapsed
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Processing Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-teal-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Processing Stages */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Processing Stages</h2>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = index === currentStage;
              const isComplete = index < currentStage;

              return (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-50 border border-blue-200'
                      : isComplete
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    isActive
                      ? 'bg-blue-600 text-white animate-pulse'
                      : isComplete
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      isActive ? 'text-blue-900' :
                      isComplete ? 'text-green-900' : 'text-gray-700'
                    }`}>
                      {stage.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isComplete ? 'Complete' :
                       isActive ? 'In progress...' : 'Waiting'}
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Educational Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">What AI Sees</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Our AI analyzes thousands of visual elements in your video, looking for compliance issues that human inspectors often miss.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Surface cleanliness and spills
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Safety equipment placement
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Uniform compliance
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Equipment maintenance needs
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Hidden Issues</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Studies show that traditional inspectors typically miss 3-5 issues per visit. Let's see what's hiding in your store.
            </p>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="text-sm text-teal-800">
                <div className="font-medium mb-1">Fun Fact:</div>
                <div>AI can detect issues in areas that are often overlooked, like behind equipment, under counters, and in corners where problems tend to accumulate.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</h4>
              <p className="text-blue-800 text-sm">
                Your video is being processed securely in our encrypted environment. Once analysis is complete,
                the video will be <strong>automatically and permanently deleted</strong>. Only the inspection
                results and recommendations will be saved to help you improve your operations.
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Option */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/videos')}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Cancel and return to videos
          </button>
        </div>
      </div>
    </div>
  );
}
