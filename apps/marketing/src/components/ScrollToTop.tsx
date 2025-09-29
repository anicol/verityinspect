import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Extend Window interface to include plausible function
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track pageview with Plausible for SPA navigation
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('pageview');
    }
  }, [pathname]);

  return null;
}