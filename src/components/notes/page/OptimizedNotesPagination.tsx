
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface OptimizedNotesPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
}

export const OptimizedNotesPagination = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  hasMore,
  loading = false,
  onLoadMore
}: OptimizedNotesPaginationProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // If we have a loadMore function, use Load More pattern
  if (onLoadMore) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-6 bg-white/80 backdrop-blur-sm rounded-lg border border-mint-100/50">
        <div className="text-sm text-gray-600">
          Showing {Math.min(currentPage * pageSize, totalCount)} of {totalCount} notes
        </div>
        
        {hasMore && (
          <Button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-mint-600 hover:bg-mint-700 text-white px-6 py-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              `Load More Notes (${totalCount - (currentPage * pageSize)} remaining)`
            )}
          </Button>
        )}
      </div>
    );
  }

  // Traditional pagination pattern
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm rounded-lg border border-mint-100/50">
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalCount} notes
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
          
          {totalPages > 5 && (
            <>
              <span className="text-gray-400">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={loading}
                className="w-8 h-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore || loading}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
