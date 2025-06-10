
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface FollowUpQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export const FollowUpQuestions = ({ 
  questions, 
  onSelectQuestion 
}: FollowUpQuestionsProps) => {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {questions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="text-xs h-7 bg-white hover:bg-mint-50 border-mint-200 text-mint-700"
          onClick={() => onSelectQuestion(question)}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          {question}
        </Button>
      ))}
    </div>
  );
};
