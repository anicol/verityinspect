// URL configuration for different environments
const isDevelopment = import.meta.env.DEV;

export const APP_URLS = {
  // Web app URLs
  webApp: isDevelopment 
    ? 'http://localhost:3000' 
    : 'https://app.verityinspect.com',
  
  // Marketing site URLs  
  marketing: isDevelopment 
    ? 'http://localhost:3001' // adjust if marketing runs on different port
    : 'https://verityinspect.com',
    
  // API URLs
  api: isDevelopment 
    ? 'http://localhost:8000/api'
    : 'https://api.verityinspect.com/api',
};

// Trial signup URL specifically  
export const TRIAL_SIGNUP_URL = `${APP_URLS.webApp}/trial-signup`;