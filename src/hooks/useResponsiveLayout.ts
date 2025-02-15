import { useEffect, useState } from 'react';

interface Breakpoint {
  mobile: boolean;    // <= 428px
  tablet: boolean;    // <= 768px
  desktop: boolean;   // > 768px
}

interface Dimensions {
  width: number;
  height: number;
  pixelRatio: number;
}

export function useResponsiveLayout() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>({
    mobile: false,
    tablet: false,
    desktop: true
  });
  
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({
        width,
        height,
        pixelRatio: window.devicePixelRatio
      });

      setBreakpoint({
        mobile: width <= 428,
        tablet: width > 428 && width <= 768,
        desktop: width > 768
      });
    };

    // Initial check
    handleResize();

    // Handle orientation changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    breakpoint,
    dimensions,
    isMobile: breakpoint.mobile,
    isTablet: breakpoint.tablet,
    isDesktop: breakpoint.desktop
  };
}