import { useCallback, useRef } from 'react';

/**
 * Prevents duplicate concurrent AI calls keyed by id.
 * If a call with the same key is already running, the new attempt
 * either returns the in-flight promise (default) or rejects.
 *
 * Usage:
 *   const guard = useAIRequestGuard();
 *   await guard('enrich:'+noteId, () => supabase.functions.invoke(...));
 */
export const useAIRequestGuard = () => {
  const inflight = useRef<Map<string, Promise<unknown>>>(new Map());

  const run = useCallback(<T>(
    key: string,
    fn: () => Promise<T>,
    opts: { onDuplicate?: 'reuse' | 'reject' } = {},
  ): Promise<T> => {
    const existing = inflight.current.get(key);
    if (existing) {
      if (opts.onDuplicate === 'reject') {
        return Promise.reject(new Error('Already running. Please wait.'));
      }
      return existing as Promise<T>;
    }
    const promise = (async () => {
      try {
        return await fn();
      } finally {
        inflight.current.delete(key);
      }
    })();
    inflight.current.set(key, promise);
    return promise;
  }, []);

  return run;
};
