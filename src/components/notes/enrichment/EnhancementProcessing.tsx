
import React from 'react';
import { Loader2 } from 'lucide-react';

export const EnhancementProcessing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-center text-muted-foreground">
        Enhancing your note with AI...
      </p>
    </div>
  );
};
