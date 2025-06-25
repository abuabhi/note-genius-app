
import React, { memo } from 'react';
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

export const NotesLoadMoreSection = memo(({
  hasMore,
  shouldVirtualize,
  loading,
  totalCount,
  currentCount,
  onLoadMore
}: NotesLoadMoreSectionProps) => {
  if (!hasMore) return null;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="text-sm text-gray-600">
        Showing {currentCount} of {totalCount} notes
        {shouldVirtualize && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Optimized
          </span>
        )}
      </div>
      
      <Button 
        variant="outline" 
        onClick={onLoadMore}
        disabled={loading}
        className="min-w-32"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </Button>
    </div>
  );
});

NotesLoadMoreSection.displayName = 'NotesLoadMoreSection';
