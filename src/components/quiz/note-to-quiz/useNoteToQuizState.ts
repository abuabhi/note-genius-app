
import { useState, useMemo, useEffect, useRef } from "react";
import { Note } from "@/types/note";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAIRequestGuard } from "@/hooks/useAIRequestGuard";

const WORDS_PER_QUESTION = 150;
const MIN_Q = 3;
const MAX_Q = 20;

function resolveBody(note: Note): { body: string; isEnriched: boolean } {
  const enriched = (note as any)?.enriched_content?.trim();
  if (enriched && enriched.length > 0) return { body: enriched, isEnriched: true };
  return { body: note.content || note.description || '', isEnriched: false };
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export const useNoteToQuizState = () => {
  const guardAIRequest = useAIRequestGuard();
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [numberOfQuestions, setNumberOfQuestionsState] = useState<number>(5);
  const userOverrodeRef = useRef(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<{
    question: string;
    explanation?: string;
    options: { content: string; isCorrect: boolean }[];
  }[]>([]);
  const [usedSource, setUsedSource] = useState<{ enriched: number; original: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("select");

  // Recommend question count based on selected note word counts
  const recommendedQuestions = useMemo(() => {
    if (selectedNotes.length === 0) return 5;
    const totalWords = selectedNotes.reduce((sum, n) => sum + countWords(resolveBody(n).body), 0);
    const rec = Math.round(totalWords / WORDS_PER_QUESTION);
    return Math.max(MIN_Q, Math.min(MAX_Q, rec || MIN_Q));
  }, [selectedNotes]);

  // Auto-update count when user hasn't overridden
  useEffect(() => {
    if (!userOverrodeRef.current) {
      setNumberOfQuestionsState(recommendedQuestions);
    }
  }, [recommendedQuestions]);

  const setNumberOfQuestions = (n: number) => {
    userOverrodeRef.current = true;
    setNumberOfQuestionsState(n);
  };

  const useRecommended = () => {
    userOverrodeRef.current = false;
    setNumberOfQuestionsState(recommendedQuestions);
  };

  const toggleNoteSelection = (note: Note) => {
    if (selectedNotes.some((n) => n.id === note.id)) {
      setSelectedNotes(selectedNotes.filter((n) => n.id !== note.id));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const generateQuiz = async () => {
    if (selectedNotes.length === 0) {
      toast({
        title: "No notes selected",
        description: "Please select at least one note to generate a quiz.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const notesPayload = selectedNotes.map(n => {
        const { body, isEnriched } = resolveBody(n);
        return { title: n.title, body, isEnriched };
      });

      const topic = selectedNotes.length === 1 ? selectedNotes[0].title : 'Multiple Topics';

      const guardKey = `generate-quiz:${selectedNotes.map(n => n.id).join(',')}:${numberOfQuestions}`;
      const { data, error } = await guardAIRequest(guardKey, () =>
        supabase.functions.invoke('generate-quiz', {
          body: {
            notes: notesPayload,
            numberOfQuestions,
            difficulty: 'medium',
            topic,
          }
        })
      );

      if (error) {
        console.error('Error calling generate-quiz function:', error);
        throw new Error(error.message || 'Failed to generate quiz questions');
      }

      if (!data || !data.success || !data.quiz || !Array.isArray(data.quiz.questions)) {
        throw new Error(data?.error || 'Invalid response from AI generator');
      }

      const questions = data.quiz.questions.map((item: any) => ({
        question: item.question || '',
        explanation: item.explanation || '',
        options: item.options ? item.options.map((opt: string, index: number) => ({
          content: opt,
          isCorrect: index === item.correctAnswer
        })) : []
      })).filter((q: any) => q.question && q.options.length >= 2);

      if (questions.length === 0) {
        throw new Error('Could not generate any valid questions from these notes');
      }

      setGeneratedQuestions(questions);
      setUsedSource(data.usedSource ?? null);
      setActiveTab("review");

      const bumped =
        typeof data.effectiveQuestions === 'number' &&
        typeof data.requestedQuestions === 'number' &&
        data.effectiveQuestions > data.requestedQuestions;

      toast({
        title: "Quiz generated",
        description: bumped
          ? `Generated ${questions.length} questions (increased from ${data.requestedQuestions} to cover the entire note).`
          : `Generated ${questions.length} questions from your notes.`,
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate quiz questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuccess = () => {
    setGeneratedQuestions([]);
    setSelectedNotes([]);
    setUsedSource(null);
    setActiveTab("select");
    userOverrodeRef.current = false;
    toast({
      title: "Quiz Created Successfully! 🎉",
      description: "Your quiz has been created and is ready to use.",
    });
  };

  return {
    selectedNotes,
    numberOfQuestions,
    setNumberOfQuestions,
    recommendedQuestions,
    useRecommended,
    generatedQuestions,
    usedSource,
    isGenerating,
    activeTab,
    setActiveTab,
    toggleNoteSelection,
    generateQuiz,
    handleSuccess,
  };
};
