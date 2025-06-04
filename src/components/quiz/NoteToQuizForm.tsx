
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubjects } from "@/hooks/useSubjects";
import { QuizQuestion } from "./form-sections/QuizQuestion";
import { useNoteToQuizForm } from "./hooks/useNoteToQuizForm";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  sourceType?: 'prebuilt' | 'note' | 'custom';
  sourceId?: string;
  onSuccess?: () => void;
}

export const NoteToQuizForm = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  sourceType = 'note',
  sourceId,
  onSuccess
}: NoteToQuizFormProps) => {
  const { subjects } = useSubjects();
  const navigate = useNavigate();
  
  const { 
    form, 
    onSubmit, 
    addQuestion, 
    removeQuestion, 
    addOption, 
    removeOption, 
    handleCorrectChange,
    isSubmitting
  } = useNoteToQuizForm({
    initialQuestions,
    initialTitle,
    initialDescription,
    sourceType,
    sourceId,
    onSuccess
  });
  
  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quiz Basic Info - Simplified */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="text-lg font-medium">Quiz Details</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter quiz title" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this quiz"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects?.map((subject) => (
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
            </div>
          </div>
          
          <Separator />
          
          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Questions</h3>
                <p className="text-sm text-muted-foreground">
                  {form.watch("questions")?.length || 0} questions
                </p>
              </div>
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
          
          <div className="flex justify-end gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/quiz")}
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
    </div>
  );
};
