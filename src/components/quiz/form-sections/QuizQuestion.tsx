
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2Icon } from "lucide-react";
import { QuizQuestionOption } from "./QuizQuestionOption";
import { UseFormReturn } from "react-hook-form";
import { QuizFormValues } from "../schema/quizFormSchema";

interface QuizQuestionProps {
  form: UseFormReturn<QuizFormValues>;
  questionIndex: number;
  onRemoveQuestion: (index: number) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onCorrectChange: (questionIndex: number, optionIndex: number, isCorrect: boolean) => void;
}

export const QuizQuestion = ({
  form,
  questionIndex,
  onRemoveQuestion,
  onAddOption,
  onRemoveOption,
  onCorrectChange
}: QuizQuestionProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-medium">Question {questionIndex + 1}</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveQuestion(questionIndex)}
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
                onClick={() => onAddOption(questionIndex)}
              >
                Add Option
              </Button>
            </div>
            
            {form.watch(`questions.${questionIndex}.options`)?.map((_, optionIndex) => (
              <QuizQuestionOption
                key={optionIndex}
                form={form}
                questionIndex={questionIndex}
                optionIndex={optionIndex}
                onRemoveOption={onRemoveOption}
                onCorrectChange={onCorrectChange}
              />
            ))}
            <FormMessage>
              {form.formState.errors.questions?.[questionIndex]?.options?.message}
            </FormMessage>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
