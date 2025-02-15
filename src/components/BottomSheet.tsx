import React from 'react';
import { X } from 'lucide-react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const swipeState = useSwipeGesture(sheetRef.current, {
    minDistance: 50,
    maxTime: 300
  });

  React.useEffect(() => {
    if (swipeState.direction === 'down') {
      onClose();
    }
  }, [swipeState.direction, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-surface rounded-t-2xl shadow-lg transform transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-dark-border rounded-full mx-auto mt-2 mb-4" />
        
        {/* Header */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}