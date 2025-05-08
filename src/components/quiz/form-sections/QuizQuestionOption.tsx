
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { QuizFormValues } from "../schema/quizFormSchema";

interface QuizQuestionOptionProps {
  form: UseFormReturn<QuizFormValues>;
  questionIndex: number;
  optionIndex: number;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onCorrectChange: (questionIndex: number, optionIndex: number, isCorrect: boolean) => void;
}

export const QuizQuestionOption = ({
  form,
  questionIndex,
  optionIndex,
  onRemoveOption,
  onCorrectChange
}: QuizQuestionOptionProps) => {
  return (
    <div className="flex items-center gap-2">
      <FormField
        control={form.control}
        name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2 space-y-0">
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(value) => 
                  onCorrectChange(questionIndex, optionIndex, value)
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
        onClick={() => onRemoveOption(questionIndex, optionIndex)}
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
};
