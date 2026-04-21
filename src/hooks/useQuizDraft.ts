import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface QuizDraftPayload {
  answers: Record<string, string>; // questionId -> selectedOptionId
  current_question: number;
}

/**
 * Persists in-progress quiz answers to Supabase so they survive reload/crash.
 * Debounced to avoid hammering the DB on every keystroke.
 */
export const useQuizDraft = (quizId: string | undefined) => {
  const { user } = useAuth();
  const [draft, setDraft] = useState<QuizDraftPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing draft on mount
  useEffect(() => {
    if (!user || !quizId) { setLoaded(true); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('quiz_attempts_draft')
        .select('answers, current_question')
        .eq('user_id', user.id)
        .eq('quiz_id', quizId)
        .maybeSingle();
      if (!cancelled && data) {
        setDraft({
          answers: (data.answers as Record<string, string>) || {},
          current_question: data.current_question || 0,
        });
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, quizId]);

  const saveDraft = useCallback((payload: QuizDraftPayload) => {
    if (!user || !quizId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await supabase
          .from('quiz_attempts_draft')
          .upsert({
            user_id: user.id,
            quiz_id: quizId,
            answers: payload.answers,
            current_question: payload.current_question,
          }, { onConflict: 'user_id,quiz_id' });
      } catch (e) {
        console.warn('[useQuizDraft] save failed', e);
      }
    }, 800);
  }, [user, quizId]);

  const clearDraft = useCallback(async () => {
    if (!user || !quizId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      await supabase
        .from('quiz_attempts_draft')
        .delete()
        .eq('user_id', user.id)
        .eq('quiz_id', quizId);
    } catch (e) {
      console.warn('[useQuizDraft] clear failed', e);
    }
  }, [user, quizId]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  return { draft, loaded, saveDraft, clearDraft };
};
