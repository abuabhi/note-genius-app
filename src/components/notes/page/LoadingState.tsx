
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  message?: string;
  onRetry?: () => void;
}

export const LoadingState = ({ 
  message = "Loading...", 
  onRetry 
}: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-mint-500 mb-2" />
      <p className="text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Retry Connection
        </Button>
      )}
    </div>
  );
};
