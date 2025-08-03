
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quizFormSchema, QuizFormValues } from "../schema/quizFormSchema";
import { useCreateQuiz } from "@/hooks/quiz/useCreateQuiz";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
      subjectId: initialSubjectId,
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

  const onSubmit = async (data: QuizFormValues) => {
    console.log("🚀 QUIZ SUBMISSION STARTED");
    console.log("📝 Form Data:", data);
    console.log("🎯 Source Type:", sourceType);
    console.log("🔗 Source ID:", sourceId);
    
    try {
      // Validate that we have a subject
      if (!data.subjectId || data.subjectId.trim() === '') {
        console.log("❌ VALIDATION FAILED: No subject selected");
        toast({
          title: "Subject Required",
          description: "Please select a subject for your quiz.",
          variant: "destructive"
        });
        return;
      }

      console.log("✅ VALIDATION PASSED: Subject ID =", data.subjectId);
      
      // Check questions validation
      const questionsValid = data.questions.every(q => 
        q.question.trim() !== '' && 
        q.options.length >= 2 && 
        q.options.some(opt => opt.isCorrect) &&
        q.options.every(opt => opt.content.trim() !== '')
      );
      
      if (!questionsValid) {
        console.log("❌ VALIDATION FAILED: Invalid questions");
        toast({
          title: "Questions Invalid",
          description: "Please ensure all questions have content, at least 2 options, and one correct answer.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("✅ QUESTIONS VALIDATED");
      
      const quizPayload = {
        title: data.title,
        description: data.description,
        subject_id: data.subjectId,
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
      };
      
      console.log("📤 SENDING TO API:", quizPayload);
      
      await createQuiz(quizPayload);
      
      console.log("🎉 QUIZ CREATED SUCCESSFULLY!");

      if (onSuccess) {
        onSuccess();
      } else {
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error("💥 ERROR CREATING QUIZ:", error);
      const errorMessage = error instanceof Error ? error.message : "There was an error creating your quiz. Please try again.";
      
      console.log("📄 Error Details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
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
