
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowUpCircle } from 'lucide-react';
import { SimpleContentRenderer } from '@/components/notes/study/SimpleContentRenderer';

interface EnhancementResultsProps {
  enhancedContent: string;
  onApply: () => void;
}

export const EnhancementResults: React.FC<EnhancementResultsProps> = ({
  enhancedContent,
  onApply
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Enhancement generated successfully</span>
      </div>
      
      <Separator />
      
      <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
        <SimpleContentRenderer
          content={enhancedContent}
          fontSize={16}
          textAlign="left"
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onApply} className="flex items-center gap-2">
          <ArrowUpCircle className="h-4 w-4" />
          Apply to Note
        </Button>
      </div>
    </div>
  );
};
