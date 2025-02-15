import { useMemo } from 'react';
import { useResponsiveLayout } from './useResponsiveLayout';

interface ImageSize {
  width: number;
  height: number;
}

export function useImageOptimization() {
  const { dimensions, isMobile } = useResponsiveLayout();

  const getOptimalImageSize = (originalSize: ImageSize): ImageSize => {
    const { pixelRatio } = dimensions;
    
    if (isMobile) {
      // For mobile, limit image width to screen width
      const maxWidth = dimensions.width;
      const scaledWidth = Math.min(originalSize.width, maxWidth);
      const scaledHeight = (originalSize.height * scaledWidth) / originalSize.width;
      
      return {
        width: Math.round(scaledWidth * pixelRatio),
        height: Math.round(scaledHeight * pixelRatio)
      };
    }
    
    // For desktop, use original size with pixel ratio
    return {
      width: Math.round(originalSize.width * pixelRatio),
      height: Math.round(originalSize.height * pixelRatio)
    };
  };

  const optimizeImageUrl = (url: string, size: ImageSize): string => {
    const optimalSize = getOptimalImageSize(size);
    
    // Handle different image service URLs
    if (url.includes('unsplash.com')) {
      return `${url}?w=${optimalSize.width}&q=80&fm=webp`;
    }
    
    // Add more image service handlers as needed
    return url;
  };

  return {
    getOptimalImageSize,
    optimizeImageUrl
  };
}