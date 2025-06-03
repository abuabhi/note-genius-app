
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Flashcard } from '@/types/flashcard';
import { StudyMode } from '@/pages/study/types';

interface UseQuizModeProps {
  setId: string;
  mode: StudyMode;
}

interface QuizSession {
  id: string;
  user_id: string;
  flashcard_set_id: string;
  mode: string;
  start_time: string;
  end_time?: string;
  total_cards: number;
  correct_answers: number;
  total_score: number;
  duration_seconds?: number;
  average_response_time?: number;
  grade?: string;
}

interface QuizCardResponse {
  flashcard_id: string;
  user_answer: string;
  is_correct: boolean;
  response_time_seconds: number;
  points_earned: number;
  time_bonus: number;
}

export const useQuizMode = ({ setId, mode }: UseQuizModeProps) => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // Quiz-specific state
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per card
  const [totalScore, setTotalScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [cardStartTime, setCardStartTime] = useState<Date | null>(null);
  const [responses, setResponses] = useState<QuizCardResponse[]>([]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFlashcards = useCallback(async () => {
    if (!user || !setId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: setCards, error: fetchError } = await supabase
        .from('flashcard_set_cards')
        .select(`
          flashcard_id,
          position,
          flashcards (
            id,
            front_content,
            back_content,
            created_at
          )
        `)
        .eq('set_id', setId)
        .order('position');

      if (fetchError) throw fetchError;

      const cards = (setCards || [])
        .map(item => ({
          ...item.flashcards,
          position: item.position
        }))
        .filter(card => card.id) as Flashcard[];

      setFlashcards(cards);

      // Create quiz session for quiz mode
      if (mode === 'test' && cards.length > 0) {
        const { data: session, error: sessionError } = await supabase
          .from('quiz_sessions')
          .insert({
            user_id: user.id,
            flashcard_set_id: setId,
            mode: 'quiz',
            total_cards: cards.length
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        setQuizSession(session);
        startCardTimer();
      }

    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setError('Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  }, [user, setId, mode]);

  const startCardTimer = useCallback(() => {
    setTimeLeft(30);
    setCardStartTime(new Date());
    setIsTimerActive(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto advance with incorrect answer
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const calculateScore = useCallback((responseTime: number, isCorrect: boolean): { points: number; timeBonus: number } => {
    if (!isCorrect) return { points: 0, timeBonus: 0 };
    
    const basePoints = 100;
    const maxTimeBonus = 50;
    const timeBonus = Math.max(0, Math.floor(maxTimeBonus * (30 - responseTime) / 30));
    
    return {
      points: basePoints + timeBonus,
      timeBonus
    };
  }, []);

  const handleQuizAnswer = useCallback(async (choice: 'needs_practice' | 'mastered') => {
    if (!quizSession || !cardStartTime || !flashcards[currentIndex]) return;

    const currentCard = flashcards[currentIndex];
    const responseTime = (new Date().getTime() - cardStartTime.getTime()) / 1000;
    const isCorrect = choice === 'mastered';
    const { points, timeBonus } = calculateScore(responseTime, isCorrect);

    stopTimer();

    const response: QuizCardResponse = {
      flashcard_id: currentCard.id,
      user_answer: choice,
      is_correct: isCorrect,
      response_time_seconds: responseTime,
      points_earned: points,
      time_bonus: timeBonus
    };

    try {
      // Save response to database
      await supabase
        .from('quiz_card_responses')
        .insert({
          quiz_session_id: quizSession.id,
          ...response
        });

      setResponses(prev => [...prev, response]);
      setTotalScore(prev => prev + points);
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      }

      // Move to next card or complete quiz
      if (currentIndex >= flashcards.length - 1) {
        await completeQuiz();
      } else {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
        startCardTimer();
      }
    } catch (error) {
      console.error('Error saving quiz response:', error);
    }
  }, [quizSession, cardStartTime, flashcards, currentIndex, calculateScore, stopTimer]);

  const handleTimeUp = useCallback(async () => {
    await handleQuizAnswer('needs_practice');
  }, [handleQuizAnswer]);

  const completeQuiz = useCallback(async () => {
    if (!quizSession) return;

    const endTime = new Date();
    const startTime = new Date(quizSession.start_time);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const averageResponseTime = responses.length > 0 
      ? responses.reduce((sum, r) => sum + r.response_time_seconds, 0) / responses.length 
      : 0;
    
    const percentage = (correctAnswers / flashcards.length) * 100;
    const grade = percentage >= 90 ? 'A' : 
                  percentage >= 80 ? 'B' : 
                  percentage >= 70 ? 'C' : 
                  percentage >= 60 ? 'D' : 'F';

    try {
      await supabase
        .from('quiz_sessions')
        .update({
          end_time: endTime.toISOString(),
          correct_answers: correctAnswers,
          total_score: totalScore,
          duration_seconds: durationSeconds,
          average_response_time: averageResponseTime,
          grade
        })
        .eq('id', quizSession.id);

      setIsComplete(true);
      stopTimer();
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  }, [quizSession, correctAnswers, totalScore, responses, flashcards.length, stopTimer]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      if (mode === 'test') {
        startCardTimer();
      }
    }
  }, [currentIndex, flashcards.length, mode, startCardTimer]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      if (mode === 'test') {
        startCardTimer();
      }
    }
  }, [currentIndex, mode, startCardTimer]);

  useEffect(() => {
    fetchFlashcards();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchFlashcards]);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

  return {
    // Original properties
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    isComplete,
    currentCard,
    totalCards,
    handleFlip,
    handleNext,
    handlePrevious,
    setIsFlipped,
    
    // Quiz-specific properties
    quizSession,
    timeLeft,
    totalScore,
    correctAnswers,
    isTimerActive,
    responses,
    handleQuizAnswer
  };
};
