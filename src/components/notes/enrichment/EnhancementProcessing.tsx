
import React from 'react';
import { Loader2 } from 'lucide-react';

export const EnhancementProcessing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-mint-500" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-mint-200 border-opacity-20"></div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-mint-800 font-medium">
          AI is enhancing your note...
        </p>
        <p className="text-sm text-muted-foreground">
          This may take a few moments
        </p>
      </div>
    </div>
  );
};
