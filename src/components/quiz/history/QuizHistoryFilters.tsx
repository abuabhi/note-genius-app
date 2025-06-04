
import { Button } from "@/components/ui/button";

interface QuizHistoryFiltersProps {
  selectedType: 'all' | 'quizzes' | 'flashcard_quizzes';
  onTypeChange: (type: 'all' | 'quizzes' | 'flashcard_quizzes') => void;
  quizResultsCount: number;
  quizSessionsCount: number;
}

export const QuizHistoryFilters = ({
  selectedType,
  onTypeChange,
  quizResultsCount,
  quizSessionsCount
}: QuizHistoryFiltersProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange('all')}
          className="mb-2"
        >
          All Quizzes ({quizResultsCount + quizSessionsCount})
        </Button>
        <Button
          variant={selectedType === 'quizzes' ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange('quizzes')}
          className="mb-2"
        >
          Traditional Quizzes ({quizResultsCount})
        </Button>
        <Button
          variant={selectedType === 'flashcard_quizzes' ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange('flashcard_quizzes')}
          className="mb-2"
        >
          Flashcard Quizzes ({quizSessionsCount})
        </Button>
      </div>
    </div>
  );
};
