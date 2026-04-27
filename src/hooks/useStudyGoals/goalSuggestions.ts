import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { GoalTemplate } from '@/types/study';

/**
 * Subjects we never want to surface in goal suggestions because they are
 * system buckets, not real study subjects.
 */
const SYSTEM_SUBJECTS = new Set(
  ['imports', 'scanned documents', 'general', 'uncategorized', '']
);

interface SubjectSignal {
  subject: string;
  notes: number;
  flashcards: number;
  quizzes: number;
}

const useContentSubjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goal-suggestions-content', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<SubjectSignal[]> => {
      if (!user?.id) return [];

      // Pull subjects from each content type the user actually has.
      // Quizzes don't store a subject string directly — they reference user_subjects.
      const [notesRes, flashcardsRes, quizzesRes] = await Promise.all([
        supabase
          .from('notes')
          .select('subject')
          .eq('user_id', user.id)
          .not('subject', 'is', null),
        supabase
          .from('flashcard_sets')
          .select('subject')
          .eq('user_id', user.id)
          .not('subject', 'is', null),
        supabase
          .from('quizzes')
          .select('user_subjects(name)')
          .eq('user_id', user.id),
      ]);

      const counts = new Map<string, SubjectSignal>();

      const bump = (raw: string | null | undefined, key: keyof Omit<SubjectSignal, 'subject'>) => {
        if (!raw) return;
        const trimmed = raw.trim();
        if (!trimmed || SYSTEM_SUBJECTS.has(trimmed.toLowerCase())) return;
        const existing = counts.get(trimmed) ?? {
          subject: trimmed,
          notes: 0,
          flashcards: 0,
          quizzes: 0,
        };
        existing[key] += 1;
        counts.set(trimmed, existing);
      };

      (notesRes.data ?? []).forEach((r: any) => bump(r.subject, 'notes'));
      (flashcardsRes.data ?? []).forEach((r: any) => bump(r.subject, 'flashcards'));
      (quizzesRes.data ?? []).forEach((r: any) => bump(r.user_subjects?.name, 'quizzes'));

      return Array.from(counts.values()).sort(
        (a, b) =>
          b.notes + b.flashcards + b.quizzes - (a.notes + a.flashcards + a.quizzes)
      );
    },
  });
};

/**
 * Build a goal suggestion grounded in the content the user actually has.
 * Picks the most useful next step for that subject based on what's missing.
 */
const buildTemplate = (sig: SubjectSignal): GoalTemplate => {
  // Has notes but no flashcards → suggest building flashcards.
  if (sig.notes > 0 && sig.flashcards === 0) {
    return {
      title: `Turn ${sig.subject} notes into flashcards`,
      description: `You have ${sig.notes} ${sig.subject} note${sig.notes === 1 ? '' : 's'} but no flashcards yet. Build a set to lock in the material.`,
      target_hours: 3,
      duration_days: 5,
      subject: sig.subject,
    };
  }

  // Has flashcards but no quizzes → suggest testing knowledge.
  if (sig.flashcards > 0 && sig.quizzes === 0) {
    return {
      title: `Test yourself on ${sig.subject}`,
      description: `You have ${sig.flashcards} flashcard set${sig.flashcards === 1 ? '' : 's'} in ${sig.subject}. Generate a quiz and find your weak spots.`,
      target_hours: 2,
      duration_days: 4,
      subject: sig.subject,
    };
  }

  // General review goal grounded in the volume of content.
  const totalItems = sig.notes + sig.flashcards + sig.quizzes;
  return {
    title: `Review ${sig.subject}`,
    description: `Work through your ${totalItems} ${sig.subject} item${totalItems === 1 ? '' : 's'} (notes, flashcards, quizzes) over the next week.`,
    target_hours: Math.min(2 + totalItems, 8),
    duration_days: 7,
    subject: sig.subject,
  };
};

export const useGoalSuggestions = () => {
  const { data: signals = [] } = useContentSubjects();

  const suggestions = useMemo((): GoalTemplate[] => {
    if (signals.length === 0) {
      // Empty state: don't fabricate fake subject goals.
      // The UI surfaces a single prompt to create some content first.
      return [];
    }
    return signals.slice(0, 3).map(buildTemplate);
  }, [signals]);

  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedGoalSuggestions');
    if (dismissed) {
      try {
        setDismissedSuggestions(JSON.parse(dismissed));
      } catch {
        // ignore malformed cache
      }
    }
  }, []);

  const toggleSuggestions = () => setSuggestionsEnabled(prev => !prev);

  const refreshSuggestions = () => {
    setDismissedSuggestions([]);
    localStorage.removeItem('dismissedGoalSuggestions');
  };

  return {
    suggestions,
    dismissedSuggestions,
    setDismissedSuggestions,
    suggestionsEnabled,
    toggleSuggestions,
    refreshSuggestions,
    /** Exposed so the UI can show an empty-state prompt when no content exists. */
    hasContent: signals.length > 0,
  };
};
