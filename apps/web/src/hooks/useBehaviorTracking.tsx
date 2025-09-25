import { useCallback, useMemo } from 'react';
import { useMutation } from 'react-query';
import { API_CONFIG } from '@/config/api';

interface BehaviorTracker {
  trackEvent: (eventType: string, metadata?: any) => void;
  trackDemoStarted: () => void;
  trackDemoCompleted: () => void;
  trackDemoSkipped: () => void;
  trackDashboardView: () => void;
  trackUploadInitiated: (metadata?: any) => void;
}

// Generate a session ID for tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('behavior_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('behavior_session_id', sessionId);
  }
  return sessionId;
};

// API calls for behavior tracking
const behaviorAPI = {
  trackEvent: async (data: { event_type: string; metadata?: any; session_id?: string }) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/behavior/track_event/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to track behavior event');
    }
    
    return response.json();
  },

  trackDemoStarted: async (session_id: string) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/behavior/demo_started/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ session_id })
    });
    
    if (!response.ok) {
      throw new Error('Failed to track demo started');
    }
    
    return response.json();
  },

  trackDemoCompleted: async (session_id: string) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/behavior/demo_completed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ session_id })
    });
    
    if (!response.ok) {
      throw new Error('Failed to track demo completed');
    }
    
    return response.json();
  },

  trackDemoSkipped: async (session_id: string) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/behavior/demo_skipped/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ session_id })
    });
    
    if (!response.ok) {
      throw new Error('Failed to track demo skipped');
    }
    
    return response.json();
  },

  trackDashboardView: async (session_id: string) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/behavior/dashboard_view/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ session_id })
    });
    
    if (!response.ok) {
      throw new Error('Failed to track dashboard view');
    }
    
    return response.json();
  }
};

export function useBehaviorTracking(): BehaviorTracker {
  const sessionId = useMemo(() => getSessionId(), []);

  // Generic event tracking
  const trackEventMutation = useMutation(behaviorAPI.trackEvent, {
    onError: (error) => {
      console.warn('Failed to track behavior event:', error);
    }
  });

  // Demo tracking mutations
  const trackDemoStartedMutation = useMutation(behaviorAPI.trackDemoStarted, {
    onError: (error) => {
      console.warn('Failed to track demo started:', error);
    }
  });

  const trackDemoCompletedMutation = useMutation(behaviorAPI.trackDemoCompleted, {
    onError: (error) => {
      console.warn('Failed to track demo completed:', error);
    }
  });

  const trackDemoSkippedMutation = useMutation(behaviorAPI.trackDemoSkipped, {
    onError: (error) => {
      console.warn('Failed to track demo skipped:', error);
    }
  });

  const trackDashboardViewMutation = useMutation(behaviorAPI.trackDashboardView, {
    onError: (error) => {
      console.warn('Failed to track dashboard view:', error);
    }
  });

  const trackEvent = useCallback((eventType: string, metadata: any = {}) => {
    trackEventMutation.mutate({
      event_type: eventType,
      metadata,
      session_id: sessionId
    });
  }, [sessionId, trackEventMutation]);

  const trackDemoStarted = useCallback(() => {
    trackDemoStartedMutation.mutate(sessionId);
  }, [sessionId, trackDemoStartedMutation]);

  const trackDemoCompleted = useCallback(() => {
    trackDemoCompletedMutation.mutate(sessionId);
  }, [sessionId, trackDemoCompletedMutation]);

  const trackDemoSkipped = useCallback(() => {
    trackDemoSkippedMutation.mutate(sessionId);
  }, [sessionId, trackDemoSkippedMutation]);

  const trackDashboardView = useCallback(() => {
    trackDashboardViewMutation.mutate(sessionId);
  }, [sessionId, trackDashboardViewMutation]);

  const trackUploadInitiated = useCallback((metadata: any = {}) => {
    trackEventMutation.mutate({
      event_type: 'UPLOAD_INITIATED',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        page: 'upload'
      },
      session_id: sessionId
    });
  }, [sessionId, trackEventMutation]);

  return {
    trackEvent,
    trackDemoStarted,
    trackDemoCompleted,
    trackDemoSkipped,
    trackDashboardView,
    trackUploadInitiated
  };
}