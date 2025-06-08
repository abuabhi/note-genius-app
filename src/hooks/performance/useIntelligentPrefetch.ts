
import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

interface PrefetchPattern {
  trigger: string;
  queries: Array<{
    queryKey: string[];
    queryFn: () => Promise<any>;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface UserBehavior {
  pageViews: Record<string, number>;
  searchTerms: string[];
  lastAccessedNotes: string[];
  subjectPreferences: string[];
}

export const useIntelligentPrefetch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const behaviorRef = useRef<UserBehavior>({
    pageViews: {},
    searchTerms: [],
    lastAccessedNotes: [],
    subjectPreferences: []
  });
  const prefetchQueueRef = useRef<Array<() => Promise<void>>>([]);
  const isProcessingRef = useRef(false);

  // Prefetch patterns based on user behavior
  const prefetchPatterns: PrefetchPattern[] = [
    {
      trigger: 'note-view',
      queries: [
        {
          queryKey: ['note-related'],
          queryFn: async () => [],
          priority: 'high'
        },
        {
          queryKey: ['note-tags'],
          queryFn: async () => [],
          priority: 'medium'
        }
      ]
    },
    {
      trigger: 'search-start',
      queries: [
        {
          queryKey: ['popular-searches'],
          queryFn: async () => [],
          priority: 'low'
        }
      ]
    }
  ];

  // Track user behavior
  const trackBehavior = useCallback((action: string, data: any) => {
    const behavior = behaviorRef.current;

    switch (action) {
      case 'page-view':
        behavior.pageViews[data.page] = (behavior.pageViews[data.page] || 0) + 1;
        break;
      case 'search':
        if (data.term && !behavior.searchTerms.includes(data.term)) {
          behavior.searchTerms.push(data.term);
          if (behavior.searchTerms.length > 10) {
            behavior.searchTerms.shift(); // Keep only last 10
          }
        }
        break;
      case 'note-access':
        if (data.noteId) {
          behavior.lastAccessedNotes.unshift(data.noteId);
          behavior.lastAccessedNotes = behavior.lastAccessedNotes.slice(0, 5); // Keep only last 5
        }
        break;
      case 'subject-select':
        if (data.subject && !behavior.subjectPreferences.includes(data.subject)) {
          behavior.subjectPreferences.push(data.subject);
        }
        break;
    }

    console.log('📊 Behavior tracked:', action, behavior);
  }, []);

  // Process prefetch queue
  const processPrefetchQueue = useCallback(async () => {
    if (isProcessingRef.current || prefetchQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    console.log('🔄 Processing prefetch queue:', prefetchQueueRef.current.length, 'items');

    try {
      // Process high priority items first
      const queue = [...prefetchQueueRef.current];
      prefetchQueueRef.current = [];

      await Promise.allSettled(queue.map(prefetch => prefetch()));
      
      console.log('✅ Prefetch queue processed');
    } catch (error) {
      console.warn('⚠️ Error processing prefetch queue:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Add prefetch task to queue
  const queuePrefetch = useCallback((queryKey: string[], queryFn: () => Promise<any>, priority: 'high' | 'medium' | 'low') => {
    const prefetchTask = async () => {
      try {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: priority === 'high' ? 2 * 60 * 1000 : 5 * 60 * 1000,
        });
        console.log('✅ Prefetched:', queryKey);
      } catch (error) {
        console.warn('⚠️ Prefetch failed:', queryKey, error);
      }
    };

    // Insert based on priority
    if (priority === 'high') {
      prefetchQueueRef.current.unshift(prefetchTask);
    } else {
      prefetchQueueRef.current.push(prefetchTask);
    }

    // Process queue with a small delay to batch operations
    setTimeout(processPrefetchQueue, 100);
  }, [queryClient, processPrefetchQueue]);

  // Trigger intelligent prefetching
  const triggerPrefetch = useCallback((trigger: string, context?: any) => {
    if (!user) return;

    console.log('🎯 Triggering prefetch:', trigger, context);

    const pattern = prefetchPatterns.find(p => p.trigger === trigger);
    if (!pattern) return;

    pattern.queries.forEach(query => {
      queuePrefetch(query.queryKey, query.queryFn, query.priority);
    });

    // Track the behavior that triggered prefetching
    trackBehavior(trigger, context);
  }, [user, queuePrefetch, trackBehavior]);

  // Predictive prefetching based on patterns
  const predictiveePrefetch = useCallback(() => {
    if (!user) return;

    const behavior = behaviorRef.current;
    
    // Prefetch based on frequently accessed notes
    behavior.lastAccessedNotes.forEach(noteId => {
      queuePrefetch(
        ['note-details', noteId],
        async () => ({ id: noteId, title: `Note ${noteId}` }),
        'medium'
      );
    });

    // Prefetch based on subject preferences
    behavior.subjectPreferences.forEach(subject => {
      queuePrefetch(
        ['subject-notes', subject],
        async () => [],
        'low'
      );
    });

    console.log('🔮 Predictive prefetch completed');
  }, [user, queuePrefetch]);

  // Idle time prefetching
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.log('😴 User idle, starting predictive prefetch');
        predictiveePrefetch();
      }, 3000); // 3 seconds of idle time
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [predictiveePrefetch]);

  return {
    trackBehavior,
    triggerPrefetch,
    predictiveePrefetch,
    getBehaviorData: () => behaviorRef.current
  };
};
