
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
  if (!hasMore || shouldVirtualize) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
        <Button
          onClick={onLoadMore}
          disabled={loading}
          className="bg-mint-600 hover:bg-mint-700 text-white px-8 py-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            `Load More Notes (${totalCount - currentCount} remaining)`
          )}
        </Button>
      </div>
    </div>
  );
});

NotesLoadMoreSection.displayName = 'NotesLoadMoreSection';
