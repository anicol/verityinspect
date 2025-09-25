import { useQuery, useMutation } from 'react-query';
import { ClickEvent } from '@/components/video';
import { API_CONFIG } from '@/config/api';

// API endpoints - use configured base URL
const API_BASE = API_CONFIG.baseURL;

interface DemoVideoData {
  id: number;
  title: string;
  description: string;
  duration: number;
  video_url: string;
  thumbnail_url?: string;
  demo_type: 'WATCH' | 'TRY';
  violations?: any[];
  overall_score?: number;
  category_scores?: {
    ppe: number;
    safety: number;
    cleanliness: number;
    uniform: number;
  };
  total_violations?: number;
}

interface ValidationResult {
  found_violations: Array<{
    id: number;
    title: string;
    category: string;
    severity: string;
  }>;
  missed_violations: Array<{
    id: number;
    title: string;
    category: string;
    severity: string;
    bbox: { x: number; y: number; width: number; height: number };
    timestamp: number;
    why_missed: string;
  }>;
  score: number;
  total: number;
  score_percentage: number;
  feedback: string;
}

// API functions
const demoApi = {
  getDemoVideo: async (demoType: 'watch' | 'try'): Promise<DemoVideoData> => {
    const response = await fetch(`${API_BASE}/videos/demo/${demoType}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${demoType} demo video`);
    }
    
    return response.json();
  },

  validateClicks: async (videoId: number, clicks: ClickEvent[], sessionId?: string): Promise<ValidationResult> => {
    const response = await fetch(`${API_BASE}/auth/behavior/validate_clicks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        video_id: videoId,
        clicks: clicks,
        session_id: sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to validate clicks');
    }
    
    return response.json();
  },

  listDemoVideos: async () => {
    const response = await fetch(`${API_BASE}/videos/demo/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch demo videos');
    }
    
    return response.json();
  }
};

// Custom hooks
export function useDemoVideo(demoType: 'watch' | 'try') {
  return useQuery(
    ['demo-video', demoType],
    () => demoApi.getDemoVideo(demoType),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      onError: (error) => {
        console.error(`Failed to load ${demoType} demo video:`, error);
      }
    }
  );
}

export function useValidateClicks() {
  return useMutation(
    ({ videoId, clicks, sessionId }: { 
      videoId: number; 
      clicks: ClickEvent[]; 
      sessionId?: string;
    }) => demoApi.validateClicks(videoId, clicks, sessionId),
    {
      onError: (error) => {
        console.error('Failed to validate clicks:', error);
      }
    }
  );
}

export function useDemoVideos() {
  return useQuery(
    'demo-videos',
    demoApi.listDemoVideos,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to load demo videos:', error);
      }
    }
  );
}

// Export API functions for direct use if needed
export { demoApi };