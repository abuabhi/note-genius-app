
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2Icon, CheckCircle } from "lucide-react";
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
  const isCorrect = form.watch(`questions.${questionIndex}.options.${optionIndex}.isCorrect`);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 ${
          isCorrect 
            ? "bg-mint-100 text-mint-700" 
            : "text-muted-foreground hover:text-mint-700 hover:bg-mint-50"
        }`}
        onClick={() => onCorrectChange(questionIndex, optionIndex, !isCorrect)}
      >
        <CheckCircle className="h-5 w-5" />
        <span className="sr-only">Mark as {isCorrect ? "incorrect" : "correct"}</span>
      </Button>

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.options.${optionIndex}.content`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input 
                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                className={`border-mint-200 focus-visible:ring-mint-500 ${
                  isCorrect ? "border-mint-300 bg-mint-50" : ""
                }`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
        render={({ field }) => (
          <input
            type="checkbox"
            className="hidden"
            checked={field.value}
            onChange={(e) => onCorrectChange(questionIndex, optionIndex, e.target.checked)}
          />
        )}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="p-1 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
        onClick={() => onRemoveOption(questionIndex, optionIndex)}
      >
        <Trash2Icon className="h-4 w-4" />
        <span className="sr-only">Delete option</span>
      </Button>
    </div>
  );
};
