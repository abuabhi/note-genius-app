// Shared helper for visualising exam urgency based on days remaining.
// Used by exam cards, the Upcoming Exams widget, the exam detail header,
// and exam-type rows in the Schedule list.

export type UrgencyTone = 'overdue' | 'critical' | 'soon' | 'upcoming' | 'later';

export interface ExamUrgency {
  tone: UrgencyTone;
  /** Short label e.g. "Today", "Tomorrow", "In 5d", "12d ago" */
  label: string;
  /** Tailwind classes for the badge */
  badgeClass: string;
  /** Tailwind classes for a left border accent on a card */
  borderClass: string;
  /** True when this exam should be visually emphasised (≤7 days away) */
  emphasise: boolean;
}

export function getExamUrgency(days: number): ExamUrgency {
  if (days < 0) {
    return {
      tone: 'overdue',
      label: `${Math.abs(days)}d ago`,
      badgeClass: 'bg-destructive text-destructive-foreground',
      borderClass: 'border-l-4 border-l-destructive',
      emphasise: true,
    };
  }
  if (days <= 1) {
    return {
      tone: 'critical',
      label: days === 0 ? 'Today' : 'Tomorrow',
      badgeClass: 'bg-red-500 text-white hover:bg-red-500',
      borderClass: 'border-l-4 border-l-red-500',
      emphasise: true,
    };
  }
  if (days <= 3) {
    return {
      tone: 'soon',
      label: `In ${days}d`,
      badgeClass: 'bg-orange-500 text-white hover:bg-orange-500',
      borderClass: 'border-l-4 border-l-orange-500',
      emphasise: true,
    };
  }
  if (days <= 7) {
    return {
      tone: 'upcoming',
      label: `In ${days}d`,
      badgeClass: 'bg-amber-400 text-amber-950 hover:bg-amber-400',
      borderClass: 'border-l-4 border-l-amber-400',
      emphasise: true,
    };
  }
  return {
    tone: 'later',
    label: `${days}d`,
    badgeClass: 'bg-secondary text-secondary-foreground',
    borderClass: '',
    emphasise: false,
  };
}
