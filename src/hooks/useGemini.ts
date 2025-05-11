
import { useState, useCallback } from 'react';
import { toast } from "sonner";

// Simple mock of Gemini AI service
export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async (prompt: string, options?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const response = {
        text: () => Promise.resolve(`Generated content for: ${prompt}`),
      };
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to generate content: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add flashcard generation function
  const generateFlashcardContent = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const generatedQuestion = "What is the main concept described in this note?";
      const generatedAnswer = `The main concept is related to: ${content.substring(0, 100)}...`;
      
      return {
        question: generatedQuestion,
        answer: generatedAnswer
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to generate flashcard: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateContent,
    generateFlashcardContent,
    isLoading,
    error
  };
}

export default useGemini;
