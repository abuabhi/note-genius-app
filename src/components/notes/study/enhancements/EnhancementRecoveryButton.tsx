import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EnhancementRecoveryButtonProps {
  onRecovery: () => void;
  isVisible: boolean;
  elapsedTime?: number;
}

export const EnhancementRecoveryButton = ({
  onRecovery,
  isVisible,
  elapsedTime = 0
}: EnhancementRecoveryButtonProps) => {
  if (!isVisible) return null;

  const handleRecovery = () => {
    onRecovery();
    toast.info("Enhancement process reset. You can try again.");
  };

  const timeInSeconds = elapsedTime / 1000;

  return (
    <div className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <div className="text-sm">
          <div className="font-medium text-orange-800 mb-1">
            Enhancement taking longer than expected
          </div>
          <div className="text-orange-600 text-xs">
            Running for {timeInSeconds.toFixed(0)}s (Target: 10-15s)
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecovery}
          className="gap-2 text-orange-700 border-orange-300 hover:bg-orange-100"
        >
          <RotateCcw className="h-4 w-4" />
          Reset & Retry
        </Button>
      </div>
    </div>
  );
};