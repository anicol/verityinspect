import { useEffect, createContext, useContext } from 'react'
import posthog from 'posthog-js'

interface PostHogContextValue {
  posthog: typeof posthog
}

const PostHogContext = createContext<PostHogContextValue | null>(null)

interface PostHogProviderProps {
  apiKey?: string
  options?: {
    api_host?: string
    person_profiles?: 'always' | 'never' | 'identified_only'
    capture_pageview?: boolean
    capture_pageleave?: boolean
  }
  children: React.ReactNode
}

export function PostHogProvider({ apiKey, options, children }: PostHogProviderProps) {
  useEffect(() => {
    if (apiKey) {
      posthog.init(apiKey, options)
    }

    return () => {
      posthog.reset()
    }
  }, [apiKey, options])

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  )
}

export function usePostHog() {
  const context = useContext(PostHogContext)
  if (!context) {
    throw new Error('usePostHog must be used within PostHogProvider')
  }
  return context.posthog
}
