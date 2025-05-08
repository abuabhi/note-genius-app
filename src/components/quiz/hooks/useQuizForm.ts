
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quizFormSchema, QuizFormValues } from "../schema/quizFormSchema";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface UseQuizFormProps {
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
  sourceType?: 'prebuilt' | 'note' | 'custom';
  sourceId?: string;
  onSuccess?: () => void;
  sections: any[];
}

export const useQuizForm = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  sourceType = 'custom',
  sourceId,
  onSuccess,
  sections
}: UseQuizFormProps) => {
  const { createQuiz } = useQuizzes();
  const navigate = useNavigate();
  
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
    form,
    filteredSections,
    onSubmit,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleCorrectChange,
    isSubmitting: createQuiz.isPending
  };
};
