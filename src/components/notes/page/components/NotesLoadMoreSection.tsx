
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface NotesLoadMoreSectionProps {
  hasMore: boolean;
  shouldVirtualize: boolean;
  loading: boolean;
  totalCount: number;
  currentCount: number;
  onLoadMore: () => void;
}

export const NotesLoadMoreSection = ({
  hasMore,
  shouldVirtualize,
  loading,
  totalCount,
  currentCount,
  onLoadMore
}: NotesLoadMoreSectionProps) => {
  if (!hasMore) {
    // Show completion message when all notes are loaded
    if (currentCount > 0 && totalCount > 0) {
      return (
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="text-sm text-muted-foreground">
            All {totalCount} notes loaded
          </div>
          {shouldVirtualize && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              Virtualized
            </span>
          )}
        </div>
      );
    }
    return null;
  }

  const remainingCount = totalCount - currentCount;
  const loadingText = loading ? 'Loading more...' : `Load ${Math.min(remainingCount, 20)} more`;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="text-sm text-muted-foreground text-center">
        <div>Showing {currentCount} of {totalCount} notes</div>
        {remainingCount > 0 && (
          <div className="text-xs mt-1">
            {remainingCount} more available
          </div>
        )}
        {shouldVirtualize && (
          <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            Performance Optimized
          </span>
        )}
      </div>
      
      <Button 
        variant="outline" 
        onClick={onLoadMore}
        disabled={loading}
        className="min-w-32 transition-all duration-200"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          loadingText
        )}
      </Button>
    </div>
  );
};
