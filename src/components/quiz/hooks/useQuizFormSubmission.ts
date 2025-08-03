
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuizFormValues } from "../schema/quizFormSchema";
import { useQuizzes } from "@/hooks/useQuizzes";
import { toast } from "@/hooks/use-toast";

export interface UseQuizFormSubmissionProps {
  sourceType?: 'prebuilt' | 'note' | 'custom';
  sourceId?: string;
  onSuccess?: () => void;
}

export const useQuizFormSubmission = ({
  sourceType = 'custom',
  sourceId,
  onSuccess
}: UseQuizFormSubmissionProps) => {
  const { createQuiz } = useQuizzes();
  const navigate = useNavigate();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const onSubmit = async (data: QuizFormValues) => {
    try {
      console.log("Submitting quiz data:", data);
      console.log("onSuccess prop:", onSuccess);
      console.log("showSuccessDialog state before:", showSuccessDialog);
      
      const quizData = {
        title: data.title,
        description: data.description || null,
        subject_id: data.subjectId || null,
        grade_id: null,
        section_id: null,
        country_id: null,
        education_system: null,
        source_type: sourceType,
        source_id: sourceId,
        is_public: false,
        questions: data.questions.map(q => ({
          question: q.question,
          explanation: q.explanation || null,
          difficulty: q.difficulty,
          options: q.options.map(opt => ({
            content: opt.content,
            is_correct: opt.isCorrect
          }))
        }))
      };
      
      console.log("Final quiz data being sent:", quizData);
      
      await createQuiz.mutateAsync(quizData);
      
      console.log("Quiz created successfully");
      
      if (onSuccess) {
        console.log("Calling onSuccess callback");
        onSuccess();
      } else {
        console.log("Setting showSuccessDialog to true");
        setShowSuccessDialog(true);
        console.log("showSuccessDialog state after:", true);
        
        // Add fallback toast
        toast({
          title: "Quiz Created Successfully! 🎉",
          description: "Your quiz has been created and is ready to use.",
        });
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateAnother = () => {
    setShowSuccessDialog(false);
    // The form will be reset by the parent component
  };

  const handleGoToQuizzes = () => {
    setShowSuccessDialog(false);
    navigate("/quizzes");
  };

  return {
    onSubmit,
    isSubmitting: createQuiz.isPending,
    showSuccessDialog,
    setShowSuccessDialog,
    handleCreateAnother,
    handleGoToQuizzes
  };
};
