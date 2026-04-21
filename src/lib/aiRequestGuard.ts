/**
 * Module-level de-duplication guard for AI / edge-function calls
 * made outside of React hooks (e.g. service modules).
 *
 * If a call with the same key is in-flight, subsequent callers
 * receive the existing promise instead of triggering a duplicate
 * edge-function invocation.
 */
const inflight = new Map<string, Promise<unknown>>();

export const guardAIRequest = <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = (async () => {
    try {
      return await fn();
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, promise);
  return promise;
};
