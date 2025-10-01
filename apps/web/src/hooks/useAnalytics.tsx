// Analytics hook - stubbed out, ready for manual PostHog installation
// Install PostHog manually: npm install posthog-js

export function useAnalytics() {
  return {
    // Track custom events
    track: (eventName: string, properties?: Record<string, any>) => {
      console.log('Analytics track:', eventName, properties)
    },

    // Track page views (manual)
    trackPageView: (pageName: string, properties?: Record<string, any>) => {
      console.log('Analytics pageview:', pageName, properties)
    },

    // Set user properties
    setUserProperties: (properties: Record<string, any>) => {
      console.log('Analytics user properties:', properties)
    },

    // Group analytics (for brand/organization tracking)
    group: (groupType: string, groupKey: string, properties?: Record<string, any>) => {
      console.log('Analytics group:', groupType, groupKey, properties)
    },

    // Feature flag utilities
    isFeatureEnabled: (flagKey: string): boolean => {
      return false
    },

    getFeatureFlag: (flagKey: string) => {
      return undefined
    }
  }
}

// Event names constants for consistency
export const ANALYTICS_EVENTS = {
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGOUT: 'logout',
  TRIAL_SIGNUP: 'trial_signup',

  // Video & Inspections
  VIDEO_UPLOADED: 'video_uploaded',
  VIDEO_PROCESSED: 'video_processed',
  INSPECTION_VIEWED: 'inspection_viewed',
  INSPECTION_CREATED: 'inspection_created',

  // Demo & Onboarding
  DEMO_STARTED: 'demo_started',
  DEMO_COMPLETED: 'demo_completed',
  ONBOARDING_STEP: 'onboarding_step',

  // UI Interactions
  BUTTON_CLICKED: 'button_clicked',
  MODAL_OPENED: 'modal_opened',
  FORM_SUBMITTED: 'form_submitted',

  // Business Events
  UPGRADE_CLICKED: 'upgrade_clicked',
  FEATURE_USED: 'feature_used',
  HELP_VIEWED: 'help_viewed',
} as const

export default useAnalytics
