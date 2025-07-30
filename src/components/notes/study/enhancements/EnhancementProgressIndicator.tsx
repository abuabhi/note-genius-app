import { useEffect, useState } from "react";
import { Loader2, Clock, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EnhancementProgressIndicatorProps {
  isEnhancing: boolean;
  enhancementStartTime: number | null;
  processingTime: number;
  enhancementType?: string;
}

export const EnhancementProgressIndicator = ({
  isEnhancing,
  enhancementStartTime,
  processingTime,
  enhancementType
}: EnhancementProgressIndicatorProps) => {
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    if (!isEnhancing || !enhancementStartTime) {
      setDisplayTime(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = performance.now() - enhancementStartTime;
      setDisplayTime(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [isEnhancing, enhancementStartTime]);

  if (!isEnhancing) return null;

  const timeInSeconds = displayTime / 1000;
  const progressPercentage = Math.min((timeInSeconds / 15) * 100, 95); // Cap at 95% until completion

  const getProgressColor = () => {
    if (timeInSeconds < 10) return "bg-green-500";
    if (timeInSeconds < 20) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getStatusMessage = () => {
    if (timeInSeconds < 5) return "Initializing...";
    if (timeInSeconds < 10) return "Processing with AI...";
    if (timeInSeconds < 15) return "Finalizing enhancement...";
    if (timeInSeconds < 30) return "Taking longer than expected...";
    return "Still processing...";
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-mint-50 rounded-lg border border-mint-200">
      <Loader2 className="h-5 w-5 animate-spin text-mint-600" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-mint-800">
            {enhancementType ? `Generating ${enhancementType}` : 'Enhancing content'}...
          </span>
          <div className="flex items-center gap-1 text-xs text-mint-600">
            <Clock className="h-3 w-3" />
            <span>{timeInSeconds.toFixed(1)}s</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <Progress 
            value={progressPercentage} 
            className="h-1.5 bg-mint-100" 
          />
          <div className="text-xs text-mint-600">
            {getStatusMessage()}
          </div>
        </div>
      </div>

      {timeInSeconds > 10 && (
        <div className="flex items-center gap-1 text-xs text-mint-500">
          <Zap className="h-3 w-3" />
          <span>Target: 10-15s</span>
        </div>
      )}
    </div>
  );
};