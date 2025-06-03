
import { Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizTimerProps {
  timeLeft: number;
  isActive: boolean;
  totalTime?: number;
}

export const QuizTimer = ({ timeLeft, isActive, totalTime = 30 }: QuizTimerProps) => {
  const percentage = (timeLeft / totalTime) * 100;
  const isWarning = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  const getTimerColor = () => {
    if (isCritical) return "text-red-600 border-red-200 bg-red-50";
    if (isWarning) return "text-orange-600 border-orange-200 bg-orange-50";
    return "text-mint-600 border-mint-200 bg-mint-50";
  };

  const getProgressColor = () => {
    if (isCritical) return "stroke-red-500";
    if (isWarning) return "stroke-orange-500";
    return "stroke-mint-500";
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg border ${getTimerColor()}`}
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
    >
      <div className="relative w-8 h-8">
        {/* Background circle */}
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 12}`}
            strokeDashoffset={`${2 * Math.PI * 12 * (1 - percentage / 100)}`}
            className={`transition-all duration-300 ${getProgressColor()}`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Timer icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isCritical ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
        <span className="text-xs opacity-75">
          {isActive ? 'Time Left' : 'Paused'}
        </span>
      </div>

      <AnimatePresence>
        {isCritical && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-xs font-medium"
          >
            HURRY!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
