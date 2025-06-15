
import { useState, useEffect } from 'react';
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
import { useLocation } from 'react-router-dom';
import { setEnhancementGenerating, setEnhancementFailed } from '@/hooks/noteEnrichment/enhancementHelpers';

interface NoteStudyViewProps {
  note: Note;
  isLoading?: boolean;
}

export const NoteStudyView = ({ note, isLoading }: NoteStudyViewProps) => {
  const location = useLocation();

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

  const {
    isEditing,
    editableContent,
    editableTitle,
    editableSubject,
    selectedTags,
    availableTags,
    availableSubjects,
    isSaving,
    handleContentChange,
    handleTitleChange,
    handleSubjectChange,
    handleSaveContent,
    toggleEditing,
    setSelectedTags,
    onNoteUpdate
  } = useNoteStudyEditor(currentNote, forceRefresh);

  const {
    enrichNote,
    currentUsage,
    monthlyLimit,
    hasReachedLimit,
    isProcessing
  } = useNoteEnrichment(currentNote);

  // Update location state with current note for Layout to access
  useEffect(() => {
    if (currentNote && location.pathname.includes('/notes/study/')) {
      // Update location state so Layout can access the note for chat
      window.history.replaceState(
        { ...window.history.state, note: currentNote },
        '',
        location.pathname
      );
    }
  }, [currentNote, location.pathname]);

  // FIXED: Comprehensive enhancement handling for ALL types
  const handleEnhanceContent = async (enhancementType: string) => {
    console.log("🎯 EXPLICIT MANUAL enhancement requested:", enhancementType);
    console.log("🎯 This should ONLY be called from user button clicks, never tab switches");
    
    try {
      if (hasReachedLimit()) {
        toast.error('You have reached your monthly enhancement limit');
        return;
      }

      // CRITICAL FIX: Set status to generating for ALL enhancement types
      console.log("🎯 Setting status to generating for enhancement type:", enhancementType);
      await setEnhancementGenerating(currentNote.id, enhancementType as any);

      const result = await enrichNote(
        currentNote.id,
        currentNote.content || currentNote.description || '',
        enhancementType as any,
        currentNote.title
      );

      if (result.success) {
        const fieldName = getEnhancementFieldName(enhancementType);
        const statusFieldName = getEnhancementStatusFieldName(enhancementType);
        const updateData: any = {
          [fieldName]: result.content,
          [`${fieldName}_generated_at`]: new Date().toISOString(),
          enhancement_type: getEnhancementType(enhancementType) as 'clarity' | 'other' | 'spelling-grammar'
        };

        // Set the appropriate status field to completed
        if (statusFieldName) {
          updateData[statusFieldName] = 'completed';
        }

        await onNoteUpdate(updateData);
        
        forceRefresh();
        toast.success('Enhancement completed successfully!');
      } else {
        // Set status to failed for the specific enhancement type
        await setEnhancementFailed(currentNote.id, enhancementType as any);
        toast.error('Failed to enhance note');
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      
      // Set status to failed on error
      await setEnhancementFailed(currentNote.id, enhancementType as any);
      
      toast.error('Failed to enhance note');
    }
  };

  // CRITICAL FIX: Only allow retry from explicit user actions
  const handleRetryEnhancement = async (enhancementType: string) => {
    console.log("🎯 EXPLICIT RETRY requested by user for:", enhancementType);
    await handleEnhanceContent(enhancementType);
  };

  const handleActiveContentTypeChange = (type: EnhancementContentType) => {
    console.log("🎯 Tab changed to:", type, "- this should NEVER trigger auto-generation");
    setActiveContentType(type);
  };

  const handleEnhancement = (enhancedContent: string, enhancementType?: any) => {
    console.log("📝 Enhancement completed, refreshing view");
    forceRefresh();
  };

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

  // Convert string array to UserSubject array with proper structure
  const subjectObjects = Array.isArray(availableSubjects) 
    ? availableSubjects.map(subject => 
        typeof subject === 'string' 
          ? { 
              name: subject, 
              id: subject,
              user_id: 'current-user', // Add required user_id field
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } 
          : subject
      )
    : [];

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
          <div>
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
          </div>

          {/* Enhanced Content View */}
          <div>
            <NoteStudyViewContent
              note={currentNote}
              isEditing={isEditing}
              fontSize={fontSize}
              textAlign={textAlign}
              editableContent={editableContent}
              editableSubject={editableSubject}
              selectedTags={selectedTags}
              availableTags={availableTags}
              availableSubjects={subjectObjects}
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
              onSubjectChange={handleSubjectChange}
              activeContentType={activeContentType}
              onActiveContentTypeChange={handleActiveContentTypeChange}
              isEditOperation={isProcessing}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper functions - FIXED with comprehensive status field mapping
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

// NEW: Helper function for status field names
const getEnhancementStatusFieldName = (enhancementType: string): string | null => {
  switch (enhancementType) {
    case 'summarize':
      return 'summary_status';
    case 'extract-key-points':
      return 'key_points_status';
    case 'improve-clarity':
      return 'improved_content_status';
    case 'convert-to-markdown':
      return 'markdown_content_status';
    case 'enrich-note':
      return 'enriched_status';
    default:
      return null;
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
