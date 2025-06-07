
import { useState, useTransition, Suspense } from 'react';
import { Note } from '@/types/note';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteStudyTracker } from './NoteStudyTracker';
import { useStudyViewState } from './hooks/useStudyViewState';
import { useNoteStudyEditor } from './hooks/useNoteStudyEditor';
import { useRealtimeNoteSync } from './hooks/useRealtimeNoteSync';
import { StudyViewHeader } from './header/StudyViewHeader';
import { NoteStudyViewContent } from './viewer/NoteStudyViewContent';
import { EnhancementContentType } from './enhancements/EnhancementSelector';
import { useNoteEnrichment } from '@/hooks/useNoteEnrichment';
import { toast } from 'sonner';

interface NoteStudyViewProps {
  note: Note;
  isLoading?: boolean;
}

const MainStudyViewContent = ({ note, isLoading }: NoteStudyViewProps) => {
  const [studyStarted, setStudyStarted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Get real-time synced note data
  const { currentNote, refreshKey, forceRefresh } = useRealtimeNoteSync(note);

  // Study view state management
  const {
    fontSize,
    textAlign,
    isFullWidth,
    isFullScreen,
    activeContentType,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen,
    setActiveContentType
  } = useStudyViewState();

  // Note editing functionality
  const {
    isEditing,
    editableContent,
    editableTitle,
    selectedTags,
    availableTags,
    isSaving,
    handleContentChange,
    handleTitleChange,
    handleSaveContent,
    toggleEditing,
    setSelectedTags,
    onNoteUpdate
  } = useNoteStudyEditor(currentNote, forceRefresh);

  // Note enrichment functionality
  const {
    enrichNote,
    currentUsage,
    monthlyLimit,
    hasReachedLimit,
    isProcessing
  } = useNoteEnrichment(currentNote);

  // Handle AI enhancement
  const handleEnhanceContent = async (enhancementType: string) => {
    try {
      if (hasReachedLimit()) {
        toast.error('You have reached your monthly enhancement limit');
        return;
      }

      const result = await enrichNote(
        currentNote.id,
        currentNote.content || currentNote.description || '',
        enhancementType as any,
        currentNote.title
      );

      if (result.success) {
        // Update the note with the enhancement
        await onNoteUpdate({
          [getEnhancementFieldName(enhancementType)]: result.content,
          [`${getEnhancementFieldName(enhancementType)}_generated_at`]: new Date().toISOString(),
          enhancement_type: getEnhancementType(enhancementType) as 'clarity' | 'other' | 'spelling-grammar'
        });
        
        // Force refresh to update UI
        forceRefresh();
        
        toast.success('Enhancement completed successfully!');
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast.error('Failed to enhance note');
    }
  };

  // Handle retry enhancement
  const handleRetryEnhancement = async (enhancementType: string) => {
    await handleEnhanceContent(enhancementType);
  };

  // Handle content type change
  const handleActiveContentTypeChange = (type: EnhancementContentType) => {
    startTransition(() => {
      // Start study session when user switches to study-focused tabs
      if (['summary', 'keyPoints', 'improved', 'markdown'].includes(type) && !studyStarted) {
        setStudyStarted(true);
      }
      
      setActiveContentType(type);
    });
  };

  // Handle enhancement from header
  const handleEnhancement = (enhancedContent: string, enhancementType?: any) => {
    // Content is already saved by the enrichment process
    forceRefresh();
  };

  // Mock fetchUsageStats function since it's not available in the hook
  const fetchUsageStats = async () => {
    console.log('Fetching usage stats...');
    // This functionality needs to be implemented in the useNoteEnrichment hook
  };

  if (!currentNote) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Skeleton className="w-32 h-8 mb-4" />
        <Skeleton className="w-48 h-6" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Study Time Tracker */}
      {studyStarted && (
        <NoteStudyTracker
          noteId={currentNote.id}
          noteName={currentNote.title}
          subject={currentNote.category || undefined}
          triggerStudyActivity={studyStarted}
          showDonutCounter={true}
          donutSize="small"
          donutPosition="top"
        />
      )}

      {/* Main Study View Card */}
      <Card className={`overflow-hidden transition-all duration-300 ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-lg shadow-lg'
      } ${isFullWidth ? 'w-full' : 'max-w-6xl mx-auto'}`}>
        
        {/* Enhanced Header */}
        <StudyViewHeader
          note={currentNote}
          fontSize={fontSize}
          textAlign={textAlign}
          isFullWidth={isFullWidth}
          isFullScreen={isFullScreen}
          isEditing={isEditing}
          isSaving={isSaving}
          editableTitle={editableTitle}
          onIncreaseFontSize={handleIncreaseFontSize}
          onDecreaseFontSize={handleDecreaseFontSize}
          onChangeTextAlign={handleTextAlign}
          onToggleWidth={toggleWidth}
          onToggleFullScreen={toggleFullScreen}
          onToggleEditing={toggleEditing}
          onSave={handleSaveContent}
          onTitleChange={handleTitleChange}
          onEnhance={handleEnhancement}
        />

        {/* Enhanced Content View */}
        <NoteStudyViewContent
          note={currentNote}
          isEditing={isEditing}
          fontSize={fontSize}
          textAlign={textAlign}
          editableContent={editableContent}
          selectedTags={selectedTags}
          availableTags={availableTags}
          isSaving={isSaving}
          statsLoading={false}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
          handleContentChange={handleContentChange}
          handleSaveContent={handleSaveContent}
          toggleEditing={toggleEditing}
          handleEnhanceContent={handleEnhanceContent}
          setSelectedTags={setSelectedTags}
          handleRetryEnhancement={handleRetryEnhancement}
          hasReachedLimit={hasReachedLimit()}
          fetchUsageStats={fetchUsageStats}
          onNoteUpdate={onNoteUpdate}
          activeContentType={activeContentType}
          onActiveContentTypeChange={handleActiveContentTypeChange}
          isEditOperation={isProcessing}
        />
      </Card>
    </div>
  );
};

// Helper functions
const getEnhancementFieldName = (enhancementType: string): string => {
  switch (enhancementType) {
    case 'summarize':
      return 'summary';
    case 'extract-key-points':
      return 'key_points';
    case 'improve-clarity':
      return 'improved_content';
    case 'convert-to-markdown':
      return 'markdown_content';
    default:
      return 'summary';
  }
};

const getEnhancementType = (enhancementType: string): 'clarity' | 'other' | 'spelling-grammar' => {
  switch (enhancementType) {
    case 'improve-clarity':
      return 'clarity';
    case 'summarize':
      return 'other'; // Map summary to 'other' since 'summary' is not allowed
    default:
      return 'other';
  }
};

export const NoteStudyView = ({ note, isLoading }: NoteStudyViewProps) => {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-48">
        <Skeleton className="w-32 h-8 mb-4" />
        <Skeleton className="w-48 h-6" />
      </div>
    }>
      <MainStudyViewContent note={note} isLoading={isLoading} />
    </Suspense>
  );
};
