import React, { Suspense } from 'react';
import { ProductionNotesGrid } from './ProductionNotesGrid';
import { LoadingState } from './LoadingState';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ProductionNotesContentProps {
  viewMode?: 'grid' | 'list';
  className?: string;
}

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Alert variant="destructive" className="m-4">
    <AlertDescription className="space-y-2">
      <p>Failed to load notes: {error.message}</p>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm">
        Try Again
      </Button>
    </AlertDescription>
  </Alert>
);

export const ProductionNotesContent = React.memo(({ 
  viewMode = 'grid', 
  className = '' 
}: ProductionNotesContentProps) => {
  console.log('🚀 ProductionNotesContent render:', { viewMode });

  return (
    <div className={`production-notes-content ${className}`}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => {
          console.error('ProductionNotesContent error:', error);
        }}
      >
        <Suspense fallback={<LoadingState />}>
          {viewMode === 'grid' ? (
            <ProductionNotesGrid />
          ) : (
            <ProductionNotesGrid /> // For now, both use grid - can add list view later
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});

ProductionNotesContent.displayName = 'ProductionNotesContent';