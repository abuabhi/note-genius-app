
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: (result: any, attempt: number) => void;
}

interface RetryState {
  isRetrying: boolean;
  attemptCount: number;
  lastError?: Error;
}

export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onError,
    onSuccess
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attemptCount: 0
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    customOptions?: Partial<RetryOptions>
  ): Promise<T> => {
    const opts = { ...options, ...customOptions };
    const maxRetries = opts.maxAttempts || maxAttempts;
    
    setRetryState({
      isRetrying: true,
      attemptCount: 0
    });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryState(prev => ({ ...prev, attemptCount: attempt }));
        
        const result = await operation();
        
        setRetryState({
          isRetrying: false,
          attemptCount: attempt
        });

        if (attempt > 1) {
          toast.success(`Operation succeeded on attempt ${attempt}`);
        }
        
        onSuccess?.(result, attempt);
        return result;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        setRetryState(prev => ({ 
          ...prev, 
          lastError: error as Error,
          isRetrying: !isLastAttempt
        }));

        onError?.(error as Error, attempt);

        if (isLastAttempt) {
          console.error(`❌ Operation failed after ${maxRetries} attempts:`, error);
          toast.error(`Operation failed after ${maxRetries} attempts`);
          throw error;
        }

        // Calculate delay with optional backoff
        const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        
        console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${currentDelay}ms...`, error);
        toast.error(`Attempt ${attempt} failed, retrying...`);
        
        await sleep(currentDelay);
      }
    }

    throw new Error('Unexpected retry loop completion');
  }, [maxAttempts, delay, backoff, onError, onSuccess]);

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attemptCount: 0,
      lastError: undefined
    });
  }, []);

  return {
    retry,
    reset,
    ...retryState
  };
};
