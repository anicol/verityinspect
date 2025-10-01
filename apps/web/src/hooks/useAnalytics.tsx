import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useAuth } from './useAuth'

export function useAnalytics() {
  const { user, isAuthenticated } = useAuth()

  // Identify user when authenticated
  useEffect(() => {
    if (isAuthenticated && user && posthog.__loaded) {
      posthog.identify(user.id.toString(), {
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
      })
    }
  }, [isAuthenticated, user])

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated && posthog.__loaded) {
      posthog.reset()
    }
  }, [isAuthenticated])

  return {
    // Track custom events
    track: (eventName: string, properties?: Record<string, any>) => {
      if (posthog.__loaded) {
        posthog.capture(eventName, properties)
      }
    },

    // Track page views (manual)
    trackPageView: (pageName: string, properties?: Record<string, any>) => {
      if (posthog.__loaded) {
        posthog.capture('$pageview', {
          ...properties,
          page_name: pageName,
        })
      }
    },

    // Set user properties
    setUserProperties: (properties: Record<string, any>) => {
      if (posthog.__loaded) {
        posthog.setPersonProperties(properties)
      }
    },

    // Group analytics (for brand/organization tracking)
    group: (groupType: string, groupKey: string, properties?: Record<string, any>) => {
      if (posthog.__loaded) {
        posthog.group(groupType, groupKey, properties)
      }
    },

    // Feature flag utilities
    isFeatureEnabled: (flagKey: string): boolean => {
      if (posthog.__loaded && posthog.isFeatureEnabled) {
        return posthog.isFeatureEnabled(flagKey) || false
      }
      return false
    },

    getFeatureFlag: (flagKey: string) => {
      if (posthog.__loaded && posthog.getFeatureFlag) {
        return posthog.getFeatureFlag(flagKey)
      }
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
