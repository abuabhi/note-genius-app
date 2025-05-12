
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EnhancementProcessingProps {
  message?: string;
  subMessage?: string;
  enhancementType?: string;
  showProgress?: boolean;
}

export const EnhancementProcessing: React.FC<EnhancementProcessingProps> = ({
  message = "AI is enhancing your note...",
  subMessage = "This may take a few moments",
  enhancementType,
  showProgress = true
}) => {
  const [progress, setProgress] = React.useState(0);
  
  // Simulate progress for better user experience
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        // Slow down as we approach 90% to give impression of waiting for API
        if (prev >= 90) {
          return prev + 0.1;
        } else if (prev >= 70) {
          return prev + 0.5;
        } else {
          return prev + 2;
        }
      });
    }, 300);
    
    return () => clearInterval(timer);
  }, []);
  
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
            <p className="text-xs text-right text-muted-foreground">
              {Math.min(Math.round(progress), 99)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
