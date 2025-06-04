
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface QuizHistoryErrorProps {
  error: string;
}

export const QuizHistoryError = ({ error }: QuizHistoryErrorProps) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <Trophy className="h-12 w-12 mx-auto opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Quiz History</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
};
