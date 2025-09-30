import posthog from 'posthog-js'

export const initPostHog = () => {
  // Only initialize PostHog in production or if explicitly enabled
  const isProduction = import.meta.env.PROD
  const enabledInDev = import.meta.env.VITE_POSTHOG_ENABLED === 'true'
  
  if (isProduction || enabledInDev) {
    const apiKey = import.meta.env.VITE_POSTHOG_KEY
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'
    
    if (!apiKey) {
      console.warn('PostHog API key not found. Analytics will not be initialized.')
      return
    }
    
    posthog.init(apiKey, {
      api_host: host,
      // Enable debug mode in development
      debug: !isProduction,
      // Capture pageviews automatically
      capture_pageview: true,
      // Capture performance metrics
      capture_performance: true,
      // Person profiles for user analytics
      person_profiles: 'identified_only',
      // Additional configuration
      persistence: 'localStorage+cookie',
      autocapture: {
        // Don't capture on sensitive elements
        dom_event_allowlist: ['click', 'change', 'submit'],
        url_allowlist: [],
        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea', 'label']
      }
    })
    
    console.log('PostHog initialized successfully')
  } else {
    console.log('PostHog disabled in development. Set VITE_POSTHOG_ENABLED=true to enable.')
  }
}

export { posthog }
export default posthog