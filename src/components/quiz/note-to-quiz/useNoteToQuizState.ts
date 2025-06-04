
import { useState } from "react";
import { Note } from "@/types/note";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useNoteToQuizState = () => {
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
      // Combine note content for AI processing
      const noteContents = selectedNotes.map(note => {
        return `${note.title}\n${note.content || note.description}`;
      }).join('\n\n');
      
      const topic = selectedNotes.length === 1 ? selectedNotes[0].title : 'Multiple Topics';
      
      console.log('Sending to generate-quiz function:', {
        content: noteContents.substring(0, 200) + '...',
        numberOfQuestions,
        topic
      });
      
      // Call the generate-quiz edge function
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          content: noteContents,
          numberOfQuestions,
          difficulty: 'medium',
          topic
        }
      });
      
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
    // Reset the form state after successful creation
    setGeneratedQuestions([]);
    setSelectedNotes([]);
    setActiveTab("select");
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
