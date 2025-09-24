import { useState, useEffect } from 'react';

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasTouchScreen, setHasTouchScreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check screen size
      const isMobileSize = window.innerWidth <= 768;
      
      // Check orientation
      const isPortraitMode = window.innerHeight > window.innerWidth;
      
      // Check if device has touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Check user agent for mobile patterns
      const userAgent = navigator.userAgent.toLowerCase();
      const mobilePatterns = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/;
      const isMobileUA = mobilePatterns.test(userAgent);
      
      setIsMobile(isMobileSize || isMobileUA);
      setIsPortrait(isPortraitMode);
      setHasTouchScreen(isTouchDevice);
    };

    const checkCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setHasCamera(videoDevices.length > 0);
        }
      } catch (error) {
        console.warn('Could not check for camera devices:', error);
        setHasCamera(false);
      }
    };

    // Initial checks
    checkMobile();
    checkCamera();

    // Listen for orientation/resize changes
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const isOptimalForCapture = isMobile && hasCamera && hasTouchScreen;

  return {
    isMobile,
    isPortrait,
    hasCamera,
    hasTouchScreen,
    isOptimalForCapture
  };
}