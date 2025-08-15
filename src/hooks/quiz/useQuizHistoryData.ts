// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QuizResultItem {
  id: string;
  quiz: {
    title: string;
    description: string;
  };
  score: number;
  total_questions: number;
  duration_seconds: number;
  completed_at: string;
}

interface UseQuizHistoryDataProps {
  userId: string | undefined;
}

export const useQuizHistoryData = ({ userId }: UseQuizHistoryDataProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["quizHistory", userId],
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from("quiz_results")
        .select(
          `
          id,
          quiz_id,
          score,
          total_questions,
          duration_seconds,
          completed_at,
          quiz (
            title,
            description
          )
        `
        )
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as QuizResultItem[];
    },
    enabled: !!userId,
  });

  return {
    quizHistory: data,
    isLoading,
    error,
  };
};
