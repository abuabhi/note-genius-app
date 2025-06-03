
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface StudyChoicesProps {
  isFlipped: boolean;
  isQuizMode: boolean;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export const StudyChoices = ({
  isFlipped,
  isQuizMode,
  onCorrect,
  onIncorrect
}: StudyChoicesProps) => {
  if (!isFlipped) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-center gap-4"
    >
      <Button
        onClick={onIncorrect}
        size="lg"
        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
        variant="outline"
      >
        <XCircle className="h-5 w-5" />
        {isQuizMode ? "Incorrect" : "Need Practice"}
      </Button>
      
      <Button
        onClick={onCorrect}
        size="lg"
        className="flex items-center gap-2 bg-mint-50 border border-mint-200 text-mint-700 hover:bg-mint-100 hover:text-mint-800"
        variant="outline"
      >
        <CheckCircle className="h-5 w-5" />
        {isQuizMode ? "Correct" : "Know This"}
      </Button>
    </motion.div>
  );
};
