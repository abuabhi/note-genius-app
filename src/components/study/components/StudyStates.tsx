
import { XCircle, Trophy, Target, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface StudyLoadingStateProps {}

export const StudyLoadingState = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-mint-700 font-medium">Loading flashcards...</p>
      </div>
    </div>
  );
};

interface StudyErrorStateProps {
  error: string;
}

export const StudyErrorState = ({ error }: StudyErrorStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-100 rounded-lg p-6 max-w-md mx-auto">
        <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
          Try Again
        </Button>
      </div>
    </div>
  );
};

export const StudyEmptyState = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-mint-50 border border-mint-100 rounded-lg p-8 max-w-md mx-auto">
        <Target className="h-12 w-12 text-mint-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-mint-800 mb-2">No flashcards available</h3>
        <p className="text-muted-foreground mb-6">This study mode doesn't have any flashcards yet.</p>
        <Button onClick={() => window.history.back()} variant="outline" className="border-mint-200 text-mint-700 hover:bg-mint-50">
          Go Back
        </Button>
      </div>
    </div>
  );
};

interface StudyCompletionStateProps {
  isQuizMode: boolean;
  studiedToday?: number;
  masteredCount?: number;
}

export const StudyCompletionState = ({ isQuizMode, studiedToday, masteredCount }: StudyCompletionStateProps) => {
  if (isQuizMode) return null; // Quiz completion is handled separately
  
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-mint-50 border border-mint-100 rounded-xl p-8 max-w-md mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Trophy className="h-16 w-16 text-mint-500 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-4 text-mint-800">
          Excellent Work!
        </h2>
        <p className="text-muted-foreground mb-8">
          You've completed this study session successfully
        </p>
        {studiedToday !== undefined && masteredCount !== undefined && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center p-4 bg-white rounded-lg border border-mint-100">
              <div className="text-2xl font-bold text-mint-600">{studiedToday}</div>
              <div className="text-sm text-muted-foreground">Cards Today</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-mint-100">
              <div className="text-2xl font-bold text-mint-600">{masteredCount}</div>
              <div className="text-sm text-muted-foreground">Mastered</div>
            </div>
          </div>
        )}
        <Button 
          onClick={() => window.history.back()}
          size="lg"
          className="bg-mint-500 hover:bg-mint-600 text-white"
        >
          Back to Sets
        </Button>
      </motion.div>
    </div>
  );
};
