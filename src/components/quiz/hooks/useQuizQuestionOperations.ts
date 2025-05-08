
import { UseFormReturn } from "react-hook-form";
import { QuizFormValues } from "../schema/quizFormSchema";
import { toast } from "@/hooks/use-toast";

export interface UseQuizQuestionOperationsProps {
  form: UseFormReturn<QuizFormValues>;
}

export const useQuizQuestionOperations = ({ form }: UseQuizQuestionOperationsProps) => {
  const addQuestion = () => {
    const questions = form.getValues("questions") || [];
    form.setValue("questions", [
      ...questions,
      {
        question: "",
        explanation: "",
        difficulty: 1,
        options: [
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
        ]
      }
    ]);
  };
  
  const removeQuestion = (index: number) => {
    const questions = form.getValues("questions") || [];
    if (questions.length > 1) {
      form.setValue("questions", questions.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot remove question",
        description: "You need at least one question.",
        variant: "destructive"
      });
    }
  };
  
  const addOption = (questionIndex: number) => {
    const questions = form.getValues("questions");
    const options = questions[questionIndex].options || [];
    
    // Only allow up to 5 options
    if (options.length >= 5) {
      toast({
        title: "Maximum options reached",
        description: "You can only have up to 5 options per question.",
        variant: "destructive"
      });
      return;
    }
    
    form.setValue(`questions.${questionIndex}.options`, [
      ...options,
      { content: "", isCorrect: false }
    ]);
  };
  
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const questions = form.getValues("questions");
    const options = questions[questionIndex].options || [];
    
    // Check if there are at least 2 options and if we're not trying to delete the last correct option
    if (options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "You need at least two options.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this is the last correct option
    const correctOptions = options.filter(opt => opt.isCorrect);
    if (correctOptions.length === 1 && options[optionIndex].isCorrect) {
      toast({
        title: "Cannot remove option",
        description: "You need at least one correct option.",
        variant: "destructive"
      });
      return;
    }
    
    form.setValue(`questions.${questionIndex}.options`, 
      options.filter((_, i) => i !== optionIndex)
    );
  };
  
  const handleCorrectChange = (questionIndex: number, optionIndex: number, isCorrect: boolean) => {
    // Update the current option
    form.setValue(`questions.${questionIndex}.options.${optionIndex}.isCorrect`, isCorrect);
    
    // If this is being marked as correct, unmark any other options if we only want one correct answer
    if (isCorrect) {
      const questions = form.getValues("questions");
      const options = questions[questionIndex].options || [];
      
      options.forEach((_, i) => {
        if (i !== optionIndex) {
          form.setValue(`questions.${questionIndex}.options.${i}.isCorrect`, false);
        }
      });
    }
  };

  return {
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleCorrectChange
  };
};
