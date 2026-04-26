export type ExamStatus = 'upcoming' | 'completed' | 'archived';
export type TopicStatus = 'not_started' | 'learning' | 'reviewing' | 'confident';
export type ExamLinkResourceType = 'note' | 'flashcard_set' | 'quiz' | 'goal' | 'todo';

export interface Exam {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  exam_date: string;
  location: string | null;
  notes: string | null;
  target_readiness: number;
  status: ExamStatus;
  event_id: string | null;
  study_plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamTopic {
  id: string;
  exam_id: string;
  user_id: string;
  name: string;
  weight: number;
  status: TopicStatus;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ExamTopicLink {
  id: string;
  topic_id: string;
  user_id: string;
  resource_type: ExamLinkResourceType;
  resource_id: string;
  created_at: string;
}

export const TOPIC_STATUS_WEIGHT: Record<TopicStatus, number> = {
  not_started: 0,
  learning: 33,
  reviewing: 66,
  confident: 100,
};

export const TOPIC_STATUS_LABEL: Record<TopicStatus, string> = {
  not_started: 'Not started',
  learning: 'Learning',
  reviewing: 'Reviewing',
  confident: 'Confident',
};

export function calculateReadiness(topics: Pick<ExamTopic, 'weight' | 'status'>[]): number {
  if (!topics.length) return 0;
  const totalWeight = topics.reduce((s, t) => s + (t.weight || 1), 0);
  if (totalWeight === 0) return 0;
  const weighted = topics.reduce(
    (s, t) => s + TOPIC_STATUS_WEIGHT[t.status] * (t.weight || 1),
    0,
  );
  return Math.round(weighted / totalWeight);
}

export function daysUntil(dateIso: string): number {
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
