
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface EmptyQuizHistoryProps {
  onNavigateToQuiz: () => void;
}

export const EmptyQuizHistory = ({ onNavigateToQuiz }: EmptyQuizHistoryProps) => {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
      <CardContent className="text-center py-12">
        <Trophy className="h-12 w-12 text-mint-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-mint-800 mb-2">No Quiz History</h3>
        <p className="text-mint-600 mb-6">
          You haven't completed any quizzes yet
        </p>
        <Button 
          onClick={onNavigateToQuiz}
          className="bg-mint-600 hover:bg-mint-700 text-white"
        >
          Take Your First Quiz
        </Button>
      </CardContent>
    </Card>
  );
};
