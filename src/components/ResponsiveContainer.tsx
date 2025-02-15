import React from 'react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useFontScaling } from '../hooks/useFontScaling';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  const { isMobile, dimensions } = useResponsiveLayout();
  const { fontScale } = useFontScaling();

  const containerStyle: React.CSSProperties = {
    maxWidth: isMobile ? '390px' : '100%',
    margin: '0 auto',
    fontSize: `${fontScale.base * fontScale.scale}px`,
    minHeight: dimensions.height,
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch'
  };

  return (
    <div 
      style={containerStyle}
      className={`relative ${className} ${isMobile ? 'telegram-app' : ''}`}
    >
      {children}
    </div>
  );
}