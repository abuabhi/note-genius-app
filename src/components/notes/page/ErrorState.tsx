
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  message = "An error occurred while loading your notes.", 
  onRetry 
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button 
          variant="outline"
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
