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
}

export interface GanttPlan {
  examId: string | null; // null = standalone
  tasks: GanttTask[];
  updatedAt: string;
}

export const GANTT_STORAGE_PREFIX = 'gantt:plan:';
export const ganttKey = (examId: string | null) =>
  `${GANTT_STORAGE_PREFIX}${examId ?? 'standalone'}`;
