
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
  sections: any[];
}

export const useQuizFormState = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  sections
}: UseQuizFormStateProps) => {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
      isPublic: false,
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
  
  const [filteredSections, setFilteredSections] = useState(sections || []);
  
  const watchedCategory = form.watch('categoryId');
  
  useEffect(() => {
    if (watchedCategory && sections) {
      setFilteredSections(sections.filter(section => 
        section.subject_id === watchedCategory
      ));
    } else {
      setFilteredSections(sections || []);
    }
  }, [watchedCategory, sections]);
  
  return {
    form,
    filteredSections
  };
};
