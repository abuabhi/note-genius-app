import { Clock, Loader2, Zap } from "lucide-react";

interface UnifiedProgressIndicatorProps {
  isEnhancing: boolean;
  processingTime: number;
  enhancementStartTime: number | null;
  enhancementType?: string;
  variant?: 'header' | 'tab' | 'full';
  showTargetTime?: boolean;
}

export const UnifiedProgressIndicator = ({
  isEnhancing,
  processingTime,
  enhancementStartTime,
  enhancementType,
  variant = 'full',
  showTargetTime = true
}: UnifiedProgressIndicatorProps) => {
  if (!isEnhancing || !enhancementStartTime) return null;

  const timeInSeconds = processingTime / 1000;
  const targetTime = 15; // 15 second target
  const progressPercentage = Math.min((timeInSeconds / targetTime) * 100, 100);

  const getStatusColor = () => {
    if (timeInSeconds <= 10) return "text-green-600";
    if (timeInSeconds <= 15) return "text-yellow-600";
    return "text-orange-600";
  };

  const getProgressColor = () => {
    if (timeInSeconds <= 10) return "bg-green-500";
    if (timeInSeconds <= 15) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getStatusMessage = () => {
    if (timeInSeconds <= 5) return "Initializing...";
    if (timeInSeconds <= 10) return "AI Processing";
    if (timeInSeconds <= 15) return "Nearly Complete";
    return "Taking Longer Than Expected";
  };

  // Header variant - compact display
  if (variant === 'header') {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Loader2 className="h-3 w-3 animate-spin text-mint-600" />
        <span className={getStatusColor()}>
          {timeInSeconds.toFixed(1)}s
        </span>
      </div>
    );
  }

  // Tab variant - minimal display
  if (variant === 'tab') {
    return (
      <div className="flex items-center gap-1 text-xs text-mint-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>{timeInSeconds.toFixed(0)}s</span>
      </div>
    );
  }

  // Full variant - detailed progress panel
  return (
    <div className="bg-mint-50 border border-mint-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-mint-600" />
          <span className="text-sm font-medium text-mint-800">
            {enhancementType ? `Processing ${enhancementType}` : 'Processing Enhancement'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-mint-600" />
            <span className={getStatusColor()}>
              {timeInSeconds.toFixed(1)}s
            </span>
          </div>
          {showTargetTime && (
            <span className="text-mint-600 text-xs">
              Target: ~{targetTime}s
            </span>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-mint-100 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </span>
        <div className="flex items-center gap-2 text-mint-600">
          <span>Normal: 10-15s</span>
          {timeInSeconds > 15 && (
            <span className="text-orange-600 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Slow API
            </span>
          )}
        </div>
      </div>
    </div>
  );
};