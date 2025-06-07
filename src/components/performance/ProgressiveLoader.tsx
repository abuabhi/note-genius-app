
import { ReactNode, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressiveLoaderProps {
  isLoading: boolean;
  isPartiallyLoaded?: boolean;
  loadingStates?: Record<string, boolean>;
  children: ReactNode;
  skeletonCount?: number;
}

export const ProgressiveLoader = ({
  isLoading,
  isPartiallyLoaded = false,
  loadingStates = {},
  children,
  skeletonCount = 3
}: ProgressiveLoaderProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isPartiallyLoaded || !isLoading) {
      setShowContent(true);
    }
  }, [isLoading, isPartiallyLoaded]);

  if (!showContent && isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {children}
      
      {/* Show loading indicators for specific sections */}
      {Object.entries(loadingStates).map(([key, loading]) => 
        loading && (
          <div key={key} className="mt-4">
            <Skeleton className="h-16 w-full opacity-50" />
          </div>
        )
      )}
    </div>
  );
};
