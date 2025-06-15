
import { useCallback, useRef, useEffect } from 'react';
import { logger } from '@/config/environment';

export type JobPriority = 'high' | 'medium' | 'low';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BackgroundJob {
  id: string;
  type: string;
  priority: JobPriority;
  status: JobStatus;
  data: any;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  maxRetries: number;
  error?: string;
}

interface JobWorker {
  type: string;
  handler: (data: any) => Promise<any>;
  concurrency: number;
  activeJobs: number;
}

export const useBackgroundProcessor = () => {
  const jobQueuesRef = useRef<Map<JobPriority, BackgroundJob[]>>(new Map([
    ['high', []],
    ['medium', []],
    ['low', []]
  ]));
  
  const workersRef = useRef<Map<string, JobWorker>>(new Map());
  const processingRef = useRef<boolean>(false);
  const statsRef = useRef({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    activeJobs: 0
  });

  // Register a job worker
  const registerWorker = useCallback((
    type: string, 
    handler: (data: any) => Promise<any>, 
    concurrency: number = 1
  ) => {
    workersRef.current.set(type, {
      type,
      handler,
      concurrency,
      activeJobs: 0
    });
    logger.info(`Background worker registered: ${type} (concurrency: ${concurrency})`);
  }, []);

  // Add job to queue
  const addJob = useCallback((
    type: string,
    data: any,
    priority: JobPriority = 'medium',
    maxRetries: number = 3
  ): string => {
    const jobId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BackgroundJob = {
      id: jobId,
      type,
      priority,
      status: 'pending',
      data,
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries
    };

    const queue = jobQueuesRef.current.get(priority);
    if (queue) {
      queue.push(job);
      statsRef.current.totalJobs++;
    }

    logger.debug(`Job added to ${priority} queue:`, { jobId, type });
    
    // Start processing if not already running
    if (!processingRef.current) {
      processJobs();
    }

    return jobId;
  }, []);

  // Process jobs from queues
  const processJobs = useCallback(async () => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    
    try {
      const priorities: JobPriority[] = ['high', 'medium', 'low'];
      
      while (true) {
        let jobProcessed = false;
        
        // Process jobs by priority
        for (const priority of priorities) {
          const queue = jobQueuesRef.current.get(priority);
          if (!queue || queue.length === 0) continue;
          
          // Find available worker for next job
          const job = queue[0];
          const worker = workersRef.current.get(job.type);
          
          if (!worker) {
            logger.warn(`No worker found for job type: ${job.type}`);
            queue.shift(); // Remove job without worker
            statsRef.current.failedJobs++;
            continue;
          }
          
          if (worker.activeJobs >= worker.concurrency) {
            continue; // Worker at capacity
          }
          
          // Process the job
          queue.shift();
          worker.activeJobs++;
          statsRef.current.activeJobs++;
          jobProcessed = true;
          
          processJob(job, worker).finally(() => {
            worker.activeJobs--;
            statsRef.current.activeJobs--;
          });
          
          break; // Process one job per cycle
        }
        
        if (!jobProcessed) {
          break; // No jobs to process
        }
        
        // Small delay between jobs
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } finally {
      processingRef.current = false;
    }
  }, []);

  // Process individual job
  const processJob = useCallback(async (job: BackgroundJob, worker: JobWorker) => {
    job.status = 'processing';
    job.startedAt = Date.now();
    
    try {
      logger.debug(`Processing job: ${job.id} (${job.type})`);
      
      const result = await worker.handler(job.data);
      
      job.status = 'completed';
      job.completedAt = Date.now();
      statsRef.current.completedJobs++;
      
      logger.debug(`Job completed: ${job.id}`, { 
        duration: job.completedAt - job.startedAt!,
        result 
      });
      
    } catch (error) {
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.retryCount++;
      
      if (job.retryCount <= job.maxRetries) {
        // Retry job
        job.status = 'pending';
        job.startedAt = undefined;
        
        const queue = jobQueuesRef.current.get(job.priority);
        if (queue) {
          queue.unshift(job); // Add back to front for retry
        }
        
        logger.warn(`Job failed, retrying: ${job.id} (attempt ${job.retryCount}/${job.maxRetries})`);
      } else {
        job.status = 'failed';
        job.completedAt = Date.now();
        statsRef.current.failedJobs++;
        
        logger.error(`Job failed permanently: ${job.id}`, error);
      }
    }
  }, []);

  // Get queue statistics
  const getStats = useCallback(() => {
    const queueSizes = {
      high: jobQueuesRef.current.get('high')?.length || 0,
      medium: jobQueuesRef.current.get('medium')?.length || 0,
      low: jobQueuesRef.current.get('low')?.length || 0
    };
    
    return {
      ...statsRef.current,
      queueSizes,
      totalQueued: Object.values(queueSizes).reduce((a, b) => a + b, 0),
      workers: Array.from(workersRef.current.values()).map(w => ({
        type: w.type,
        concurrency: w.concurrency,
        activeJobs: w.activeJobs
      }))
    };
  }, []);

  // Clear completed jobs
  const clearCompleted = useCallback(() => {
    // Background jobs are automatically removed when completed
    logger.info('Background processor cleanup completed');
  }, []);

  // Setup cleanup interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (!processingRef.current && statsRef.current.activeJobs === 0) {
        const stats = getStats();
        if (stats.totalQueued > 0) {
          processJobs();
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [processJobs, getStats]);

  return {
    registerWorker,
    addJob,
    getStats,
    clearCompleted,
    isProcessing: () => processingRef.current
  };
};
