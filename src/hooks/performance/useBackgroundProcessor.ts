
import { useCallback, useRef } from 'react';

interface Job {
  id: string;
  type: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

export const useBackgroundProcessor = () => {
  const workersRef = useRef<Map<string, (data: any) => Promise<void>>>(new Map());
  const jobQueueRef = useRef<Job[]>([]);
  const processingRef = useRef(false);

  const addJob = useCallback((type: string, data: any, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const job: Job = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data,
      priority,
      timestamp: Date.now()
    };

    jobQueueRef.current.push(job);
    jobQueueRef.current.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    processJobs();
  }, []);

  const registerWorker = useCallback((type: string, worker: (data: any) => Promise<void>) => {
    workersRef.current.set(type, worker);
  }, []);

  const processJobs = useCallback(async () => {
    if (processingRef.current || jobQueueRef.current.length === 0) return;

    processingRef.current = true;

    while (jobQueueRef.current.length > 0) {
      const job = jobQueueRef.current.shift()!;
      const worker = workersRef.current.get(job.type);

      if (worker) {
        try {
          await worker(job.data);
        } catch (error) {
          console.error(`Background job ${job.type} failed:`, error);
        }
      }
    }

    processingRef.current = false;
  }, []);

  return {
    addJob,
    registerWorker,
    processJobs
  };
};
