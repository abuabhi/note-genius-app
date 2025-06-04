
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCwIcon, Settings } from "lucide-react";

interface QuizGenerationControlsProps {
  selectedNotesCount: number;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  numberOfQuestions: number;
  onNumberOfQuestionsChange: (count: number) => void;
}

export const QuizGenerationControls = ({
  selectedNotesCount,
  onGenerateQuiz,
  isGenerating,
  numberOfQuestions,
  onNumberOfQuestionsChange,
}: QuizGenerationControlsProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-mint-600" />
        <Label htmlFor="questionCount" className="text-sm font-medium text-mint-700">
          Questions:
        </Label>
        <Select
          value={numberOfQuestions.toString()}
          onValueChange={(value) => onNumberOfQuestionsChange(parseInt(value))}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onGenerateQuiz}
        disabled={selectedNotesCount === 0 || isGenerating}
        size="lg"
        className="bg-mint-600 hover:bg-mint-700"
      >
        {isGenerating ? (
          <>
            <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Quiz"
        )}
      </Button>
    </div>
  );
};
