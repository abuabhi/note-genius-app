import { useState } from 'react';
import { Note } from '@/types/note';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudyViewState } from './hooks/useStudyViewState';
import { useNoteStudyEditor } from './hooks/useNoteStudyEditor';
import { useSimpleRealtimeSync } from './hooks/useSimpleRealtimeSync';
import { StudyViewHeader } from './header/StudyViewHeader';
import { NoteStudyViewContent } from './viewer/NoteStudyViewContent';
import { EnhancementContentType } from './enhancements/EnhancementSelector';
import { useNoteEnrichment } from '@/hooks/useNoteEnrichment';
import { toast } from 'sonner';
import { StudyBreadcrumb } from './navigation/StudyBreadcrumb';

interface NoteStudyViewProps {
  note: Note;
  isLoading?: boolean;
}

export const NoteStudyView = ({ note, isLoading }: NoteStudyViewProps) => {
  // Use simplified real-time sync for better performance
  const { currentNote, refreshKey, forceRefresh } = useSimpleRealtimeSync(note);

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

  // CRITICAL FIX: Only allow manual enhancement requests, never automatic
  const handleEnhanceContent = async (enhancementType: string) => {
    console.log("🎯 Manual enhancement requested:", enhancementType);
    
    try {
      if (hasReachedLimit()) {
        toast.error('You have reached your monthly enhancement limit');
        return;
      }

      // CRITICAL: Set status to generating BEFORE calling enrichNote
      if (enhancementType === 'summarize') {
        await onNoteUpdate({
          summary_status: 'generating'
        });
      } else if (enhancementType === 'enrich-note') {
        await onNoteUpdate({
          enriched_status: 'generating'
        });
      }

      const result = await enrichNote(
        currentNote.id,
        currentNote.content || currentNote.description || '',
        enhancementType as any,
        currentNote.title
      );

      if (result.success) {
        const fieldName = getEnhancementFieldName(enhancementType);
        const updateData: any = {
          [fieldName]: result.content,
          [`${fieldName}_generated_at`]: new Date().toISOString(),
          enhancement_type: getEnhancementType(enhancementType) as 'clarity' | 'other' | 'spelling-grammar'
        };

        // CRITICAL: Set status to completed for summary and enriched
        if (enhancementType === 'summarize') {
          updateData.summary_status = 'completed';
        } else if (enhancementType === 'enrich-note') {
          updateData.enriched_status = 'completed';
        }

        await onNoteUpdate(updateData);
        
        forceRefresh();
        toast.success('Enhancement completed successfully!');
      } else {
        // CRITICAL: Set status to failed on error
        if (enhancementType === 'summarize') {
          await onNoteUpdate({
            summary_status: 'failed'
          });
        } else if (enhancementType === 'enrich-note') {
          await onNoteUpdate({
            enriched_status: 'failed'
          });
        }
        toast.error('Failed to enhance note');
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      
      // CRITICAL: Set status to failed on error
      if (enhancementType === 'summarize') {
        await onNoteUpdate({
          summary_status: 'failed'
        });
      } else if (enhancementType === 'enrich-note') {
        await onNoteUpdate({
          enriched_status: 'failed'
        });
      }
      
      toast.error('Failed to enhance note');
    }
  };

  // Handle retry enhancement
  const handleRetryEnhancement = async (enhancementType: string) => {
    await handleEnhanceContent(enhancementType);
  };

  // Handle content type change
  const handleActiveContentTypeChange = (type: EnhancementContentType) => {
    setActiveContentType(type);
  };

  // Handle enhancement from header - FIXED: no automatic generation
  const handleEnhancement = (enhancedContent: string, enhancementType?: any) => {
    console.log("📝 Enhancement completed, refreshing view");
    forceRefresh();
  };

  // Simple usage stats function
  const fetchUsageStats = async () => {
    console.log('Fetching usage stats...');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-mint-50/20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Breadcrumb Navigation */}
        <StudyBreadcrumb note={currentNote} />

        {/* Main Study View Card */}
        <Card className={`overflow-hidden transition-all duration-300 ${
          isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-lg shadow-lg'
        } ${isFullWidth ? 'w-full' : 'max-w-6xl mx-auto'} bg-white/95 backdrop-blur-sm border-mint-100`}>
          
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
    case 'enrich-note':
      return 'enriched_content';
    default:
      return 'summary';
  }
};

const getEnhancementType = (enhancementType: string): 'clarity' | 'other' | 'spelling-grammar' => {
  switch (enhancementType) {
    case 'improve-clarity':
      return 'clarity';
    case 'summarize':
    case 'enrich-note':
      return 'other';
    default:
      return 'other';
  }
};
