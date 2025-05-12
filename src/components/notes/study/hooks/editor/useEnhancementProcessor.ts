
import { toast } from "sonner";
import { Note } from "@/types/note";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";

/**
 * Hook to handle note enhancement processing
 */
export const useEnhancementProcessor = (note: Note, editorState: {
  isEditing: boolean;
  setEditableContent: (content: string) => void;
}) => {
  const { isEditing, setEditableContent } = editorState;
  const { getEnhancementDetails } = useNoteEnrichment();
  
  // Handle content enhancement
  const handleEnhanceContent = async (enhancedContent: string, enhancementType?: EnhancementFunction) => {
    // If no enhancement type is provided, assume it's improve-clarity
    const typeToApply = enhancementType || 'improve-clarity';
    const enhancementDetails = getEnhancementDetails?.(typeToApply);
    
    console.log("Handling enhancement:", {
      typeToApply,
      replaceContent: enhancementDetails?.replaceContent,
      contentLength: enhancedContent.length
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
            // Store in dedicated summary field
            await updateNoteInDatabase(note.id, {
              summary: enhancedContent,
              summary_generated_at: now
            });
            
            // Update local note
            note.summary = enhancedContent;
            note.summary_generated_at = now;
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
              summary_generated_at: now
            });
            
            // Update local note
            note.summary = enhancedContent;
            note.summary_generated_at = now;
            toast.success("Enhancement completed successfully");
        }
      }
    } catch (error) {
      toast.error("Failed to save enhanced content");
      console.error("Error saving enhancement:", error);
    }
  };

  return {
    handleEnhanceContent
  };
};
