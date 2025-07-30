import { AlertTriangle, RotateCcw, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface EnhancementStatusIndicatorProps {
  isEnhancing: boolean;
  isStuck: boolean;
  lastRequestTime: number | null;
  retryCount: number;
  onForceReset: () => void;
  className?: string;
}

export const EnhancementStatusIndicator = ({
  isEnhancing,
  isStuck,
  lastRequestTime,
  retryCount,
  onForceReset,
  className
}: EnhancementStatusIndicatorProps) => {
  if (!isEnhancing && !isStuck) return null;

  const getStatusMessage = () => {
    if (isStuck) {
      return "Enhancement appears stuck";
    }
    if (retryCount > 0) {
      return `Retrying enhancement (${retryCount}/2)`;
    }
    return "Generating enhancement...";
  };

  const getElapsedTime = () => {
    if (!lastRequestTime) return null;
    return formatDistanceToNow(new Date(lastRequestTime), { addSuffix: false });
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      isStuck 
        ? "bg-orange-50 border-orange-200 text-orange-800" 
        : "bg-mint-50 border-mint-200 text-mint-800",
      className
    )}>
      <div className="flex items-center gap-3">
        {isStuck ? (
          <AlertTriangle className="h-5 w-5 text-orange-500" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-mint-500" />
        )}
        
        <div>
          <div className="font-medium text-sm">
            {getStatusMessage()}
          </div>
          {lastRequestTime && (
            <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
              <Clock className="h-3 w-3" />
              <span>Started {getElapsedTime()} ago</span>
            </div>
          )}
        </div>
      </div>

      {(isStuck || retryCount > 0) && (
        <Button
          variant="outline"
          size="sm"
          onClick={onForceReset}
          className={cn(
            "gap-2",
            isStuck ? "text-orange-700 border-orange-300" : "text-mint-700 border-mint-300"
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
};