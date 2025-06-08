
import { ReactNode, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRetry } from '@/hooks/useRetry';

interface ProgressiveLoaderProps {
  isLoading: boolean;
  isPartiallyLoaded?: boolean;
  loadingStates?: Record<string, boolean>;
  error?: Error | null;
  onRetry?: () => void;
  children: ReactNode;
  skeletonCount?: number;
  timeout?: number;
}

export const ProgressiveLoader = ({
  isLoading,
  isPartiallyLoaded = false,
  loadingStates = {},
  error,
  onRetry,
  children,
  skeletonCount = 3,
  timeout = 30000
}: ProgressiveLoaderProps) => {
  const [showContent, setShowContent] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const { retry, isRetrying, attemptCount } = useRetry({
    maxAttempts: 3,
    delay: 1000,
    backoff: true
  });

  useEffect(() => {
    if (isPartiallyLoaded || !isLoading) {
      setShowContent(true);
      setHasTimedOut(false);
    }
  }, [isLoading, isPartiallyLoaded]);

  // Timeout handling
  useEffect(() => {
    if (!isLoading) return;

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setHasTimedOut(true);
        console.warn('⏰ Loading timeout reached');
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isLoading, timeout]);

  const handleRetry = async () => {
    if (onRetry) {
      setHasTimedOut(false);
      try {
        await retry(async () => {
          onRetry();
          // Simulate waiting for the retry to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
        });
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-red-700">Loading Failed</p>
          <p className="text-sm text-red-600">{error.message}</p>
          {onRetry && (
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              size="sm" 
              className="mt-4"
              disabled={isRetrying}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? `Retrying (${attemptCount}/3)...` : 'Try Again'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show timeout warning
  if (hasTimedOut && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-orange-600 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-orange-700">Taking longer than expected</p>
          <p className="text-sm text-orange-600">The request is still processing...</p>
          {onRetry && (
            <Button onClick={handleRetry} variant="outline" size="sm" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show skeleton loading
  if (!showContent && isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Skeleton className="h-24 w-full mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
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
