
import { toast } from "sonner";
import { Note } from "@/types/note";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
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
      
      if (isEditing) {
        // If we're editing, just update the editable content
        setEditableContent(enhancedContent);
        toast.success("Enhancement applied to editor. Save to keep changes.");
        return;
      }
      
      // If not editing, directly update the note based on enhancement type
      try {
        // Check if this is a replacement type enhancement
        if (enhancementDetails?.replaceContent) {
          // For enhancements that replace content
          await updateNoteInDatabase(note.id, { content: enhancedContent });
            
          // Update local note
          note.content = enhancedContent;
          toast.success(`Content ${enhancementDetails.title.toLowerCase()} successfully`);
        } else {
          // For enhancements that create separate content
          // Store in the appropriate field based on enhancement type
          const now = new Date().toISOString();
          
          switch (typeToApply) {
            case 'summarize':
              console.log("Storing summary in dedicated field", {
                summary: enhancedContent,
                summary_generated_at: now,
                summary_status: 'completed'
              });
              
              // Store in dedicated summary field
              await updateNoteInDatabase(note.id, {
                summary: enhancedContent,
                summary_generated_at: now,
                summary_status: 'completed'
              });
              
              // Update local note
              note.summary = enhancedContent;
              note.summary_generated_at = now;
              note.summary_status = 'completed';
              toast.success("Summary created successfully");
              break;
              
            case 'extract-key-points':
              // Store in dedicated key_points field
              await updateNoteInDatabase(note.id, {
                key_points: enhancedContent,
                key_points_generated_at: now
              });
              
              // Update local note
              note.key_points = enhancedContent;
              note.key_points_generated_at = now;
              toast.success("Key points extracted successfully");
              break;
              
            case 'convert-to-markdown':
              // Store in dedicated markdown_content field
              await updateNoteInDatabase(note.id, {
                markdown_content: enhancedContent,
                markdown_content_generated_at: now
              });
              
              // Update local note
              note.markdown_content = enhancedContent;
              note.markdown_content_generated_at = now;
              toast.success("Converted to markdown successfully");
              break;
              
            case 'improve-clarity':
              // Store in dedicated improved_content field
              await updateNoteInDatabase(note.id, {
                improved_content: enhancedContent,
                improved_content_generated_at: now
              });
              
              // Update local note
              note.improved_content = enhancedContent;
              note.improved_content_generated_at = now;
              toast.success("Improved clarity generated successfully");
              break;
              
            default:
              // Fallback to summary for any other enhancements
              await updateNoteInDatabase(note.id, {
                summary: enhancedContent,
                summary_generated_at: now,
                summary_status: 'completed'
              });
              
              // Update local note
              note.summary = enhancedContent;
              note.summary_generated_at = now;
              note.summary_status = 'completed';
              toast.success("Enhancement completed successfully");
          }
        }
      } catch (error) {
        console.error("Error saving enhancement:", error);
        setProcessingError("Failed to save enhanced content");
        toast.error(`Failed to save enhanced content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error; // Re-throw to be caught by the outer try-catch
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
