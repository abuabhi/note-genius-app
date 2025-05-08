
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
  
  const onSubmit = async (data: QuizFormValues) => {
    try {
      await createQuiz.mutateAsync({
        title: data.title,
        description: data.description,
        category_id: data.categoryId,
        grade_id: data.gradeId,
        section_id: data.sectionId,
        source_type: sourceType,
        source_id: sourceId,
        is_public: data.isPublic,
        questions: data.questions.map(q => ({
          question: q.question,
          explanation: q.explanation,
          difficulty: q.difficulty,
          options: q.options.map(opt => ({
            content: opt.content,
            is_correct: opt.isCorrect
          }))
        }))
      });
      
      toast({
        title: "Quiz created",
        description: "Your quiz has been created successfully."
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };
  
  return {
    onSubmit,
    isSubmitting: createQuiz.isPending
  };
};
