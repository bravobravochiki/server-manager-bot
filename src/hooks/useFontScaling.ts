import { useEffect, useState } from 'react';
import { useResponsiveLayout } from './useResponsiveLayout';

interface FontScale {
  base: number;
  scale: number;
}

export function useFontScaling() {
  const { dimensions, isMobile } = useResponsiveLayout();
  const [fontScale, setFontScale] = useState<FontScale>({
    base: 16,
    scale: 1
  });

  useEffect(() => {
    const calculateScale = () => {
      if (isMobile) {
        // For mobile devices, scale based on screen width
        const baseWidth = 390; // iPhone 12/13/14 width
        const scale = Math.min(dimensions.width / baseWidth, 1.2);
        return { base: 16, scale };
      }
      
      // For desktop, use standard scaling
      return { base: 16, scale: 1 };
    };

    setFontScale(calculateScale());
  }, [dimensions.width, isMobile]);

  const getScaledSize = (size: number) => {
    return Math.round(size * fontScale.scale);
  };

  return {
    fontScale,
    getScaledSize,
    remToPx: (rem: number) => getScaledSize(rem * fontScale.base)
  };
}