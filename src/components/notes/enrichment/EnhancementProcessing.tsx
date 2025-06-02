
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface EnhancementProcessingProps {
  message?: string;
  subMessage?: string;
  enhancementType?: string;
  showProgress?: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const EnhancementProcessing: React.FC<EnhancementProcessingProps> = ({
  message = "AI is enhancing your note...",
  subMessage = "This may take a few moments",
  enhancementType,
  showProgress = true,
  onCancel,
  onRetry
}) => {
  const [progress, setProgress] = React.useState(0);
  const [isStuck, setIsStuck] = React.useState(false);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  
  // Simulate progress for better user experience
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        // Slow down as we approach 90% to give impression of waiting for API
        if (prev >= 95) {
          // Check if we've been at high progress for too long
          setTimeElapsed(elapsed => elapsed + 300);
          return prev + 0.05; // Very slow increment
        } else if (prev >= 85) {
          return prev + 0.2;
        } else if (prev >= 70) {
          return prev + 0.5;
        } else {
          return prev + 2;
        }
      });
    }, 300);
    
    return () => clearInterval(timer);
  }, []);

  // Check for stuck process
  React.useEffect(() => {
    if (timeElapsed > 3000) { // 3 seconds at high progress = likely stuck
      setIsStuck(true);
    }
  }, [timeElapsed]);

  // Auto-timeout after 2 minutes
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      console.error('Enhancement process timed out after 2 minutes');
      setIsStuck(true);
    }, 120000); // 2 minutes

    return () => clearTimeout(timeout);
  }, []);
  
  if (isStuck) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="relative">
          <AlertCircle className="h-12 w-12 text-amber-500" />
        </div>
        <div className="space-y-4 text-center w-full max-w-xs">
          <div className="space-y-1">
            <p className="text-amber-800 font-medium">
              Enhancement is taking longer than expected
            </p>
            <p className="text-sm text-muted-foreground">
              The AI service might be experiencing delays
            </p>
          </div>
          
          <div className="flex gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Retry
              </Button>
            )}
            {onCancel && (
              <Button onClick={onCancel} variant="ghost" size="sm">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-mint-500" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-mint-200 border-opacity-20"></div>
      </div>
      <div className="space-y-4 text-center w-full max-w-xs">
        <div className="space-y-1">
          <p className="text-mint-800 font-medium">
            {message}
          </p>
          <p className="text-sm text-muted-foreground">
            {subMessage}
          </p>
          {enhancementType && (
            <p className="text-xs font-medium text-mint-600">
              {enhancementType}
            </p>
          )}
        </div>
        
        {showProgress && (
          <div className="w-full space-y-1">
            <Progress value={progress} className="h-1" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.min(Math.round(progress), 99)}%</span>
              <span>Usually takes 30-60s</span>
            </div>
          </div>
        )}

        {onCancel && (
          <Button onClick={onCancel} variant="ghost" size="sm" className="mt-4">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
