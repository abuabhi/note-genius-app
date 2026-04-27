
import { useState } from "react";
import { Note } from "@/types/note";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAIRequestGuard } from "@/hooks/useAIRequestGuard";

export const useNoteToQuizState = () => {
  const guardAIRequest = useAIRequestGuard();
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
  const [generatedQuestions, setGeneratedQuestions] = useState<{
    question: string;
    explanation?: string;
    options: { content: string; isCorrect: boolean }[];
  }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("select");

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
      // Combine note content for AI processing.
      // Prefer the AI-enriched version of each note when available — it produces
      // more precise, professional quiz questions than the raw user-entered content.
      const noteContents = selectedNotes.map(note => {
        const enriched = (note as any)?.enriched_content?.trim();
        const body = enriched && enriched.length > 0
          ? enriched
          : (note.content || note.description || '');
        return `${note.title}\n${body}`;
      }).join('\n\n');
      const anyEnriched = selectedNotes.some(n => {
        const e = (n as any)?.enriched_content;
        return typeof e === 'string' && e.trim().length > 0;
      });
      
      const topic = selectedNotes.length === 1 ? selectedNotes[0].title : 'Multiple Topics';
      
      console.log('Sending to generate-quiz function:', {
        content: noteContents.substring(0, 200) + '...',
        numberOfQuestions,
        topic
      });
      
      // Call the generate-quiz edge function (guarded against double-clicks)
      const guardKey = `generate-quiz:${selectedNotes.map(n => n.id).join(',')}:${numberOfQuestions}`;
      const { data, error } = await guardAIRequest(guardKey, () =>
        supabase.functions.invoke('generate-quiz', {
          body: {
            content: noteContents,
            numberOfQuestions,
            difficulty: 'medium',
            topic,
            usingEnrichedContent: anyEnriched,
          }
        })
      );
      
      if (error) {
        console.error('Error calling generate-quiz function:', error);
        throw new Error(error.message || 'Failed to generate quiz questions');
      }
      
      console.log('Response from generate-quiz function:', data);
      
      if (!data || !data.success || !data.quiz || !Array.isArray(data.quiz.questions)) {
        console.error('Invalid response from generate-quiz:', data);
        throw new Error(data?.error || 'Invalid response from AI generator');
      }
      
      // Transform the quiz response to the expected format
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
      
      console.log('Generated questions:', questions);
      setGeneratedQuestions(questions);
      setActiveTab("review");
      
      toast({
        title: "Quiz generated",
        description: `Generated ${questions.length} questions from your notes.`,
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
    console.log("🎉 Quiz creation success callback triggered in useNoteToQuizState");
    
    // Reset the form state after successful creation
    setGeneratedQuestions([]);
    setSelectedNotes([]);
    setActiveTab("select");
    
    // Show success toast
    toast({
      title: "Quiz Created Successfully! 🎉",
      description: "Your quiz has been created and is ready to use.",
    });
  };

  return {
    selectedNotes,
    numberOfQuestions,
    setNumberOfQuestions,
    generatedQuestions,
    isGenerating,
    activeTab,
    setActiveTab,
    toggleNoteSelection,
    generateQuiz,
    handleSuccess,
  };
};
