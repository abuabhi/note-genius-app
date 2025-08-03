
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { QuizQuestion } from "./form-sections/QuizQuestion";
import { useNoteToQuizForm } from "./hooks/useNoteToQuizForm";
import { QuizCreatedDialog } from "./QuizCreatedDialog";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface NoteToQuizFormProps {
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

export const NoteToQuizForm = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  initialSubjectId,
  sourceType = 'note',
  sourceId,
  onSuccess
}: NoteToQuizFormProps) => {
  const { subjects: userSubjects } = useUserSubjects();
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
    handleCreateAnother,
    handleGoToQuizzes
  } = useNoteToQuizForm({
    initialQuestions,
    initialTitle,
    initialDescription,
    initialSubjectId,
    sourceType,
    sourceId,
    onSuccess
  });
  
  const handleFormSubmit = async (data: any) => {
    console.log("🔄 FORM SUBMIT TRIGGERED");
    console.log("📊 Form State Valid:", form.formState.isValid);
    console.log("🚨 Form Errors:", form.formState.errors);
    
    // Force validation to update form state
    const isValid = await form.trigger();
    console.log("🔍 Manual validation result:", isValid);
    console.log("🔍 All form errors after trigger:", form.formState.errors);
    
    if (!isValid) {
      console.log("❌ FORM VALIDATION FAILED");
      console.log("🔍 Detailed Errors:", form.formState.errors);
      
      // Show specific validation errors
      const errorMessages = [];
      const errors = form.formState.errors;
      
      if (errors.title) errorMessages.push("Title is required");
      if (errors.subjectId) errorMessages.push("Subject is required");
      if (errors.questions) {
        if (Array.isArray(errors.questions)) {
          errors.questions.forEach((questionError: any, index: number) => {
            if (questionError?.question) errorMessages.push(`Question ${index + 1} content is required`);
            if (questionError?.options) {
              if (Array.isArray(questionError.options)) {
                questionError.options.forEach((optionError: any, optIndex: number) => {
                  if (optionError?.content) errorMessages.push(`Question ${index + 1}, Option ${optIndex + 1} content is required`);
                });
              } else if (questionError.options.message) {
                errorMessages.push(`Question ${index + 1}: ${questionError.options.message}`);
              }
            }
          });
        } else if (errors.questions.message) {
          errorMessages.push(errors.questions.message);
        }
      }
      
      if (errorMessages.length > 0) {
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: "Form Validation Failed",
            description: errorMessages.slice(0, 3).join(". ") + (errorMessages.length > 3 ? "..." : ""),
            variant: "destructive"
          });
        });
      }
      
      return;
    }
    
    await onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Quiz Basic Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-mint-100 p-6 space-y-4">
            <h3 className="text-lg font-medium text-mint-800">Quiz Details</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint-700">Quiz Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter quiz title" 
                        className="border-mint-200 focus-visible:ring-mint-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint-700">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this quiz"
                        className="border-mint-200 focus-visible:ring-mint-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint-700">Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-mint-200 focus:ring-mint-500">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userSubjects?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-mint-300 data-[state=checked]:bg-mint-600 data-[state=checked]:border-mint-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-mint-700">
                        Make this quiz public
                      </FormLabel>
                      <p className="text-xs text-mint-600">
                        Other users will be able to see and take this quiz
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Separator className="bg-mint-100" />
          
          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-mint-800">Questions</h3>
                <p className="text-sm text-mint-600">
                  {form.watch("questions")?.length || 0} questions
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addQuestion}
                className="border-mint-200 text-mint-700 hover:bg-mint-50"
              >
                <PlusCircleIcon className="mr-2 h-4 w-4 text-mint-600" />
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
          
          <div className="flex justify-end gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/quizzes")}
              className="border-mint-200 text-mint-700 hover:bg-mint-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-mint-600 hover:bg-mint-700"
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
    </div>
  );
};
