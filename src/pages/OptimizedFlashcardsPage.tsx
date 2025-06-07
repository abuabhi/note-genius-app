
import { lazy, Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Brain } from 'lucide-react';
import { useOptimizedFlashcards } from '@/hooks/performance/useOptimizedFlashcards';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Lazy load heavy components
const FlashcardGrid = lazy(() => import('@/components/flashcards/components/FlashcardSetGrid'));

const OptimizedFlashcardsPage = () => {
  const {
    data,
    isLoading,
    currentPage,
    filters,
    handlePageChange,
    handleFilterChange,
    prefetchNextPage
  } = useOptimizedFlashcards();

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Flashcards" pageIcon={<Brain className="h-3 w-3" />} />
        
        <ProgressiveLoader
          isLoading={isLoading}
          isPartiallyLoaded={data.sets.length > 0}
          skeletonCount={6}
        >
          <div className="space-y-6">
            {/* Header with stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Flashcard Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex gap-4">
                    <div className="text-sm text-muted-foreground">
                      {data.totalCount} total sets
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {data.totalPages}
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search flashcards..."
                      value={filters.searchTerm || ''}
                      onChange={(e) => handleFilterChange({ ...filters, searchTerm: e.target.value })}
                      className="w-48"
                    />
                    <Select 
                      value={filters.subject || 'all'} 
                      onValueChange={(value) => handleFilterChange({ 
                        ...filters, 
                        subject: value === 'all' ? undefined : value 
                      })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {data.subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flashcard Grid */}
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            }>
              <FlashcardGrid flashcardSets={data.sets} />
            </Suspense>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, data.totalPages) }).map((_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > data.totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                      onMouseEnter={() => {
                        if (pageNum === currentPage + 1) {
                          prefetchNextPage();
                        }
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                  onMouseEnter={prefetchNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </ProgressiveLoader>
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
