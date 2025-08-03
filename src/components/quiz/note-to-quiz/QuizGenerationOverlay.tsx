import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, FileText, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface QuizGenerationOverlayProps {
  isOpen: boolean;
  selectedNotesCount: number;
  numberOfQuestions: number;
}

export const QuizGenerationOverlay = ({
  isOpen,
  selectedNotesCount,
  numberOfQuestions,
}: QuizGenerationOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: FileText, text: "Analyzing your notes", duration: 2000 },
    { icon: Brain, text: "AI processing content", duration: 3000 },
    { icon: Sparkles, text: "Generating questions", duration: 2500 },
    { icon: HelpCircle, text: "Creating quiz options", duration: 2000 },
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    let interval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;
    
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;
    
    const updateProgress = () => {
      interval = setInterval(() => {
        elapsed += 100;
        const newProgress = Math.min((elapsed / totalDuration) * 100, 95);
        setProgress(newProgress);
        
        // Update current step based on elapsed time
        let cumulativeDuration = 0;
        for (let i = 0; i < steps.length; i++) {
          cumulativeDuration += steps[i].duration;
          if (elapsed <= cumulativeDuration) {
            setCurrentStep(i);
            break;
          }
        }
      }, 100);
    };

    updateProgress();

    return () => {
      if (interval) clearInterval(interval);
      if (stepTimeout) clearTimeout(stepTimeout);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const CurrentIcon = steps[currentStep]?.icon || Brain;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-mint-50 via-white to-mint-50/50 backdrop-blur-xl">
        <div className="flex flex-col items-center space-y-6 py-8">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-mint-200/50 h-16 w-16"></div>
            <div className="relative flex items-center justify-center h-16 w-16 bg-gradient-to-r from-mint-500 to-mint-600 rounded-full shadow-lg">
              <CurrentIcon className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>

          {/* Progress Section */}
          <div className="w-full space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-mint-800">
                Generating Your Quiz
              </h3>
              <p className="text-sm text-mint-600">
                Creating {numberOfQuestions} questions from {selectedNotesCount} notes
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={progress} 
                className="h-2 bg-mint-100"
              />
              <div className="text-center text-xs text-mint-500">
                {Math.round(progress)}% complete
              </div>
            </div>

            {/* Current Step */}
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-mint-700 animate-pulse">
                {steps[currentStep]?.text || "Processing..."}
              </p>
              
              {/* Step Indicators */}
              <div className="flex justify-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-mint-500 scale-110' 
                        : 'bg-mint-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-mint-50/80 rounded-lg p-4 w-full border border-mint-100">
            <p className="text-xs text-mint-600 text-center leading-relaxed">
              💡 Our AI is analyzing patterns in your notes to create meaningful questions 
              that test comprehension and critical thinking.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};