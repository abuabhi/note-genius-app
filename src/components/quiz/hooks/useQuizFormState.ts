
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
  initialCountryId?: string;
  initialEducationSystem?: string;
  sections: any[];
}

export const useQuizFormState = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  initialCountryId = '',
  initialEducationSystem = '',
  sections
}: UseQuizFormStateProps) => {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
      isPublic: false,
      countryId: initialCountryId,
      educationSystem: initialEducationSystem,
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
  
  const watchedSubject = form.watch('subjectId');
  
  useEffect(() => {
    if (watchedSubject && sections) {
      setFilteredSections(sections.filter(section => 
        section.subject_id === watchedSubject
      ));
    } else {
      setFilteredSections(sections || []);
    }
  }, [watchedSubject, sections]);
  
  return {
    form,
    filteredSections
  };
};
