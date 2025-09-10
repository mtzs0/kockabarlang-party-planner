import React from 'react';
import { cn } from '@/lib/utils';

interface EmbedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const EmbedLayout: React.FC<EmbedLayoutProps> = ({ children, className }) => {
  // Check if we're running in an iframe
  const isEmbedded = window.self !== window.top;
  
  return (
    <div 
      className={cn(
        "min-h-screen bg-background text-foreground",
        // Apply iframe-specific styles when embedded
        isEmbedded && [
          "overflow-x-hidden",
          "scroll-smooth",
          // Ensure proper isolation in iframe
          "relative",
          "w-full"
        ],
        className
      )}
      style={{
        // Prevent horizontal scrolling in iframe
        ...(isEmbedded && {
          maxWidth: '100%',
          overflow: 'hidden auto'
        })
      }}
    >
      {/* Content wrapper with responsive padding */}
      <div className={cn(
        "container mx-auto",
        isEmbedded ? "px-4 py-6" : "px-4 py-8"
      )}>
        {children}
      </div>
      
      {/* Embedded mode indicator for development */}
      {process.env.NODE_ENV === 'development' && isEmbedded && (
        <div className="fixed bottom-2 right-2 z-50">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Embedded Mode
          </div>
        </div>
      )}
    </div>
  );
};