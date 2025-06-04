
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateQuiz } from "./useCreateQuiz";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const noteToQuizFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  questions: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    explanation: z.string().optional(),
    difficulty: z.number().min(1).max(5).default(3),
    options: z.array(z.object({
      content: z.string().min(1, "Option content is required"),
      isCorrect: z.boolean()
    })).min(2, "At least 2 options are required")
  })).min(1, "At least 1 question is required")
});

type NoteToQuizFormValues = z.infer<typeof noteToQuizFormSchema>;

export interface UseNoteToQuizFormProps {
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
}

export const useNoteToQuizForm = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  sourceType = 'note',
  sourceId,
  onSuccess
}: UseNoteToQuizFormProps) => {
  const navigate = useNavigate();
  const { mutateAsync: createQuiz, isPending: isSubmitting } = useCreateQuiz();
  
  // Transform initial questions to include proper difficulty
  const transformedQuestions = initialQuestions?.map(q => ({
    question: q.question,
    explanation: q.explanation || "",
    difficulty: 3, // Default difficulty for AI-generated questions
    options: q.options
  })) || [
    {
      question: "",
      explanation: "",
      difficulty: 3,
      options: [
        { content: "", isCorrect: true },
        { content: "", isCorrect: false },
      ]
    }
  ];

  const form = useForm<NoteToQuizFormValues>({
    resolver: zodResolver(noteToQuizFormSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
      questions: transformedQuestions,
    },
  });

  // Update form when initial questions change
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      const transformedQuestions = initialQuestions.map(q => ({
        question: q.question,
        explanation: q.explanation || "",
        difficulty: 3,
        options: q.options
      }));
      
      form.setValue('questions', transformedQuestions);
    }
  }, [initialQuestions, form]);

  const addQuestion = () => {
    const currentQuestions = form.getValues("questions");
    form.setValue("questions", [
      ...currentQuestions,
      {
        question: "",
        explanation: "",
        difficulty: 3,
        options: [
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
        ]
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    const currentQuestions = form.getValues("questions");
    if (currentQuestions.length > 1) {
      form.setValue("questions", currentQuestions.filter((_, i) => i !== index));
    }
  };

  const addOption = (questionIndex: number) => {
    const currentQuestions = form.getValues("questions");
    const updatedQuestions = [...currentQuestions];
    updatedQuestions[questionIndex].options.push({
      content: "",
      isCorrect: false
    });
    form.setValue("questions", updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = form.getValues("questions");
    const updatedQuestions = [...currentQuestions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      form.setValue("questions", updatedQuestions);
    }
  };

  const handleCorrectChange = (questionIndex: number, optionIndex: number, isCorrect: boolean) => {
    const currentQuestions = form.getValues("questions");
    const updatedQuestions = [...currentQuestions];
    
    // If setting this option as correct, make others incorrect
    if (isCorrect) {
      updatedQuestions[questionIndex].options.forEach((option, idx) => {
        option.isCorrect = idx === optionIndex;
      });
    } else {
      updatedQuestions[questionIndex].options[optionIndex].isCorrect = false;
    }
    
    form.setValue("questions", updatedQuestions);
  };

  const onSubmit = async (data: NoteToQuizFormValues) => {
    try {
      await createQuiz({
        title: data.title,
        description: data.description,
        category_id: data.categoryId,
        source_type: sourceType,
        source_id: sourceId,
        is_public: false,
        questions: data.questions.map((q, index) => ({
          question: q.question,
          explanation: q.explanation,
          difficulty: q.difficulty,
          position: index,
          options: q.options.map((opt, optIndex) => ({
            content: opt.content,
            is_correct: opt.isCorrect,
            position: optIndex
          }))
        }))
      });

      toast({
        title: "Quiz created successfully",
        description: "Your quiz has been created and is ready to use.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        title: "Failed to create quiz",
        description: "There was an error creating your quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    form,
    onSubmit,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleCorrectChange,
    isSubmitting
  };
};
