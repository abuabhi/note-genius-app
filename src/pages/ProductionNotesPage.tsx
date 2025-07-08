import React, { useState } from 'react';
import { ProductionNotesContent } from '@/components/notes/page/ProductionNotesContent';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ProductionNotesProvider } from '@/contexts/ProductionNotesContext';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { useUserTier } from '@/hooks/useUserTier';
import { EnhancedImportDialog } from '@/components/notes/import/EnhancedImportDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateNoteForm } from '@/components/notes/page/CreateNoteForm';
import { Note } from '@/types/note';
import { useProductionNotes } from '@/contexts/ProductionNotesContext';
import { toast } from 'sonner';
import { NotesHeaderTop } from '@/components/notes/page/header/NotesHeaderTop';
import { NotesFilters } from '@/components/notes/NotesFilters';
import { useUserSubjects } from '@/hooks/useUserSubjects';

// Streamlined error fallback
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  console.error('ProductionNotesPage Error:', error);
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Alert variant="destructive">
        <AlertTitle>Error Loading Notes</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>{error.message}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
              Try again
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

const ProductionNotesPageContent = () => {
  console.log('🚀 ProductionNotesPage - Starting render');
  
  const { viewMode, setViewMode } = useViewPreferences('notes');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const { userTier } = useUserTier();
  const { addNote, loading, notes, searchTerm, setSearchTerm, selectedSubject, setSelectedSubject, sortType, setSortType } = useProductionNotes();
  const { subjects } = useUserSubjects();

  // Convert ViewMode to the expected type
  const convertedViewMode: 'grid' | 'list' = viewMode === 'compact' ? 'grid' : viewMode as 'grid' | 'list';
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handleFiltersChange = (filters: {
    search?: string;
    subject?: string;
    showArchived?: boolean;
  }) => {
    if (filters.search !== undefined) {
      setSearchTerm(filters.search || '');
    }
    if (filters.subject !== undefined) {
      setSelectedSubject(filters.subject || 'all');
    }
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      console.log('🚀 Creating note via production context...');
      
      // Close dialog immediately for better UX
      setIsManualDialogOpen(false);
      
      // Create the note using the production context
      const newNote = await addNote(noteData);
      if (newNote) {
        console.log('✅ Note created successfully via production context');
        return newNote;
      }
      return null;
    } catch (error) {
      console.error('Failed to create note via production context:', error);
      toast.error('Failed to create note. Please try again.');
      // Reopen dialog if creation failed
      setIsManualDialogOpen(true);
      return null;
    }
  };

  console.log('🎯 ProductionNotesPage - Rendering with:', {
    convertedViewMode,
    loading,
    isImportDialogOpen,
    isManualDialogOpen
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header with search and controls */}
        <div className="mb-8">
          <NotesHeaderTop
            onOpenManualDialog={() => setIsManualDialogOpen(true)}
            onOpenImportDialog={() => setIsImportDialogOpen(true)}
          />
          
          {/* View Mode Toggle */}
          <div className="mt-6 flex justify-end">
            <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm">
              <Button
                variant={convertedViewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className={`rounded-r-none ${convertedViewMode === 'grid' ? 'bg-mint-500 text-white' : 'text-gray-600'}`}
              >
                Grid
              </Button>
              <Button
                variant={convertedViewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className={`rounded-l-none ${convertedViewMode === 'list' ? 'bg-mint-500 text-white' : 'text-gray-600'}`}
              >
                List
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mt-6">
            <NotesFilters
              onFiltersChange={handleFiltersChange}
              totalNotes={notes.length}
              searchTerm={searchTerm}
              selectedSubject={selectedSubject}
              showArchived={false}
              sortType={sortType}
              onSortChange={setSortType}
            />
          </div>
        </div>
        
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            console.log('Resetting production notes page error boundary');
          }}
          onError={(error, errorInfo) => {
            console.error('Production notes page error caught:', error, errorInfo);
          }}
        >
          <ProductionNotesContent viewMode={convertedViewMode} />
        </ErrorBoundary>
      </div>

      {/* Import Dialog */}
      <EnhancedImportDialog 
        isVisible={isImportDialogOpen} 
        onClose={() => setIsImportDialogOpen(false)}
        onSaveNote={async (note) => {
          return true; // Import dialog handles its own note creation
        }}
        isPremiumUser={userTier === 'GRADUATE' || userTier === 'MASTER'}
      />

      {/* Manual Note Creation Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <CreateNoteForm onSave={handleSaveNote} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProductionNotesPage = () => {
  console.log('🏭 ProductionNotesPage - Initializing with production context');
  
  return (
    <ProductionNotesProvider>
      <ProductionNotesPageContent />
    </ProductionNotesProvider>
  );
};

export default ProductionNotesPage;