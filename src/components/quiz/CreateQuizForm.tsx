import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useSubjects } from "@/hooks/useSubjects";
import { useSections } from "@/hooks/useSections";
import { useGrades } from "@/hooks/useGrades";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  gradeId: z.string().optional(),
  sectionId: z.string().optional(),
  isPublic: z.boolean().default(false),
  questions: z.array(
    z.object({
      question: z.string().min(1, "Question is required"),
      explanation: z.string().optional(),
      difficulty: z.number().min(1).max(5).default(1),
      options: z.array(
        z.object({
          content: z.string().min(1, "Option content is required"),
          isCorrect: z.boolean().default(false),
        })
      ).min(2, "At least 2 options are required"),
    })
  ).min(1, "At least one question is required"),
});

type FormValues = z.infer<typeof formSchema>;

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
  const { createQuiz } = useQuizzes();
  const { subjects } = useSubjects();
  const { grades } = useGrades();
  const { sections } = useSections({});
  const navigate = useNavigate();
  
  const [filteredSections, setFilteredSections] = useState(sections || []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
  
  const watchedCategory = form.watch('categoryId');
  
  // Filter sections when subject changes
  useState(() => {
    if (watchedCategory && sections) {
      setFilteredSections(sections.filter(section => 
        section.subject_id === watchedCategory
      ));
    } else {
      setFilteredSections(sections || []);
    }
  });
  
  const onSubmit = async (data: FormValues) => {
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
    // This depends on the question type - for now we'll assume multiple_choice with one correct answer
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
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz Details */}
          <div className="space-y-4">
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
          </div>
          
          {/* Quiz Metadata */}
          <div className="space-y-4">
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
            
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {grades?.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
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
              name="sectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSections?.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-4">
                  <div className="space-y-0.5">
                    <FormLabel>Make Public</FormLabel>
                    <FormDescription>
                      Allow other users to see and take this quiz
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
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
            <Card key={questionIndex}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Question {questionIndex + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Question text */}
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.question`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your question"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Difficulty */}
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.difficulty`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty (1-5)</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 - Very Easy</SelectItem>
                            <SelectItem value="2">2 - Easy</SelectItem>
                            <SelectItem value="3">3 - Medium</SelectItem>
                            <SelectItem value="4">4 - Hard</SelectItem>
                            <SelectItem value="5">5 - Very Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Explanation */}
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.explanation`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide an explanation for the correct answer"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Options</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(questionIndex)}
                      >
                        Add Option
                      </Button>
                    </div>
                    
                    {form.watch(`questions.${questionIndex}.options`)?.map((_, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(value) => 
                                    handleCorrectChange(questionIndex, optionIndex, value)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.options.${optionIndex}.content`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder={`Option ${optionIndex + 1}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <FormMessage>
                      {form.formState.errors.questions?.[questionIndex]?.options?.message}
                    </FormMessage>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/quiz")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createQuiz.isPending}
          >
            {createQuiz.isPending ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
