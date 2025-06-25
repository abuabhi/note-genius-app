
import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FancyNotesCounterProps {
  currentCount: number;
  totalCount: number;
  hasFilters?: boolean;
}

export const FancyNotesCounter = ({ 
  currentCount, 
  totalCount, 
  hasFilters = false 
}: FancyNotesCounterProps) => {
  if (totalCount === 0) return null;

  const isFiltered = hasFilters && currentCount !== totalCount;
  
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-3 bg-gradient-to-r from-mint-50 to-blue-50 border border-mint-200 rounded-full px-6 py-3 shadow-sm">
        {/* Icon with subtle animation */}
        <div className="flex items-center gap-2 text-mint-600">
          <FileText className="h-5 w-5" />
          <Sparkles className="h-4 w-4 text-mint-400 animate-pulse" />
        </div>
        
        {/* Main counter text */}
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <span className="text-2xl font-bold text-mint-700">
            {currentCount}
          </span>
          <span className="text-sm">
            {currentCount === 1 ? 'note' : 'notes'}
          </span>
          
          {isFiltered && (
            <>
              <span className="text-gray-400 mx-1">of</span>
              <span className="text-lg font-semibold text-gray-600">
                {totalCount}
              </span>
              <span className="text-sm text-gray-500">total</span>
            </>
          )}
        </div>
        
        {/* Status badge */}
        {isFiltered && (
          <Badge 
            variant="secondary" 
            className="bg-mint-100 text-mint-700 border-mint-300 text-xs font-medium animate-fade-in"
          >
            Filtered
          </Badge>
        )}
      </div>
    </div>
  );
};
