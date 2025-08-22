
import React, { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FlashcardsPageHeader } from "@/components/flashcards/page/FlashcardsPageHeader";
import { FlashcardsContent } from "@/components/flashcards/page/FlashcardsContent";

import { useFlashcardsPageState } from "@/components/flashcards/page/useFlashcardsPageState";
import { ErrorBoundaryWithRouter } from "@/components/flashcards/components/ErrorBoundaryWithRouter";
import { FlashcardProvider } from "@/contexts/flashcards/index.tsx";
import { Helmet } from "react-helmet";

// Use a separate type for flashcard view modes
type FlashcardViewMode = 'card' | 'list';

const FlashcardsPage = () => {
  console.log('🏠 FlashcardsPage component rendering');
  
  useRequireAuth();
  const [viewMode, setViewMode] = useState<FlashcardViewMode>('card');
  const { filters, setFilters } = useFlashcardsPageState();

  // Reset page when filters change to ensure proper filtering
  const handleFiltersChange = (newFilters: typeof filters) => {
    console.log('🔄 Filters changed');
    setFilters(newFilters);
  };

  return (
    <ErrorBoundaryWithRouter>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <FlashcardProvider>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-6 space-y-6">
            <FlashcardsPageHeader 
              loading={false}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            
            
            <FlashcardsContent />
          </div>
        </div>
      </FlashcardProvider>
    </ErrorBoundaryWithRouter>
  );
};

export default FlashcardsPage;
