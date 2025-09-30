import { createContext, useContext, useEffect, ReactNode } from 'react'
import { PostHog } from 'posthog-js'
import posthog, { initPostHog } from '../config/posthog'

interface PostHogContextType {
  posthog: PostHog
}

const PostHogContext = createContext<PostHogContextType | null>(null)

interface PostHogProviderProps {
  children: ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initPostHog()
    
    // Clean up on unmount
    return () => {
      // Don't actually destroy PostHog as it might be used elsewhere
      // posthog.reset() if needed
    }
  }, [])

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  )
}

export function usePostHog() {
  const context = useContext(PostHogContext)
  if (!context) {
    // Return a mock PostHog object if not initialized
    return {
      posthog: {
        capture: () => {},
        identify: () => {},
        reset: () => {},
        group: () => {},
        alias: () => {},
        setPersonProperties: () => {},
        featureFlags: {
          isFeatureEnabled: () => false,
          getFeatureFlag: () => undefined,
        }
      } as unknown as PostHog
    }
  }
  return context
}