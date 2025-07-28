import { useRef, useCallback } from 'react';
import { rateLimitingService } from '@/services/security/RateLimitingService';

interface ConcurrentRequest {
  id: string;
  promise: Promise<any>;
  controller: AbortController;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

interface QueueItem {
  id: string;
  request: () => Promise<any>;
  priority: 'low' | 'medium' | 'high';
  resolve: (value: any) => void;
  reject: (error: any) => void;
  controller: AbortController;
}

export const useConcurrencyManager = () => {
  const activeRequestsRef = useRef<Map<string, ConcurrentRequest>>(new Map());
  const queueRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);

  // Configuration for concurrency limits
  const MAX_CONCURRENT_REQUESTS = 3;
  const MAX_QUEUE_SIZE = 10;
  const REQUEST_TIMEOUT = 45000; // 45 seconds

  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return;
    if (activeRequestsRef.current.size >= MAX_CONCURRENT_REQUESTS) return;

    processingRef.current = true;

    try {
      // Sort queue by priority (high > medium > low) and timestamp
      queueRef.current.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff !== 0 ? priorityDiff : a.id.localeCompare(b.id);
      });

      while (
        queueRef.current.length > 0 && 
        activeRequestsRef.current.size < MAX_CONCURRENT_REQUESTS
      ) {
        const queueItem = queueRef.current.shift()!;
        
        // Check if request was aborted while in queue
        if (queueItem.controller.signal.aborted) {
          queueItem.reject(new Error('Request was cancelled'));
          continue;
        }

        const requestId = queueItem.id;
        
        try {
          const promise = queueItem.request();
          
          const concurrentRequest: ConcurrentRequest = {
            id: requestId,
            promise,
            controller: queueItem.controller,
            priority: queueItem.priority,
            timestamp: Date.now()
          };

          activeRequestsRef.current.set(requestId, concurrentRequest);

          // Set timeout for the request
          const timeoutId = setTimeout(() => {
            if (!queueItem.controller.signal.aborted) {
              queueItem.controller.abort();
              queueItem.reject(new Error('Request timeout'));
            }
          }, REQUEST_TIMEOUT);

          promise
            .then((result) => {
              clearTimeout(timeoutId);
              activeRequestsRef.current.delete(requestId);
              queueItem.resolve(result);
              // Process next item in queue
              setTimeout(() => processQueue(), 0);
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              activeRequestsRef.current.delete(requestId);
              queueItem.reject(error);
              // Process next item in queue
              setTimeout(() => processQueue(), 0);
            });

        } catch (error) {
          queueItem.reject(error);
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, []);

  const executeRequest = useCallback(async <T>(
    request: () => Promise<T>,
    options: {
      priority?: 'low' | 'medium' | 'high';
      userId?: string;
      requestType?: string;
    } = {}
  ): Promise<T> => {
    const { priority = 'medium', userId, requestType = 'api' } = options;
    
    // Check rate limiting
    const userKey = rateLimitingService.getUserKey(userId);
    if (!rateLimitingService.checkRateLimit(userKey, requestType)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    return new Promise((resolve, reject) => {
      // Check queue size limit
      if (queueRef.current.length >= MAX_QUEUE_SIZE) {
        reject(new Error('System is currently overloaded. Please try again later.'));
        return;
      }

      const requestId = generateRequestId();
      const controller = new AbortController();

      const queueItem: QueueItem = {
        id: requestId,
        request,
        priority,
        resolve,
        reject,
        controller
      };

      queueRef.current.push(queueItem);
      
      // Start processing the queue
      processQueue();
    });
  }, [generateRequestId, processQueue]);

  const cancelRequest = useCallback((requestId: string) => {
    // Cancel active request
    const activeRequest = activeRequestsRef.current.get(requestId);
    if (activeRequest) {
      activeRequest.controller.abort();
      activeRequestsRef.current.delete(requestId);
      return true;
    }

    // Cancel queued request
    const queueIndex = queueRef.current.findIndex(item => item.id === requestId);
    if (queueIndex !== -1) {
      const queueItem = queueRef.current[queueIndex];
      queueItem.controller.abort();
      queueRef.current.splice(queueIndex, 1);
      queueItem.reject(new Error('Request was cancelled'));
      return true;
    }

    return false;
  }, []);

  const getConcurrencyStats = useCallback(() => {
    return {
      activeRequests: activeRequestsRef.current.size,
      queuedRequests: queueRef.current.length,
      maxConcurrentRequests: MAX_CONCURRENT_REQUESTS,
      maxQueueSize: MAX_QUEUE_SIZE,
      isAtCapacity: activeRequestsRef.current.size >= MAX_CONCURRENT_REQUESTS,
      queueUtilization: (queueRef.current.length / MAX_QUEUE_SIZE) * 100
    };
  }, []);

  const clearAll = useCallback(() => {
    // Cancel all active requests
    for (const [, request] of activeRequestsRef.current) {
      request.controller.abort();
    }
    activeRequestsRef.current.clear();

    // Cancel all queued requests
    for (const queueItem of queueRef.current) {
      queueItem.controller.abort();
      queueItem.reject(new Error('Request was cancelled'));
    }
    queueRef.current = [];
  }, []);

  return {
    executeRequest,
    cancelRequest,
    getConcurrencyStats,
    clearAll
  };
};