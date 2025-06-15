
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackgroundProcessor } from '@/hooks/performance/useBackgroundProcessor';
import { useMultiLevelCache } from '@/hooks/performance/useMultiLevelCache';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  isLoading: boolean;
  isPartiallyLoaded?: boolean;
  skeletonCount?: number;
  loadingStages?: Array<{
    name: string;
    component: React.ReactNode;
    duration?: number;
  }>;
  enableCache?: boolean;
  cacheKey?: string;
  fallback?: React.ReactNode;
  error?: Error | null;
  retryable?: boolean;
  onRetry?: () => void;
}

const DefaultSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer" />
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer col-span-2" />
        </div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer w-3/4" />
      </div>
    ))}
  </div>
);

const ErrorFallback = ({ 
  error, 
  onRetry, 
  retryable = true 
}: { 
  error: Error; 
  onRetry?: () => void; 
  retryable?: boolean;
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 mb-4 text-red-500">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-4 max-w-md">{error.message}</p>
    {retryable && onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

export const EnhancedProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  isLoading,
  isPartiallyLoaded = false,
  skeletonCount = 3,
  loadingStages,
  enableCache = true,
  cacheKey = 'progressive_loader',
  fallback,
  error,
  retryable = true,
  onRetry
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const { addJob } = useBackgroundProcessor();
  const cache = useMultiLevelCache();

  // Manage loading stages
  useEffect(() => {
    if (!isLoading || !loadingStages?.length) {
      setCurrentStage(0);
      setShowContent(!isLoading);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    
    const progressStages = () => {
      if (currentStage < loadingStages.length - 1) {
        const stage = loadingStages[currentStage];
        const duration = stage.duration || 1000;
        
        timeoutId = setTimeout(() => {
          setCurrentStage(prev => prev + 1);
        }, duration);
      } else {
        setShowContent(true);
      }
    };

    progressStages();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, currentStage, loadingStages]);

  // Cache content when loaded
  useEffect(() => {
    if (!isLoading && showContent && enableCache && children) {
      addJob('cache_content', {
        key: cacheKey,
        content: children,
        cache
      }, 'low');
    }
  }, [isLoading, showContent, enableCache, children, cacheKey, cache, addJob]);

  // Preload content from cache
  const cachedContent = useMemo(() => {
    if (enableCache && cacheKey) {
      return cache.get(cacheKey);
    }
    return null;
  }, [enableCache, cacheKey, cache]);

  // Handle error state
  if (error) {
    return (
      <ErrorFallback 
        error={error} 
        onRetry={onRetry} 
        retryable={retryable} 
      />
    );
  }

  // Show cached content immediately if available
  if (cachedContent && !isLoading) {
    return <>{cachedContent}</>;
  }

  // Show content if loaded
  if (showContent && !isLoading) {
    return (
      <div className="animate-fade-in">
        {children}
      </div>
    );
  }

  // Show partial content if available
  if (isPartiallyLoaded && children) {
    return (
      <div className="relative">
        <div className="animate-fade-in opacity-70">
          {children}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
          <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mint-500" />
            <span className="text-sm text-gray-600">Loading more...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading stages or fallback
  if (loadingStages?.length) {
    const stage = loadingStages[currentStage];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="text-sm text-gray-600">
            Loading: {stage.name}
          </div>
        </div>
        {stage.component}
      </div>
    );
  }

  // Show fallback or default skeleton
  return fallback || <DefaultSkeleton count={skeletonCount} />;
};

// Hook for managing progressive loading states
export const useProgressiveLoading = (
  loadingFunction: () => Promise<any>,
  dependencies: any[] = []
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPartiallyLoaded, setIsPartiallyLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate partial loading
      setTimeout(() => setIsPartiallyLoaded(true), 500);
      
      const result = await loadingFunction();
      setData(result);
      setIsPartiallyLoaded(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Loading failed'));
      setIsPartiallyLoaded(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadingFunction]);

  const retry = useCallback(() => {
    load();
  }, [load]);

  useEffect(() => {
    load();
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading,
    isPartiallyLoaded,
    error,
    data,
    retry
  };
};

// Add shimmer animation CSS
const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}
