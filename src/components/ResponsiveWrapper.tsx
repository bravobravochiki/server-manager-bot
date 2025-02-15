import React from 'react';
import { useLayoutManager } from '../hooks/useLayoutManager';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableCache?: boolean;
  onLayout?: (dimensions: { width: number; height: number }) => void;
}

export function ResponsiveWrapper({
  children,
  className = '',
  enableCache = true,
  onLayout
}: ResponsiveWrapperProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const {
    breakpoint,
    dimensions,
    getElementDimensions,
    getSpacing,
    isCalculating
  } = useLayoutManager({
    cacheTimeout: enableCache ? 5000 : 0,
    enableLogging: process.env.NODE_ENV === 'development'
  });

  React.useEffect(() => {
    if (containerRef.current && onLayout && !isCalculating) {
      const dims = getElementDimensions(containerRef.current, {
        width: dimensions.width,
        height: dimensions.height
      });
      onLayout(dims);
    }
  }, [dimensions, getElementDimensions, isCalculating, onLayout]);

  const containerStyle: React.CSSProperties = {
    maxWidth: breakpoint.mobile ? '428px' : '100%',
    margin: '0 auto',
    padding: getSpacing(16),
    minHeight: dimensions.height,
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch'
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={`relative transition-all duration-300 ${className} ${
        breakpoint.mobile ? 'telegram-app' : ''
      }`}
    >
      {children}
    </div>
  );
}