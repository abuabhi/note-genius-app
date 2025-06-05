
export interface AchievementProgress {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  badge_image: string;
  progress: number;
  current: number;
  target: number;
}

export interface SafeStats {
  totalCardsMastered: number;
  totalSets: number;
  streakDays: number;
  totalSessions: number;
  flashcardAccuracy: number;
  studyTimeHours: number;
}
