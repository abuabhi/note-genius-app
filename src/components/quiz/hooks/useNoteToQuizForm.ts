
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateQuiz } from "@/hooks/quiz/useCreateQuiz";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const noteToQuizFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Subject is required"),
  isPublic: z.boolean().default(false),
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
  initialSubjectId?: string;
  sourceType?: 'prebuilt' | 'note' | 'custom';
  sourceId?: string;
  onSuccess?: () => void;
}

export const useNoteToQuizForm = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  initialSubjectId,
  sourceType = 'note',
  sourceId,
  onSuccess
}: UseNoteToQuizFormProps) => {
  const navigate = useNavigate();
  const { mutateAsync: createQuiz, isPending: isSubmitting } = useCreateQuiz();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
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
      subjectId: initialSubjectId,
      isPublic: false,
      questions: transformedQuestions,
    },
  });

  // Update form when initial questions or subject change
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
    
    if (initialSubjectId) {
      form.setValue('subjectId', initialSubjectId);
    }
  }, [initialQuestions, initialSubjectId, form]);

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
      // Validate that we have a subject
      if (!data.subjectId || data.subjectId.trim() === '') {
        toast({
          title: "Subject Required",
          description: "Please select a subject for your quiz.",
          variant: "destructive"
        });
        return;
      }

      await createQuiz({
        title: data.title,
        description: data.description,
        subject_id: data.subjectId,
        source_type: sourceType,
        source_id: sourceId,
        is_public: data.isPublic,
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

      if (onSuccess) {
        onSuccess();
      } else {
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      const errorMessage = error instanceof Error ? error.message : "There was an error creating your quiz. Please try again.";
      toast({
        title: "Failed to create quiz",
        description: errorMessage.includes('foreign key') 
          ? "Please ensure you have selected a valid subject for your quiz."
          : errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessDialog(false);
    form.reset({
      title: '',
      description: '',
      subjectId: initialSubjectId,
      isPublic: false,
      questions: [{
        question: "",
        explanation: "",
        difficulty: 3,
        options: [
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
        ]
      }],
    });
  };

  const handleGoToQuizzes = () => {
    setShowSuccessDialog(false);
    navigate("/quizzes");
  };

  return {
    form,
    onSubmit,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleCorrectChange,
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    handleCreateAnother,
    handleGoToQuizzes
  };
};
