
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface RetryState {
  retryCount: number;
  isRetrying: boolean;
  lastError?: Error;
  totalDuration: number;
}

export const useEnhancedRetry = (config: RetryConfig = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = () => true,
    onRetry,
    onMaxRetriesReached
  } = config;

  const [retryState, setRetryState] = useState<RetryState>({
    retryCount: 0,
    isRetrying: false,
    totalDuration: 0
  });

  const startTimeRef = useRef<number>();

  const calculateDelay = useCallback((attempt: number) => {
    const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, [baseDelay, backoffMultiplier, maxDelay]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T> => {
    startTimeRef.current = Date.now();
    let lastError: Error;
    
    setRetryState(prev => ({ ...prev, isRetrying: true, retryCount: 0 }));

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        const totalDuration = Date.now() - (startTimeRef.current || Date.now());
        
        setRetryState({
          retryCount: attempt,
          isRetrying: false,
          totalDuration,
          lastError: undefined
        });

        if (attempt > 0) {
          console.log(`✅ ${operationName || 'Operation'} succeeded on attempt ${attempt + 1}`);
          toast.success(`Operation succeeded after ${attempt} ${attempt === 1 ? 'retry' : 'retries'}`);
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        
        setRetryState(prev => ({ 
          ...prev, 
          retryCount: attempt + 1,
          lastError 
        }));

        // Check if we should retry this error
        if (!retryCondition(lastError)) {
          console.log(`❌ ${operationName || 'Operation'} failed with non-retryable error:`, lastError.message);
          break;
        }

        if (attempt < maxRetries) {
          const delay = calculateDelay(attempt);
          console.log(`⚠️ ${operationName || 'Operation'} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          
          onRetry?.(lastError, attempt + 1);
          
          toast.info(`Retrying in ${Math.round(delay / 1000)} seconds... (${attempt + 1}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const totalDuration = Date.now() - (startTimeRef.current || Date.now());
    
    setRetryState(prev => ({ 
      ...prev, 
      isRetrying: false, 
      totalDuration,
      lastError 
    }));

    // All retries exhausted
    console.error(`❌ ${operationName || 'Operation'} failed after ${maxRetries} retries:`, lastError!.message);
    
    onMaxRetriesReached?.(lastError!);
    toast.error(`${operationName || 'Operation'} failed after ${maxRetries} retries`);
    
    throw lastError!;
  }, [maxRetries, calculateDelay, retryCondition, onRetry, onMaxRetriesReached]);

  const reset = useCallback(() => {
    setRetryState({
      retryCount: 0,
      isRetrying: false,
      totalDuration: 0,
      lastError: undefined
    });
  }, []);

  // Predefined retry conditions
  const retryConditions = {
    networkErrors: (error: Error) => {
      const message = error.message.toLowerCase();
      return message.includes('network') || 
             message.includes('fetch') || 
             message.includes('timeout') ||
             message.includes('connection');
    },
    serverErrors: (error: Error) => {
      return error.message.includes('5') || error.message.includes('server');
    },
    temporaryErrors: (error: Error) => {
      const message = error.message.toLowerCase();
      return message.includes('temporary') || 
             message.includes('busy') || 
             message.includes('throttle');
    }
  };

  return {
    executeWithRetry,
    reset,
    retryState,
    retryConditions,
    canRetry: retryState.retryCount < maxRetries,
    progress: maxRetries > 0 ? (retryState.retryCount / maxRetries) * 100 : 0
  };
};
