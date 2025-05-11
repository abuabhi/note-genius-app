
// This file is now redundant since we're using the hook from /hooks/useProgressStats.ts
// Let's re-export it for backward compatibility

import { useProgressStats as useProgressStatsHook } from '@/hooks/useProgressStats';

export const useProgressStats = useProgressStatsHook;
export type { ProgressStats } from '@/hooks/useProgressStats';
