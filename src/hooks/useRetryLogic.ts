
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  progressCallback?: (progress: { attempt: number; maxAttempts: number }) => void;
}

export const useRetryLogic = (config: RetryConfig = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    progressCallback
  } = config;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const calculateDelay = useCallback((attempt: number) => {
    const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, [baseDelay, backoffMultiplier, maxDelay]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    onError?: (error: Error, attempt: number) => void
  ): Promise<T> => {
    let currentError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        if (progressCallback) {
          progressCallback({ attempt, maxAttempts: maxRetries });
        }
        
        const result = await operation();
        setRetryCount(0);
        setIsRetrying(false);
        setLastError(null);
        return result;
      } catch (error) {
        currentError = error as Error;
        setLastError(currentError);
        setRetryCount(attempt + 1);
        
        if (attempt < maxRetries) {
          const delay = calculateDelay(attempt);
          toast.info(`Retrying in ${Math.round(delay / 1000)} seconds... (${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          onError?.(currentError, attempt + 1);
        }
      }
    }
    
    setIsRetrying(false);
    toast.error(`Operation failed after ${maxRetries} retries: ${currentError?.message || 'Unknown error'}`);
    throw lastError!;
  }, [maxRetries, calculateDelay, progressCallback]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
    lastError,
    reset
  };
};
