import { useMemo } from 'react';
import { useAuth } from './useAuth';

export interface NavigationState {
  // Core navigation
  showLogo: boolean;
  showUserEmail: boolean;
  showSkipToDashboard: boolean;
  
  // Main navigation items
  dashboard: 'hidden' | 'visible-disabled' | 'enabled';
  videos: 'hidden' | 'enabled';
  inspections: 'hidden' | 'enabled';
  actionItems: 'hidden' | 'enabled';
  stores: 'hidden' | 'enabled';
  users: 'hidden' | 'enabled';
  brands: 'hidden' | 'enabled';
  inspectorQueue: 'hidden' | 'enabled';
  
  // Settings/Profile
  settings: 'hidden' | 'partial' | 'full';
  
  // Never available in trial
  billing: 'hidden';
  teamManagement: 'hidden';
  apiAccess: 'hidden';
}

export function useProgressiveNavigation(): NavigationState {
  const { user } = useAuth();
  
  return useMemo(() => {
    // Default state - non-trial users get full access
    if (!user?.is_trial_user) {
      return {
        showLogo: true,
        showUserEmail: true,
        showSkipToDashboard: false,
        dashboard: 'enabled',
        videos: 'enabled',
        inspections: 'enabled',
        actionItems: 'enabled',
        stores: 'enabled',
        users: user?.role === 'ADMIN' ? 'enabled' : 'hidden',
        brands: user?.role === 'ADMIN' ? 'enabled' : 'hidden',
        inspectorQueue: ['INSPECTOR', 'ADMIN'].includes(user?.role || '') ? 'enabled' : 'hidden',
        settings: 'full',
        billing: 'hidden', // Always hidden for trials
        teamManagement: 'hidden',
        apiAccess: 'hidden',
      };
    }

    // Get user's progress data
    const trial = user.trial_status;
    const hasCompletedDemo = !!user.demo_completed_at;
    const hasUploadedVideo = (trial?.videos_used || 0) > 0;
    const hasInspections = (user.total_inspections || 0) > 0;
    const hasMultipleVideos = (trial?.videos_used || 0) >= 3;
    const hoursSinceSignup = user.hours_since_signup || 0;
    const hasBeenActive24Hours = hoursSinceSignup >= 24;
    
    // Trial user progressive navigation logic
    const state: NavigationState = {
      // Always visible during trial
      showLogo: true,
      showUserEmail: true,
      showSkipToDashboard: !hasCompletedDemo, // Hide after demo completion
      
      // Progressive unlocking based on demo stages
      dashboard: hasCompletedDemo 
        ? 'enabled' 
        : user.has_seen_demo 
          ? 'visible-disabled' 
          : 'hidden',
      
      // After first upload
      videos: hasUploadedVideo ? 'enabled' : 'hidden',
      
      // After first AI analysis complete
      inspections: hasInspections ? 'enabled' : 'hidden',
      actionItems: hasInspections ? 'enabled' : 'hidden',
      
      // After 24 hours or 3+ videos
      stores: (hasBeenActive24Hours || hasMultipleVideos) ? 'enabled' : 'hidden',
      settings: (hasBeenActive24Hours || hasMultipleVideos) ? 'partial' : 'hidden',
      
      // Admin/role-based (only if unlocked)
      users: 'hidden', // Never available in trial
      brands: 'hidden', // Never available in trial  
      inspectorQueue: 'hidden', // Never available in trial
      
      // Never available in trial
      billing: 'hidden',
      teamManagement: 'hidden',
      apiAccess: 'hidden',
    };

    return state;
  }, [user]);
}

export function useNavigationProgress() {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user?.is_trial_user) {
      return {
        completedStages: [],
        nextStage: null,
        progress: 100,
      };
    }

    const stages = [];
    const trial = user.trial_status;
    const hasCompletedDemo = !!user.demo_completed_at;
    const hasUploadedVideo = (trial?.videos_used || 0) > 0;
    const hasInspections = (user.total_inspections || 0) > 0;
    
    if (user.has_seen_demo) stages.push('demo-started');
    if (hasCompletedDemo) stages.push('demo-completed');
    if (hasUploadedVideo) stages.push('first-upload');
    if (hasInspections) stages.push('first-analysis');
    
    const nextStage = !user.has_seen_demo 
      ? 'start-demo'
      : !hasCompletedDemo 
        ? 'complete-demo'
        : !hasUploadedVideo 
          ? 'upload-video' 
          : !hasInspections 
            ? 'wait-for-analysis'
            : 'explore-features';

    return {
      completedStages: stages,
      nextStage,
      progress: Math.min((stages.length / 4) * 100, 100),
    };
  }, [user]);
}