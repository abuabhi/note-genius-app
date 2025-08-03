
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { QuizMetadataForm } from "./form-sections/QuizMetadataForm";
import { QuizQuestion } from "./form-sections/QuizQuestion";
import { QuizCreatedDialog } from "./QuizCreatedDialog";
import { useQuizForm } from "./hooks/useQuizForm";

interface CreateQuizFormProps {
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

export const CreateQuizForm = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  sourceType = 'custom',
  sourceId,
  onSuccess
}: CreateQuizFormProps) => {
  const { subjects: userSubjects } = useUserSubjects(); // Use user subjects
  const navigate = useNavigate();
  
  const { 
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
    handleCreateAnother: originalHandleCreateAnother,
    handleGoToQuizzes
  } = useQuizForm({
    initialQuestions,
    initialTitle,
    initialDescription,
    sourceType,
    sourceId,
    onSuccess,
    sections: []
  });

  const handleCreateAnother = () => {
    originalHandleCreateAnother();
    form.reset({
      title: '',
      description: '',
      subjectId: '',
      
      questions: [{
        question: "",
        explanation: "",
        difficulty: 1,
        options: [
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
        ]
      }],
    });
  };
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <QuizMetadataForm 
            form={form}
            userSubjects={userSubjects}
          />
          
          <Separator />
          
          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Questions</h3>
              <Button type="button" variant="outline" onClick={addQuestion}>
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
            
            {form.watch("questions")?.map((_, questionIndex) => (
              <QuizQuestion 
                key={questionIndex}
                form={form}
                questionIndex={questionIndex}
                onRemoveQuestion={removeQuestion}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onCorrectChange={handleCorrectChange}
              />
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/quizzes")}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </Form>
      
      <QuizCreatedDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        onCreateAnother={handleCreateAnother}
        onGoToQuizzes={handleGoToQuizzes}
      />
    </>
  );
};
