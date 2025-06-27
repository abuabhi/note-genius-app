
import React, { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FlashcardsPageHeader } from "@/components/flashcards/page/FlashcardsPageHeader";
import { FlashcardsContent } from "@/components/flashcards/page/FlashcardsContent";
import { AdvancedFlashcardFilters } from "@/components/flashcards/components/AdvancedFlashcardFilters";
import { useFlashcardsPageState } from "@/components/flashcards/page/useFlashcardsPageState";
import { ErrorBoundary } from "@/components/flashcards/components/ErrorBoundary";
import { FlashcardProvider } from "@/contexts/flashcards/index.tsx";

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
    <ErrorBoundary>
      <FlashcardProvider>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-6 space-y-6">
            <FlashcardsPageHeader 
              loading={false}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            
            <AdvancedFlashcardFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalSets={0}
              hideViewMode={true}
            />
            
            <FlashcardsContent />
          </div>
        </div>
      </FlashcardProvider>
    </ErrorBoundary>
  );
};

export default FlashcardsPage;
