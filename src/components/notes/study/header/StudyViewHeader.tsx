
import { useState } from "react";
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/note";
import { StudyViewControls } from "../controls/StudyViewControls";
import { TextAlignType } from "../hooks/useStudyViewState";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { toast } from "sonner";
import { StudyViewTitleSection } from "./StudyViewTitleSection";
import { StudyViewEnhancementDropdown } from "./StudyViewEnhancementDropdown";
import { StudyViewExportDropdown } from "./StudyViewExportDropdown";
import { StudyViewConversionDropdown } from "./StudyViewConversionDropdown";
import { StudyViewYouTubeButton } from "./StudyViewYouTubeButton";
import { supabase } from "@/integrations/supabase/client";


interface StudyViewHeaderProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isFullWidth: boolean;
  isFullScreen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  editableTitle: string;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
  onToggleEditing: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onEnhance: (enhancedContent: string, enhancementType?: EnhancementFunction) => void;
  onEnhancementProcessing?: (enhancementType: string | null) => void;
  onActiveContentTypeChange?: (type: string) => void;
}

export const StudyViewHeader = ({
  note,
  fontSize,
  textAlign,
  isFullWidth,
  isFullScreen,
  isEditing,
  isSaving,
  editableTitle,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
  onToggleEditing,
  onSave,
  onTitleChange,
  onEnhance,
  onEnhancementProcessing,
  onActiveContentTypeChange,
}: StudyViewHeaderProps) => {
  const [processingEnhancement, setProcessingEnhancement] = useState<EnhancementFunction | null>(null);
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const { enrichNote, enhancementOptions } = useNoteEnrichment();

  // Test OpenAI function
  const testOpenAI = async () => {
    setTestingOpenAI(true);
    try {
      const testText = note.content || note.description || "This is a test note content for OpenAI integration.";
      
      console.log('🧪 Testing OpenAI with text:', testText.substring(0, 100));
      
      const { data, error } = await supabase.functions.invoke('test-openai', {
        body: { text: testText }
      });

      if (error) {
        console.error('❌ Test OpenAI error:', error);
        toast.error(`Test failed: ${error.message}`);
        return;
      }

      console.log('✅ Test OpenAI success:', data);
      
      if (data.success) {
        toast.success('✅ OpenAI test successful!');
        alert(`OpenAI Test Result:\n\n${data.result}`);
      } else {
        toast.error(`Test failed: ${data.error}`);
      }
    } catch (error) {
      console.error('💥 Test OpenAI exception:', error);
      toast.error('Test failed with exception');
    } finally {
      setTestingOpenAI(false);
    }
  };

  // Mapping from enhancement function to content type for automatic tab switching
  const enhancementToContentTypeMap: Record<EnhancementFunction, string> = {
    'summarize': 'summary',
    'extract-key-points': 'keyPoints',
    'generate-questions': 'questions',
    'convert-to-markdown': 'markdown',
    'enrich-note': 'enriched',
    'create-flashcards': 'original' // Default fallback
  };

  // Handle enhancement selection with unified performance tracking
  const handleEnhancementSelect = async (enhancement: EnhancementFunction) => {
    const startTime = performance.now();
    setProcessingEnhancement(enhancement);
    onEnhancementProcessing?.(enhancement);
    
    // Automatically switch to the relevant tab
    const contentType = enhancementToContentTypeMap[enhancement];
    if (contentType && onActiveContentTypeChange) {
      console.log(`🎯 Auto-switching to tab: ${contentType} for enhancement: ${enhancement}`);
      onActiveContentTypeChange(contentType);
    }
    
    try {
      const originalContent = note.content || note.description || "";
      console.log(`⏱️ Header Enhancement: Starting ${enhancement} at ${new Date().toISOString()}`);
      
      const { data, error } = await supabase.functions.invoke('simple-enhance-note', {
        body: { 
          noteId: note.id,
          content: originalContent, 
          enhancementType: enhancement, 
          title: note.title || "" 
        }
      });

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      console.log(`⏱️ Header Enhancement ${enhancement} completed in ${duration.toFixed(2)}s`);

      if (error) {
        console.error('❌ Enhancement error:', error);
        toast.error(`Enhancement failed: ${error.message}`);
        return;
      }

      if (data.success) {
        toast.success(`${enhancementOptions.find(opt => opt.value === enhancement)?.title} completed successfully! (${duration.toFixed(1)}s)`);
        // Force page refresh to show updated content
        window.location.reload();
      } else {
        toast.error(`Enhancement failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error enhancing note:", error);
      toast.error("Failed to enhance note");
    } finally {
      setProcessingEnhancement(null);
      onEnhancementProcessing?.(null);
    }
  };

  return (
    <CardHeader className="border-b p-4 bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <StudyViewTitleSection
            note={note}
            isEditing={isEditing}
            editableTitle={editableTitle}
            onTitleChange={onTitleChange}
          />
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <Button
                onClick={testOpenAI}
                disabled={testingOpenAI}
                variant="outline"
                size="sm"
                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
              >
                {testingOpenAI ? "Testing..." : "🧪 Test OpenAI"}
              </Button>
              
              <StudyViewConversionDropdown note={note} />
              
              <StudyViewEnhancementDropdown
                note={note}
                processingEnhancement={processingEnhancement}
                onEnhancementSelect={handleEnhancementSelect}
              />
              
              <StudyViewExportDropdown note={note} />
              
              {note.sourceType === 'youtube' && note.video_url && (
                <StudyViewYouTubeButton videoUrl={note.video_url} />
              )}
            </>
          )}

          <StudyViewControls
            fontSize={fontSize}
            textAlign={textAlign}
            isFullWidth={isFullWidth}
            isFullScreen={isFullScreen}
            isEditing={isEditing}
            isSaving={isSaving}
            hideAlignment={true}
            onIncreaseFontSize={onIncreaseFontSize}
            onDecreaseFontSize={onDecreaseFontSize}
            onChangeTextAlign={onChangeTextAlign}
            onToggleWidth={onToggleWidth}
            onToggleFullScreen={onToggleFullScreen}
            onToggleEditing={onToggleEditing}
            onSave={onSave}
          />
        </div>
      </div>
    </CardHeader>
  );
};
