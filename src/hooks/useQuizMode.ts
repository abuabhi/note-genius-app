
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { StudyMode } from '@/pages/study/types';
import { FlashcardWithProgress } from '@/types/flashcard';
import { useGlobalSessionTracker } from './useGlobalSessionTracker';

interface UseQuizModeProps {
  setId: string;
  mode: StudyMode;
}

interface QuizSession {
  startTime: Date;
  totalQuestions: number;
  answeredQuestions: number;
}

export const useQuizMode = ({ setId, mode }: UseQuizModeProps) => {
  const { user } = useAuth();
  const { updateSessionActivity, recordActivity } = useGlobalSessionTracker();
  
  const [flashcards, setFlashcards] = useState<FlashcardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [totalScore, setTotalScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);

  // Load flashcards for quiz
  useEffect(() => {
    const loadFlashcards = async () => {
      if (!user || !setId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch flashcards
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select('*')
          .eq('set_id', setId)
          .order('created_at');

        if (flashcardsError) throw flashcardsError;

        // Shuffle cards for quiz mode
        const shuffledCards = [...flashcardsData].sort(() => Math.random() - 0.5);
        setFlashcards(shuffledCards.slice(0, 10)); // Limit to 10 questions

        // Initialize quiz session
        const session: QuizSession = {
          startTime: new Date(),
          totalQuestions: Math.min(shuffledCards.length, 10),
          answeredQuestions: 0
        };
        setQuizSession(session);
        setIsTimerActive(true);

      } catch (err) {
        console.error('Error loading quiz flashcards:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
        toast.error('Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    if (mode === 'test') {
      loadFlashcards();
    }
  }, [user, setId, mode]);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerActive(false);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const handleQuizAnswer = useCallback(async (answer: 'mastered' | 'needs_practice') => {
    if (!user || !flashcards[currentIndex] || !quizSession) return;

    recordActivity(); // Record user activity
    const isCorrect = answer === 'mastered';
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setTotalScore(prev => prev + 10); // 10 points per correct answer
    }

    // Update session activity
    await updateSessionActivity({
      quiz_score: isCorrect ? totalScore + 10 : totalScore,
      quiz_total_questions: quizSession.answeredQuestions + 1
    });

    // Update quiz session
    const updatedSession = {
      ...quizSession,
      answeredQuestions: quizSession.answeredQuestions + 1
    };
    setQuizSession(updatedSession);

    // Check if quiz is complete
    if (updatedSession.answeredQuestions >= updatedSession.totalQuestions) {
      handleQuizComplete();
    } else {
      handleNext();
    }
  }, [user, flashcards, currentIndex, quizSession, totalScore, updateSessionActivity, recordActivity]);

  const handleQuizComplete = useCallback(async () => {
    if (!user || !quizSession) return;

    setIsTimerActive(false);
    
    try {
      // Save quiz results
      const { error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: setId,
          score: totalScore,
          total_questions: quizSession.totalQuestions,
          correct_answers: correctAnswers,
          completed_at: new Date().toISOString(),
          time_taken: Math.floor((Date.now() - quizSession.startTime.getTime()) / 1000)
        });

      if (error) throw error;

      toast.success(`Quiz completed! Score: ${correctAnswers}/${quizSession.totalQuestions}`);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast.error('Failed to save quiz results');
    }
  }, [user, quizSession, totalScore, correctAnswers, setId]);

  const handleNext = useCallback(() => {
    recordActivity(); // Record user activity
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % flashcards.length);
  }, [flashcards.length, recordActivity]);

  const handlePrevious = useCallback(() => {
    recordActivity(); // Record user activity
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
  }, [flashcards.length, recordActivity]);

  const handleFlip = useCallback(() => {
    recordActivity(); // Record user activity
    setIsFlipped(prev => !prev);
  }, [recordActivity]);

  // Memoized values
  const currentCard = useMemo(() => flashcards[currentIndex] || null, [flashcards, currentIndex]);
  const isComplete = useMemo(() => 
    quizSession ? quizSession.answeredQuestions >= quizSession.totalQuestions : false, 
    [quizSession]
  );
  const totalCards = flashcards.length;

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    isComplete,
    currentCard,
    totalCards,
    timeLeft,
    totalScore,
    correctAnswers,
    isTimerActive,
    quizSession,
    handleNext,
    handlePrevious,
    handleFlip,
    handleQuizAnswer,
    setIsFlipped
  };
};
