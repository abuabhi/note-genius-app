export type GanttTaskType = 'task' | 'milestone' | 'project';

export interface GanttTask {
  id: string;
  name: string;
  start: string; // ISO date
  end: string;   // ISO date
  progress: number; // 0-100
  type: GanttTaskType;
  parentId?: string;
  dependencies?: string[];
  hideChildren?: boolean;
  topicId?: string | null;
  position?: number;
}

export interface GanttPlan {
  id: string;
  title: string;
  examId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Legacy localStorage shape (used only by one-time migration)
export const GANTT_STORAGE_PREFIX = 'gantt:plan:';
