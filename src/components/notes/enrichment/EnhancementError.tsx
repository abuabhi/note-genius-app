
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface EnhancementErrorProps {
  error: string;
  onRetry: () => void;
}

export const EnhancementError: React.FC<EnhancementErrorProps> = ({
  error,
  onRetry
}) => {
  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-2 mb-4">
      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-700 font-medium">Enhancement failed</p>
        <p className="text-red-600 text-sm">{error}</p>
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 border-red-300 hover:bg-red-50 mr-2"
            onClick={onRetry}
          >
            <RefreshCcw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};
