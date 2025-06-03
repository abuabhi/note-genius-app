
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export interface TestSession {
  id: string;
  user_id: string;
  flashcard_set_id: string;
  total_questions: number;
  correct_answers: number;
  time_limit_seconds?: number;
  start_time: string;
  end_time?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface TestQuestionAttempt {
  id: string;
  test_session_id: string;
  flashcard_id: string;
  question_type: 'flashcard' | 'multiple_choice' | 'fill_blank';
  user_answer?: string;
  is_correct: boolean;
  time_spent_seconds?: number;
}

export const useTestSession = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startTestSession = useCallback(async (
    flashcardSetId: string, 
    totalQuestions: number, 
    timeLimitSeconds?: number
  ) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .insert({
          user_id: user.id,
          flashcard_set_id: flashcardSetId,
          total_questions: totalQuestions,
          time_limit_seconds: timeLimitSeconds,
        })
        .select()
        .single();

      if (error) throw error;

      // Type cast the data to ensure proper typing
      const typedSession: TestSession = {
        ...data,
        status: data.status as 'in_progress' | 'completed' | 'abandoned'
      };

      setCurrentSession(typedSession);
      return typedSession;
    } catch (error) {
      console.error('Error starting test session:', error);
      toast.error('Failed to start test session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const recordQuestionAttempt = useCallback(async (
    sessionId: string,
    flashcardId: string,
    isCorrect: boolean,
    questionType: 'flashcard' | 'multiple_choice' | 'fill_blank' = 'flashcard',
    userAnswer?: string,
    timeSpentSeconds?: number
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('test_question_attempts')
        .insert({
          test_session_id: sessionId,
          flashcard_id: flashcardId,
          question_type: questionType,
          user_answer: userAnswer,
          is_correct: isCorrect,
          time_spent_seconds: timeSpentSeconds,
        });

      if (error) throw error;

      // Update session correct answers count
      if (isCorrect && currentSession) {
        const updatedSession = {
          ...currentSession,
          correct_answers: currentSession.correct_answers + 1
        };
        setCurrentSession(updatedSession);

        await supabase
          .from('test_sessions')
          .update({ correct_answers: updatedSession.correct_answers })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error recording question attempt:', error);
      toast.error('Failed to record answer');
    }
  }, [user, currentSession]);

  const completeTestSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Type cast the data to ensure proper typing
      const typedSession: TestSession = {
        ...data,
        status: data.status as 'in_progress' | 'completed' | 'abandoned'
      };

      setCurrentSession(typedSession);
      return typedSession;
    } catch (error) {
      console.error('Error completing test session:', error);
      toast.error('Failed to complete test session');
      return null;
    }
  }, [user]);

  return {
    currentSession,
    isLoading,
    startTestSession,
    recordQuestionAttempt,
    completeTestSession,
  };
};
