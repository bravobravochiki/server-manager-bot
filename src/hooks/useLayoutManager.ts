import { useEffect, useState, useCallback } from 'react';
import { useResponsiveLayout } from './useResponsiveLayout';
import { useFontScaling } from './useFontScaling';
import { useImageOptimization } from './useImageOptimization';
import { logger } from '../utils/logger';

interface LayoutCache {
  [key: string]: {
    timestamp: number;
    value: any;
  };
}

interface LayoutConfig {
  cacheTimeout?: number;
  debounceDelay?: number;
  enableLogging?: boolean;
}

export function useLayoutManager(config: LayoutConfig = {}) {
  const {
    cacheTimeout = 5000,
    debounceDelay = 150,
    enableLogging = false
  } = config;

  const { breakpoint, dimensions } = useResponsiveLayout();
  const { fontScale, getScaledSize } = useFontScaling();
  const { getOptimalImageSize, optimizeImageUrl } = useImageOptimization();
  
  const [layoutCache] = useState<LayoutCache>({});
  const [resizeTimeout, setResizeTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate layout dimensions with caching
  const calculateLayout = useCallback((key: string, calculator: () => any) => {
    const cached = layoutCache[key];
    const now = Date.now();

    if (cached && now - cached.timestamp < cacheTimeout) {
      return cached.value;
    }

    const value = calculator();
    layoutCache[key] = { timestamp: now, value };
    
    if (enableLogging) {
      logger.debug('Layout calculation', { key, value, dimensions });
    }

    return value;
  }, [layoutCache, cacheTimeout, dimensions, enableLogging]);

  // Handle resize events with debouncing
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      setIsCalculating(true);

      const timeout = setTimeout(() => {
        // Clear cache on resize
        Object.keys(layoutCache).forEach(key => {
          delete layoutCache[key];
        });

        setIsCalculating(false);

        if (enableLogging) {
          logger.info('Layout recalculated after resize', {
            dimensions,
            breakpoint
          });
        }
      }, debounceDelay);

      setResizeTimeout(timeout);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [resizeTimeout, debounceDelay, layoutCache, dimensions, breakpoint, enableLogging]);

  // Get element dimensions based on screen size
  const getElementDimensions = useCallback((
    element: HTMLElement | null,
    defaultSize: { width: number; height: number }
  ) => {
    if (!element) return defaultSize;

    return calculateLayout(`element-${element.id}`, () => {
      const { width, height } = element.getBoundingClientRect();
      return {
        width: Math.round(width),
        height: Math.round(height)
      };
    });
  }, [calculateLayout]);

  // Get spacing values based on screen size
  const getSpacing = useCallback((baseSize: number) => {
    const scale = breakpoint.mobile ? 0.8 : 1;
    return Math.max(Math.round(baseSize * scale), 8);
  }, [breakpoint.mobile]);

  // Get font size based on screen size and base size
  const getFontSize = useCallback((baseSize: number) => {
    return getScaledSize(baseSize);
  }, [getScaledSize]);

  // Get touch target size based on screen size
  const getTouchTargetSize = useCallback((baseSize: number = 44) => {
    return breakpoint.mobile ? Math.max(baseSize, 44) : baseSize;
  }, [breakpoint.mobile]);

  // Get optimal image dimensions
  const getImageDimensions = useCallback((
    originalSize: { width: number; height: number },
    url: string
  ) => {
    const optimalSize = getOptimalImageSize(originalSize);
    const optimizedUrl = optimizeImageUrl(url, optimalSize);
    
    return {
      width: optimalSize.width,
      height: optimalSize.height,
      url: optimizedUrl
    };
  }, [getOptimalImageSize, optimizeImageUrl]);

  return {
    breakpoint,
    dimensions,
    fontScale,
    isCalculating,
    calculateLayout,
    getElementDimensions,
    getSpacing,
    getFontSize,
    getTouchTargetSize,
    getImageDimensions
  };
}