import { useEffect, useRef, useState } from 'react';

interface SwipeConfig {
  minDistance?: number;
  maxTime?: number;
  threshold?: number;
}

interface SwipeState {
  swiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
}

export function useSwipeGesture(element: HTMLElement | null, config: SwipeConfig = {}) {
  const { 
    minDistance = 50, 
    maxTime = 300,
    threshold = 0.5 
  } = config;
  
  const [swipeState, setSwipeState] = useState<SwipeState>({
    swiping: false,
    direction: null,
    distance: 0,
    velocity: 0
  });

  const startPos = useRef({ x: 0, y: 0, time: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startPos.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      currentPos.current = {
        x: touch.clientX,
        y: touch.clientY
      };
      
      setSwipeState({
        swiping: true,
        direction: null,
        distance: 0,
        velocity: 0
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeState.swiping) return;

      const touch = e.touches[0];
      currentPos.current = {
        x: touch.clientX,
        y: touch.clientY
      };

      const deltaX = currentPos.current.x - startPos.current.x;
      const deltaY = currentPos.current.y - startPos.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const time = Date.now() - startPos.current.time;
      const velocity = distance / time;

      if (distance >= minDistance) {
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        let direction: SwipeState['direction'] = null;

        if (angle >= -45 && angle < 45) direction = 'right';
        else if (angle >= 45 && angle < 135) direction = 'down';
        else if (angle >= 135 || angle < -135) direction = 'left';
        else if (angle >= -135 && angle < -45) direction = 'up';

        if (velocity > threshold) {
          setSwipeState({
            swiping: true,
            direction,
            distance,
            velocity
          });
        }
      }
    };

    const handleTouchEnd = () => {
      const endTime = Date.now();
      const duration = endTime - startPos.current.time;

      if (duration <= maxTime && swipeState.velocity > threshold) {
        const event = new CustomEvent('swipe', {
          detail: swipeState
        });
        element.dispatchEvent(event);
      }

      setSwipeState({
        swiping: false,
        direction: null,
        distance: 0,
        velocity: 0
      });
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, minDistance, maxTime, threshold, swipeState.swiping, swipeState.velocity]);

  return swipeState;
}