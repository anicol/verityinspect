import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_CONFIG } from '@/config/api';

interface SmartNudge {
  id: number;
  nudge_type: string;
  title: string;
  message: string;
  cta_text?: string;
  cta_url?: string;
  priority: number;
  show_after: string;
  expires_at?: string;
  status: 'PENDING' | 'SHOWN' | 'CLICKED' | 'DISMISSED' | 'EXPIRED';
}

// API calls for nudges
const nudgeAPI = {
  getActiveNudges: async (): Promise<SmartNudge[]> => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/nudges/active/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch nudges');
    }
    
    return response.json();
  },

  markNudgeShown: async (nudgeId: number) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/nudges/${nudgeId}/mark_shown/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark nudge as shown');
    }
    
    return response.json();
  },

  markNudgeClicked: async (nudgeId: number) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/nudges/${nudgeId}/mark_clicked/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark nudge as clicked');
    }
    
    return response.json();
  },

  dismissNudge: async (nudgeId: number) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/nudges/${nudgeId}/dismiss/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to dismiss nudge');
    }
    
    return response.json();
  }
};

export function useSmartNudges() {
  const queryClient = useQueryClient();

  // Fetch active nudges
  const { 
    data: nudges = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<SmartNudge[]>(
    'active-nudges',
    nudgeAPI.getActiveNudges,
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 60000, // 1 minute
      refetchOnWindowFocus: true,
      retry: 1,
      onError: (error) => {
        console.warn('Failed to fetch nudges:', error);
      }
    }
  );

  // Mark nudge as shown
  const markShownMutation = useMutation(nudgeAPI.markNudgeShown, {
    onSuccess: () => {
      queryClient.invalidateQueries('active-nudges');
    },
    onError: (error) => {
      console.warn('Failed to mark nudge as shown:', error);
    }
  });

  // Mark nudge as clicked  
  const markClickedMutation = useMutation(nudgeAPI.markNudgeClicked, {
    onSuccess: () => {
      queryClient.invalidateQueries('active-nudges');
    },
    onError: (error) => {
      console.warn('Failed to mark nudge as clicked:', error);
    }
  });

  // Dismiss nudge
  const dismissMutation = useMutation(nudgeAPI.dismissNudge, {
    onSuccess: () => {
      queryClient.invalidateQueries('active-nudges');
    },
    onError: (error) => {
      console.warn('Failed to dismiss nudge:', error);
    }
  });

  const markNudgeShown = (nudgeId: number) => {
    markShownMutation.mutate(nudgeId);
  };

  const handleNudgeAction = (nudgeId: number, actionUrl?: string) => {
    markClickedMutation.mutate(nudgeId);
    
    // Navigate to action URL if provided
    if (actionUrl) {
      // Handle both internal and external URLs
      if (actionUrl.startsWith('/')) {
        window.location.href = actionUrl;
      } else {
        window.open(actionUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const dismissNudge = (nudgeId: number) => {
    dismissMutation.mutate(nudgeId);
  };

  return {
    nudges,
    isLoading,
    error,
    refetch,
    markNudgeShown,
    handleNudgeAction,
    dismissNudge,
    isUpdating: markShownMutation.isLoading || markClickedMutation.isLoading || dismissMutation.isLoading
  };
}