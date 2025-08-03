
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quizFormSchema, QuizFormValues } from "../schema/quizFormSchema";

export interface UseQuizFormStateProps {
  initialQuestions?: {
    question: string;
    explanation?: string;
    options: {
      content: string;
      isCorrect: boolean;
    }[];
  }[];
  initialTitle?: string;
  initialDescription?: string;
  initialSubjectId?: string;
}

export const useQuizFormState = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  initialSubjectId = ''
}: UseQuizFormStateProps) => {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
      subjectId: initialSubjectId,
      questions: initialQuestions || [
        {
          question: "",
          explanation: "",
          difficulty: 1,
          options: [
            { content: "", isCorrect: true },
            { content: "", isCorrect: false },
          ]
        }
      ],
    },
  });
  
  return {
    form,
    filteredSections: []
  };
};
