
import { toast } from "sonner";
import { Note } from "@/types/note";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useNotes } from "@/contexts/NoteContext";
import { useState } from "react";

/**
 * Hook to handle note enhancement processing
 */
export const useEnhancementProcessor = (note: Note, editorState: {
  isEditing: boolean;
  setEditableContent: (content: string) => void;
}) => {
  const { isEditing, setEditableContent } = editorState;
  const { getEnhancementDetails } = useNoteEnrichment();
  const { updateNote } = useNotes(); // Get updateNote from context
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Handle content enhancement
  const handleEnhanceContent = async (enhancedContent: string, enhancementType?: EnhancementFunction) => {
    // Reset error state
    setProcessingError(null);
    setIsProcessing(true);
    
    try {
      // If no enhancement type is provided, assume it's improve-clarity
      const typeToApply = enhancementType || 'improve-clarity';
      const enhancementDetails = getEnhancementDetails?.(typeToApply);
      
      console.log("Handling enhancement:", {
        typeToApply,
        replaceContent: enhancementDetails?.replaceContent,
        contentLength: enhancedContent.length,
        isEditing
      });
      
      // If we're editing and it's a replacement type enhancement, update the editable content
      if (isEditing && enhancementDetails?.replaceContent) {
        setEditableContent(enhancedContent);
        toast.success("Enhancement applied to editor. Save to keep changes.");
        return;
      }
      
      // If not editing, directly update the note based on enhancement type
      try {
        const now = new Date().toISOString();
        let updateData: Partial<Note> = {};
        
        switch (typeToApply) {
          case 'summarize':
            console.log("Storing summary in dedicated field", {
              summary: enhancedContent,
              summary_generated_at: now,
              summary_status: 'completed'
            });
            
            updateData = {
              summary: enhancedContent,
              summary_generated_at: now,
              summary_status: 'completed'
            };
            break;
            
          case 'extract-key-points':
            console.log("Storing key points in dedicated field", {
              key_points: enhancedContent,
              key_points_generated_at: now
            });
            
            updateData = {
              key_points: enhancedContent,
              key_points_generated_at: now
            };
            break;
            
          case 'convert-to-markdown':
            updateData = {
              markdown_content: enhancedContent,
              markdown_content_generated_at: now
            };
            break;
            
          case 'improve-clarity':
            if (enhancementDetails?.replaceContent) {
              updateData = { content: enhancedContent };
            } else {
              updateData = {
                improved_content: enhancedContent,
                improved_content_generated_at: now
              };
            }
            break;
            
          default:
            // Fallback to summary for any other enhancements
            updateData = {
              summary: enhancedContent,
              summary_generated_at: now,
              summary_status: 'completed'
            };
        }
        
        // First update the database
        await updateNoteInDatabase(note.id, updateData);
        
        // Then immediately update the context state to trigger re-renders
        await updateNote(note.id, updateData);
        
        console.log("Enhancement saved and context updated:", {
          noteId: note.id,
          updateData,
          enhancementType: typeToApply
        });
        
        // Show success message
        const successMessages = {
          'summarize': "Summary created successfully",
          'extract-key-points': "Key points extracted successfully", 
          'convert-to-markdown': "Converted to markdown successfully",
          'improve-clarity': enhancementDetails?.replaceContent ? "Content improved successfully" : "Improved clarity generated successfully"
        };
        
        toast.success(successMessages[typeToApply] || "Enhancement completed successfully");
        
      } catch (error) {
        console.error("Error saving enhancement:", error);
        setProcessingError("Failed to save enhanced content");
        toast.error(`Failed to save enhanced content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    } catch (error) {
      console.error("Error in enhancement process:", error);
      setProcessingError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to retry a failed enhancement
  const retryEnhancement = async (content: string, enhancementType?: EnhancementFunction) => {
    setProcessingError(null);
    await handleEnhanceContent(content, enhancementType);
  };

  return {
    handleEnhanceContent,
    retryEnhancement,
    isProcessing,
    processingError
  };
};
